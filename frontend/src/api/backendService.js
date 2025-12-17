import { apiClient, endpoints } from "./apiClient";

/**
 * Generic entity service factory
 * Creates CRUD operations for any entity type
 */
const createEntityService = (entityEndpoints) => ({
  async create(data) {
    const response = await apiClient.post(entityEndpoints.create, data);
    return response.data;
  },

  async get(id) {
    const response = await apiClient.get(entityEndpoints.getById(id));
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.put(entityEndpoints.update(id), data);
    return response.data;
  },

  async delete(id) {
    await apiClient.delete(entityEndpoints.delete(id));
    return { id, deleted: true };
  },

  async list(options = {}) {
    const response = await apiClient.get(entityEndpoints.list, options);
    return response.data;
  },
});

/**
 * Trip Service
 */
export const Trip = {
  ...createEntityService({
    create: endpoints.trips.create,
    getById: endpoints.trips.getById,
    update: endpoints.trips.update,
    delete: endpoints.trips.delete,
    list: endpoints.trips.list,
  }),

  async getLikes(tripId, options = {}) {
    const response = await apiClient.get(
      endpoints.trips.getLikes(tripId),
      options
    );
    return response.data;
  },

  async getReviews(tripId, options = {}) {
    const response = await apiClient.get(
      endpoints.trips.getReviews(tripId),
      options
    );
    return response.data;
  },

  async getDerivations(tripId, options = {}) {
    const response = await apiClient.get(
      endpoints.trips.getDerivations(tripId),
      options
    );
    return response.data;
  },
};

/**
 * Trip Like Service
 */
export const TripLike = {
  async create(tripId) {
    const response = await apiClient.post(endpoints.tripLikes.create, {
      tripId,
    });
    return response.data;
  },

  async delete(id) {
    await apiClient.delete(endpoints.tripLikes.delete(id));
    return { id, deleted: true };
  },

  async list(options = {}) {
    const response = await apiClient.get(endpoints.tripLikes.list, options);
    return response.data;
  },

  async check(tripId) {
    const response = await apiClient.get(endpoints.tripLikes.check(tripId));
    return response.data;
  },

  // Alias for backward compatibility
  async checkLikeStatus(tripId) {
    return this.check(tripId);
  },
};

/**
 * Favorite Service (alias for TripLike)
 */
export const Favorite = TripLike;

/**
 * Follow Service
 */
export const Follow = {
  async create(followeeId) {
    const response = await apiClient.post(endpoints.follows.create, {
      followeeId,
    });
    return response.data;
  },

  async delete(id) {
    await apiClient.delete(endpoints.follows.delete(id));
    return { id, deleted: true };
  },

  async getFollowers(userId, options = {}) {
    const response = await apiClient.get(
      endpoints.follows.followers(userId),
      options
    );
    return response.data;
  },

  async getFollowing(userId, options = {}) {
    const response = await apiClient.get(
      endpoints.follows.following(userId),
      options
    );
    return response.data;
  },

  async check(userId) {
    const response = await apiClient.get(endpoints.follows.check(userId));
    return response.data;
  },

  // Alias for backward compatibility
  async checkFollowStatus(userId) {
    return this.check(userId);
  },
};

/**
 * Review Service
 */
export const Review = {
  ...createEntityService({
    create: endpoints.reviews.create,
    getById: endpoints.reviews.getById,
    update: endpoints.reviews.update,
    delete: endpoints.reviews.delete,
    list: endpoints.reviews.list,
  }),
};

/**
 * Trip Derivation Service (Trip Steals)
 */
export const TripDerivation = {
  async create(originalTripId) {
    const response = await apiClient.post(endpoints.derivations.create, {
      originalTripId,
    });
    return response.data;
  },

  async delete(id) {
    await apiClient.delete(endpoints.derivations.delete(id));
    return { id, deleted: true };
  },

  async list(options = {}) {
    const response = await apiClient.get(endpoints.derivations.list, options);
    return response.data;
  },
};

/**
 * Trip Steal Service (alias for TripDerivation)
 */
export const TripSteal = TripDerivation;

/**
 * User Service
 */
export const User = {
  async get(id) {
    const response = await apiClient.get(endpoints.users.getById(id));
    return response.data;
  },

  async list(options = {}) {
    const response = await apiClient.get(endpoints.users.list, options);
    return response.data;
  },

  async getUserTrips(userId, options = {}) {
    const response = await apiClient.get(
      endpoints.users.getUserTrips(userId),
      options
    );
    return response.data;
  },

  async getUserStats(userId) {
    const response = await apiClient.get(endpoints.users.getUserStats(userId));
    return response.data;
  },

  // Auth methods
  async me() {
    const response = await apiClient.get(endpoints.auth.me);
    return response.data;
  },

  async updateMe(data) {
    const response = await apiClient.put(endpoints.users.updateMe, data);
    return response.data;
  },
};

/**
 * Upload Service
 */
export const Upload = {
  async uploadImage(file, onProgress) {
    const response = await apiClient.upload(
      endpoints.upload.image,
      file,
      onProgress
    );
    return response.data;
  },

  async uploadFile(file, onProgress) {
    const response = await apiClient.upload(
      endpoints.upload.file,
      file,
      onProgress
    );
    return response.data;
  },

  async delete(filename) {
    await apiClient.delete(endpoints.upload.delete(filename));
    return { filename, deleted: true };
  },
};

// Export all services
export default {
  Trip,
  TripLike,
  Favorite,
  Follow,
  Review,
  TripDerivation,
  TripSteal,
  User,
  Upload,
};
