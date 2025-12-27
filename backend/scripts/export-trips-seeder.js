const { sequelize, initModels } = require("../src/models/sequelize");
const {
  Trip,
  User,
  City,
  Country,
  TripCity,
  TripTag,
  TripPlace,
  TripItineraryDay,
  TripItineraryActivity,
  TripImage,
  Place,
  PlacePhoto,
  CityPhoto,
} = require("../src/models/sequelize");

async function exportTrips() {
  // Initialize model associations
  initModels();
  try {
    console.log("[Export] Fetching walvee user...");

    // Find walvee user
    const { Op } = require("sequelize");
    const walveeUser = await User.findOne({
      where: {
        email: { [Op.like]: '%walvee%' }
      }
    });

    if (!walveeUser) {
      console.error("[Export] Walvee user not found!");
      process.exit(1);
    }

    console.log(`[Export] Found walvee user: ${walveeUser.email} (${walveeUser.id})`);
    console.log("[Export] Fetching 10 trips from walvee user...");

    // Fetch 10 public trips from walvee user with all related data
    const trips = await Trip.findAll({
      where: {
        is_public: true,
        author_id: walveeUser.id
      },
      limit: 10,
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "email", "full_name", "preferred_name", "photo_url", "bio"],
        },
        {
          model: City,
          as: "cities",
          include: [
            {
              model: Country,
              as: "country",
            },
            {
              model: CityPhoto,
              as: "photos",
            },
          ],
          through: { attributes: ["city_order"] },
        },
        {
          model: TripTag,
          as: "tags",
        },
        {
          model: TripPlace,
          as: "places",
          include: [
            {
              model: Place,
              as: "place",
              include: [
                {
                  model: PlacePhoto,
                  as: "photos",
                },
              ],
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
            },
          ],
        },
        {
          model: TripImage,
          as: "images",
          include: [
            {
              model: PlacePhoto,
              as: "placePhoto",
            },
            {
              model: CityPhoto,
              as: "cityPhoto",
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    console.log(`[Export] Found ${trips.length} trips`);

    // Convert to plain objects
    const tripsData = trips.map((trip) => trip.toJSON());

    // Create the seeder file content
    const seederContent = `'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tripsData = ${JSON.stringify(tripsData, null, 2)};

    // Process each trip
    for (const tripData of tripsData) {
      console.log(\`Processing trip: \${tripData.title}\`);

      // Create/update author
      if (tripData.author) {
        await queryInterface.bulkInsert('users', [{
          id: tripData.author.id,
          email: tripData.author.email,
          full_name: tripData.author.full_name,
          preferred_name: tripData.author.preferred_name,
          photo_url: tripData.author.photo_url,
          bio: tripData.author.bio,
          created_at: new Date(),
          updated_at: new Date(),
        }], { ignoreDuplicates: true });
      }

      // Create/update countries
      const countries = new Set();
      if (tripData.cities && tripData.cities.length > 0) {
        for (const city of tripData.cities) {
          if (city.country) {
            countries.add(JSON.stringify({
              id: city.country.id,
              name: city.country.name,
              code: city.country.code,
            }));
          }
        }
      }

      for (const countryStr of countries) {
        const country = JSON.parse(countryStr);
        await queryInterface.bulkInsert('countries', [{
          id: country.id,
          name: country.name,
          code: country.code,
          created_at: new Date(),
          updated_at: new Date(),
        }], { ignoreDuplicates: true });
      }

      // Create/update cities
      if (tripData.cities && tripData.cities.length > 0) {
        for (const city of tripData.cities) {
          await queryInterface.bulkInsert('cities', [{
            id: city.id,
            name: city.name,
            country_id: city.country?.id || null,
            latitude: city.latitude,
            longitude: city.longitude,
            created_at: new Date(),
            updated_at: new Date(),
          }], { ignoreDuplicates: true });

          // Insert city photos
          if (city.photos && city.photos.length > 0) {
            await queryInterface.bulkInsert('city_photos',
              city.photos.map(photo => ({
                id: photo.id,
                city_id: city.id,
                url: photo.url,
                photo_order: photo.photo_order || 0,
                created_at: new Date(),
              })),
              { ignoreDuplicates: true }
            );
          }
        }
      }

      // Create/update places
      if (tripData.places && tripData.places.length > 0) {
        for (const tripPlace of tripData.places) {
          if (tripPlace.place) {
            const place = tripPlace.place;
            await queryInterface.bulkInsert('places', [{
              id: place.id,
              google_place_id: place.google_place_id,
              name: place.name,
              address: place.address,
              latitude: place.latitude,
              longitude: place.longitude,
              rating: place.rating,
              user_ratings_total: place.user_ratings_total,
              price_level: place.price_level,
              types: JSON.stringify(place.types || []),
              city_id: place.city_id,
              created_at: new Date(),
              updated_at: new Date(),
            }], { ignoreDuplicates: true });

            // Insert place photos
            if (place.photos && place.photos.length > 0) {
              await queryInterface.bulkInsert('place_photos',
                place.photos.map(photo => ({
                  id: photo.id,
                  place_id: place.id,
                  url: photo.url,
                  photo_order: photo.photo_order || 0,
                  created_at: new Date(),
                })),
                { ignoreDuplicates: true }
              );
            }
          }
        }
      }

      // Create trip
      await queryInterface.bulkInsert('trips', [{
        id: tripData.id,
        author_id: tripData.author_id,
        title: tripData.title,
        description: tripData.description,
        destination_lat: tripData.destination_lat,
        destination_lng: tripData.destination_lng,
        duration: tripData.duration,
        budget: tripData.budget,
        transportation: tripData.transportation,
        accommodation: tripData.accommodation,
        best_time_to_visit: tripData.best_time_to_visit,
        difficulty_level: tripData.difficulty_level,
        trip_type: tripData.trip_type,
        is_public: tripData.is_public,
        is_featured: tripData.is_featured,
        is_draft: tripData.is_draft,
        views_count: tripData.views_count || 0,
        created_at: new Date(tripData.created_at),
        updated_at: new Date(tripData.updated_at),
      }], { ignoreDuplicates: true });

      // Create trip-city associations
      if (tripData.cities && tripData.cities.length > 0) {
        await queryInterface.bulkInsert('trip_cities',
          tripData.cities.map(city => ({
            trip_id: tripData.id,
            city_id: city.id,
            city_order: city.trip_cities?.city_order || city.Cities?.city_order || 0,
            created_at: new Date(),
          })),
          { ignoreDuplicates: true }
        );
      }

      // Create tags
      if (tripData.tags && tripData.tags.length > 0) {
        await queryInterface.bulkInsert('trip_tags',
          tripData.tags.map(tag => ({
            id: tag.id,
            trip_id: tripData.id,
            tag: tag.tag,
            created_at: new Date(),
          })),
          { ignoreDuplicates: true }
        );
      }

      // Create trip places
      if (tripData.places && tripData.places.length > 0) {
        await queryInterface.bulkInsert('trip_places',
          tripData.places.map(tp => ({
            id: tp.id,
            trip_id: tripData.id,
            place_id: tp.place_id,
            name: tp.name,
            address: tp.address,
            rating: tp.rating,
            price_level: tp.price_level,
            types: JSON.stringify(tp.types || []),
            description: tp.description,
            created_at: new Date(tp.created_at),
          })),
          { ignoreDuplicates: true }
        );
      }

      // Create itinerary days
      if (tripData.itineraryDays && tripData.itineraryDays.length > 0) {
        for (const day of tripData.itineraryDays) {
          await queryInterface.bulkInsert('trip_itinerary_days', [{
            id: day.id,
            trip_id: tripData.id,
            city_id: day.city_id,
            day_number: day.day_number,
            title: day.title,
            description: day.description,
            created_at: new Date(day.created_at),
          }], { ignoreDuplicates: true });

          // Create activities
          if (day.activities && day.activities.length > 0) {
            await queryInterface.bulkInsert('trip_itinerary_activities',
              day.activities.map(activity => ({
                id: activity.id,
                itinerary_day_id: day.id,
                time: activity.time,
                name: activity.name,
                location: activity.location,
                description: activity.description,
                activity_order: activity.activity_order,
                place_id: activity.place_id,
                created_at: new Date(activity.created_at),
              })),
              { ignoreDuplicates: true }
            );
          }
        }
      }

      // Create trip images
      if (tripData.images && tripData.images.length > 0) {
        await queryInterface.bulkInsert('trip_images',
          tripData.images.map(img => ({
            id: img.id,
            trip_id: tripData.id,
            place_photo_id: img.place_photo_id,
            city_photo_id: img.city_photo_id,
            image_order: img.image_order,
            created_at: new Date(img.created_at),
          })),
          { ignoreDuplicates: true }
        );
      }
    }

    console.log('Seeder completed successfully!');
  },

  down: async (queryInterface, Sequelize) => {
    const tripsData = ${JSON.stringify(tripsData, null, 2)};

    console.log('Rolling back seeded trips...');

    // Collect all IDs for deletion
    const tripIds = tripsData.map(t => t.id);
    const itineraryDayIds = [];
    const activityIds = [];
    const tripPlaceIds = [];
    const tripTagIds = [];
    const tripImageIds = [];
    const placeIds = [];
    const placePhotoIds = [];
    const cityIds = [];
    const cityPhotoIds = [];
    const countryIds = [];

    // Collect IDs from trip data
    for (const trip of tripsData) {
      // Collect itinerary day and activity IDs
      if (trip.itineraryDays) {
        for (const day of trip.itineraryDays) {
          itineraryDayIds.push(day.id);
          if (day.activities) {
            activityIds.push(...day.activities.map(a => a.id));
          }
        }
      }

      // Collect trip place IDs
      if (trip.places) {
        tripPlaceIds.push(...trip.places.map(tp => tp.id));
        for (const tp of trip.places) {
          if (tp.place) {
            placeIds.push(tp.place.id);
            if (tp.place.photos) {
              placePhotoIds.push(...tp.place.photos.map(p => p.id));
            }
          }
        }
      }

      // Collect trip tag IDs
      if (trip.tags) {
        tripTagIds.push(...trip.tags.map(t => t.id));
      }

      // Collect trip image IDs
      if (trip.images) {
        tripImageIds.push(...trip.images.map(i => i.id));
      }

      // Collect city and country IDs
      if (trip.cities) {
        for (const city of trip.cities) {
          cityIds.push(city.id);
          if (city.photos) {
            cityPhotoIds.push(...city.photos.map(p => p.id));
          }
          if (city.country) {
            countryIds.push(city.country.id);
          }
        }
      }
    }

    // Delete in reverse order of creation (respecting foreign key constraints)
    console.log(\`Deleting \${tripImageIds.length} trip images...\`);
    if (tripImageIds.length > 0) {
      await queryInterface.bulkDelete('trip_images', { id: tripImageIds });
    }

    console.log(\`Deleting \${activityIds.length} itinerary activities...\`);
    if (activityIds.length > 0) {
      await queryInterface.bulkDelete('trip_itinerary_activities', { id: activityIds });
    }

    console.log(\`Deleting \${itineraryDayIds.length} itinerary days...\`);
    if (itineraryDayIds.length > 0) {
      await queryInterface.bulkDelete('trip_itinerary_days', { id: itineraryDayIds });
    }

    console.log(\`Deleting \${tripPlaceIds.length} trip places...\`);
    if (tripPlaceIds.length > 0) {
      await queryInterface.bulkDelete('trip_places', { id: tripPlaceIds });
    }

    console.log(\`Deleting \${tripTagIds.length} trip tags...\`);
    if (tripTagIds.length > 0) {
      await queryInterface.bulkDelete('trip_tags', { id: tripTagIds });
    }

    console.log(\`Deleting trip-city associations...\`);
    if (tripIds.length > 0) {
      await queryInterface.bulkDelete('trip_cities', { trip_id: tripIds });
    }

    console.log(\`Deleting \${tripIds.length} trips...\`);
    if (tripIds.length > 0) {
      await queryInterface.bulkDelete('trips', { id: tripIds });
    }

    console.log(\`Deleting \${placePhotoIds.length} place photos...\`);
    if (placePhotoIds.length > 0) {
      await queryInterface.bulkDelete('place_photos', { id: placePhotoIds });
    }

    console.log(\`Deleting \${placeIds.length} places...\`);
    if (placeIds.length > 0) {
      await queryInterface.bulkDelete('places', { id: placeIds });
    }

    console.log(\`Deleting \${cityPhotoIds.length} city photos...\`);
    if (cityPhotoIds.length > 0) {
      await queryInterface.bulkDelete('city_photos', { id: cityPhotoIds });
    }

    console.log(\`Deleting \${cityIds.length} cities...\`);
    if (cityIds.length > 0) {
      await queryInterface.bulkDelete('cities', { id: cityIds });
    }

    console.log(\`Deleting \${countryIds.length} countries...\`);
    if (countryIds.length > 0) {
      await queryInterface.bulkDelete('countries', { id: countryIds });
    }

    console.log('Rollback completed successfully!');
  }
};
`;

    // Write the seeder file
    const fs = require("fs");
    const path = require("path");
    const timestamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0];
    const filename = `${timestamp}-seed-walvee-trips.js`;
    const filepath = path.join(__dirname, "../src/database/seeders", filename);

    fs.writeFileSync(filepath, seederContent);

    console.log(`[Export] Seeder created: ${filepath}`);
    console.log(`[Export] Run with: npx sequelize-cli db:seed --seed ${filename}`);

    process.exit(0);
  } catch (error) {
    console.error("[Export] Error:", error);
    process.exit(1);
  }
}

// Run the export
exportTrips();
