import { useState, useCallback, useRef, useEffect } from "react";
import { apiClient, endpoints } from "@/api/apiClient";

export function useGlobalSearch(cityContext = null) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({
    cities: [],
    trips: [],
    places: [],
    travelers: [],
  });
  const [counts, setCounts] = useState({
    cities: 0,
    trips: 0,
    places: 0,
    travelers: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const search = useCallback(
    async (searchQuery) => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setResults({ cities: [], trips: [], places: [], travelers: [] });
        setCounts({ cities: 0, trips: 0, places: 0, travelers: 0, total: 0 });
        setIsLoading(false);
        setError(null);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        // Build query parameters
        const params = {
          query: searchQuery,
          limit: 10, // Get up to 10 items per category
        };

        if (cityContext) {
          params.cityContext = cityContext;
        }

        // Call backend search endpoint
        const response = await apiClient.get(endpoints.search.overlay, params);

        if (response.success && response.data) {
          const { results: searchResults, counts: searchCounts } =
            response.data;

          // Map results to expected format
          const mappedResults = {
            cities: (searchResults.cities || []).map((city) => ({
              name: city.name,
              country: city.country,
              state: city.state,
              tripsCount: 0, // Will be populated from trips data if needed
              image: city.image,
              id: city.id,
              google_maps_id: city.google_maps_id,
            })),

            trips: (searchResults.trips || []).map((trip) => ({
              id: trip.id,
              title: trip.title,
              destination:
                (trip.cities && trip.cities[0]?.name) || trip.destination,
              description: trip.description,
              image_url: trip.image,
              images: trip.image ? [trip.image] : [],
              duration: trip.duration,
              likes: trip.likes || 0,
              views: trip.views || 0,
              author_name: trip.author?.name,
              author_photo: trip.author?.photo,
            })),

            places: (searchResults.places || []).map((place) => ({
              id: place.id,
              place_id: place.place_id,
              name: place.name,
              address: place.address,
              city: place.city,
              rating: place.rating,
              price_level: place.price_level,
              types: place.types,
              photo: place.image,
              latitude: place.latitude,
              longitude: place.longitude,
              source: "backend",
            })),

            travelers: (searchResults.travelers || []).map((user) => ({
              id: user.id,
              email: user.email,
              name: user.name,
              photo: user.photo,
              city: user.city,
              country: user.country,
              trips: user.trips,
              followers: user.followers,
              instagram_username: user.instagram_username || null,
              instagram_display: user.instagram_display || null,
              instagram_url: user.instagram_url || null,
            })),
          };

          setResults(mappedResults);
          setCounts(
            searchCounts || {
              cities: 0,
              trips: 0,
              places: 0,
              travelers: 0,
              total: 0,
            }
          );
        }
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }

        setError(err.message || "Search failed");
        setResults({ cities: [], trips: [], places: [], travelers: [] });
        setCounts({ cities: 0, trips: 0, places: 0, travelers: 0, total: 0 });
      } finally {
        setIsLoading(false);
      }
    },
    [cityContext]
  );

  const debouncedSearch = useCallback(
    (searchQuery) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (!searchQuery || searchQuery.trim().length < 2) {
        setResults({ cities: [], trips: [], places: [], travelers: [] });
        setCounts({ cities: 0, trips: 0, places: 0, travelers: 0, total: 0 });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      searchTimeoutRef.current = setTimeout(() => {
        search(searchQuery);
      }, 300);
    },
    [search]
  );

  useEffect(() => {
    debouncedSearch(query);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, debouncedSearch]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults({ cities: [], trips: [], places: [], travelers: [] });
    setCounts({ cities: 0, trips: 0, places: 0, travelers: 0, total: 0 });
    setError(null);
    setIsLoading(false);
  }, []);

  const retrySearch = useCallback(() => {
    if (query) {
      search(query);
    }
  }, [query, search]);

  const totalResults =
    results.cities.length +
    results.trips.length +
    results.places.length +
    results.travelers.length;

  return {
    query,
    setQuery,
    results,
    counts,
    isLoading,
    error,
    totalResults,
    clearSearch,
    retrySearch,
  };
}
