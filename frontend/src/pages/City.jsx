import React, { useState, useEffect, useRef } from "react";
import { Trip } from "@/api/entities";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin } from "lucide-react";
import CityHeader from "../components/city/CityHeader";
import CityNavigation from "../components/city/CityNavigation";
import CityTripGrid from "../components/city/CityTripGrid";
import CityTopPlaces from "../components/city/CityTopPlaces";
import CityExplore from "../components/city/CityExplore";
import CityLocals from "../components/city/CityLocals";
import CityFavorites from "../components/city/CityFavorites";
import PlaceModal from "../components/city/PlaceModal";

console.log("[City Page] ===== MODULE LOADED =====");

export default function City({
  user,
  cityNameOverride,
  isModal = false,
}) {
  console.log("[City Page] ===== FUNCTION CALLED =====");
  console.log("[City Page] Received props:", {
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    userName: user?.preferred_name || user?.full_name,
    cityNameOverride: cityNameOverride,
    isModal: isModal,
  });

  const urlParams = new URLSearchParams(window.location.search);
  const cityName =
    cityNameOverride || urlParams.get("name") || urlParams.get("city");

  const [activeTab, setActiveTab] = useState("all");
  const [placeCategory, setPlaceCategory] = useState("all");
  const [offset, setOffset] = useState(0);
  const [allTrips, setAllTrips] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);

  const [placesOffset, setPlacesOffset] = useState(0);
  const [allPlaces, setAllPlaces] = useState([]);
  const [hasMorePlaces, setHasMorePlaces] = useState(true);

  const [enrichedTripPlaces, setEnrichedTripPlaces] = useState([]);
  const [isEnrichingTripPlaces, setIsEnrichingTripPlaces] = useState(false);

  const [imageErrors, setImageErrors] = useState(new Set());

  const navigate = useNavigate();
  const observerRef = useRef();
  const loadingRef = useRef(false);
  const placesObserverRef = useRef();
  const placesLoadingRef = useRef(false);
  const contentRef = useRef(null);

  const LIMIT = 6;
  const PLACES_LIMIT = 6;

  const [isNavSticky, setIsNavSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsNavSticky(window.scrollY > 280);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      const navHeight = 64;
      const offset = 20;
      const elementPosition = contentRef.current.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - navHeight - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, [activeTab]);

  const {
    data: trips = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["cityTrips", cityName, offset],
    queryFn: async () => {
      if (!cityName) return [];

      const allTrips = await Trip.list({ sortBy: "likes_count", order: "desc" });

      const normalizedCityName = cityName.toLowerCase().trim();
      const cityNameOnly = normalizedCityName.split(",")[0].trim();

      let filtered = allTrips.filter((trip) => {
        const destination = trip.destination?.toLowerCase().trim() || "";
        const destinationCity = destination.split(",")[0].trim();

        if (
          destinationCity === cityNameOnly ||
          destination === normalizedCityName
        ) {
          return true;
        }

        const locations =
          trip.locations?.map((loc) => loc.toLowerCase().trim()) || [];

        return locations.some((loc) => {
          const locCity = loc.split(",")[0].trim();
          return locCity === cityNameOnly || loc === normalizedCityName;
        });
      });

      return filtered;
    },
    enabled: !!cityName,
    staleTime: 12 * 60 * 60 * 1000,
    cacheTime: 24 * 60 * 60 * 1000,
  });

  useEffect(() => {
    if (trips.length === 0) {
      setAllTrips([]);
      setHasMore(false);
      return;
    }

    const newTrips = trips.slice(0, offset + LIMIT);
    setAllTrips(prev => {
      // Only update if the content actually changed
      if (prev.length === newTrips.length &&
          prev.every((trip, index) => trip.id === newTrips[index]?.id)) {
        return prev;
      }
      return newTrips;
    });
    setHasMore(newTrips.length < trips.length);
  }, [trips, offset]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loadingRef.current &&
          !isLoading
        ) {
          loadingRef.current = true;
          setTimeout(() => {
            setOffset((prev) => prev + LIMIT);
            loadingRef.current = false;
          }, 300);
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  useEffect(() => {
    setOffset(0);
    setAllTrips([]);
    setHasMore(true);
    setActiveTab("all");
    setPlacesOffset(0);
    setAllPlaces([]);
    setHasMorePlaces(true);
    setPlaceCategory("all");
  }, [cityName]);

  const topPlaces = React.useMemo(() => {
    if (!trips.length) return [];

    const placeCount = {};
    const placeDetails = {};

    trips.forEach((trip) => {
      trip.itinerary?.forEach((day) => {
        day.places?.forEach((place) => {
          if (!place.name) return;

          const key = place.place_id || place.name;
          placeCount[key] = (placeCount[key] || 0) + 1;

          if (!placeDetails[key]) {
            placeDetails[key] = {
              name: place.name,
              address: place.address,
              place_id: place.place_id,
              rating: place.rating,
              price_level: place.price_level,
              types: place.types || [],
              mentions: 0,
              photo: place.photos?.[0] || null,
              photos: place.photos || [],
            };
          }
        });
      });
    });

    const placesFromTrips = Object.entries(placeCount)
      .map(([key, count]) => ({
        ...placeDetails[key],
        mentions: count,
      }))
      .sort((a, b) => b.mentions - a.mentions);

    return placesFromTrips;
  }, [trips]);

  useEffect(() => {
    // Simply use topPlaces as-is without enrichment
    setEnrichedTripPlaces(topPlaces);
    setIsEnrichingTripPlaces(false);
  }, [topPlaces]);

  const combinedPlacesAll = React.useMemo(() => {
    const tripsPlaces = enrichedTripPlaces.filter((p) => p.mentions > 0);

    let combined = [...tripsPlaces];

    const cityNameOnly = cityName?.split(",")[0].trim().toLowerCase() || "";

    combined = combined.filter((place) => {
      const placeAddress = place.address?.toLowerCase() || "";
      return placeAddress.includes(cityNameOnly);
    });

    if (placeCategory !== "all") {
      combined = combined.filter((place) =>
        place.types?.some(
          (type) =>
            type.toLowerCase().includes(placeCategory.toLowerCase()) ||
            placeCategory.toLowerCase().includes(type.toLowerCase())
        )
      );
    }

    return combined.sort((a, b) => {
      if (a.mentions && !b.mentions) return -1;
      if (!a.mentions && b.mentions) return 1;
      if (a.mentions && b.mentions) return b.mentions - a.mentions;
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [enrichedTripPlaces, googlePlaces, placeCategory, cityName]);

  useEffect(() => {
    if (activeTab !== "places") return;

    if (combinedPlacesAll.length === 0) {
      setAllPlaces([]);
      setHasMorePlaces(false);
      return;
    }

    const newPlaces = combinedPlacesAll.slice(0, placesOffset + PLACES_LIMIT);
    setAllPlaces(newPlaces);
    setHasMorePlaces(newPlaces.length < combinedPlacesAll.length);
  }, [combinedPlacesAll, placesOffset, activeTab]);

  useEffect(() => {
    if (activeTab === "places") {
      setPlacesOffset(0);
      setAllPlaces([]);
      setHasMorePlaces(true);
    }
  }, [placeCategory, activeTab]);

  useEffect(() => {
    if (activeTab !== "places") return;

    const currentPlacesObserverRef = placesObserverRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMorePlaces &&
          !placesLoadingRef.current &&
          !isEnrichingTripPlaces
        ) {
          placesLoadingRef.current = true;
          setTimeout(() => {
            setPlacesOffset((prev) => prev + PLACES_LIMIT);
            placesLoadingRef.current = false;
          }, 300);
        }
      },
      { threshold: 0.5 }
    );

    if (currentPlacesObserverRef) {
      observer.observe(currentPlacesObserverRef);
    }

    return () => {
      if (currentPlacesObserverRef) {
        observer.disconnect();
      }
    };
  }, [hasMorePlaces, isEnrichingTripPlaces, activeTab]);

  const relatedCities = React.useMemo(() => {
    if (!trips.length) return [];

    const cityCount = {};
    trips.forEach((trip) => {
      const allCities = [trip.destination, ...(trip.locations || [])];
      allCities.forEach((city) => {
        if (!city || city.toLowerCase().includes(cityName?.toLowerCase()))
          return;
        cityCount[city] = (cityCount[city] || 0) + 1;
      });
    });

    return Object.entries(cityCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([city, count]) => ({ name: city, tripsCount: count }));
  }, [trips, cityName]);

  const featuredLocals = React.useMemo(() => {
    if (!trips.length) return [];

    const authorCount = {};
    trips.forEach((trip) => {
      const authorId = trip.created_by;
      if (!authorCount[authorId]) {
        authorCount[authorId] = {
          id: authorId,
          name: trip.author_name,
          avatar: trip.author_photo,
          tripsCount: 0,
          followers: 0,
        };
      }
      authorCount[authorId].tripsCount++;
    });

    return Object.values(authorCount)
      .sort((a, b) => b.tripsCount - a.tripsCount)
      .slice(0, 6);
  }, [trips]);

  const favoriteTrips = React.useMemo(() => {
    return [...trips]
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 12);
  }, [trips]);

  const handleCreateTrip = () => {
    // Always navigate - if not authenticated, the API call will trigger 401 and show login modal
    navigate(createPageUrl("InspirePrompt"));
  };

  const handlePlaceClick = (place) => {
    console.log("[City Page] ===== handlePlaceClick =====");
    console.log("[City Page] Place clicked:", {
      placeName: place.name,
      hasUser: !!user,
      userId: user?.id,
      userName: user?.preferred_name || user?.full_name,
      hasOpenLoginModal: !!openLoginModal,
    });

    console.log("[City Page] Setting selectedPlace and opening modal");
    setSelectedPlace(place);
    setIsPlaceModalOpen(true);
  };

  const handleClosePlaceModal = () => {
    console.log("[City Page] Closing PlaceModal");
    setIsPlaceModalOpen(false);
    setTimeout(() => setSelectedPlace(null), 300);
  };

  if (!cityName) {
    return (
      <div className="min-h-screen bg-[#0C0E11] text-white flex items-center justify-center pt-16">
        <p className="text-gray-400">No city specified</p>
      </div>
    );
  }

  console.log("[City Page] ===== ABOUT TO RENDER =====");
  console.log("[City Page] PlaceModal state:", {
    hasPlace: !!selectedPlace,
    placeName: selectedPlace?.name,
    isOpen: isPlaceModalOpen,
    hasUser: !!user,
    userId: user?.id,
    hasOpenLoginModal: !!openLoginModal,
  });

  return (
    <div
      className={`min-h-screen bg-[#0C0E11] text-white ${
        isModal ? "" : "pt-16"
      }`}
    >
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <CityHeader
        cityName={cityName}
        user={user}
      />

      <CityNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cityName={cityName}
        user={user}
        placeCategory={placeCategory}
        onCategoryChange={setPlaceCategory}
      />

      <div ref={contentRef} className="pb-12">
        {activeTab === "all" && (
          <>
            <CityTripGrid
              trips={allTrips}
              isLoading={isLoading && offset === 0}
              currentUserId={user?.id}
            />

            {hasMore && !isLoading && (
              <div ref={observerRef} className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
              </div>
            )}

            {!hasMore && allTrips.length > 0 && (
              <p className="text-center text-gray-500 py-12">
                You've seen all trips in {cityName}
              </p>
            )}

            {!isLoading && allTrips.length === 0 && (
              <div className="container mx-auto px-6 text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MapPin className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="2xl font-bold text-white mb-4">
                    No trips found in {cityName}
                  </h3>
                  <p className="text-gray-400 mb-8">
                    Be the first to create an amazing journey here!
                  </p>
                  <button
                    onClick={handleCreateTrip}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 rounded-xl font-bold text-white transition-all hover:scale-105"
                  >
                    Create the first trip
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "places" && (
          <>
            <CityTopPlaces
              places={allPlaces}
              cityName={cityName}
              isLoading={isEnrichingTripPlaces && placesOffset === 0}
              onPlaceClick={handlePlaceClick}
            />

            {hasMorePlaces && !isEnrichingTripPlaces && (
              <div
                ref={placesObserverRef}
                className="py-12 flex justify-center"
              >
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-500 border-t-transparent" />
              </div>
            )}

            {!hasMorePlaces && allPlaces.length > 0 && (
              <p className="text-center text-gray-500 py-12">
                You've seen all places in {cityName}
              </p>
            )}

            {!isEnrichingTripPlaces &&
              allPlaces.length === 0 &&
              !hasMorePlaces &&
              combinedPlacesAll.length === 0 && (
                <div className="container mx-auto px-6 text-center py-20">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <MapPin className="w-10 h-10 text-purple-400" />
                    </div>
                    <h3 className="2xl font-bold text-white mb-4">
                      No places found
                    </h3>
                    <p className="text-gray-400 mb-4">
                      No{" "}
                      {placeCategory === "all"
                        ? "places"
                        : placeCategory.replace(/_/g, " ")}{" "}
                      found in {cityName}.
                    </p>
                    <button
                      onClick={() => setPlaceCategory("all")}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Show all places
                    </button>
                  </div>
                </div>
              )}
          </>
        )}

        {activeTab === "locals" && (
          <div className="container mx-auto px-6">
            <CityLocals cityName={cityName} />
          </div>
        )}

        {activeTab === "favorites" && (
          <CityFavorites
            cityName={cityName}
            user={user}
            onPlaceClick={handlePlaceClick}
          />
        )}

        <CityExplore
          relatedCities={relatedCities}
          featuredLocals={featuredLocals}
          currentCity={cityName}
        />
      </div>

      <PlaceModal
        place={selectedPlace}
        trip={null}
        isOpen={isPlaceModalOpen}
        onClose={handleClosePlaceModal}
        user={user}
      />
    </div>
  );
}
