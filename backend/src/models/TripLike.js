const { query } = require("../database/connection");
const { generateUUID } = require("../utils/helpers");

class TripLikeModel {
  async create(tripId, likerId) {
    const id = generateUUID();
    const sql =
      "INSERT INTO trip_likes (id, trip_id, liker_id) VALUES (?, ?, ?)";

    try {
      await query(sql, [id, tripId, likerId]);
      return this.findById(id);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return null; // Already liked
      }
      throw error;
    }
  }

  async findById(id) {
    const sql = "SELECT * FROM trip_likes WHERE id = ?";
    const likes = await query(sql, [id]);
    return likes[0] || null;
  }

  async findByTripAndLiker(tripId, likerId) {
    const sql = "SELECT * FROM trip_likes WHERE trip_id = ? AND liker_id = ?";
    const likes = await query(sql, [tripId, likerId]);
    return likes[0] || null;
  }

  async delete(id) {
    const sql = "DELETE FROM trip_likes WHERE id = ?";
    await query(sql, [id]);
  }

  async findByLiker(likerId, offset = 0, limit = 20) {
    const sql =
      "SELECT * FROM trip_likes WHERE liker_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
    return await query(sql, [likerId, limit, offset]);
  }

  async findByTrip(tripId, offset = 0, limit = 20) {
    const sql =
      "SELECT * FROM trip_likes WHERE trip_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
    return await query(sql, [tripId, limit, offset]);
  }

  async countByLiker(likerId) {
    const sql = "SELECT COUNT(*) as total FROM trip_likes WHERE liker_id = ?";
    const result = await query(sql, [likerId]);
    return result[0].total;
  }

  async countByTrip(tripId) {
    const sql = "SELECT COUNT(*) as total FROM trip_likes WHERE trip_id = ?";
    const result = await query(sql, [tripId]);
    return result[0].total;
  }
}

module.exports = new TripLikeModel();
