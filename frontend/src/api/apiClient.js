// API Configuration for Express Backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/v1";

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};

// API client with authentication
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem("authToken");
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }

  getToken() {
    return this.token || localStorage.getItem("authToken");
  }

  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          ...data,
        };
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: "GET" });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }

  async upload(endpoint, file, onProgress) {
    const formData = new FormData();
    formData.append("file", file);

    const token = this.getToken();
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          ...data,
        };
      }

      return data;
    } catch (error) {
      console.error("Upload Error:", error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();

// API Endpoints
export const endpoints = {
  // Auth
  auth: {
    google: "/auth/google",
    googleCallback: "/auth/google/callback",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me",
  },

  // Users
  users: {
    list: "/users",
    getById: (id) => `/users/${id}`,
    updateMe: "/users/me",
    getUserTrips: (id) => `/users/${id}/trips`,
    getUserStats: (id) => `/users/${id}/stats`,
  },

  // Trips
  trips: {
    list: "/trips",
    create: "/trips",
    getById: (id) => `/trips/${id}`,
    update: (id) => `/trips/${id}`,
    delete: (id) => `/trips/${id}`,
    getLikes: (id) => `/trips/${id}/likes`,
    getReviews: (id) => `/trips/${id}/reviews`,
    getDerivations: (id) => `/trips/${id}/derivations`,
  },

  // Trip Likes
  tripLikes: {
    list: "/trip-likes",
    create: "/trip-likes",
    delete: (id) => `/trip-likes/${id}`,
    check: (tripId) => `/trip-likes/check/${tripId}`,
  },

  // Follows
  follows: {
    followers: (userId) => `/follows/followers/${userId}`,
    following: (userId) => `/follows/following/${userId}`,
    create: "/follows",
    delete: (id) => `/follows/${id}`,
    check: (userId) => `/follows/check/${userId}`,
  },

  // Reviews
  reviews: {
    list: "/reviews",
    create: "/reviews",
    getById: (id) => `/reviews/${id}`,
    update: (id) => `/reviews/${id}`,
    delete: (id) => `/reviews/${id}`,
  },

  // Trip Derivations
  derivations: {
    list: "/trip-derivations",
    create: "/trip-derivations",
    delete: (id) => `/trip-derivations/${id}`,
  },

  // Upload
  upload: {
    image: "/upload/image",
    file: "/upload/file",
    delete: (filename) => `/upload/${filename}`,
  },
};

export default apiClient;
