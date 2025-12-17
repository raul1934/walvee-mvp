const { query } = require("../database/connection");
const { generateUUID } = require("../utils/helpers");

class TripModel {
  async create(tripData) {
    const id = generateUUID();
    const {
      title,
      destination,
      description = null,
      duration = null,
      budget = null,
      transportation = null,
      accommodation = null,
      bestTimeToVisit = null,
      difficultyLevel = null,
      tripType = null,
      coverImage = null,
      authorId,
      destinationLat = null,
      destinationLng = null,
      isPublic = true,
      isFeatured = false,
      tags = [],
      places = [],
      itinerary = [],
    } = tripData;

    const sql = `
      INSERT INTO trips (
        id, title, destination, description, duration, budget,
        transportation, accommodation, best_time_to_visit, difficulty_level,
        trip_type, cover_image, author_id, destination_lat, destination_lng,
        is_public, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await query(sql, [
      id,
      title,
      destination,
      description,
      duration,
      budget,
      transportation,
      accommodation,
      bestTimeToVisit,
      difficultyLevel,
      tripType,
      coverImage,
      authorId,
      destinationLat,
      destinationLng,
      isPublic,
      isFeatured,
    ]);

    // Insert tags
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await query(
          "INSERT INTO trip_tags (id, trip_id, tag) VALUES (?, ?, ?)",
          [generateUUID(), id, tag]
        );
      }
    }

    // Insert places
    if (places && places.length > 0) {
      for (const place of places) {
        await query(
          `INSERT INTO trip_places (id, trip_id, name, address, rating, price_level, types, description)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            generateUUID(),
            id,
            place.name,
            place.address || null,
            place.rating || null,
            place.priceLevel || null,
            place.types ? JSON.stringify(place.types) : null,
            place.description || null,
          ]
        );
      }
    }

    // Insert itinerary
    if (itinerary && itinerary.length > 0) {
      for (const day of itinerary) {
        const dayId = generateUUID();
        await query(
          "INSERT INTO trip_itinerary_days (id, trip_id, day_number, title) VALUES (?, ?, ?, ?)",
          [dayId, id, day.day, day.title || null]
        );

        // Insert activities for this day
        if (day.activities && day.activities.length > 0) {
          for (let i = 0; i < day.activities.length; i++) {
            const activity = day.activities[i];
            await query(
              `INSERT INTO trip_itinerary_activities (id, itinerary_day_id, time, name, location, description, activity_order)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                generateUUID(),
                dayId,
                activity.time || null,
                activity.name,
                activity.location || null,
                activity.description || null,
                i,
              ]
            );
          }
        }
      }
    }

    return this.findById(id);
  }

  async findById(id) {
    const sql = `
      SELECT 
        t.*,
        u.full_name as author_name,
        u.preferred_name as author_preferred_name,
        u.photo_url as author_photo,
        u.email as author_email,
        u.bio as author_bio
      FROM trips t
      INNER JOIN users u ON t.author_id = u.id
      WHERE t.id = ?
    `;
    const trips = await query(sql, [id]);
    if (!trips[0]) return null;

    return this.formatTrip(trips[0]);
  }

  async update(id, tripData) {
    const allowedFields = [
      "title",
      "destination",
      "description",
      "duration",
      "budget",
      "transportation",
      "accommodation",
      "best_time_to_visit",
      "difficulty_level",
      "trip_type",
      "cover_image",
      "destination_lat",
      "destination_lng",
      "is_public",
      "is_featured",
    ];

    const updates = [];
    const values = [];

    Object.keys(tripData).forEach((key) => {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );
      if (allowedFields.includes(snakeKey)) {
        updates.push(`${snakeKey} = ?`);
        values.push(tripData[key]);
      }
    });

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const sql = `UPDATE trips SET ${updates.join(", ")} WHERE id = ?`;
    await query(sql, values);

    // Handle tags update if provided
    if (tripData.tags) {
      await query("DELETE FROM trip_tags WHERE trip_id = ?", [id]);
      for (const tag of tripData.tags) {
        await query(
          "INSERT INTO trip_tags (id, trip_id, tag) VALUES (?, ?, ?)",
          [generateUUID(), id, tag]
        );
      }
    }

    // Handle places update if provided
    if (tripData.places) {
      await query("DELETE FROM trip_places WHERE trip_id = ?", [id]);
      for (const place of tripData.places) {
        await query(
          `INSERT INTO trip_places (id, trip_id, name, address, rating, price_level, types, description)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            generateUUID(),
            id,
            place.name,
            place.address || null,
            place.rating || null,
            place.priceLevel || null,
            place.types ? JSON.stringify(place.types) : null,
            place.description || null,
          ]
        );
      }
    }

    // Handle itinerary update if provided
    if (tripData.itinerary) {
      // Delete existing itinerary (cascades to activities)
      await query("DELETE FROM trip_itinerary_days WHERE trip_id = ?", [id]);
      
      for (const day of tripData.itinerary) {
        const dayId = generateUUID();
        await query(
          "INSERT INTO trip_itinerary_days (id, trip_id, day_number, title) VALUES (?, ?, ?, ?)",
          [dayId, id, day.day, day.title || null]
        );

        if (day.activities && day.activities.length > 0) {
          for (let i = 0; i < day.activities.length; i++) {
            const activity = day.activities[i];
            await query(
              `INSERT INTO trip_itinerary_activities (id, itinerary_day_id, time, name, location, description, activity_order)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                generateUUID(),
                dayId,
                activity.time || null,
                activity.name,
                activity.location || null,
                activity.description || null,
                i,
              ]
            );
          }
        }
      }
    }

    return this.findById(id);
  }

  async delete(id) {
    const sql = "DELETE FROM trips WHERE id = ?";
    await query(sql, [id]);
  }

  async findAll(options = {}) {
    const {
      offset = 0,
      limit = 20,
      sortBy = "created_at",
      order = "desc",
      destination = "",
      createdBy = "",
      isPublic = "",
      minLikes = null,
      search = "",
    } = options;

    // Validate sortBy to prevent SQL injection
    const validSortColumns = [
      "created_at",
      "updated_at",
      "likes_count",
      "views_count",
      "title",
      "destination",
      "duration",
      "budget",
    ];
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : "created_at";

    // Validate order to prevent SQL injection
    const safeOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";

    let sql = `
      SELECT
        t.*,
        u.full_name as author_name,
        u.preferred_name as author_preferred_name,
        u.photo_url as author_photo,
        u.email as author_email
      FROM trips t
      INNER JOIN users u ON t.author_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (destination) {
      sql += " AND t.destination LIKE ?";
      params.push(`%${destination}%`);
    }

    if (createdBy) {
      sql += " AND t.author_id = ?";
      params.push(createdBy);
    }

    if (isPublic !== "") {
      sql += " AND t.is_public = ?";
      params.push(isPublic);
    }

    if (minLikes !== null) {
      sql += " AND t.likes_count >= ?";
      params.push(minLikes);
    }

    if (search) {
      sql +=
        " AND MATCH(t.title, t.destination, t.description) AGAINST (? IN NATURAL LANGUAGE MODE)";
      params.push(search);
    }

    sql += ` ORDER BY t.${safeSortBy} ${safeOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const trips = await query(sql, params);
    return Promise.all(trips.map((trip) => this.formatTrip(trip)));
  }

  async count(options = {}) {
    const {
      destination = "",
      createdBy = "",
      isPublic = "",
      minLikes = null,
      search = "",
    } = options;

    let sql = "SELECT COUNT(*) as total FROM trips t WHERE 1=1";
    const params = [];

    if (destination) {
      sql += " AND t.destination LIKE ?";
      params.push(`%${destination}%`);
    }

    if (createdBy) {
      sql += " AND t.author_id = ?";
      params.push(createdBy);
    }

    if (isPublic !== "") {
      sql += " AND t.is_public = ?";
      params.push(isPublic);
    }

    if (minLikes !== null) {
      sql += " AND t.likes_count >= ?";
      params.push(minLikes);
    }

    if (search) {
      sql +=
        " AND MATCH(t.title, t.destination, t.description) AGAINST (? IN NATURAL LANGUAGE MODE)";
      params.push(search);
    }

    const result = await query(sql, params);
    return result[0].total;
  }

  async incrementLikes(id) {
    const sql = "UPDATE trips SET likes_count = likes_count + 1 WHERE id = ?";
    await query(sql, [id]);
  }

  async decrementLikes(id) {
    const sql =
      "UPDATE trips SET likes_count = GREATEST(0, likes_count - 1) WHERE id = ?";
    await query(sql, [id]);
  }

  async incrementViews(id) {
    const sql = "UPDATE trips SET views_count = views_count + 1 WHERE id = ?";
    await query(sql, [id]);
  }

  async formatTrip(trip) {
    // Get tags
    const tags = await query("SELECT tag FROM trip_tags WHERE trip_id = ?", [
      trip.id,
    ]);

    // Get places
    const places = await query(
      "SELECT name, address, rating, price_level, types, description FROM trip_places WHERE trip_id = ?",
      [trip.id]
    );

    // Get itinerary
    const days = await query(
      `SELECT id, day_number, title FROM trip_itinerary_days WHERE trip_id = ? ORDER BY day_number`,
      [trip.id]
    );

    const itinerary = [];
    for (const day of days) {
      const activities = await query(
        `SELECT time, name, location, description FROM trip_itinerary_activities 
         WHERE itinerary_day_id = ? ORDER BY activity_order`,
        [day.id]
      );

      itinerary.push({
        day: day.day_number,
        title: day.title,
        activities: activities,
      });
    }

    // Format places with parsed types
    const formattedPlaces = places.map((place) => ({
      ...place,
      types: place.types ? JSON.parse(place.types) : [],
    }));

    return {
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      description: trip.description,
      duration: trip.duration,
      budget: trip.budget,
      transportation: trip.transportation,
      accommodation: trip.accommodation,
      bestTimeToVisit: trip.best_time_to_visit,
      difficultyLevel: trip.difficulty_level,
      tripType: trip.trip_type,
      coverImage: trip.cover_image,
      destinationLat: trip.destination_lat,
      destinationLng: trip.destination_lng,
      isPublic: trip.is_public,
      isFeatured: trip.is_featured,
      likesCount: trip.likes_count,
      viewsCount: trip.views_count,
      createdAt: trip.created_at,
      updatedAt: trip.updated_at,
      author: {
        id: trip.author_id,
        name: trip.author_name,
        preferredName: trip.author_preferred_name,
        photo: trip.author_photo,
        email: trip.author_email,
        bio: trip.author_bio,
      },
      tags: tags.map((t) => t.tag),
      places: formattedPlaces,
      itinerary: itinerary,
    };
  }
}

module.exports = new TripModel();
