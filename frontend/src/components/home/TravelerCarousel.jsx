import React from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl, createProfileUrl } from "@/utils";
import UserAvatar from "../common/UserAvatar";
import { apiClient, endpoints } from "@/api/apiClient";

export default function TravelerCarousel() {
  const scrollRef = React.useRef(null);

  const { data: travelers = [], isLoading } = useQuery({
    queryKey: ["homeTravelers"],
    queryFn: async () => {
      try {
        console.log("[TravelerCarousel] Fetching travelers from home endpoint");
        const response = await apiClient.get(endpoints.home.travelers);

        if (response.success && response.data) {
          console.log(
            "[TravelerCarousel] Travelers loaded:",
            response.data.length
          );
          return response.data;
        }

        return [];
      } catch (error) {
        console.error("[TravelerCarousel] Error loading travelers:", error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (travelers.length === 0) {
    console.warn("[TravelerCarousel] No travelers to display");
    return null;
  }

  return (
    <div className="relative px-2 py-3">
      <div className="flex items-center justify-center">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth max-w-xl"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {travelers.map((traveler) => (
            <Link
              key={traveler.id}
              to={createProfileUrl(traveler.id)}
              className="flex-shrink-0 group cursor-pointer flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-purple-500 transition-all duration-300 group-hover:scale-110 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <UserAvatar
                    src={traveler.photo_url || traveler.picture}
                    name={traveler.preferred_name || traveler.full_name}
                    size="xl"
                  />
                </div>
                {traveler.score > 20 && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[#0A0B0F]">
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              <p className="text-xs text-center mt-1.5 text-gray-300 group-hover:text-white transition-colors w-16 truncate">
                {traveler.preferred_name || traveler.full_name?.split(" ")[0]}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
