import { apiClient, endpoints } from "./apiClient";

/**
 * Authentication Service
 * Handles all authentication-related operations with Express backend
 */
export const authService = {
  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!apiClient.getToken();
  },

  /**
   * Get current authenticated user
   */
  me: async () => {
    try {
      const response = await apiClient.get(endpoints.auth.me);
      return response.data;
    } catch (error) {
      if (error.status === 401) {
        authService.signOut();
      }
      throw error;
    }
  },

  /**
   * Update current user profile
   */
  updateMe: async (data) => {
    try {
      const response = await apiClient.put(endpoints.users.updateMe, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Sign in with Google (redirects to backend OAuth)
   */
  signInWithGoogle: () => {
    const backendUrl =
      import.meta.env.VITE_API_URL || "http://localhost:3000/v1";
    window.location.href = `${backendUrl}/auth/google`;
  },

  /**
   * Handle OAuth callback (extract token from URL)
   */
  handleAuthCallback: () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      apiClient.setToken(token);
      return true;
    }
    return false;
  },

  /**
   * Sign out
   */
  signOut: async () => {
    try {
      await apiClient.post(endpoints.auth.logout);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      apiClient.setToken(null);
      window.location.href = "/";
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    try {
      const response = await apiClient.post(endpoints.auth.refresh);
      if (response.data.token) {
        apiClient.setToken(response.data.token);
        return true;
      }
      return false;
    } catch (error) {
      authService.signOut();
      return false;
    }
  },

  /**
   * Get current user (alias for me())
   */
  getCurrentUser: async () => {
    return authService.me();
  },

  /**
   * Listen to auth state changes (polling-based since no WebSocket)
   * Returns cleanup function
   */
  onAuthStateChanged: (callback) => {
    let isMounted = true;

    const checkAuth = async () => {
      if (!isMounted) return;

      if (authService.isAuthenticated()) {
        try {
          const user = await authService.me();
          if (isMounted) callback(user);
        } catch (error) {
          if (isMounted) callback(null);
        }
      } else {
        if (isMounted) callback(null);
      }
    };

    // Check immediately
    checkAuth();

    // Optional: Set up periodic checks (every 5 minutes)
    const interval = setInterval(checkAuth, 5 * 60 * 1000);

    // Return cleanup function
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  },
};

export default authService;
