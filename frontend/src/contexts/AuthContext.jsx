import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/api/authService";
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
    const unsubscribe = authService.onAuthStateChanged(async (backendUser) => {
      if (!backendUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const currentUser = backendUser;
        setUser(currentUser);

        // Update photo if needed
        if (currentUser.picture && !currentUser.photo_url) {
          try {
            await authService.updateMe({
              photoUrl: currentUser.picture,
            });
          } catch (error) {
            console.error("Error updating photo:", error);
          }
        }

        // Redirect to onboarding if not completed
        if (
          currentUser &&
          !currentUser.onboarding_completed &&
          currentPageName !== "Onboarding"
        ) {
          navigate(createPageUrl("Onboarding"));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentPageName, navigate]);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const value = {
    user,
    userLoading: loading,
    openLoginModal,
    closeLoginModal,
    isLoginModalOpen,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
