const { City, Country } = require("../models/sequelize");
const { Op } = require("sequelize");
const {
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");

/**
 * Search cities with auto-population from Google Maps API
 * This endpoint searches existing cities and creates new ones if not found
 */
const searchCities = async (req, res, next) => {
  try {
    const { query, google_maps_id } = req.query;

    if (!query && !google_maps_id) {
      return res
        .status(400)
        .json(
          buildErrorResponse(
            "INVALID_INPUT",
            "Query or google_maps_id is required"
          )
        );
    }

    // If google_maps_id is provided, search by it first
    if (google_maps_id) {
      const existingCity = await City.findOne({
        where: { google_maps_id },
        include: [{ model: Country, as: "country" }],
      });

      if (existingCity) {
        return res.json(buildSuccessResponse([existingCity]));
      }
    }

    // Search existing cities by name
    if (query) {
      const existingCities = await City.findAll({
        where: {
          name: { [Op.like]: `%${query}%` },
        },
        include: [{ model: Country, as: "country" }],
        limit: 10,
        order: [["name", "ASC"]],
      });

      if (existingCities.length > 0) {
        return res.json(buildSuccessResponse(existingCities));
      }
    }

    // If no cities found and google_maps_id is provided, we would need to
    // fetch from Google Maps API here. For now, return empty array.
    // TODO: Implement Google Maps API integration
    return res.json(
      buildSuccessResponse([], {
        message:
          "No cities found. Google Maps API integration pending for auto-population.",
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get or create a city from Google Maps data
 * This is used when we need to ensure a city exists in our database
 */
const getOrCreateCity = async (req, res, next) => {
  try {
    const { name, country_code, country_name, google_maps_id, state, latitude, longitude, timezone } = req.body;

    if (!name || (!country_code && !country_name)) {
      return res
        .status(400)
        .json(
          buildErrorResponse(
            "INVALID_INPUT",
            "City name and country information are required"
          )
        );
    }

    // First, check if city already exists by google_maps_id
    if (google_maps_id) {
      const existingCity = await City.findOne({
        where: { google_maps_id },
        include: [{ model: Country, as: "country" }],
      });

      if (existingCity) {
        return res.json(buildSuccessResponse(existingCity));
      }
    }

    // Find or create the country first
    let country;
    if (country_code) {
      [country] = await Country.findOrCreate({
        where: { code: country_code.toUpperCase() },
        defaults: {
          name: country_name || country_code.toUpperCase(),
          code: country_code.toUpperCase(),
        },
      });
    } else {
      [country] = await Country.findOrCreate({
        where: { name: country_name },
        defaults: {
          name: country_name,
          code: country_name.substring(0, 2).toUpperCase(),
        },
      });
    }

    // Check if city already exists with same name and country
    const existingCity = await City.findOne({
      where: {
        name,
        country_id: country.id,
      },
      include: [{ model: Country, as: "country" }],
    });

    if (existingCity) {
      // Update google_maps_id if it wasn't set before
      if (google_maps_id && !existingCity.google_maps_id) {
        await existingCity.update({ google_maps_id });
      }
      return res.json(buildSuccessResponse(existingCity));
    }

    // Create new city
    const newCity = await City.create({
      name,
      country_id: country.id,
      google_maps_id,
      state,
      latitude,
      longitude,
      timezone,
    });

    // Fetch with country data
    const cityWithCountry = await City.findByPk(newCity.id, {
      include: [{ model: Country, as: "country" }],
    });

    res.status(201).json(buildSuccessResponse(cityWithCountry));
  } catch (error) {
    next(error);
  }
};

/**
 * Get city by ID
 */
const getCityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const city = await City.findByPk(id, {
      include: [{ model: Country, as: "country" }],
    });

    if (!city) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "City not found"));
    }

    res.json(buildSuccessResponse(city));
  } catch (error) {
    next(error);
  }
};

/**
 * Get all cities for a country
 */
const getCitiesByCountry = async (req, res, next) => {
  try {
    const { country_id, country_code } = req.query;

    if (!country_id && !country_code) {
      return res
        .status(400)
        .json(
          buildErrorResponse(
            "INVALID_INPUT",
            "country_id or country_code is required"
          )
        );
    }

    let country;
    if (country_code) {
      country = await Country.findOne({
        where: { code: country_code.toUpperCase() },
      });
    } else {
      country = await Country.findByPk(country_id);
    }

    if (!country) {
      return res
        .status(404)
        .json(buildErrorResponse("RESOURCE_NOT_FOUND", "Country not found"));
    }

    const cities = await City.findAll({
      where: { country_id: country.id },
      include: [{ model: Country, as: "country" }],
      order: [["name", "ASC"]],
    });

    res.json(buildSuccessResponse(cities));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchCities,
  getOrCreateCity,
  getCityById,
  getCitiesByCountry,
};
