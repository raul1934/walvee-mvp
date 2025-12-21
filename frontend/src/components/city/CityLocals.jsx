import React from "react";
import { apiClient, endpoints } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl, createProfileUrl } from "@/utils";
import { Users } from "lucide-react";
import UserAvatar from "../common/UserAvatar";

export default function CityLocals({ cityName, cityId }) {
  // Fetch users who live in this city from backend
  const { data: localsData, isLoading } = useQuery({
    queryKey: ["cityLocals", cityId],
    queryFn: async () => {
      if (!cityId) return { data: [], pagination: null };

      try {
        const response = await apiClient.get(
          endpoints.cities.getLocals(cityId),
          {
            page: 1,
            limit: 50,
            sortBy: "trips_count",
            order: "desc",
          }
        );

        if (response.success && response.data) {
          return { data: response.data, pagination: response.pagination };
        }
        return { data: [], pagination: null };
      } catch (error) {
        console.error("[CityLocals] Error fetching locals:", error);
        return { data: [], pagination: null };
      }
    },
    enabled: !!cityId,
    staleTime: 10 * 60 * 1000,
  });

  const locals = localsData?.data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (locals.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Users className="w-10 h-10 text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">
          No locals found yet
        </h3>
        <p className="text-gray-400">
          Be the first to set {cityName} as your home city and connect with
          future travelers!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Local Travelers in {cityName}
          </h2>
          <p className="text-gray-400">
            Connect with {locals.length}{" "}
            {locals.length === 1 ? "traveler" : "travelers"} who call this city
            home
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locals.map((local) => (
          <Link
            key={local.id}
            to={createProfileUrl(local.id)}
            className="bg-[#1A1B23] rounded-xl p-4 border border-[#2A2B35] hover:border-purple-500/50 transition-all group"
          >
            <div className="flex items-start gap-3">
              <UserAvatar src={local.photo} name={local.name} size="lg" />

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
                  {local.name}
                </h3>

                <p className="text-sm text-gray-400 truncate">{local.city}</p>

                {local.bio && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {local.bio}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-white">
                      {local.trips_count || 0}
                    </span>
                    <span className="text-gray-500">trips</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-white">
                      {local.followers_count || 0}
                    </span>
                    <span className="text-gray-500">followers</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
