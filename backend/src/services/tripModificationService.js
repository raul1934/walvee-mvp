const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");
const { sequelize } = require("../database/sequelize");
const {
  Trip,
  City,
  Country,
  Place,
  TripPlace,
  TripItineraryDay,
  TripItineraryActivity,
} = require("../models/sequelize");
const googleMapsService = require("./googleMapsService");

/**
 * Trip Modification Service
 * Handles AI-powered trip modifications with operations:
 * - ADD_CITY, REMOVE_CITY
 * - ADD_PLACE, REMOVE_PLACE
 * - ADD_ITINERARY
 */
class TripModificationService {
  /**
   * Validate trip ownership
   * @param {string} tripId
   * @param {string} userId
   * @returns {Promise<Trip>}
   */
  async validateTripOwnership(tripId, userId) {
    const trip = await Trip.findOne({
      where: { id: tripId },
      include: [
        {
          model: City,
          as: "cities",
          include: [{ model: Country, as: "country" }],
        },
        {
          model: TripPlace,
          as: "places",
          include: [
            {
              model: Place,
              as: "place",
              include: [{ model: City, as: "city" }],
            },
          ],
        },
        {
          model: TripItineraryDay,
          as: "itineraryDays",
          include: [
            {
              model: TripItineraryActivity,
              as: "activities",
              include: [{ model: Place, as: "place" }],
            },
          ],
        },
      ],
    });

    if (!trip) {
      throw new Error("Trip not found");
    }

    if (trip.author_id !== userId) {
      throw new Error("Unauthorized: You do not own this trip");
    }

    return trip;
  }

  /**
   * Apply approved changes to a trip
   * Uses a single transaction for atomicity
   * @param {string} tripId
   * @param {string} userId
   * @param {Array} changes - Array of change objects with operation, data, approved
   * @returns {Promise<Object>} Results with applied and failed changes
   */
  async applyChanges(tripId, userId, changes) {
    const trip = await this.validateTripOwnership(tripId, userId);

    const results = {
      applied: [],
      failed: [],
    };

    // Filter only approved changes
    const approvedChanges = changes.filter((c) => c.approved);

    if (approvedChanges.length === 0) {
      return results;
    }

    // Use a transaction for atomicity
    try {
      await sequelize.transaction(async (transaction) => {
        for (const change of approvedChanges) {
          try {
            switch (change.operation) {
              case "ADD_CITY":
                await this.addCity(trip, change.data, transaction);
                results.applied.push({
                  operation_id: change.operation_id,
                  status: "success",
                });
                break;

              case "REMOVE_CITY":
                await this.removeCity(trip, change.data, transaction);
                results.applied.push({
                  operation_id: change.operation_id,
                  status: "success",
                });
                break;

              case "ADD_PLACE":
                await this.addPlace(trip, change.data, transaction);
                results.applied.push({
                  operation_id: change.operation_id,
                  status: "success",
                });
                break;

              case "REMOVE_PLACE":
                await this.removePlace(trip, change.data, transaction);
                results.applied.push({
                  operation_id: change.operation_id,
                  status: "success",
                });
                break;

              case "ADD_ITINERARY":
                await this.addItinerary(trip, change.data, transaction);
                results.applied.push({
                  operation_id: change.operation_id,
                  status: "success",
                });
                break;

              default:
                results.failed.push({
                  operation_id: change.operation_id,
                  status: "failed",
                  error: `Unknown operation: ${change.operation}`,
                });
            }
          } catch (error) {
            console.error(`[TripModificationService] Error applying change ${change.operation_id}:`, error);
            results.failed.push({
              operation_id: change.operation_id,
              status: "failed",
              error: error.message || "Unknown error",
            });
            // Don't throw - let transaction continue or rollback
            throw error;
          }
        }
      });
    } catch (error) {
      console.error("[TripModificationService] Transaction failed:", error);
      throw new Error("Failed to apply changes: " + error.message);
    }

    return results;
  }

  /**
   * Add a city to the trip
   * @param {Trip} trip
   * @param {Object} data - { city_name, country }
   * @param {Transaction} transaction
   */
  async addCity(trip, data, transaction) {
    const { city_name, country } = data;

    // 1. Resolve city (find in DB or create from Google Maps)
    const city = await this.resolveCity(city_name, country, transaction);

    // 2. Check if city already in trip using association methods
    const hasCity = await trip.hasCity(city.id, { transaction });
    if (hasCity) {
      throw new Error(`City ${city_name} is already in this trip`);
    }

    // 3. Get next city_order from existing associated cities
    const existingCities = await trip.getCities({
      joinTableAttributes: ["city_order"],
      transaction,
    });

    const nextOrder =
      existingCities.length > 0
        ? Math.max(
            ...existingCities.map((c) => c.trip_cities?.city_order || 0)
          ) + 1
        : 0;

    // 4. Add city using association method
    await trip.addCity(city.id, {
      through: { city_order: nextOrder },
      transaction,
    });

    console.log(`[TripModificationService] Added city ${city_name} to trip ${trip.id}`);
  }

  /**
   * Remove a city from the trip
   * Cascades to remove places and itinerary items for that city
   * @param {Trip} trip
   * @param {Object} data - { city_id?, city_name }
   * @param {Transaction} transaction
   */
  async removeCity(trip, data, transaction) {
    const { city_id, city_name } = data;

    // 1. Resolve city in trip
    const city = await this.findCityInTrip(trip.id, city_name, city_id, transaction);

    if (!city) {
      throw new Error(`City ${city_name} not found in this trip`);
    }

    // 2. Remove city association using association method
    try {
      await trip.removeCity(city.id, { transaction });
    } catch (err) {
      // Fallback: if association removal fails, try direct destroy
      await sequelize.query(
        "DELETE FROM trip_cities WHERE trip_id = :tripId AND city_id = :cityId",
        { replacements: { tripId: trip.id, cityId: city.id }, transaction }
      );
    }

    // 3. Clean up orphaned places (places in this city that are in the trip)
    const placesInCity = await Place.findAll({
      where: { city_id: city.id },
      attributes: ["id"],
      transaction,
    });

    const placeIds = placesInCity.map((p) => p.id);

    if (placeIds.length > 0) {
      await TripPlace.destroy({
        where: { trip_id: trip.id, place_id: { [Op.in]: placeIds } },
        transaction,
      });

      // 4. Clean up itinerary activities for those places
      const dayRows = await TripItineraryDay.findAll({
        where: { trip_id: trip.id },
        attributes: ["id"],
        transaction,
      });

      const dayIds = dayRows.map((d) => d.id);

      if (dayIds.length > 0) {
        await TripItineraryActivity.destroy({
          where: {
            place_id: { [Op.in]: placeIds },
            itinerary_day_id: { [Op.in]: dayIds },
          },
          transaction,
        });
      }
    }

    console.log(`[TripModificationService] Removed city ${city_name} from trip ${trip.id}`);
  }

  /**
   * Add a place to the trip
   * @param {Trip} trip
   * @param {Object} data - { city_name, place_name, place_id (Google Place ID) }
   * @param {Transaction} transaction
   */
  async addPlace(trip, data, transaction) {
    const { place_id, place_name, city_name } = data;

    // 1. Resolve place (find in DB or fetch from Google Maps)
    const place = await this.resolvePlace(place_id, place_name, transaction);

    // 2. Check if place already in trip
    const existingTripPlace = await TripPlace.findOne({
      where: { trip_id: trip.id, place_id: place.id },
      transaction,
    });

    if (existingTripPlace) {
      throw new Error(`Place ${place_name} is already in this trip`);
    }

    // 3. Get next display_order
    const maxOrder = await TripPlace.max("display_order", {
      where: { trip_id: trip.id },
      transaction,
    });

    const nextOrder = (maxOrder || 0) + 1;

    // 4. Add to trip_places
    await TripPlace.create(
      {
        id: uuidv4(),
        trip_id: trip.id,
        place_id: place.id,
        name: place.name,
        address: place.address,
        rating: place.rating,
        price_level: place.price_level,
        types: place.types,
        display_order: nextOrder,
      },
      { transaction }
    );

    console.log(`[TripModificationService] Added place ${place_name} to trip ${trip.id}`);

    // 5. Ensure the place's city is added to the trip as a city (if place has a city)
    try {
      if (place.city_id) {
        const hasCity = await trip.hasCity(place.city_id, { transaction });

        if (!hasCity) {
          // Compute next city_order from existing cities
          const existingCities = await trip.getCities({
            joinTableAttributes: ["city_order"],
            transaction,
          });

          const nextCityOrder =
            existingCities.length > 0
              ? Math.max(
                  ...existingCities.map((c) => c.trip_cities?.city_order || 0)
                ) + 1
              : 0;

          await trip.addCity(place.city_id, {
            through: { city_order: nextCityOrder },
            transaction,
          });

          console.log(
            `[TripModificationService] Auto-added city ${place.city_id} to trip ${trip.id} when adding place ${place.id}`
          );
        }
      }
    } catch (err) {
      console.warn(
        `[TripModificationService] Failed to auto-add city for place ${place.id}:`,
        err.message
      );
    }
  }

  /**
   * Remove a place from the trip
   * @param {Trip} trip
   * @param {Object} data - { place_name, city_name? }
   * @param {Transaction} transaction
   */
  async removePlace(trip, data, transaction) {
    const { place_name } = data;

    // 1. Find place in trip
    const tripPlace = await TripPlace.findOne({
      where: {
        trip_id: trip.id,
        name: place_name,
      },
      transaction,
    });

    if (!tripPlace) {
      throw new Error(`Place ${place_name} not found in this trip`);
    }

    // 2. Remove from trip_places
    await tripPlace.destroy({ transaction });

    // 3. Remove from itinerary activities if present
    await TripItineraryActivity.destroy({
      where: {
        place_id: tripPlace.place_id,
        itinerary_day_id: {
          [Op.in]: sequelize.literal(
            `(SELECT id FROM trip_itinerary_days WHERE trip_id = '${trip.id}')`
          ),
        },
      },
      transaction,
    });

    console.log(`[TripModificationService] Removed place ${place_name} from trip ${trip.id}`);
  }

  /**
   * Add or replace itinerary for a city
   * @param {Trip} trip
   * @param {Object} data - { city_name, days: [{ day_number, title, activities: [...] }] }
   * @param {Transaction} transaction
   */
  async addItinerary(trip, data, transaction) {
    const { city_name, days } = data;

    // Note: This implementation adds itinerary days without city-specific tracking
    // For MVP, we simply append days to the trip's itinerary

    // 1. Get the next available day_number
    const maxDay = await TripItineraryDay.max("day_number", {
      where: { trip_id: trip.id },
      transaction,
    });

    let currentDayNumber = (maxDay || 0) + 1;

    // 2. Create new itinerary days
    for (const dayData of days) {
      const itineraryDay = await TripItineraryDay.create(
        {
          id: uuidv4(),
          trip_id: trip.id,
          day_number: currentDayNumber,
          title: dayData.title || `Day ${currentDayNumber}`,
        },
        { transaction }
      );

      // 3. Create activities for this day
      const activities = dayData.activities || [];
      for (let i = 0; i < activities.length; i++) {
        const activityData = activities[i];
        let place = null;

        // Try to resolve place if place_id provided
        if (activityData.place_id) {
          try {
            place = await this.resolvePlace(
              activityData.place_id,
              activityData.name,
              transaction
            );
          } catch (error) {
            console.warn(
              `[TripModificationService] Could not resolve place ${activityData.place_id}:`,
              error.message
            );
          }
        }

        await TripItineraryActivity.create(
          {
            id: uuidv4(),
            itinerary_day_id: itineraryDay.id,
            time: activityData.time || null,
            name: activityData.name,
            location: activityData.location || null,
            description: activityData.description || null,
            place_id: place?.id || null,
            activity_order: i,
          },
          { transaction }
        );
      }

      currentDayNumber++;
    }

    console.log(`[TripModificationService] Added itinerary for ${city_name} to trip ${trip.id}`);
  }

  /**
   * Resolve city - find existing or fetch from Google Maps
   * @param {string} cityName
   * @param {string} countryName
   * @param {Transaction} transaction
   * @returns {Promise<City>}
   */
  async resolveCity(cityName, countryName = null, transaction) {
    // 1. Try to find in database
    const whereClause = { name: cityName };
    const include = [{ model: Country, as: "country" }];

    if (countryName) {
      include[0].where = { name: countryName };
    }

    let city = await City.findOne({
      where: whereClause,
      include,
      transaction,
    });

    if (city) {
      return city;
    }

    // 2. Not found - fetch from Google Maps
    const query = countryName ? `${cityName}, ${countryName}` : cityName;
    const gmResults = await googleMapsService.searchCitiesFromGoogle(query);

    if (gmResults.length === 0) {
      throw new Error(`City ${query} not found in Google Maps`);
    }

    const gmDetails = await googleMapsService.getPlaceDetails(
      gmResults[0].google_maps_id
    );

    // 3. Find or create country
    let country = null;
    if (gmDetails.country_code) {
      country = await Country.findOne({
        where: { code: gmDetails.country_code },
        transaction,
      });

      if (!country) {
        country = await Country.create(
          {
            id: uuidv4(),
            name: gmDetails.country_name,
            code: gmDetails.country_code,
          },
          { transaction }
        );
      }
    }

    // 4. Create city
    city = await City.create(
      {
        id: uuidv4(),
        name: gmDetails.name,
        country_id: country?.id || null,
        google_maps_id: gmDetails.google_maps_id,
        latitude: gmDetails.latitude,
        longitude: gmDetails.longitude,
        state: gmDetails.state,
      },
      { transaction }
    );

    return city;
  }

  /**
   * Resolve place - find existing or fetch from Google Maps
   * @param {string} placeId - Google Place ID
   * @param {string} placeName
   * @param {Transaction} transaction
   * @returns {Promise<Place>}
   */
  async resolvePlace(placeId, placeName = null, transaction) {
    // 1. Try to find by Google Place ID
    if (placeId) {
      let place = await Place.findOne({
        where: { google_place_id: placeId },
        transaction,
      });

      if (place) {
        return place;
      }
    }

    // 2. Not found - fetch from Google Maps
    if (!placeId) {
      throw new Error("Place ID required to fetch from Google Maps");
    }

    const gmPlace = await googleMapsService.searchPlace(placeName || placeId);

    if (!gmPlace) {
      throw new Error(`Place ${placeName || placeId} not found in Google Maps`);
    }

    // Get full details
    const gmDetails = await googleMapsService.getPlaceDetails(
      gmPlace.google_place_id
    );

    // 3. Resolve city for this place
    let city = null;
    if (gmDetails.name && gmDetails.country_name) {
      try {
        city = await this.resolveCity(
          gmDetails.name,
          gmDetails.country_name,
          transaction
        );
      } catch (error) {
        console.warn(
          `[TripModificationService] Could not resolve city for place:`,
          error.message
        );
      }
    }

    // 4. Create place
    const place = await Place.create(
      {
        id: uuidv4(),
        google_place_id: gmPlace.google_place_id,
        name: gmPlace.name,
        address: gmDetails.formatted_address,
        city_id: city?.id || null,
        latitude: gmDetails.latitude,
        longitude: gmDetails.longitude,
        rating: gmPlace.rating,
        user_ratings_total: gmPlace.user_ratings_total || 0,
        price_level: gmPlace.price_level,
        types: gmPlace.types || gmDetails.types,
      },
      { transaction }
    );

    return place;
  }

  /**
   * Find a city within a trip
   * @param {string} tripId
   * @param {string} cityName
   * @param {string} cityId
   * @param {Transaction} transaction
   * @returns {Promise<City|null>}
   */
  async findCityInTrip(tripId, cityName, cityId = null, transaction) {
    // If cityId provided, verify it exists and is associated with the trip
    if (cityId) {
      const city = await City.findByPk(cityId, { transaction });
      if (!city) return null;

      const tripWithCity = await Trip.findOne({
        where: { id: tripId },
        include: [
          {
            model: City,
            as: "cities",
            where: { id: cityId },
            attributes: ["id"],
          },
        ],
        transaction,
      });

      return tripWithCity && tripWithCity.cities && tripWithCity.cities.length > 0 ? city : null;
    }

    // Otherwise, search by name
    const tripWithNamedCity = await Trip.findOne({
      where: { id: tripId },
      include: [
        {
          model: City,
          as: "cities",
          where: { name: cityName },
          attributes: ["id"],
        },
      ],
      transaction,
    });

    if (!tripWithNamedCity || !tripWithNamedCity.cities || tripWithNamedCity.cities.length === 0) {
      return null;
    }

    const cityIdFound = tripWithNamedCity.cities[0].id;
    return await City.findByPk(cityIdFound, { transaction });
  }
}

module.exports = new TripModificationService();
