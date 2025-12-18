import { useState, useCallback, useRef, useEffect } from 'react';
import { Trip, User } from "@/api/entities";

export function useGlobalSearch(cityContext = null) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    cities: [],
    trips: [],
    places: [],
    travelers: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const normalizeString = (str) => {
    if (!str) return '';
    return str
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const search = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults({ cities: [], trips: [], places: [], travelers: [] });
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
      const normalizedQuery = normalizeString(searchQuery);
      console.log('[Search] ===== STARTING SEARCH =====');
      console.log('[Search] Query:', searchQuery);
      console.log('[Search] Normalized:', normalizedQuery);
      console.log('[Search] City Context:', cityContext || 'none');

      const isAuthenticated = await User.isAuthenticated();
      console.log('[Search] Authenticated:', isAuthenticated);

      const [allTrips, allUsers] = await Promise.all([
        Trip.list().catch(err => {
          console.error('[Search] Error fetching trips:', err);
          return [];
        }),
        isAuthenticated
          ? User.list().catch(err => {
              console.error('[Search] Error fetching users:', err);
              return [];
            })
          : Promise.resolve([])
      ]);

      console.log('[Search] Data fetched - Trips:', allTrips.length, 'Users:', allUsers.length);

      const normalizedCityContext = cityContext ? normalizeString(cityContext) : null;
      const cityNameOnly = normalizedCityContext ? normalizedCityContext.split(',')[0].trim() : null;

      let travelers = [];
      if (isAuthenticated && allUsers.length > 0) {
        console.log('[Search] ===== SEARCHING USERS =====');
        
        travelers = allUsers
          .map(u => {
            const preferredName = normalizeString(u.preferred_name || '');
            const fullName = normalizeString(u.full_name || '');
            const email = normalizeString(u.email || '');
            const userCity = normalizeString(u.city || '');
            
            const nameMatches = 
              preferredName.includes(normalizedQuery) ||
              fullName.includes(normalizedQuery) ||
              email.includes(normalizedQuery);

            const cityMatches = !cityNameOnly || userCity.includes(cityNameOnly);

            if (nameMatches && cityMatches) {
              console.log('[Search] ✓ User match:', {
                name: u.preferred_name || u.full_name,
                city: u.city,
                matchedName: nameMatches,
                matchedCity: cityMatches
              });
            }

            return (nameMatches && cityMatches) ? {
              id: u.id,
              email: u.email,
              name: u.preferred_name || u.full_name || u.email,
              photo: u.photo_url || u.picture,
              city: u.city,
              country: u.country,
              trips: u.metrics_my_trips || 0,
              followers: u.metrics_followers || 0
            } : null;
          })
          .filter(Boolean)
          .sort((a, b) => {
            if (b.trips !== a.trips) return b.trips - a.trips;
            return (b.followers || 0) - (a.followers || 0);
          })
          .slice(0, 10);

        console.log('[Search] Travelers found:', travelers.length);
      }

      console.log('[Search] ===== SEARCHING TRIPS =====');
      const trips = allTrips
        .filter(trip => {
          const title = normalizeString(trip.title || '');
          const description = normalizeString(trip.description || '');
          const destination = normalizeString(trip.destination || '');
          const authorName = normalizeString(trip.author_name || '');
          
          const locationsMatch = (trip.locations || []).some(loc => 
            normalizeString(loc).includes(normalizedQuery)
          );
          
          const textMatches = 
            title.includes(normalizedQuery) ||
            description.includes(normalizedQuery) ||
            destination.includes(normalizedQuery) ||
            authorName.includes(normalizedQuery) ||
            locationsMatch;

          let cityMatches = true;
          if (cityNameOnly) {
            const tripDestination = normalizeString(trip.destination || '');
            const tripLocations = (trip.locations || []).map(loc => normalizeString(loc));
            
            cityMatches = 
              tripDestination.includes(cityNameOnly) ||
              tripLocations.some(loc => loc.includes(cityNameOnly));
          }

          if (textMatches && cityMatches) {
            console.log('[Search] ✓ Trip match:', {
              title: trip.title,
              matchedText: textMatches,
              matchedCity: cityMatches
            });
          }

          return textMatches && cityMatches;
        })
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 10);

      console.log('[Search] Trips found:', trips.length);

      let cities = [];
      if (!cityContext) {
        console.log('[Search] ===== SEARCHING CITIES =====');
        const cityMap = new Map();
        
        allTrips.forEach(trip => {
          if (trip.destination) {
            const normalizedDest = normalizeString(trip.destination);
            
            if (normalizedDest.includes(normalizedQuery)) {
              if (!cityMap.has(trip.destination)) {
                cityMap.set(trip.destination, {
                  name: trip.destination,
                  tripsCount: 0,
                  image: trip.images?.[0] || trip.image_url
                });
                console.log('[Search] ✓ City match (destination):', trip.destination);
              }
              cityMap.get(trip.destination).tripsCount++;
            }
          }
          
          if (trip.locations && Array.isArray(trip.locations)) {
            trip.locations.forEach(location => {
              const normalizedLoc = normalizeString(location);
              
              if (normalizedLoc.includes(normalizedQuery)) {
                if (!cityMap.has(location)) {
                  cityMap.set(location, {
                    name: location,
                    tripsCount: 0,
                    image: trip.images?.[0] || trip.image_url
                  });
                  console.log('[Search] ✓ City match (location):', location);
                }
                cityMap.get(location).tripsCount++;
              }
            });
          }
        });

        cities = Array.from(cityMap.values())
          .sort((a, b) => b.tripsCount - a.tripsCount)
          .slice(0, 10);

        console.log('[Search] Cities found:', cities.length);
      }

      console.log('[Search] ===== SEARCHING PLACES =====');
      const placeMap = new Map();
      
      allTrips.forEach(trip => {
        if (cityNameOnly) {
          const tripDestination = normalizeString(trip.destination || '');
          const tripLocations = (trip.locations || []).map(loc => normalizeString(loc));
          const tripMatchesCity = 
            tripDestination.includes(cityNameOnly) ||
            tripLocations.some(loc => loc.includes(cityNameOnly));
          
          if (!tripMatchesCity) return;
        }

        if (!trip.itinerary) return;
        
        trip.itinerary.forEach(day => {
          if (!day.places) return;
          
          day.places.forEach(place => {
            if (!place.name) return;
            
            const normalizedPlaceName = normalizeString(place.name);
            const normalizedAddress = normalizeString(place.address || '');
            
            const matches = 
              normalizedPlaceName.includes(normalizedQuery) ||
              normalizedAddress.includes(normalizedQuery);
            
            if (matches) {
              const key = place.place_id || place.name;
              
              if (!placeMap.has(key)) {
                placeMap.set(key, {
                  ...place,
                  mentions: 0,
                  city: trip.destination?.split(',')[0]?.trim(),
                  source: 'trips'
                });
                console.log('[Search] ✓ Place match (from trip):', place.name);
              }
              placeMap.get(key).mentions++;
            }
          });
        });
      });

      const places = Array.from(placeMap.values())
        .sort((a, b) => {
          if (a.mentions && !b.mentions) return -1;
          if (!a.mentions && b.mentions) return 1;
          if (a.mentions && b.mentions) return b.mentions - a.mentions;
          return (b.rating || 0) - (a.rating || 0);
        })
        .slice(0, 15);

      console.log('[Search] Places found:', places.length);

      console.log('[Search] ===== SEARCH COMPLETE =====');
      console.log('[Search] Total results:', {
        cities: cities.length,
        trips: trips.length,
        places: places.length,
        travelers: travelers.length
      });

      setResults({
        cities,
        trips,
        places,
        travelers
      });

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('[Search] Search aborted');
        return;
      }
      
      console.error('[Search] Error:', err);
      setError(err.message || 'Search failed');
      setResults({ cities: [], trips: [], places: [], travelers: [] });
    } finally {
      setIsLoading(false);
    }
  }, [cityContext]);

  const debouncedSearch = useCallback((searchQuery) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults({ cities: [], trips: [], places: [], travelers: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    searchTimeoutRef.current = setTimeout(() => {
      search(searchQuery);
    }, 300);
  }, [search]);

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
    setQuery('');
    setResults({ cities: [], trips: [], places: [], travelers: [] });
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
    isLoading,
    error,
    totalResults,
    clearSearch,
    retrySearch
  };
}