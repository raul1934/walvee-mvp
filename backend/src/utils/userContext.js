const { TripLike, Follow } = require("../models/sequelize");

/**
 * Add user-specific context fields to trip/user results
 * @param {Object|Array} results - Single result or array of results
 * @param {string} userId - Current user's ID
 * @param {Object} options - Options for what context to include
 * @param {boolean} options.includeLikes - Add currentUserLiked field to trips
 * @param {boolean} options.includeFollows - Add currentUserFollowing field to users/trips
 * @returns {Object|Array} Results with added context fields
 */
exports.addUserContext = async (results, userId, options = {}) => {
  if (!userId || !results) return results;

  const isArray = Array.isArray(results);
  const items = isArray ? results : [results];

  if (items.length === 0) return results;

  // Add currentUserLiked to trips
  if (options.includeLikes) {
    const tripIds = items.map(item => item.id).filter(Boolean);

    if (tripIds.length > 0) {
      const likes = await TripLike.findAll({
        where: { trip_id: tripIds, liker_id: userId },
        attributes: ["trip_id"],
        raw: true
      });

      const likedIds = new Set(likes.map(l => l.trip_id));

      items.forEach(item => {
        item.currentUserLiked = likedIds.has(item.id);
      });
    }
  }

  // Add currentUserFollowing to users or trip authors
  if (options.includeFollows) {
    const userIds = items
      .map(item => item.author_id || item.id)
      .filter(Boolean);

    if (userIds.length > 0) {
      const follows = await Follow.findAll({
        where: { followee_id: userIds, follower_id: userId },
        attributes: ["followee_id"],
        raw: true
      });

      const followedIds = new Set(follows.map(f => f.followee_id));

      items.forEach(item => {
        const targetId = item.author_id || item.id;
        item.currentUserFollowing = followedIds.has(targetId);
      });
    }
  }

  return isArray ? items : items[0];
};
