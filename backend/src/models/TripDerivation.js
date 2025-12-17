const { query } = require("../database/connection");
const { generateUUID } = require("../utils/helpers");

class TripDerivationModel {
  async create(originalTripId, creatorId, derivedTripId = null) {
    const id = generateUUID();
    const sql = `
      INSERT INTO trip_derivations (id, original_trip_id, derived_trip_id, creator_id)
      VALUES (?, ?, ?, ?)
    `;

    await query(sql, [id, originalTripId, derivedTripId, creatorId]);
    return this.findById(id);
  }

  async findById(id) {
    const sql = "SELECT * FROM trip_derivations WHERE id = ?";
    const derivations = await query(sql, [id]);
    return derivations[0] || null;
  }

  async delete(id) {
    const sql = "DELETE FROM trip_derivations WHERE id = ?";
    await query(sql, [id]);
  }

  async findAll(options = {}) {
    const {
      originalTripId = null,
      creatorId = null,
      offset = 0,
      limit = 20,
    } = options;

    let sql = "SELECT * FROM trip_derivations WHERE 1=1";
    const params = [];

    if (originalTripId) {
      sql += " AND original_trip_id = ?";
      params.push(originalTripId);
    }

    if (creatorId) {
      sql += " AND creator_id = ?";
      params.push(creatorId);
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    return await query(sql, params);
  }

  async count(options = {}) {
    const { originalTripId = null, creatorId = null } = options;

    let sql = "SELECT COUNT(*) as total FROM trip_derivations WHERE 1=1";
    const params = [];

    if (originalTripId) {
      sql += " AND original_trip_id = ?";
      params.push(originalTripId);
    }

    if (creatorId) {
      sql += " AND creator_id = ?";
      params.push(creatorId);
    }

    const result = await query(sql, params);
    return result[0].total;
  }
}

module.exports = new TripDerivationModel();
