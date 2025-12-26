import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, endpoints } from "@/api/apiClient";
import {
  getRecommendations,
  organizeItinerary,
  modifyTrip,
  applyChanges,
  createDraftTrip,
  getCurrentDraftTrip,
  finalizeTrip,
  loadMessages,
} from "@/api/inspireService";
import { Trip } from "@/api/backendService";
import { City } from "@/api/cityService";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Loader2,
  X,
  MapPin,
  Star,
  Sparkles,
  Filter,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FiltersModal from "../components/inspire/FiltersModal";
import CitiesModal from "../components/inspire/CitiesModal";
import RecommendationList from "../components/inspire/RecommendationList";
import RecommendationModal from "../components/inspire/RecommendationModal";
import PlacesSidebar from "../components/inspire/PlacesSidebar";
import OrganizeTripModal from "../components/inspire/OrganizeTripModal";
import SidebarPlaceModal from "../components/inspire/SidebarPlaceModal";
import ConfirmationModal from "../components/common/ConfirmationModal";
import NotificationModal from "../components/common/NotificationModal";
import UserAvatar from "../components/common/UserAvatar";
import PlaceDetails from "../components/trip/PlaceDetails";
import ProposedChanges from "../components/inspire/ProposedChanges";
import ClarificationQuestions from "../components/inspire/ClarificationQuestions";
import PublishTripModal from "../components/trip/PublishTripModal";

const EXAMPLE_PROMPTS = [
  "Scuba trip through Southeast Asia on a budget.",
  "A quiet week in Tuscany with vineyards and sunsets.",
  "Chasing northern lights in Norway this winter.",
  "Exploring Tokyo's food markets for 5 days.",
  "A long weekend in Lisbon with local culture.",
];

/**
 * ⚠️ CRITICAL - Normalize city name to avoid duplicates
 *
 * Handles various formats:
 * - "Miami, Estados Unidos"
 * - "Miami, Estados Unidos, United States"
 * - "Miami, United States"
 * - "Miami"
 *
 * Always returns: "city, country" (normalized, lowercase) or "city" if no country specified.
 *
 * EXAMPLES:
 * ✓ "Miami, Estados Unidos" → "miami, estados unidos"
 * ✓ "Miami, Estados Unidos, United States" → "miami, estados unidos"
 * ✓ "Miami, United States" → "miami, united states"
 * ✓ "Miami" → "miami"
 */
const normalizeCityName = (cityName) => {
  if (!cityName) return "";

  // Normalize: lowercase and trim
  const normalized = cityName.toLowerCase().trim();

  // Split by comma
  const parts = normalized
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (parts.length === 0) return "";

  // If only city name (no country)
  if (parts.length === 1) {
    return parts[0];
  }

  // If has city + country (or more)
  // Always use first part (city) + last part (country)
  const cityPart = parts[0];
  const countryPart = parts[parts.length - 1];

  const result = `${cityPart}, ${countryPart}`;
  return result;
};

/**
 * ⚠️ CRITICAL - Check if city already exists in tabs
 *
 * Uses smart comparison to detect duplicates even with different formats:
 * - "Miami, Estados Unidos" vs "Miami, Estados Unidos, United States" → DUPLICATE
 * - "Miami, Estados Unidos" vs "Miami, United States" → DUPLICATE (if country names are considered similar)
 *
 * LOGIC:
 * 1. Normalize both city names to get 'city' and 'country' parts.
 * 2. Compare the CITY part (first segment) - must match.
 * 3. If cities match, compare COUNTRY parts.
 * 4. If countries are an exact match OR one country name contains significant parts of the other (to handle translations like "Estados Unidos" vs "United States"), then it's a DUPLICATE.
 * 5. Also considers "City" vs "City, Country" as a duplicate if cities match.
 */
const isCityInTabs = (cityName, existingTabs) => {
  if (!cityName || !existingTabs || existingTabs.length === 0) {
    return false;
  }

  const normalizedInput = normalizeCityName(cityName);
  const inputParts = normalizedInput.split(",").map((p) => p.trim());
  const inputCity = inputParts[0];
  const inputCountry =
    inputParts.length > 1 ? inputParts[inputParts.length - 1] : "";

  for (const tab of existingTabs) {
    const normalizedTab = normalizeCityName(tab.name);
    const tabParts = normalizedTab.split(",").map((p) => p.trim());
    const tabCity = tabParts[0];
    const tabCountry = tabParts.length > 1 ? tabParts[tabParts.length - 1] : "";

    // Cities must match exactly
    if (inputCity !== tabCity) {
      continue;
    }

    // If cities match, check countries
    // Case 1: Both are city-only, or both are city,country and countries match
    if (inputParts.length === 1 && tabParts.length === 1) {
      // Both are city only, and cities match
      return true;
    } else if (
      inputParts.length > 1 &&
      tabParts.length > 1 &&
      inputCountry === tabCountry
    ) {
      // Both have country, and countries match exactly
      return true;
    } else if (
      (inputParts.length === 1 && tabParts.length > 1) ||
      (inputParts.length > 1 && tabParts.length === 1)
    ) {
      // One is "City" and the other is "City, Country". If cities match, consider it a duplicate.
      // This handles cases like input "Miami" and existing tab "Miami, United States", or vice-versa.
      return true;
    }

    // Case 2: Countries don't match exactly, but might be translations/synonyms
    if (inputCountry && tabCountry) {
      // Only attempt this if both have country parts
      const countryWords1 = inputCountry
        .split(" ")
        .filter((word) => word.length > 2);
      const countryWords2 = tabCountry
        .split(" ")
        .filter((word) => word.length > 2);

      // Check if they share significant words
      const sharedWords = countryWords1.filter((word1) =>
        countryWords2.some(
          (word2) => word1.includes(word2) || word2.includes(word1)
        )
      );

      if (sharedWords.length > 0) {
        return true;
      }
    }
  }

  return false;
};

/**
 * ⚠️ CRITICAL FUNCTION - DO NOT MODIFY WITHOUT UNDERSTANDING ⚠️
 *
 * Determines if a recommendation is a CITY or a PLACE/LOCAL
 * This is used to decide which modal to open:
 * - City → RecommendationModal (with CityModalContent)
 * - Place → PlaceDetails modal
 *
 * TESTED AND WORKING LOGIC:
 * 1. PRIORITY 1: Trust AI's explicit type
 *    - type === 'city' OR 'cidade' → TRUE (it's a city)
 *    - type === 'place'/'activity'/'business'/'lugar'/'atividade'/'negócio' → FALSE (it's a place)
 *
 * 2. PRIORITY 2: Check for google_place_id
 *    - Has google_place_id (and not "MANUAL_ENTRY_REQUIRED") → FALSE (cities don't have google_place_id, only specific places do)
 *
 * 3. PRIORITY 3: Check name for place keywords
 *    - Contains: park, museum, beach, restaurant, avenue, etc. → FALSE
 *
 * 4. DEFAULT: If no clear indicators → FALSE (safer to assume place)
 *
 * EXAMPLES:
 * ✓ "Paris, France" (type: city) → TRUE → Opens City Modal
 * ✓ "Silicon Valley" (type: cidade) → TRUE → Opens City Modal
 * ✓ "Ibirapuera Park" (type: place, google_place_id: ChIJ...) → FALSE → Opens Place Modal
 * ✓ "Avenida Paulista" (type: place, google_place_id: ChIJ...) → FALSE → Opens Place Modal
 */
const isCityRecommendation = (rec) => {
  // ==========================================
  // PRIORITY 1: Trust the type from AI
  // Accept both English and Portuguese types
  // ==========================================
  const typeNormalized = rec.type?.toLowerCase().trim();

  // City types (English and Portuguese)
  if (typeNormalized === "city" || typeNormalized === "cidade") {
    return true;
  }

  // Place types (English and Portuguese)
  const placeTypes = [
    "place",
    "activity",
    "business",
    "lugar",
    "atividade",
    "negócio",
  ];
  if (placeTypes.includes(typeNormalized)) {
    return false;
  }

  // ==========================================
  // PRIORITY 2: Check for google_place_id
  // Cities don't have google_place_id. Specific places do.
  // Ignore "MANUAL_ENTRY_REQUIRED" as it's not a valid Place ID
  // ==========================================
  const hasValidGooglePlaceId =
    rec.google_place_id &&
    rec.google_place_id.length > 0 &&
    rec.google_place_id !== "MANUAL_ENTRY_REQUIRED";
  if (hasValidGooglePlaceId) {
    return false;
  }

  // ==========================================
  // PRIORITY 3: Check name for common place keywords
  // ==========================================
  const placeKeywords = [
    "park",
    "parque",
    "museum",
    "museu",
    "beach",
    "praia",
    "restaurant",
    "restaurante",
    "bar",
    "cafe",
    "café",
    "hotel",
    "mall",
    "shopping",
    "market",
    "mercado",
    "avenue",
    "avenida",
    "street",
    "rua",
    "square",
    "praça",
    "garden",
    "jardim",
    "tower",
    "torre",
    "palace",
    "palácio",
    "cathedral",
    "catedral",
    "church",
    "igreja",
    "temple",
    "templo",
  ];
  const nameLower = rec.name.toLowerCase();

  if (placeKeywords.some((keyword) => nameLower.includes(keyword))) {
    return false;
  }

  // ==========================================
  // DEFAULT: When in doubt, treat as a place
  // ==========================================
  return false;
};

export default function InspirePrompt() {
  const { user } = useAuth();
  const { tripId: urlTripId } = useParams();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Trip persistence state
  const [tripId, setTripId] = useState(urlTripId || null);
  const [tripData, setTripData] = useState(null);
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);

  // Conversation & Recommendations
  const [messages, setMessages] = useState([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);

  // City tabs management
  const [cityTabs, setCityTabs] = useState([]);
  const [initialCityPrefillDone, setInitialCityPrefillDone] = useState(false);
  const [activeCity, setActiveCity] = useState(null);

  // Helper function to get active city ID (UUID)
  const getActiveCityId = () => {
    if (!activeCity) return null;
    const tab = cityTabs.find((t) => t.name === activeCity);
    return tab?.id || null;
  };

  // Filters & Cities modal
  const [showFilters, setShowFilters] = useState(false);
  const [showCitiesModal, setShowCitiesModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    interests: [],
    budget: null,
    pace: null,
    companions: null,
    season: null,
  });

  // Recommendation Modal State
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sidebar & Organizer state
  const [selectedSidebarPlace, setSelectedSidebarPlace] = useState(null);
  const [isSidebarPlaceModalOpen, setIsSidebarPlaceModalOpen] = useState(false);
  const [isOrganizeTripModalOpen, setIsOrganizeTripModalOpen] = useState(false);
  const [tripDays, setTripDays] = useState(3);
  const [isOrganizingTrip, setIsOrganizingTrip] = useState(false);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState(null);

  // Error notification modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalConfig, setErrorModalConfig] = useState(null);

  // Show more recommendations
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  // Loading phrases
  const [loadingPhrase, setLoadingPhrase] = useState(0);

  // Trip modification state
  const [proposedChanges, setProposedChanges] = useState(null);
  const [clarificationQuestions, setClarificationQuestions] = useState(null);
  const [isApplyingChanges, setIsApplyingChanges] = useState(false);

  // Publish modal state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [fullTripData, setFullTripData] = useState(null);

  // Example prompts rotation
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const exampleIntervalRef = useRef(null);

  // Initialize trip on mount - load existing trip or check for draft
  useEffect(() => {
    const initializeTrip = async () => {
      setIsLoadingTrip(true);

      try {
        if (urlTripId) {
          // Load existing trip from URL
          const tripResponse = await Trip.get(urlTripId);
          setTripData(tripResponse);

          // Load chat messages
          const messagesData = await loadMessages(urlTripId);
          setMessages(messagesData);

          // Reconstruct city tabs from trip data
          reconstructCityTabs(tripResponse);

          setTripId(urlTripId);
        } else {
          // Check for existing draft trip
          try {
            const draftData = await getCurrentDraftTrip();
            console.log(
              "[InspirePrompt] getCurrentDraftTrip returned:",
              draftData
            );

            // Robust extraction similar to create flow
            let existingTrip = null;
            if (draftData?.trip) existingTrip = draftData.trip;
            else if (draftData?.data?.trip) existingTrip = draftData.data.trip;
            else if (draftData?.data && draftData.data.id)
              existingTrip = draftData.data;
            else if (draftData?.id) existingTrip = draftData;

            if (existingTrip && existingTrip.id) {
              // Redirect to existing draft
              navigate(`/InspirePrompt/${existingTrip.id}`, { replace: true });
              return; // Let the redirect handle loading
            }
          } catch (error) {
            // No draft found or error - that's fine, start fresh
            console.log("[InspirePrompt] No existing draft trip");
          }
        }
      } catch (error) {
        console.error("[InspirePrompt] Error initializing trip:", error);
      } finally {
        setIsLoadingTrip(false);
      }
    };

    if (user) {
      initializeTrip();
    } else {
      setIsLoadingTrip(false);
    }
  }, [urlTripId, user]);

  // Reconstruct city tabs from loaded trip data
  const reconstructCityTabs = (tripData) => {
    if (!tripData) return;

    const cities = tripData.cities || [];
    const tabs = cities.map((city) => {
      // Include country name if available for display (e.g., "Vancouver, Canada")
      const displayName = city.country?.name
        ? `${city.name}, ${city.country.name}`
        : city.name;

      // Use a simplified city name for address matching (first part before comma)
      const searchName = String(city.name).split(",")[0].trim().toLowerCase();

      return {
        id: city.id,
        name: displayName,
        city_id: city.id,
        places: (tripData.places || [])
          .filter((place) => {
            // Match places to city by address (using searchName) or by explicit city relationship
            return (
              (place.address &&
                searchName &&
                place.address.toLowerCase().includes(searchName)) ||
              place.place?.city_id === city.id
            );
          })
          .map((p) => ({
            id: p.id,
            name: p.name,
            address: p.address,
            rating: p.rating,
            price_level: p.price_level,
            place_id: p.place?.google_place_id,
            photos: p.photos || [],
            types: p.types || [],
            addedAt: p.created_at,
          })),
        organizedItinerary:
          tripData.itineraryDays && tripData.itineraryDays.length > 0
            ? tripData.itineraryDays
            : null,
        createdAt: city.created_at || Date.now(),
      };
    });

    setCityTabs(tabs);
  };

  // Read URL prefill for city or cityId and add to cityTabs once
  const [searchParams] = useSearchParams();
  useEffect(() => {
    if (initialCityPrefillDone) return;
    const cityParam = searchParams.get("city");
    const cityIdParam = searchParams.get("cityId");
    if (cityIdParam) {
      (async () => {
        try {
          const resp = await apiClient.get(
            endpoints.cities.getById(cityIdParam)
          );
          if (resp.success && resp.data) {
            setCityTabs((s) => {
              if (s.find((c) => c.id === resp.data.id)) return s;
              return [
                {
                  id: resp.data.id,
                  name: `${resp.data.name}, ${resp.data.country?.name || ""}`,
                },
                ...s,
              ];
            });
          }
        } catch (e) {
          console.warn("Prefill city by id failed", e.message);
        }
      })();
    } else if (cityParam) {
      const normalized = normalizeCityName(cityParam);
      if (normalized) {
        setCityTabs((s) => {
          if (s.find((c) => c.name === normalized)) return s;
          return [{ name: normalized, id: null }, ...s];
        });
      }
    }
    setInitialCityPrefillDone(true);
  }, [searchParams, initialCityPrefillDone]);

  // Resolve city id by querying the server; returns city id (uuid) or null if not found
  const resolveCityId = async (cityName) => {
    if (!cityName) return null;
    try {
      const resp = await apiClient.get(endpoints.cities.search, {
        query: cityName,
      });

      if (
        resp &&
        resp.success &&
        Array.isArray(resp.data) &&
        resp.data.length > 0
      ) {
        const normalizedTarget = normalizeCityName(cityName);
        // Prefer exact normalized match
        const exact = resp.data.find(
          (c) => normalizeCityName(c.name) === normalizedTarget
        );
        if (exact) return exact.id;

        // Fallback: match by city-only (before comma)
        const cityOnly = normalizedTarget.split(",")[0].trim();
        const byCity = resp.data.find((c) =>
          normalizeCityName(c.name).startsWith(cityOnly)
        );
        if (byCity) return byCity.id;

        // Last resort: return first result
        return resp.data[0].id;
      }
    } catch (err) {
      console.error("[InspirePrompt] resolveCityId error:", err);
    }

    return null;
  };

  // Parse tripId from URL for trip modification mode
  useEffect(() => {
    const tripIdParam = searchParams.get("tripId");
    if (tripIdParam) {
      setTripId(tripIdParam);
      console.log(
        "[InspirePrompt] Trip modification mode enabled:",
        tripIdParam
      );
    }
  }, [searchParams]);

  // Welcome content - Apple Intelligence style
  const welcomeContent = {
    en: {
      hero: "Travel planning with us is different.",
      features: [
        {
          number: "1",
          title: "Start from the essence.",
          description:
            "Everything in Walvee begins with cities — living places where every journey takes shape. Describe your trip in your own words, and Walvee's AI will translate your ideas into destinations that match your spirit of adventure.",
          color: "violet",
        },
        {
          number: "2",
          title: "Explore in depth.",
          description:
            "Each city becomes a living space — a tab where you can talk, explore, and design your journey. Find hidden spots, experiences, and people — and choose what truly belongs in your story.",
          color: "blue",
        },
        {
          number: "3",
          title: "Let it unfold naturally.",
          description:
            "Forget about schedules for now. When you're ready, Walvee organizes it all — days, paths, stays, and connections — turning your vision into a real itinerary.",
          color: "cyan",
        },
      ],
    },
    pt: {
      hero: "Criar viagem com a gente é diferente.",
      features: [
        {
          number: "1",
          title: "Comece pela essência.",
          description:
            "Tudo na Walvee começa com cidades — lugares vivos onde cada jornada toma forma. Descreva sua viagem com suas próprias palavras e a IA da Walvee vai traduzir suas ideias em destinos que combinam com seu espírito de aventura.",
          color: "violet",
        },
        {
          number: "2",
          title: "Explore em profundidade.",
          description:
            "Cada cidade se torna um espaço vivo — uma aba onde você pode conversar, explorar e desenhar sua jornada. Encontre lugares escondidos, experiências e pessoas — e escolha o que realmente pertence à sua história.",
          color: "blue",
        },
        {
          number: "3",
          title: "Deixe acontecer naturalmente.",
          description:
            "Esqueça os horários por enquanto. Quando estiver pronta, a Walvee organiza tudo — dias, caminhos, hospedagens e conexões — transformando sua visão em um roteiro real.",
          color: "cyan",
        },
      ],
    },
  };

  // Detect user language
  const userLanguage = messages.some((m) => /[àáâãéêíóôõúç]/i.test(m.content))
    ? "pt"
    : "en";

  const content = welcomeContent[userLanguage];

  // Auto scroll to bottom when new messages
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Track which message contexts we've already loaded from the server to avoid refetching
  const loadedMessageContextsRef = useRef(new Set());

  // Load messages when the active city (context) changes — only the first time per context
  useEffect(() => {
    if (!tripId) return;

    const contextKey =
      activeCity === null
        ? null
        : (() => {
            // Try to resolve to a city id when available for more reliable server filtering
            const tab = cityTabs.find((t) => t.name === activeCity);
            return tab && tab.id ? tab.id : activeCity;
          })();

    if (loadedMessageContextsRef.current.has(contextKey)) return;

    let cancelled = false;
    (async () => {
      try {
        const msgs = await loadMessages(
          tripId,
          contextKey === null ? null : contextKey
        );
        if (cancelled) return;
        // Merge messages without duplicates, keep chronological order
        setMessages((prev) => {
          const existing = new Set(prev.map((m) => m.id));
          const newMsgs = msgs.filter((m) => !existing.has(m.id));
          const merged = [...prev, ...newMsgs].sort(
            (a, b) => a.timestamp - b.timestamp
          );
          return merged;
        });
        loadedMessageContextsRef.current.add(contextKey);
      } catch (err) {
        console.error(
          "[InspirePrompt] loadMessages error for context:",
          contextKey,
          err
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tripId, activeCity, cityTabs]);

  // Initial focus on input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Example rotation (for input placeholder)
  useEffect(() => {
    if (isFocused || inputValue.trim() || messages.length > 0) {
      if (exampleIntervalRef.current) {
        clearInterval(exampleIntervalRef.current);
        exampleIntervalRef.current = null;
      }
      return;
    }

    exampleIntervalRef.current = setInterval(() => {
      setCurrentExampleIndex((prev) => (prev + 1) % EXAMPLE_PROMPTS.length);
    }, 4000);

    return () => {
      if (exampleIntervalRef.current) clearInterval(exampleIntervalRef.current);
    };
  }, [isFocused, inputValue, messages.length]);

  // Loading phrases rotation
  useEffect(() => {
    if (!isLoadingResponse) {
      setLoadingPhrase(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingPhrase((prev) => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoadingResponse]);

  // Helper for price level display
  const getPriceRangeInfo = (priceLevel) => {
    switch (priceLevel) {
      case 0:
        return { symbol: "Free", level: 0 };
      case 1:
        return { symbol: "$", level: 1 };
      case 2:
        return { symbol: "$$", level: 2 };
      case 3:
        return { symbol: "$$$", level: 3 };
      case 4:
        return { symbol: "$$$$", level: 4 };
      default:
        return null;
    }
  };

  /**
   * ⚠️ CRITICAL HANDLER - ADD CITY TO TABS ⚠️
   *
   * Prevents duplicate cities from being added
   * Uses isCityInTabs() for smart duplicate detection
   */
  const handleAddCityToTrip = async (cityName, providedCityId = null) => {
    // Always close modal and clear selection when adding/activating a city tab
    setIsModalOpen(false);
    setSelectedRecommendation(null);

    // Check for duplicates BEFORE adding
    if (isCityInTabs(cityName, cityTabs)) {
      let foundExistingTab = null;
      const normalizedInput = normalizeCityName(cityName);
      const inputParts = normalizedInput.split(",").map((p) => p.trim());
      const inputCity = inputParts[0];
      const inputCountry =
        inputParts.length > 1 ? inputParts[inputParts.length - 1] : "";

      for (const tab of cityTabs) {
        const normalizedTab = normalizeCityName(tab.name);
        const tabParts = normalizedTab.split(",").map((p) => p.trim());
        const tabCity = tabParts[0];
        const tabCountry =
          tabParts.length > 1 ? tabParts[tabParts.length - 1] : "";

        if (inputCity !== tabCity) {
          continue;
        }

        if (inputParts.length === 1 && tabParts.length === 1) {
          foundExistingTab = tab;
          break;
        } else if (
          inputParts.length > 1 &&
          tabParts.length > 1 &&
          inputCountry === tabCountry
        ) {
          foundExistingTab = tab;
          break;
        } else if (
          (inputParts.length === 1 && tabParts.length > 1) ||
          (inputParts.length > 1 && tabParts.length === 1)
        ) {
          foundExistingTab = tab;
          break;
        }

        if (inputCountry && tabCountry) {
          const countryWords1 = inputCountry
            .split(" ")
            .filter((word) => word.length > 2);
          const countryWords2 = tabCountry
            .split(" ")
            .filter((word) => word.length > 2);
          const sharedWords = countryWords1.filter((word1) =>
            countryWords2.some(
              (word2) => word1.includes(word2) || word2.includes(word1)
            )
          );
          if (sharedWords.length > 0) {
            foundExistingTab = tab;
            break;
          }
        }
      }

      if (foundExistingTab) {
        setActiveCity(foundExistingTab.name);
        setInputValue("");
        inputRef.current?.focus();
      } else {
        console.warn(
          "[handleAddCityToTrip] isCityInTabs returned true, but no specific matching existingTab found to activate. This scenario should be rare."
        );
      }
      return;
    }

    // Determine user's language for AI's response for the new city message
    const userLanguageForAI = messages.some((m) =>
      /[àáâãéêíóôõúç]/i.test(m.content)
    )
      ? "pt"
      : "en";

    const newTab = {
      name: cityName,
      places: [],
      organizedItinerary: null,
      createdAt: Date.now(),
    };

    setCityTabs((prev) => [...prev, newTab]);
    setActiveCity(cityName);

    // Persist to backend if tripId exists
    if (tripId) {
      try {
        const resolvedCityId =
          providedCityId || (await resolveCityId(cityName));
        const payload = resolvedCityId
          ? { city_id: resolvedCityId }
          : { city_name: cityName };
        await Trip.addCity(tripId, payload);

        // If we have an id, update the optimistic tab to include it
        if (resolvedCityId) {
          setCityTabs((prev) =>
            prev.map((tab) =>
              tab.name === cityName
                ? { ...tab, id: resolvedCityId, city_id: resolvedCityId }
                : tab
            )
          );
        }
      } catch (error) {
        console.error("[InspirePrompt] Error persisting city:", error);

        // Check if it's a duplicate city error
        if (error.response?.data?.code === "DUPLICATE_CITY") {
          setErrorModalConfig({
            title: "City Already Added",
            message:
              error.response?.data?.message ||
              "This city is already in your trip.",
          });
          setShowErrorModal(true);
          // Remove the city from local state since backend rejected it
          setCityTabs((prev) => prev.filter((tab) => tab.name !== cityName));
          return;
        }

        // For other errors, show generic error
        setErrorModalConfig({
          title: "Error Adding City",
          message:
            error.response?.data?.message ||
            "Failed to add city to trip. Please try again.",
        });
        setShowErrorModal(true);
        // Remove the city from local state since backend rejected it
        setCityTabs((prev) => prev.filter((tab) => tab.name !== cityName));
        return;
      }
    }

    // Re-add the city focus message for the new tab
    const cityFocusMessage = {
      role: "assistant",
      content:
        userLanguageForAI === "pt"
          ? `Ótimo! Agora que você escolheu ${cityName}, vamos focar nossa conversa nesta cidade. 🌟\n\nVocê pode me contar sobre seus interesses, o que você gosta de fazer, que tipo de lugares procura, e eu vou sugerir locais, atividades e experiências específicas em ${cityName}.\n\nO que você gostaria de explorar nesta cidade?`
          : `Great! Now that you've chosen ${cityName}, let's focus our conversation on this city. 🌟\n\nYou can tell me about your interests, what you like to do, what kind of places you're looking for, and I'll suggest specific places, activities and experiences in ${cityName}.\n\nWhat would you like to explore in this city?`,
      cityContext: cityName, // This ties the message to the new city tab
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, cityFocusMessage]);

    setInputValue("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Handle adding place to trip
  const handleAddPlaceToTrip = async (place) => {
    let cityName;
    if (place.city && place.country) {
      const countryName =
        typeof place.country === "object" ? place.country.name : place.country;
      cityName = `${place.city}, ${countryName}`;
    } else if (place.city) {
      cityName = place.city;
    } else if (place.address) {
      // Attempt to extract city from address if no explicit city/country
      const addressParts = place.address.split(",").map((p) => p.trim());
      if (addressParts.length >= 2) {
        // Assume last part is country, second to last is city if available
        cityName = `${addressParts[addressParts.length - 2]}, ${
          addressParts[addressParts.length - 1]
        }`;
      } else {
        cityName = addressParts[0]; // Just the first part
      }
    } else {
      cityName = "Unknown City";
    }

    // Persist to backend if tripId exists
    if (tripId) {
      try {
        // Check if city tab exists, if not create it first
        const cityExists = cityTabs.some(
          (tab) => normalizeCityName(tab.name) === normalizeCityName(cityName)
        );

        if (!cityExists) {
          let createdCityId = null;
          try {
            const resolvedCityId = await resolveCityId(cityName);
            const payload = resolvedCityId
              ? { city_id: resolvedCityId }
              : { city_name: cityName };
            await Trip.addCity(tripId, payload);
            createdCityId = resolvedCityId;
          } catch (cityError) {
            // For city errors, log and continue
            console.error("[InspirePrompt] Error adding city:", cityError);
          }
        }

        // Add place to backend
        await Trip.addPlace(tripId, {
          name: place.name,
          address: place.address,
          rating: place.rating,
          price_level: place.price_level,
          types: place.types,
          place_id: place.place_id,
        });
      } catch (error) {
        console.error("[InspirePrompt] Error persisting place:", error);

        // Show generic error for all errors
        setErrorModalConfig({
          title: "Error Adding Place",
          message:
            error.response?.data?.message ||
            "Failed to add place to trip. Please try again.",
        });
        setShowErrorModal(true);
        return;
      }
    }

    const normalizedNewCityName = normalizeCityName(cityName);

    setCityTabs((prevTabs) => {
      // Find existing tab using the robust isCityInTabs logic.
      let existingTab = null;
      const inputParts = normalizedNewCityName.split(",").map((p) => p.trim());
      const inputCity = inputParts[0];
      const inputCountry =
        inputParts.length > 1 ? inputParts[inputParts.length - 1] : "";

      for (const tab of prevTabs) {
        const normalizedTab = normalizeCityName(tab.name);
        const tabParts = normalizedTab.split(",").map((p) => p.trim());
        const tabCity = tabParts[0];
        const tabCountry =
          tabParts.length > 1 ? tabParts[tabParts.length - 1] : "";

        if (inputCity !== tabCity) {
          continue;
        }

        if (inputParts.length === 1 && tabParts.length === 1) {
          existingTab = tab;
          break;
        } else if (
          inputParts.length > 1 &&
          tabParts.length > 1 &&
          inputCountry === tabCountry
        ) {
          existingTab = tab;
          break;
        } else if (
          (inputParts.length === 1 && tabParts.length > 1) ||
          (inputParts.length > 1 && tabParts.length === 1)
        ) {
          existingTab = tab;
          break;
        }

        if (inputCountry && tabCountry) {
          const countryWords1 = inputCountry
            .split(" ")
            .filter((word) => word.length > 2);
          const countryWords2 = tabCountry
            .split(" ")
            .filter((word) => word.length > 2);
          const sharedWords = countryWords1.filter((word1) =>
            countryWords2.some(
              (word2) => word1.includes(word2) || word2.includes(word1)
            )
          );
          if (sharedWords.length > 0) {
            existingTab = tab;
            break;
          }
        }
      }

      if (existingTab) {
        const placeExistsInTab = existingTab.places.some(
          (p) =>
            (p.place_id && p.place_id === place.place_id) ||
            (p.name === place.name && p.address === place.address)
        );

        if (placeExistsInTab) {
          setActiveCity(existingTab.name);
          return prevTabs;
        }

        const updatedTabs = prevTabs.map((tab) => {
          if (tab.name === existingTab.name) {
            // Match by original tab name to update and invalidate organizedItinerary
            return {
              ...tab,
              places: [
                ...tab.places,
                {
                  name: place.name,
                  address: place.address,
                  rating: place.rating,
                  price_level: place.price_level,
                  place_id: place.place_id,
                  photos: place.photos || [],
                  types: place.types || [],
                  addedAt: Date.now(),
                },
              ],
              organizedItinerary: null,
            };
          }
          return tab;
        });
        setActiveCity(existingTab.name);
        return updatedTabs;
      } else {
        const userLanguageForAI = messages.some((m) =>
          /[àáâãéêíóôõúç]/i.test(m.content)
        )
          ? "pt"
          : "en";

        const newTab = {
          name: cityName,
          places: [
            {
              name: place.name,
              address: place.address,
              rating: place.rating,
              price_level: place.price_level,
              place_id: place.place_id,
              photos: place.photos || [],
              types: place.types || [],
              addedAt: Date.now(),
            },
          ],
          organizedItinerary: null,
          createdAt: Date.now(),
        };

        const updatedTabs = [...prevTabs, newTab];
        setActiveCity(cityName);

        const cityFocusMessage = {
          role: "assistant",
          content:
            userLanguageForAI === "pt"
              ? `Ótimo! Adicionei ${place.name} ao seu roteiro em ${cityName}. 🎉\n\nVocê pode me contar mais sobre o que gostaria de fazer nesta cidade e eu vou sugerir outros locais e atividades.\n\nO que mais você gostaria de explorar?`
              : `Great! I've added ${place.name} to your itinerary in ${cityName}. 🎉\n\nYou can tell me more about what you'd like to do in this city and I'll suggest other places and activities.\n\nWhat else would you like to explore?`,
          cityContext: cityName,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, cityFocusMessage]);

        return updatedTabs;
      }
    });

    setIsModalOpen(false);
    setSelectedRecommendation(null);
    setInputValue("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Handle removing place from trip
  const handleRemovePlace = (cityName, placeName) => {
    setConfirmModalConfig({
      title: "Remove Place",
      description: `Are you sure you want to remove "${placeName}" from your itinerary?`,
      confirmLabel: "Remove",
      onConfirm: async () => {
        // Find the place to get its ID
        const cityTab = cityTabs.find((tab) => tab.name === cityName);
        const place = cityTab?.places?.find((p) => p.name === placeName);

        // If we have a tripId and place ID, remove from backend first
        if (tripId && place?.id) {
          try {
            await Trip.removePlace(tripId, place.id);
          } catch (error) {
            console.error(
              "[InspirePrompt] Error removing place from backend:",
              error
            );
            // Show error modal
            setErrorModalConfig({
              title: "Error Removing Place",
              message:
                error.response?.data?.message ||
                "Failed to remove place. Please try again.",
            });
            setShowErrorModal(true);
            setShowConfirmModal(false);
            setConfirmModalConfig(null);
            return;
          }
        }

        // Update local state
        setCityTabs((prevTabs) =>
          prevTabs.map((tab) => {
            if (tab.name === cityName) {
              return {
                ...tab,
                places: (tab.places || []).filter((p) => p.name !== placeName),
                organizedItinerary: null, // Invalidate organized itinerary when places change
              };
            }
            return tab;
          })
        );
        setShowConfirmModal(false);
        setConfirmModalConfig(null);
      },
      onCancel: () => {
        setShowConfirmModal(false);
        setConfirmModalConfig(null);
      },
    });
    setShowConfirmModal(true);
  };

  // Handle removing city tab
  const handleRemoveCityTab = (cityName, e) => {
    e.stopPropagation();

    const cityTab = cityTabs.find((tab) => tab.name === cityName);
    const placesCount = cityTab?.places?.length || 0;

    setConfirmModalConfig({
      title: "Remove City",
      description:
        placesCount > 0
          ? `Are you sure you want to remove "${cityName}" and all ${placesCount} place${
              placesCount > 1 ? "s" : ""
            } from your itinerary?`
          : `Are you sure you want to remove "${cityName}" from your itinerary?`,
      confirmLabel: "Remove",
      onConfirm: async () => {
        // If we have a tripId and city ID, remove from backend first
        if (tripId && cityTab?.city_id) {
          try {
            await Trip.removeCity(tripId, cityTab.city_id);
          } catch (error) {
            console.error(
              "[InspirePrompt] Error removing city from backend:",
              error
            );
            // Show error modal
            setErrorModalConfig({
              title: "Error Removing City",
              message:
                error.response?.data?.message ||
                "Failed to remove city. Please try again.",
            });
            setShowErrorModal(true);
            setShowConfirmModal(false);
            setConfirmModalConfig(null);
            return;
          }
        }

        // Update local state
        setCityTabs((prev) => prev.filter((tab) => tab.name !== cityName));

        if (activeCity === cityName) {
          setActiveCity(null);
        }

        setShowConfirmModal(false);
        setConfirmModalConfig(null);
      },
      onCancel: () => {
        setShowConfirmModal(false);
        setConfirmModalConfig(null);
      },
    });
    setShowConfirmModal(true);
  };

  /**
   * ⚠️ CRITICAL HANDLER - MODAL ROUTING LOGIC ⚠️
   *
   * Handles click on recommendation cards
   * Uses isCityRecommendation() to determine which modal to open
   *
   * DO NOT MODIFY without testing both:
   * - City recommendations (should open RecommendationModal)
   * - Place recommendations (should open PlaceDetails modal)
   */
  const handleRecommendationClick = (rec) => {
    setSelectedRecommendation(rec);
    setIsModalOpen(true);
  };

  // Check if a place is already in the trip
  const isPlaceInTrip = (place) => {
    if (!place || !place.name) return false;

    // Check all city tabs for this place
    return cityTabs.some((tab) =>
      tab.places?.some((p) => p.name === place.name)
    );
  };

  // Handle adding place from the PlaceDetails modal to the trip
  const handleAddPlaceFromModal = () => {
    if (!selectedRecommendation) return;

    handleAddPlaceToTrip(selectedRecommendation);

    setIsModalOpen(false);
    setSelectedRecommendation(null);
  };

  // Handle removing place from the PlaceDetails modal
  const handleRemovePlaceFromModal = () => {
    if (!selectedRecommendation) return;

    // Find which city this place belongs to
    const cityTab = cityTabs.find((tab) =>
      tab.places?.some((p) => p.name === selectedRecommendation.name)
    );

    if (cityTab) {
      handleRemovePlace(cityTab.name, selectedRecommendation.name);
    }

    setIsModalOpen(false);
    setSelectedRecommendation(null);
  };

  // Sidebar place selection
  const handleSelectSidebarPlace = (place) => {
    setSelectedSidebarPlace(place);
    setIsSidebarPlaceModalOpen(true);
  };

  const handleCloseSidebarPlaceModal = () => {
    setSelectedSidebarPlace(null);
    setIsSidebarPlaceModalOpen(false);
  };

  // Organize trip handlers
  const handleOrganizeClick = () => {
    setIsOrganizeTripModalOpen(true);
  };

  const handleClearItinerary = (cityName) => {
    setCityTabs((prev) =>
      prev.map((tab) =>
        tab.name === cityName ? { ...tab, organizedItinerary: null } : tab
      )
    );
  };

  const handleConfirmOrganize = async ({ cityName, places, days }) => {
    if (!cityName) return;
    setIsOrganizingTrip(true);

    try {
      // Get city ID from cityName
      const cityTab = cityTabs.find((t) => t.name === cityName);
      const cityId = cityTab?.id || null;

      if (!cityId) {
        console.error(
          "[handleConfirmOrganize] City ID not found for:",
          cityName
        );
        setIsOrganizingTrip(false);
        return;
      }

      // Call organize endpoint WITH trip_id for auto-save
      const response = await organizeItinerary({
        city_id: cityId,
        places: places || [],
        days: days,
        user_query: "", // Optional custom instructions
        trip_id: tripId, // Backend saves automatically if trip_id provided
      });

      // Response already has .itinerary
      const itinerary = response.itinerary || [];

      console.log(
        `[InspirePrompt] Itinerary organized${tripId ? " and saved" : ""} for city ${cityId}`
      );

      // Update local state with organized itinerary
      setCityTabs((prev) =>
        prev.map((tab) =>
          tab.name === cityName
            ? { ...tab, organizedItinerary: itinerary }
            : tab
        )
      );

      setIsOrganizeTripModalOpen(false);
    } catch (error) {
      console.error("[OrganizeTrip] Error:", error);
      // Show error notification to user
      setErrorModalConfig({
        title: "Error Organizing Trip",
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to organize itinerary. Please try again.",
      });
      setShowErrorModal(true);
    } finally {
      setIsOrganizingTrip(false);
    }
  };

  // Get filtered messages based on active city
  const filteredMessages =
    activeCity === null
      ? messages.filter((m) => !m.cityContext)
      : messages.filter((m) => m.cityContext === activeCity);

  // ==================== TRIP MODIFICATION HANDLERS ====================

  /**
   * Handle trip modification request
   * Sends query to AI for analysis and gets proposed changes or clarification questions
   */
  const handleModifyTrip = async (query) => {
    setIsLoadingResponse(true);
    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await modifyTrip(tripId, query, conversationHistory);

      if (response.response_type === "changes") {
        // AI proposed changes
        setProposedChanges(response.changes);

        const aiMessage = {
          role: "assistant",
          content: response.message,
          hasChanges: true,
          changeCount: response.changes.length,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else if (response.response_type === "clarification") {
        // AI needs clarification
        setClarificationQuestions(response.questions);

        const aiMessage = {
          role: "assistant",
          content: response.message,
          hasClarificationQuestions: true,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("[TripModification] Error:", error);
      const errorMessage = {
        role: "assistant",
        content:
          "Sorry, I had trouble understanding that request. Could you try rephrasing it?",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoadingResponse(false);
      inputRef.current?.focus();
    }
  };

  /**
   * Handle approval of proposed changes
   * Applies selected changes to the trip
   */
  const handleApproveChanges = async (selectedChanges) => {
    setIsApplyingChanges(true);
    try {
      const response = await applyChanges(tripId, selectedChanges);

      // Show success message
      const successMessage = {
        role: "assistant",
        content: `✅ Successfully applied ${
          response.applied_changes.length
        } changes to your trip!${
          response.failed_changes.length > 0
            ? ` (${response.failed_changes.length} changes failed)`
            : ""
        }`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, successMessage]);

      // Clear proposed changes
      setProposedChanges(null);

      // TODO: Update trip state with response.trip
      // You may want to refresh the trip data or update local state here
      console.log("[TripModification] Updated trip:", response.trip);
    } catch (error) {
      console.error("[TripModification] Apply error:", error);
      const errorMessage = {
        role: "assistant",
        content:
          "Sorry, something went wrong while applying the changes. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsApplyingChanges(false);
    }
  };

  /**
   * Handle rejection of proposed changes
   */
  const handleRejectChanges = () => {
    setProposedChanges(null);
    const rejectionMessage = {
      role: "assistant",
      content:
        "No problem! Let me know if you'd like to make any other changes.",
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, rejectionMessage]);
  };

  /**
   * Handle submission of clarification answers
   * Converts answers to natural language and re-submits to AI
   */
  const handleSubmitClarificationAnswers = (answersText) => {
    setClarificationQuestions(null);
    setInputValue(answersText);

    // Automatically submit with the answers
    setTimeout(() => {
      if (tripId) {
        handleModifyTrip(answersText);
      } else {
        handleSubmit();
      }
    }, 100);
  };

  // ==================== END TRIP MODIFICATION HANDLERS ====================

  // Handle input submission
  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!inputValue.trim() || isLoadingResponse) return;

    const userMessage = {
      role: "user",
      content: inputValue,
      cityContext: activeCity,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = inputValue;
    setInputValue("");

    setIsLoadingResponse(true);

    try {
      // Create draft trip if doesn't exist
      let currentTripId = tripId;
      if (!currentTripId) {
        const draftData = await createDraftTrip({ title: "Untitled Trip" });
        // Debug log to capture unexpected shapes
        console.log("[InspirePrompt] createDraftTrip returned:", draftData);

        // Robustly extract trip object from multiple possible shapes
        let trip = null;
        if (draftData?.trip) trip = draftData.trip;
        else if (draftData?.data?.trip) trip = draftData.data.trip;
        else if (draftData?.data && draftData.data.id) trip = draftData.data;
        else if (draftData?.id) trip = draftData;

        if (!trip || !trip.id) {
          console.error("[InspirePrompt] Invalid draft payload:", draftData);
          // Don't crash the app; fallback to starting without a tripId
          // and let the recommendations call proceed without trip persistence
          // but log the issue so we can debug server/client mismatch.
          trip = null;
        }

        if (trip) {
          currentTripId = trip.id;
          setTripId(currentTripId);
          setTripData(trip);
          navigate(`/InspirePrompt/${currentTripId}`, { replace: true });
        }
      }

      // Build simple conversation history array
      const conversationHistory = filteredMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call new recommendations endpoint with trip_id for auto-save
      const response = await getRecommendations({
        user_query: currentInput,
        conversation_history: conversationHistory,
        filters: selectedFilters,
        city_id: getActiveCityId(),
        trip_id: currentTripId,
      });

      console.log("[InspirePrompt] Response received:", response);

      // Add AI message with recommendations
      const aiMessage = {
        role: "assistant",
        content: response.message || response,
        recommendations: response.recommendations || [],
        cityContext: activeCity,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      setShowAllRecommendations(false);
    } catch (error) {
      console.error("[InspirePrompt] Error:", error);
      console.error("[InspirePrompt] Error details:", {
        message: error.message,
        response: error.response,
        stack: error.stack,
      });
      const errorMessage = {
        role: "assistant",
        content:
          "Sorry, I had trouble processing that. Could you try rephrasing your request?",
        recommendations: [],
        cityContext: activeCity,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoadingResponse(false);
      inputRef.current?.focus();
    }
  };

  // Handle manual city selection
  const handleCitySelect = (cityName) => {
    setInputValue(`Tell me about ${cityName}`);
    setShowCitiesModal(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Handle filters apply
  const handleApplyFilters = (filters) => {
    setSelectedFilters(filters);
    setShowFilters(false);
  };

  const loadingPhrases = [
    "Navigating digital seas and searching for information about your trip...",
    "School of cities and places spotted, we're close...",
    "Arriving at a place just for you in this infomare!",
  ];

  const activeCityPlaces =
    cityTabs.find((tab) => tab.name === activeCity)?.places || [];

  // Placeholder function for opening login modal
  const openLoginModal = () => {};

  // Handle opening publish modal
  const handlePublishTrip = async () => {
    if (!tripId) return;

    try {
      const response = await Trip.get(tripId);

      // Handle both response formats - direct data or wrapped in success/data
      let tripData;
      if (response && response.success && response.data) {
        tripData = response.data;
      } else if (response && response.id) {
        tripData = response;
      } else {
        throw new Error("Invalid response format");
      }

      setFullTripData(tripData);
      setShowPublishModal(true);
    } catch (error) {
      setErrorModalConfig({
        title: "Error",
        message: error.message || "Could not load trip data for publishing",
      });
      setShowErrorModal(true);
    }
  };

  // Handle publishing with photos
  const handlePublishWithPhotos = async (photosData, tripDetails) => {
    setIsPublishing(true);
    try {
      await Trip.publish(tripId, { photos: photosData, ...tripDetails });

      setShowPublishModal(false);
      // Redirect to trip details
      navigate(`/TripDetails/${tripId}`);
    } catch (error) {
      console.error("[InspirePrompt] Error publishing trip:", error);
      setErrorModalConfig({
        title: "Publish Failed",
        message:
          error.response?.data?.error?.message ||
          error.message ||
          "Failed to publish trip",
      });
      setShowErrorModal(true);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="inspire-container">
      <style>{`
        .inspire-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #121518;
          position: relative;
          overflow: hidden;
        }

        .inspire-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.03);
          pointer-events: none;
        }

        /* City tabs container */
        .city-tabs-container {
          position: sticky;
          top: 64px;
          left: 0;
          right: 0;
          z-index: 30;
          background: #0A0B0F;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 12px 16px;
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          flex-shrink: 0;
        }

        .city-tabs-container::-webkit-scrollbar {
          display: none;
        }

        /* Main chat tab */
        .city-tab.main-chat {
          background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
          border-color: rgba(59, 130, 246, 0.4);
          min-width: 120px;
        }

        .city-tab.main-chat:hover {
          background: linear-gradient(135deg, #1E40AF 0%, #60A5FA 100%);
          border-color: rgba(96, 165, 250, 0.6);
        }

        .city-tab.main-chat.active {
          background: linear-gradient(135deg, #1E40AF 0%, #60A5FA 100%);
          border-color: #60A5FA;
          box-shadow: 0 0 20px rgba(96, 165, 250, 0.4);
        }

        /* Regular city tabs */
        .city-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(26, 27, 35, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .city-tab:hover {
          background: rgba(31, 34, 45, 0.9);
          border-color: rgba(59, 130, 246, 0.3);
          color: rgba(255, 255, 255, 0.9);
          transform: translateY(-1px);
        }

        .city-tab.active {
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.5);
          color: #FFFFFF;
          box-shadow: 0 0 16px rgba(59, 130, 246, 0.2);
        }

        .city-tab-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          transition: all 0.2s ease;
          margin-left: 4px;
        }

        .city-tab-remove:hover {
          background: rgba(239, 68, 68, 0.3);
          border-color: rgba(239, 68, 68, 0.5);
          transform: scale(1.1);
        }

        /* Main layout */
        .inspire-main-layout {
          display: flex;
          height: calc(100vh - 96px);
          margin-top: 64px;
          position: relative;
          width: 100%;
        }

        /* When city tabs are visible, add extra margin */
        .inspire-main-layout.with-city-tabs {
          margin-top: 64px;
          height: calc(100vh - 64px);
        }

        /* Places sidebar */
        .places-sidebar {
          width: 300px;
          flex-shrink: 0;
          background: rgba(13, 14, 17, 0.95);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .places-sidebar-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          flex-shrink: 0;
        }

        .places-sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .places-sidebar-content::-webkit-scrollbar {
          width: 6px;
        }

        .places-sidebar-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .places-sidebar-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        /* Content area - parent is a flex column so the prompt can stick to bottom */
        .content-scroll-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: visible;
          overflow-x: hidden;
          padding: 20px 24px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }

        .content-scroll-area::-webkit-scrollbar {
          width: 6px;
        }

        .content-scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }

        .content-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        /* Content inner should flex to fill available vertical space */
        .content-inner {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          flex: 1;
          min-height: 0; /* allow children to shrink/scroll */
        }

        /* Stage Area */
        .stage-area {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          height: 100%;
          box-sizing: border-box;
          align-self: center;
          flex: 1;
        }

        /* Conversation State (now scrollable) */
        .conversation-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 32px;
          padding: 20px;
          padding-bottom: 120px;
          flex: 1;
          overflow-y: auto;
        }

        .message {
          display: flex;
          gap: 16px;
          animation: messageIn 0.4s ease;
        }

        @keyframes messageIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message.user {
          flex-direction: row-reverse;
          justify-content: flex-start;
        }

        .message.user .message-content-wrapper {
          align-items: flex-end;
        }

        .message.user .message-header {
          justify-content: flex-end;
        }

        .message.user .message-content {
          text-align: right;
        }

        .message-avatar {
          flex-shrink: 0;
        }

        .message-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .message-user-name {
          font-size: 16px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.95);
        }

        .message-content-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .message-content {
          max-width: 85%;
          padding: 20px 24px;
          border-radius: 20px;
          font-size: 15px;
          line-height: 1.7;
          white-space: pre-wrap;
        }

        .message.assistant .message-content {
          background: rgba(37, 99, 235, 0.08);
          color: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(37, 99, 235, 0.15);
        }

        .message.user .message-content {
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        /* Loading phrase */
        .loading-phrase {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
        }

        /* Apple-style welcome section - UPDATED */
        .inspire-welcome {
          text-align: center;
          padding: 60px 20px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          max-width: 1200px;
          margin: 0 auto;
          flex: 1;
          min-height: 0;
        }

        .welcome-hero {
          margin-bottom: 56px;
          position: relative;
        }

        .welcome-hero::after {
          content: '';
          position: absolute;
          bottom: -32px;
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, rgba(139, 92, 246, 0.3), transparent);
        }

        .welcome-hero-title {
          font-size: clamp(40px, 5vw, 64px);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% 200%;
          animation: gradientShift 6s ease infinite;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Feature cards - HORIZONTAL GRID */
        .welcome-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          width: 100%;
          max-width: 1200px;
          margin-bottom: 56px;
        }

        .welcome-feature-card {
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 40px 32px;
          text-align: left;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          min-height: 320px;
          display: flex;
          flex-direction: column;
        }

        /* Card color variants */
        .welcome-feature-card.color-violet {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(109, 40, 217, 0.08) 100%);
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .welcome-feature-card.color-blue {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(29, 78, 216, 0.08) 100%);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .welcome-feature-card.color-cyan {
          background: linear-gradient(135deg, rgba(34, 211, 238, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%);
          border: 1px solid rgba(34, 211, 238, 0.2);
        }

        /* Glow effect on hover */
        .welcome-feature-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 24px;
          padding: 2px;
          background: linear-gradient(135deg, transparent 0%, transparent 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .welcome-feature-card.color-violet::before {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.6), rgba(236, 72, 153, 0.4));
        }

        .welcome-feature-card.color-blue::before {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.6), rgba(139, 92, 246, 0.4));
        }

        .welcome-feature-card.color-cyan::before {
          background: linear-gradient(135deg, rgba(34, 211, 238, 0.6), rgba(59, 130, 246, 0.4));
        }

        .welcome-feature-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.25);
        }

        .welcome-feature-card:hover::before {
          opacity: 1;
        }

        /* Numbered badge with pulse */
        .feature-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          font-size: 22px;
          font-weight: 700;
          color: white;
          margin-bottom: 24px;
          position: relative;
          animation: gentlePulse 3s ease-in-out infinite;
        }

        @keyframes gentlePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .color-violet .feature-number {
          background: linear-gradient(135deg, #8B5CF6, #A855F7);
          box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);
        }

        .color-blue .feature-number {
          background: linear-gradient(135deg, #3B82F6, #60A5FA);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
        }

        .color-cyan .feature-number {
          background: linear-gradient(135deg, #22D3EE, #06B6D4);
          box-shadow: 0 8px 24px rgba(34, 211, 238, 0.3);
        }

        .feature-title {
          font-size: 26px;
          font-weight: 700;
          color: white;
          margin-bottom: 16px;
          line-height: 1.3;
        }

        .feature-description {
          font-size: 16px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.75);
          flex: 1;
        }

        /* Action buttons */
        .welcome-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .welcome-button {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: white;
          padding: 14px 28px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          cursor: pointer;
        }

        .welcome-button:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(59, 130, 246, 0.25);
        }

        /* Mobile - horizontal scroll with snap */
        @media (max-width: 1024px) {
          .welcome-features {
            grid-template-columns: 1fr; /* Reset grid for smaller screens */
            gap: 20px;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
            padding: 0 20px;
            display: flex; /* Override grid display for horizontal scroll */
          }

          .welcome-features::-webkit-scrollbar {
            display: none;
          }

          .welcome-feature-card {
            min-width: 320px;
            max-width: 400px;
            flex-shrink: 0;
            scroll-snap-align: center;
            min-height: 280px;
            padding: 32px 24px;
          }

          .feature-title {
            font-size: 22px;
          }

          .feature-description {
            font-size: 15px;
          }
        }

        @media (max-width: 768px) {
          .inspire-welcome {
            padding: 40px 16px 32px;
          }

          .welcome-hero {
            margin-bottom: 48px;
          }

          .welcome-hero-title {
            font-size: 36px;
          }

          .welcome-features {
            margin-bottom: 40px;
            padding: 0 16px;
          }

          .welcome-feature-card {
            min-width: 280px;
            max-width: 320px;
          }

          .feature-number {
            width: 40px;
            height: 40px;
            font-size: 18px;
            margin-bottom: 20px;
          }

          .feature-title {
            font-size: 20px;
            margin-bottom: 12px;
          }

          .feature-description {
            font-size: 14px;
            line-height: 1.6;
          }
        }

        /* Place sidebar item */
        .place-sidebar-item {
          position: relative;
          background: rgba(26, 27, 35, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 12px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .place-sidebar-item:hover {
          background: rgba(31, 34, 45, 0.8);
          border-color: rgba(59, 130, 246, 0.3);
          transform: translateX(2px);
        }

        .place-sidebar-item-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 8px;
        }

        .place-sidebar-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(59, 130, 246, 0.15);
          border-radius: 10px;
          flex-shrink: 0;
        }

        .place-sidebar-item-content {
          flex: 1;
          min-width: 0;
          padding-right: 24px;
        }

        .place-sidebar-item-name {
          font-size: 14px;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .place-sidebar-item-address {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .place-sidebar-item-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-left: 52px;
        }

        .place-sidebar-item-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          color: #FCD34D;
        }

        .place-sidebar-item-price {
          font-size: 13px;
          font-weight: 700;
          color: #34D399;
        }

        .place-sidebar-item-remove {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0;
        }

        .place-sidebar-item:hover .place-sidebar-item-remove {
          opacity: 1;
        }

        .place-sidebar-item-remove:hover {
          background: rgba(239, 68, 68, 0.25);
          border-color: rgba(239, 68, 68, 0.5);
          transform: scale(1.1);
        }

        /* Show more button */
        .show-more-container {
          display: flex;
          justify-content: center;
          padding: 24px 0;
          margin-top: 16px;
        }

        /* Prompt Block (now positioned by flexbox: sticks to bottom of content area) */
        .prompt-block-container {
          /* previously fixed; now placed as last flex child */
          flex-shrink: 0;
          margin-top: auto; /* push to bottom */
          width: 100%;
          background: linear-gradient(to top, #121518 0%, #121518 80%, transparent 100%);
          padding: 32px 24px 24px;
        }

        .prompt-block-inner {
          max-width: 900px;
          margin: 0 auto;
        }

        .prompt-microcopy {
          text-align: center;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 16px;
          font-weight: 500;
        }

        .prompt-wrapper {
          position: relative;
          background: rgba(26, 27, 35, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }

        .prompt-input-container {
          position: relative;
        }

        .prompt-textarea {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-size: 15px;
          line-height: 1.6;
          resize: none;
          min-height: 60px;
          max-height: 200px;
          font-family: inherit;
        }

        .prompt-textarea::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .prompt-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .prompt-action-btn {
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .prompt-action-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .prompt-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .filter-active-dot {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 8px;
          height: 8px;
          background: #3B82F6;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
        }

        .prompt-submit-btn {
          position: absolute;
          right: 16px;
          bottom: 16px;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          border: none;
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
        }

        .prompt-submit-btn:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 6px 24px rgba(59, 130, 246, 0.6);
        }

        .prompt-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Place modal */
        .place-modal-container {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .place-modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
        }

        .place-modal-content {
          position: relative;
          width: 100%;
          max-width: 520px;
          height: 100vh;
          background: linear-gradient(135deg, #0F1014 0%, #1A1B23 100%);
          box-shadow:
            -4px 0 24px rgba(0, 0, 0, 0.5),
            -2px 0 12px rgba(59, 130, 246, 0.1);
          animation: slideInFromRight 0.3s ease-out;
          display: flex;
          flex-direction: column;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Organize Trip modal */
        .organize-trip-modal-container {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .organize-trip-modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
        }

        .organize-trip-modal-content {
          position: relative;
          width: 100%;
          max-width: 520px;
          height: 100vh;
          background: linear-gradient(135deg, #0F1014 0%, #1A1B23 100%);
          box-shadow:
            -4px 0 24px rgba(0, 0, 0, 0.5),
            -2px 0 12px rgba(59, 130, 246, 0.1);
          animation: slideInFromRight 0.3s ease-out;
          display: flex;
          flex-direction: column;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
        }

        .organize-days-input {
          width: 120px;
        }

        .organize-places-list {
          max-height: 320px;
          overflow-y: auto;
        }

        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .places-sidebar {
            width: 300px;
            position: fixed;
            left: 0;
            top: 116px; /* Header (64px) + City tabs container (~52px) */
            bottom: 0;
            z-index: 40;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .places-sidebar.open {
            transform: translateX(0);
          }

          .inspire-main-layout {
            padding-left: 0;
          }
        }

        @media (max-width: 768px) {
          .city-tabs-container {
            padding: 8px 16px;
          }

          .inspire-main-layout {
            margin-top: 64px;
            height: calc(100vh - 96px);
          }

          .content-scroll-area {
            padding: 16px 16px;
          }

          .place-modal-content {
            max-width: 100%;
          }
        }
      `}</style>

      {/* City Tabs - with Main Chat */}
      {(cityTabs.length > 0 || messages.length > 0) && (
        <div className="city-tabs-container">
          {/* Main Chat Tab - Always first */}
          <button
            className={`city-tab main-chat ${
              activeCity === null ? "active" : ""
            }`}
            onClick={() => setActiveCity(null)}
          >
            <Sparkles className="w-4 h-4" />
            <span>Main Chat</span>
          </button>

          {/* City Tabs */}
          {cityTabs.map((tab) => (
            <div
              key={tab.name}
              className={`city-tab ${activeCity === tab.name ? "active" : ""}`}
              onClick={() => setActiveCity(tab.name)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveCity(tab.name);
                }
              }}
            >
              <MapPin className="w-4 h-4" />
              <span>{tab.name}</span>
              <button
                className="city-tab-remove"
                onClick={(e) => handleRemoveCityTab(tab.name, e)}
                aria-label={`Remove ${tab.name}`}
              >
                <X className="w-3 h-3 text-red-400" />
              </button>
            </div>
          ))}

          {/* Publish Trip Button */}
          {tripId && cityTabs.length > 0 && (
            <button
              className="city-tab publish-trip-btn"
              onClick={handlePublishTrip}
              style={{
                marginLeft: "auto",
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                borderColor: "rgba(16, 185, 129, 0.4)",
                color: "#FFFFFF",
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>Publish Trip</span>
            </button>
          )}
        </div>
      )}

      {/* Main Layout with Sidebar (sidebar moved inside content area for proper stacking) */}
      <div
        className={`inspire-main-layout ${
          cityTabs.length > 0 || messages.length > 0 ? "with-city-tabs" : ""
        }`}
      >
        {/* Fixed Places Sidebar (left, non-scrolling on desktop) */}
        {activeCity && (
          <PlacesSidebar
            activeCity={activeCity}
            places={activeCityPlaces}
            organizedItinerary={
              cityTabs.find((t) => t.name === activeCity)?.organizedItinerary
            }
            onOrganizeClick={() => handleOrganizeClick()}
            onPlaceClick={(place) => handleSelectSidebarPlace(place)}
            onRemovePlace={(placeName) =>
              handleRemovePlace(activeCity, placeName)
            }
            onClearItinerary={() => handleClearItinerary(activeCity)}
            getPriceRangeInfo={getPriceRangeInfo}
            onOpenPlaceDetails={(place) => {
              setSelectedRecommendation(place);
              setIsModalOpen(true);
            }}
          />
        )}
        {/* Scrollable Content Area - Chat */}
        <div className="content-scroll-area">
          <div className="content-inner">
            {/* Stage Area */}
            <div className="stage-area">
              <AnimatePresence mode="wait">
                {/* Welcome Section - Apple Intelligence Style */}
                {messages.length === 0 && (
                  <motion.div
                    key="welcome-section"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inspire-welcome"
                  >
                    {/* Hero */}
                    <motion.div
                      className="welcome-hero"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    >
                      <h1 className="welcome-hero-title">{content.hero}</h1>
                    </motion.div>

                    {/* Feature cards - Horizontal Grid */}
                    <div className="welcome-features">
                      {content.features.map((feature, index) => (
                        <motion.div
                          key={feature.number}
                          className={`welcome-feature-card color-${feature.color}`}
                          initial={{ opacity: 0, y: 40 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.6,
                            delay: 0.3 + index * 0.15,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                        >
                          <div className="feature-number">{feature.number}</div>
                          <h3 className="feature-title">{feature.title}</h3>
                          <p className="feature-description">
                            {feature.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Quick action buttons */}
                    <motion.div
                      className="welcome-actions"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.9 }}
                    >
                      <button
                        onClick={() => setShowFilters(true)}
                        className="welcome-button"
                      >
                        <Filter className="w-5 h-5" />
                        Set Preferences
                      </button>
                      {/* <button
                        onClick={() => setShowCitiesModal(true)}
                        className="welcome-button"
                      >
                        <Globe className="w-5 h-5" />
                        Explore Cities
                      </button> */}
                    </motion.div>
                  </motion.div>
                )}

                {/* State: Conversation */}
                {messages.length > 0 && (
                  <motion.div
                    key="conversation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="conversation-container"
                  >
                    {filteredMessages.map((msg, idx) => (
                      <div key={idx} className={`message ${msg.role}`}>
                        <div className="message-avatar">
                          {msg.role === "assistant" ? (
                            <UserAvatar
                              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/dda6b4bec_LogoWalvee.png"
                              name="Walvee"
                              size="lg"
                              ring={true}
                            />
                          ) : (
                            <UserAvatar
                              src={user?.photo_url || user?.picture}
                              name={
                                user?.preferred_name || user?.full_name || "You"
                              }
                              size="lg"
                              ring={true}
                            />
                          )}
                        </div>

                        <div className="message-content-wrapper">
                          <div className="message-header">
                            <span className="message-user-name">
                              {msg.role === "assistant"
                                ? "Walvee"
                                : user?.preferred_name ||
                                  user?.full_name ||
                                  "You"}
                            </span>
                          </div>

                          <div className="message-content">{msg.content}</div>

                          {msg.role === "assistant" && msg.recommendations && (
                            <>
                              <RecommendationList
                                recommendations={msg.recommendations}
                                onCardClick={handleRecommendationClick}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    {isLoadingResponse && (
                      <div className="message assistant">
                        <div className="message-avatar ai">
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        </div>
                        <div className="message-content">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={loadingPhrase}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.5 }}
                              className="loading-phrase"
                            >
                              {loadingPhrases[loadingPhrase]}
                            </motion.span>
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    {/* Trip Modification: Proposed Changes */}
                    {proposedChanges && (
                      <ProposedChanges
                        changes={proposedChanges}
                        onApprove={handleApproveChanges}
                        onReject={handleRejectChanges}
                        isApplying={isApplyingChanges}
                      />
                    )}

                    {/* Trip Modification: Clarification Questions */}
                    {clarificationQuestions && (
                      <ClarificationQuestions
                        questions={clarificationQuestions}
                        onSubmitAnswers={handleSubmitClarificationAnswers}
                      />
                    )}

                    <div ref={messagesEndRef} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Fixed Prompt Block (moved outside content-inner) */}
          <div className="prompt-block-container">
            <div className="prompt-block-inner">
              <p className="prompt-microcopy">
                Every great trip begins with a few words. Start yours below.
              </p>

              <form onSubmit={handleSubmit} className="prompt-wrapper">
                <div className="prompt-input-container">
                  <textarea
                    ref={inputRef}
                    className="prompt-textarea"
                    placeholder={
                      messages.length > 0
                        ? "Continue your conversation..."
                        : EXAMPLE_PROMPTS[currentExampleIndex]
                    }
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={isLoadingResponse}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />
                </div>

                <div className="prompt-actions">
                  <button
                    type="button"
                    className="prompt-action-btn"
                    onClick={() => setShowFilters(true)}
                    disabled={isLoadingResponse}
                    style={{ position: "relative" }}
                  >
                    Filters
                    {(selectedFilters.interests.length > 0 ||
                      selectedFilters.budget ||
                      selectedFilters.pace ||
                      selectedFilters.companions ||
                      selectedFilters.season) && (
                      <span className="filter-active-dot" />
                    )}
                  </button>

                  {/* <button
                    type="button"
                    className="prompt-action-btn"
                    onClick={() => setShowCitiesModal(true)}
                    disabled={isLoadingResponse}
                  >
                    Cities
                  </button> */}
                </div>

                {inputValue.trim() && (
                  <button
                    type="submit"
                    className="prompt-submit-btn"
                    disabled={isLoadingResponse}
                  >
                    <ChevronRight className="w-7 h-7" />
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Filters Modal */}
        <FiltersModal
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          selectedFilters={selectedFilters}
          onApply={handleApplyFilters}
        />

        {/* Cities Modal */}
        <CitiesModal
          isOpen={showCitiesModal}
          onClose={() => setShowCitiesModal(false)}
          onSelectCity={handleCitySelect}
        />

        {/* Modals - Conditional rendering based on recommendation type */}
        {isModalOpen && selectedRecommendation && (
          <>
            {isCityRecommendation(selectedRecommendation) ? (
              <RecommendationModal
                isOpen={isModalOpen}
                onClose={() => {
                  setIsModalOpen(false);
                  setSelectedRecommendation(null);
                }}
                recommendation={selectedRecommendation}
                user={user}
                onAddToTrip={(rec) => {
                  const countryName =
                    typeof rec.country === "object"
                      ? rec.country.name
                      : rec.country;
                  const cityName = countryName
                    ? `${rec.name}, ${countryName}`
                    : rec.name;
                  if (rec?.city_id) {
                    handleAddCityToTrip(cityName, rec.city_id);
                  } else {
                    handleAddCityToTrip(cityName);
                  }
                }}
              />
            ) : (
              <div className="place-modal-container">
                <div
                  className="place-modal-backdrop"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedRecommendation(null);
                  }}
                />
                <div className="place-modal-content">
                  <PlaceDetails
                    place={selectedRecommendation}
                    trip={{
                      destination:
                        selectedRecommendation.city ||
                        selectedRecommendation.address,
                    }}
                    onClose={() => {
                      setIsModalOpen(false);
                      setSelectedRecommendation(null);
                    }}
                    user={user}
                    isInTrip={isPlaceInTrip(selectedRecommendation)}
                    onAddToTrip={handleAddPlaceFromModal}
                    onRemoveFromTrip={handleRemovePlaceFromModal}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Sidebar Place Modal */}
        {isSidebarPlaceModalOpen && selectedSidebarPlace && (
          <SidebarPlaceModal
            isOpen={isSidebarPlaceModalOpen}
            onClose={handleCloseSidebarPlaceModal}
            place={selectedSidebarPlace}
            user={user}
            isInTrip={isPlaceInTrip(selectedSidebarPlace)}
            onAddToTrip={() => {
              handleAddPlaceToTrip(selectedSidebarPlace);
              handleCloseSidebarPlaceModal();
            }}
            onRemove={() => {
              handleRemovePlace(activeCity, selectedSidebarPlace.name);
              handleCloseSidebarPlaceModal();
            }}
          />
        )}

        {/* Organize Trip Modal */}
        {isOrganizeTripModalOpen && (
          <OrganizeTripModal
            isOpen={isOrganizeTripModalOpen}
            onClose={() => setIsOrganizeTripModalOpen(false)}
            places={activeCityPlaces}
            tripDays={tripDays}
            setTripDays={setTripDays}
            isOrganizing={isOrganizingTrip}
            onConfirm={() =>
              handleConfirmOrganize({
                cityName: activeCity,
                places: activeCityPlaces,
                days: tripDays,
              })
            }
          />
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && confirmModalConfig && (
          <ConfirmationModal
            isOpen={showConfirmModal}
            title={confirmModalConfig.title}
            description={confirmModalConfig.description}
            confirmLabel={confirmModalConfig.confirmLabel}
            cancelLabel={confirmModalConfig.cancelLabel || "Cancel"}
            onConfirm={confirmModalConfig.onConfirm}
            onCancel={confirmModalConfig.onCancel}
          />
        )}

        {/* Error Notification Modal */}
        {showErrorModal && errorModalConfig && (
          <NotificationModal
            isOpen={showErrorModal}
            type="error"
            title={errorModalConfig.title}
            message={errorModalConfig.message}
            onClose={() => {
              setShowErrorModal(false);
              setErrorModalConfig(null);
            }}
          />
        )}

        {/* Publish Trip Modal */}
        <PublishTripModal
          isOpen={showPublishModal}
          onClose={() => setShowPublishModal(false)}
          trip={fullTripData}
          onPublish={handlePublishWithPhotos}
          isPublishing={isPublishing}
        />
      </div>
    </div>
  );
}
