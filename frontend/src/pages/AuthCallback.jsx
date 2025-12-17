import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/api/authService";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract token from URL and save it
        const success = authService.handleAuthCallback();

        if (success) {
          // Get user data to check onboarding status
          try {
            const user = await authService.me();

            if (user && !user.onboarding_completed) {
              navigate("/onboarding");
            } else {
              navigate("/");
            }
          } catch (error) {
            console.error("Error fetching user:", error);
            navigate("/");
          }
        } else {
          // No token found, redirect to home
          navigate("/");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        navigate("/");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-white text-lg">Completing sign in...</p>
      </div>
    </div>
  );
}
