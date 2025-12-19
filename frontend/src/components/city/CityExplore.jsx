import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl, createCityUrl } from "@/utils";
import { MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";
import UserAvatar from "../common/UserAvatar";
import { useQuery } from "@tanstack/react-query";
import { apiClient, endpoints } from "@/api/apiClient";

// Top cities by country - curated list
const COUNTRY_CITIES = {
  Brazil: [
    "Rio de Janeiro",
    "São Paulo",
    "Salvador",
    "Brasília",
    "Florianópolis",
  ],
  Spain: ["Madrid", "Barcelona", "Seville", "Valencia", "Granada"],
  Argentina: ["Buenos Aires", "Mendoza", "Córdoba", "Bariloche", "Salta"],
  "United States": [
    "New York",
    "Los Angeles",
    "Miami",
    "San Francisco",
    "Chicago",
  ],
  "South Africa": [
    "Cape Town",
    "Johannesburg",
    "Durban",
    "Pretoria",
    "Port Elizabeth",
  ],
  Japan: ["Tokyo", "Kyoto", "Osaka", "Hiroshima", "Sapporo"],
  Italy: ["Rome", "Milan", "Venice", "Florence", "Naples"],
  France: ["Paris", "Lyon", "Marseille", "Nice", "Bordeaux"],
  "United Kingdom": [
    "London",
    "Edinburgh",
    "Manchester",
    "Liverpool",
    "Birmingham",
  ],
  UAE: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah"],
};

export default function CityExplore({
  relatedCities,
  featuredLocals,
  currentCity,
}) {
  // Extract country from currentCity (format: "City, Country")
  const country = currentCity?.split(",")[1]?.trim();
  const currentCityName = currentCity?.split(",")[0]?.trim();

  // Query cities from the same country from backend
  const { data: countryCities = [] } = useQuery({
    queryKey: ["countryCities", country],
    queryFn: async () => {
      if (!country) return [];

      try {
        // Search for cities in the country
        const response = await apiClient.get(endpoints.cities.search, {
          query: country,
        });

        if (response.success && response.data) {
          return response.data
            .filter((city) => {
              const cityCountry = city.country?.name || "";
              return (
                cityCountry.toLowerCase().includes(country.toLowerCase()) &&
                city.name !== currentCityName
              );
            })
            .slice(0, 5);
        }
        return [];
      } catch (error) {
        console.error("Error fetching country cities:", error);
        return [];
      }
    },
    enabled: !!country,
    staleTime: 30 * 60 * 1000,
  });

  // Get suggested cities from same country
  const suggestedCities = React.useMemo(() => {
    // Prefer backend cities with IDs
    if (countryCities.length > 0) {
      return countryCities.map((city) => ({
        id: city.id,
        name: `${city.name}, ${city.country?.name || ""}`,
        tripsCount: city.trip_count || 0,
      }));
    }

    // Fallback to hardcoded list if backend fails
    if (!country || !COUNTRY_CITIES[country]) return [];

    return COUNTRY_CITIES[country]
      .filter((city) => city !== currentCityName)
      .slice(0, 5)
      .map((city) => ({
        id: null,
        name: `${city}, ${country}`,
        tripsCount: 0,
      }));
  }, [countryCities, country, currentCityName]);

  const citiesToShow =
    suggestedCities.length > 0
      ? suggestedCities
      : relatedCities?.slice(0, 5) || [];

  if (
    citiesToShow.length === 0 &&
    (!featuredLocals || featuredLocals.length === 0)
  )
    return null;

  return (
    <div className="container mx-auto px-6 py-16 space-y-16">
      {/* Related Cities */}
      {citiesToShow.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <MapPin className="w-6 h-6 text-blue-400" />
            Explore More from {country || "the Region"}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {citiesToShow.map((city, idx) => (
              <motion.div
                key={city.id || city.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                {city.id ? (
                  <Link
                    to={createCityUrl(city.id)}
                    className="block bg-[#1A1B23] rounded-xl p-4 text-center hover:bg-[#2A2B35] hover:scale-105 transition-all border border-[#2A2B35] hover:border-blue-500/30"
                  >
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-white text-sm mb-1">
                      {city.name.split(",")[0]}
                    </h4>
                    {city.tripsCount > 0 && (
                      <p className="text-xs text-gray-500">
                        {city.tripsCount} trips
                      </p>
                    )}
                  </Link>
                ) : (
                  <div className="block bg-[#1A1B23] rounded-xl p-4 text-center border border-[#2A2B35]">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-white text-sm mb-1">
                      {city.name.split(",")[0]}
                    </h4>
                    {city.tripsCount > 0 && (
                      <p className="text-xs text-gray-500">
                        {city.tripsCount} trips
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Top Contributors */}
      {featuredLocals && featuredLocals.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Users className="w-6 h-6 text-purple-400" />
            Top Contributors
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredLocals.map((local, idx) => (
              <motion.div
                key={local.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="text-center"
              >
                <Link
                  to={`${createPageUrl("Profile")}?email=${encodeURIComponent(
                    local.id
                  )}`}
                  className="block group"
                >
                  <div className="relative mb-3 inline-block">
                    <UserAvatar
                      src={local.avatar}
                      name={local.name}
                      size="xl"
                      ring={true}
                      email={local.id}
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-[#0C0E11]">
                      {local.tripsCount}
                    </div>
                  </div>
                  <h4 className="font-semibold text-white text-sm mb-1 group-hover:text-purple-400 transition-colors truncate">
                    {local.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {local.tripsCount}{" "}
                    {local.tripsCount === 1 ? "trip" : "trips"}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
