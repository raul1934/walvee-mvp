const { query } = require("../database/connection");
const { generateUUID } = require("../utils/helpers");

class FollowModel {
  async create(followerId, followeeId, followeeEmail = null) {
    const id = generateUUID();
    const sql =
      "INSERT INTO follows (id, follower_id, followee_id, followee_email) VALUES (?, ?, ?, ?)";

    try {
      await query(sql, [id, followerId, followeeId, followeeEmail]);
      return this.findById(id);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return null; // Already following
      }
      throw error;
    }
  }

  async findById(id) {
    const sql = "SELECT * FROM follows WHERE id = ?";
    const follows = await query(sql, [id]);
    return follows[0] || null;
  }

  async findByFollowerAndFollowee(followerId, followeeId) {
    const sql =
      "SELECT * FROM follows WHERE follower_id = ? AND followee_id = ?";
    const follows = await query(sql, [followerId, followeeId]);
    return follows[0] || null;
  }

  async delete(id) {
    const sql = "DELETE FROM follows WHERE id = ?";
    await query(sql, [id]);
  }

  async findFollowers(userId, offset = 0, limit = 20) {
    const sql =
      "SELECT * FROM follows WHERE followee_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
    return await query(sql, [userId, limit, offset]);
  }

  async findFollowing(userId, offset = 0, limit = 20) {
    const sql =
      "SELECT * FROM follows WHERE follower_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
    return await query(sql, [userId, limit, offset]);
  }

  async countFollowers(userId) {
    const sql = "SELECT COUNT(*) as total FROM follows WHERE followee_id = ?";
    const result = await query(sql, [userId]);
    return result[0].total;
  }

  async countFollowing(userId) {
    const sql = "SELECT COUNT(*) as total FROM follows WHERE follower_id = ?";
    const result = await query(sql, [userId]);
    return result[0].total;
  }
}

module.exports = new FollowModel();
