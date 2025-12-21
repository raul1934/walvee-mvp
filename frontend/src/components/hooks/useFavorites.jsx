import { useState, useCallback } from "react";
import { TripLike } from "@/api/entities";
import { apiClient, endpoints } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Global favorites hook - manages both trip and place favorites
 * Detects type automatically based on data structure
 */
export function useFavorites(user) {
  const queryClient = useQueryClient();

  // Fetch user's trip favorites
  const { data: tripFavorites = [], isLoading: isLoadingTrips } = useQuery({
    queryKey: ["tripFavorites", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }
      const allFavorites = await TripLike.list({
        sortBy: "created_at",
        order: "desc",
      });
      const userFavorites = allFavorites.filter(
        (fav) => fav.created_by === user.email
      );

      return userFavorites;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch user's place favorites
  const { data: placeFavorites = [], isLoading: isLoadingPlaces } = useQuery({
    queryKey: ["placeFavorites", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }
      const response = await apiClient.get(endpoints.placeFavorites.list);
      return response.data?.favorites || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // Add trip favorite mutation
  const addTripFavoriteMutation = useMutation({
    mutationFn: async (tripId) => {
      return await TripLike.create(tripId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripFavorites", user?.id] });
    },
    onError: (error) => {
      console.error("[useFavorites] Error adding trip favorite:", error);
    },
  });

  // Remove trip favorite mutation
  const removeTripFavoriteMutation = useMutation({
    mutationFn: async (favoriteId) => {
      return await TripLike.delete(favoriteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripFavorites", user?.id] });
    },
    onError: (error) => {
      console.error("[useFavorites] Error removing trip favorite:", error);
    },
  });

  // Add place favorite mutation
  const addPlaceFavoriteMutation = useMutation({
    mutationFn: async (placeId) => {
      return await apiClient.post(endpoints.placeFavorites.create, {
        place_id: placeId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placeFavorites", user?.id] });
    },
    onError: (error) => {
      console.error("[useFavorites] Error adding place favorite:", error);
    },
  });

  // Remove place favorite mutation
  const removePlaceFavoriteMutation = useMutation({
    mutationFn: async (favoriteId) => {
      return await apiClient.delete(
        endpoints.placeFavorites.delete(favoriteId)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["placeFavorites", user?.id] });
    },
    onError: (error) => {
      console.error("[useFavorites] Error removing place favorite:", error);
    },
  });

  // Check if a place is favorited (by place ID)
  const isPlaceFavorited = useCallback(
    (placeId) => {
      if (!placeId) return false;
      return placeFavorites.some((fav) => fav.place_id === placeId);
    },
    [placeFavorites]
  );

  // Get place favorite by place ID
  const getPlaceFavorite = useCallback(
    (placeId) => {
      if (!placeId) return null;
      return placeFavorites.find((fav) => fav.place_id === placeId);
    },
    [placeFavorites]
  );

  // Check if a trip is favorited (legacy - by place name)
  const isTripFavorited = useCallback(
    (placeName) => {
      if (!placeName) return false;

      const normalizedName = placeName.toLowerCase().trim();
      return tripFavorites.some(
        (fav) => fav.place_name?.toLowerCase().trim() === normalizedName
      );
    },
    [tripFavorites]
  );

  // Get trip favorite by place name (legacy)
  const getTripFavoriteByName = useCallback(
    (placeName) => {
      if (!placeName) return null;

      const normalizedName = placeName.toLowerCase().trim();
      return tripFavorites.find(
        (fav) => fav.place_name?.toLowerCase().trim() === normalizedName
      );
    },
    [tripFavorites]
  );

  // Toggle place favorite
  const togglePlaceFavorite = useCallback(
    async (placeId) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const existingFavorite = getPlaceFavorite(placeId);

      if (existingFavorite) {
        await removePlaceFavoriteMutation.mutateAsync(existingFavorite.id);
      } else {
        await addPlaceFavoriteMutation.mutateAsync(placeId);
      }
    },
    [
      user,
      getPlaceFavorite,
      addPlaceFavoriteMutation,
      removePlaceFavoriteMutation,
    ]
  );

  // Toggle trip favorite (legacy - kept for backward compatibility)
  const toggleTripFavorite = useCallback(
    async (placeData, destination) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const placeName = placeData.name || placeData.place_name;
      const existingFavorite = getTripFavoriteByName(placeName);

      if (existingFavorite) {
        await removeTripFavoriteMutation.mutateAsync(existingFavorite.id);
      } else {
        // Extract city and country from destination or place data
        let city = placeData.city;
        let country = placeData.country;

        if (destination && !city) {
          const parts = destination.split(",").map((p) => p.trim());
          city = parts[0];
          country = parts[1] || "";
        }

        if (!city && placeData.address) {
          const addressParts = placeData.address
            .split(",")
            .map((p) => p.trim());
          city = addressParts[addressParts.length - 2] || addressParts[0];
          country = addressParts[addressParts.length - 1] || "";
        }

        const tripId = placeData.trip_id || placeData.id;
        if (!tripId) {
          throw new Error("Trip ID required");
        }

        await addTripFavoriteMutation.mutateAsync(tripId);
      }
    },
    [
      user,
      getTripFavoriteByName,
      addTripFavoriteMutation,
      removeTripFavoriteMutation,
    ]
  );

  return {
    // Place favorites
    placeFavorites,
    isPlaceFavorited,
    getPlaceFavorite,
    togglePlaceFavorite,
    isTogglingPlace:
      addPlaceFavoriteMutation.isPending ||
      removePlaceFavoriteMutation.isPending,

    // Trip favorites (legacy)
    tripFavorites,
    isTripFavorited,
    getTripFavoriteByName,
    toggleTripFavorite,
    isTogglingTrip:
      addTripFavoriteMutation.isPending || removeTripFavoriteMutation.isPending,

    // Combined state
    isLoading: isLoadingTrips || isLoadingPlaces,

    // Backward compatibility (points to trip favorites)
    favorites: tripFavorites,
    isFavorited: isTripFavorited,
    getFavoriteByName: getTripFavoriteByName,
    toggleFavorite: toggleTripFavorite,
    isToggling:
      addTripFavoriteMutation.isPending || removeTripFavoriteMutation.isPending,
  };
}
