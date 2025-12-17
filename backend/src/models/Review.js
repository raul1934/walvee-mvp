const { query } = require("../database/connection");
const { generateUUID } = require("../utils/helpers");

class ReviewModel {
  async create(reviewData) {
    const id = generateUUID();
    const {
      tripId = null,
      placeId = null,
      reviewerId,
      rating,
      comment = null,
    } = reviewData;

    const sql = `
      INSERT INTO reviews (id, trip_id, place_id, reviewer_id, rating, comment)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await query(sql, [id, tripId, placeId, reviewerId, rating, comment]);
    return this.findById(id);
  }

  async findById(id) {
    const sql = "SELECT * FROM reviews WHERE id = ?";
    const reviews = await query(sql, [id]);
    return reviews[0] || null;
  }

  async update(id, reviewData) {
    const updates = [];
    const values = [];

    if (reviewData.rating !== undefined) {
      updates.push("rating = ?");
      values.push(reviewData.rating);
    }

    if (reviewData.comment !== undefined) {
      updates.push("comment = ?");
      values.push(reviewData.comment);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const sql = `UPDATE reviews SET ${updates.join(", ")} WHERE id = ?`;
    await query(sql, values);

    return this.findById(id);
  }

  async delete(id) {
    const sql = "DELETE FROM reviews WHERE id = ?";
    await query(sql, [id]);
  }

  async findAll(options = {}) {
    const { tripId = null, placeId = null, offset = 0, limit = 20 } = options;

    let sql = "SELECT * FROM reviews WHERE 1=1";
    const params = [];

    if (tripId) {
      sql += " AND trip_id = ?";
      params.push(tripId);
    }

    if (placeId) {
      sql += " AND place_id = ?";
      params.push(placeId);
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    return await query(sql, params);
  }

  async count(options = {}) {
    const { tripId = null, placeId = null } = options;

    let sql = "SELECT COUNT(*) as total FROM reviews WHERE 1=1";
    const params = [];

    if (tripId) {
      sql += " AND trip_id = ?";
      params.push(tripId);
    }

    if (placeId) {
      sql += " AND place_id = ?";
      params.push(placeId);
    }

    const result = await query(sql, params);
    return result[0].total;
  }
}

module.exports = new ReviewModel();
