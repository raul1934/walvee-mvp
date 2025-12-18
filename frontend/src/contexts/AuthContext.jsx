import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/api/authService";
import { apiClient } from "@/api/apiClient";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children, currentPageName }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Register callback to show login modal on 401 errors
    apiClient.setUnauthenticatedCallback(() => {
      setUser(null);
      setIsLoginModalOpen(true);
    });

    // Load user once on initial mount
    const loadUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const backendUser = await authService.me();
          setUser(backendUser);

          // Update photo if needed
          if (backendUser.picture && !backendUser.photo_url) {
            try {
              await authService.updateMe({
                photoUrl: backendUser.picture,
              });
            } catch (error) {
              console.error("Error updating photo:", error);
            }
          }

          // Redirect to onboarding if not completed
          if (
            backendUser &&
            !backendUser.onboarding_completed &&
            currentPageName !== "Onboarding"
          ) {
            navigate(createPageUrl("Onboarding"));
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();

    // Cleanup callback on unmount
    return () => {
      apiClient.setUnauthenticatedCallback(null);
    };
  }, [currentPageName, navigate]);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const refreshUser = async () => {
    if (authService.isAuthenticated()) {
      try {
        const backendUser = await authService.me();
        setUser(backendUser);
        return backendUser;
      } catch (error) {
        console.error("Error refreshing user:", error);
        setUser(null);
        return null;
      }
    }
    setUser(null);
    return null;
  };

  const value = {
    user,
    userLoading: loading,
    openLoginModal,
    closeLoginModal,
    isLoginModalOpen,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
