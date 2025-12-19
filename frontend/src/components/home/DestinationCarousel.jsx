import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createCityUrl } from "@/utils";
import { apiClient, endpoints } from "@/api/apiClient";

export default function DestinationCarousel() {
  const scrollRef = React.useRef(null);
  const [showArrows, setShowArrows] = React.useState(false);

  // Fetch cities from home endpoint
  const { data: cities = [], isLoading } = useQuery({
    queryKey: ["homeCities"],
    queryFn: async () => {
      try {
        const response = await apiClient.get(endpoints.home.cities);

        if (response.success && response.data) {
          // Format for carousel: {id, country_id, name, tripsCount, image}
          const cities = response.data.map((city) => ({
            id: city.id,
            country_id: city.country?.id,
            name: `${city.name}, ${city.country_name}`,
            tripsCount: city.trip_count,
            image: city.city_image || city.photo,
          }));

          return cities;
        }

        return [];
      } catch (error) {
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  React.useEffect(() => {
    const checkOverflow = () => {
      const element = scrollRef.current;
      if (element) {
        setShowArrows(element.scrollWidth > element.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [cities]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (cities.length === 0) return null;

  return (
    <div className="relative px-2 py-3">
      <div className="flex items-center justify-center gap-3">
        {showArrows && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 h-8 w-8"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth max-w-xl"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {cities.map((city) => (
            <Link
              key={city.name}
              to={createCityUrl(city.id)}
              className="flex-shrink-0 group cursor-pointer"
            >
              <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-blue-500 transition-all duration-300 group-hover:scale-110">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=400&fit=crop";
                  }}
                />
              </div>
              <p className="text-xs text-center mt-1 text-gray-300 group-hover:text-white transition-colors max-w-[64px] truncate">
                {city.name.split(",")[0]}
              </p>
            </Link>
          ))}
        </div>

        {showArrows && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 h-8 w-8"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
