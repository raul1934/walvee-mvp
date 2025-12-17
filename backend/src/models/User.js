const { query } = require("../database/connection");
const { generateUUID } = require("../utils/helpers");

class UserModel {
  async create(userData) {
    const id = generateUUID();
    const {
      email,
      googleId,
      fullName,
      preferredName = null,
      photoUrl = null,
      bio = null,
      city = null,
      country = null,
      instagramUsername = null,
    } = userData;

    const sql = `
      INSERT INTO users (
        id, email, google_id, full_name, preferred_name, photo_url,
        bio, city, country, instagram_username
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await query(sql, [
      id,
      email,
      googleId,
      fullName,
      preferredName,
      photoUrl,
      bio,
      city,
      country,
      instagramUsername,
    ]);

    return this.findById(id);
  }

  async findById(id) {
    const sql = "SELECT * FROM users WHERE id = ?";
    const users = await query(sql, [id]);
    return users[0] || null;
  }

  async findByEmail(email) {
    const sql = "SELECT * FROM users WHERE email = ?";
    const users = await query(sql, [email]);
    return users[0] || null;
  }

  async findByGoogleId(googleId) {
    const sql = "SELECT * FROM users WHERE google_id = ?";
    const users = await query(sql, [googleId]);
    return users[0] || null;
  }

  async update(id, userData) {
    const allowedFields = [
      "full_name",
      "preferred_name",
      "photo_url",
      "bio",
      "city",
      "country",
      "instagram_username",
      "onboarding_completed",
    ];

    const updates = [];
    const values = [];

    Object.keys(userData).forEach((key) => {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );
      if (allowedFields.includes(snakeKey)) {
        updates.push(`${snakeKey} = ?`);
        values.push(userData[key]);
      }
    });

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    await query(sql, values);

    return this.findById(id);
  }

  async findAll(options = {}) {
    const {
      offset = 0,
      limit = 20,
      sortBy = "created_at",
      order = "desc",
      search = "",
    } = options;

    // Validate sortBy to prevent SQL injection
    const validSortColumns = [
      "created_at",
      "updated_at",
      "full_name",
      "email",
      "metrics_trips",
      "metrics_followers",
      "metrics_following",
      "metrics_likes_received",
    ];
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : "created_at";

    // Validate order to prevent SQL injection
    const safeOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";

    let sql = "SELECT * FROM users";
    const params = [];

    if (search) {
      sql += " WHERE full_name LIKE ? OR email LIKE ?";
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY ${safeSortBy} ${safeOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return await query(sql, params);
  }

  async count(search = "") {
    let sql = "SELECT COUNT(*) as total FROM users";
    const params = [];

    if (search) {
      sql += " WHERE full_name LIKE ? OR email LIKE ?";
      params.push(`%${search}%`, `%${search}%`);
    }

    const result = await query(sql, params);
    return result[0].total;
  }

  async updateMetrics(id, metrics) {
    const updates = [];
    const values = [];

    if (metrics.followers !== undefined) {
      updates.push("metrics_followers = ?");
      values.push(metrics.followers);
    }
    if (metrics.following !== undefined) {
      updates.push("metrics_following = ?");
      values.push(metrics.following);
    }
    if (metrics.trips !== undefined) {
      updates.push("metrics_trips = ?");
      values.push(metrics.trips);
    }
    if (metrics.likesReceived !== undefined) {
      updates.push("metrics_likes_received = ?");
      values.push(metrics.likesReceived);
    }

    if (updates.length === 0) return;

    values.push(id);
    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    await query(sql, values);
  }
}

module.exports = new UserModel();
