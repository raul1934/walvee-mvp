import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Trip } from "@/api/entities";
import { apiClient, endpoints } from "@/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Save,
  Upload as UploadIcon,
  X,
  Plus,
  GripVertical,
  MapPin,
  Trash2,
  Image as ImageIcon,
  Info,
  FileText,
  Map as MapIcon,
  Tag,
  MessageSquare,
  Repeat,
  Edit2,
  Check,
} from "lucide-react";
import { createPageUrl } from "@/utils";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TripMap from "../components/map/TripMap";

export default function TripEditor() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();

  // State management
  const [mode, setMode] = useState("create");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    durationDays: 1,
    budget: "",
    transportation: "",
    accommodation: "",
    best_time_to_visit: "",
    difficulty_level: "",
    trip_type: "",
    trip_images: [],
    images: [],
    visibility: "public",
    is_public: true,
    is_draft: true,
    cities: [],
    tags: [],
    itinerary: [
      {
        day: 1,
        title: "",
        description: "",
        activities: [
          {
            time: "",
            name: "",
            location: "",
            description: "",
            place_id: null,
            place: null,
          },
        ],
      },
    ],
  });

  // City search state
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [citySearchResults, setCitySearchResults] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [searchingCities, setSearchingCities] = useState(false);

  // Tag input state
  const [tagInput, setTagInput] = useState("");

  // Place search state for activities
  const [placeSearchQueries, setPlaceSearchQueries] = useState({});
  const [placeSearchResults, setPlaceSearchResults] = useState({});
  const [showPlaceDropdowns, setShowPlaceDropdowns] = useState({});

  // Map state
  const [mapMarkers, setMapMarkers] = useState([]);
  const [cityMarkers, setCityMarkers] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Default to Paris

  // Tab state
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Image gallery state
  const [selectedImages, setSelectedImages] = useState([]);
  const [showManageImagesModal, setShowManageImagesModal] = useState(false);
  const [availableImages, setAvailableImages] = useState([]);
  const [selectedImageIds, setSelectedImageIds] = useState(new Set());
  const [loadingImages, setLoadingImages] = useState(false);

  // City modal state
  const [selectedCity, setSelectedCity] = useState(null);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [showPlacePickerModal, setShowPlacePickerModal] = useState(false);
  const [placePickerActivity, setPlacePickerActivity] = useState(null); // { dayIndex, activityIndex }
  const [cityPlaces, setCityPlaces] = useState({}); // Object keyed by city ID
  const [cityPlacesLoading, setCityPlacesLoading] = useState(false);
  const [cityPlaceType, setCityPlaceType] = useState("all");

  const [cityPlaceSearch, setCityPlaceSearch] = useState("");
  // When user types a place search, store global results here (across cities)
  const [globalPlaceSearchResults, setGlobalPlaceSearchResults] = useState([]);
  // Day edit modal state
  const [editingDayIndex, setEditingDayIndex] = useState(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load trip data for edit mode
  useEffect(() => {
    if (tripId) {
      setMode("edit");
      loadTripData(tripId);
    }
  }, [tripId]);

  // Update map markers when itinerary changes
  useEffect(() => {
    const markers = [];

    formData.itinerary.forEach((day, dayIndex) => {
      (day.activities || []).forEach((activity, activityIndex) => {
        if (activity.place?.latitude && activity.place?.longitude) {
          markers.push({
            id: `${dayIndex}-${activityIndex}`,
            lat: activity.place.latitude,
            lng: activity.place.longitude,
            title: activity.name,
            address: activity.place.address || activity.location,
            number: markers.length + 1,
          });
        }
      });
    });

    setMapMarkers(markers);

    // Update map center if we have markers
    if (markers.length > 0) {
      const avgLat =
        markers.reduce((sum, m) => sum + m.lat, 0) / markers.length;
      const avgLng =
        markers.reduce((sum, m) => sum + m.lng, 0) / markers.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
    }
  }, [formData.itinerary]);

  // Update city markers when cities change
  useEffect(() => {
    const cities = [];

    formData.cities.forEach((city) => {
      if (city.latitude && city.longitude) {
        const countryName =
          typeof city.country === "object" ? city.country.name : city.country;
        cities.push({
          id: `city-${city.id}`,
          lat: city.latitude,
          lng: city.longitude,
          title: city.name,
          subtitle: countryName || "",
        });
      }
    });

    setCityMarkers(cities);
  }, [formData.cities]);

  const loadTripData = async (id) => {
    setLoading(true);
    try {
      const trip = await Trip.get(id);

      // Check authorization
      if (currentUser && trip.author?.id !== currentUser.id) {
        showNotification({
          type: "error",
          title: "Unauthorized",
          message: "You don't have permission to edit this trip",
        });
        navigate(`/TripDetails/${id}`);
        return;
      }

      populateFormData(trip);
    } catch (error) {
      showNotification({
        type: "error",
        title: "Error loading trip",
        message: error.message,
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const populateFormData = (trip) => {
    const transformedImages = (trip.trip_images || []).map((img, index) => {
      return {
        id: img.place_photo_id || img.city_photo_id,
        url: img.placePhoto?.url || img.cityPhoto?.url || null,
        source: img.place_photo_id ? "place" : "city",
        sourceName: "", // We don't have this in the response
        placePhotoId: img.place_photo_id,
        cityPhotoId: img.city_photo_id,
        imageOrder: img.image_order !== undefined ? img.image_order : index,
      };
    }).filter(img => img.url);

    setFormData({
      title: trip.title,
      description: trip.description || "",
      durationDays: trip.duration_days || trip.durationDays || 1,
      budget: trip.budget || "",
      transportation: trip.transportation || "",
      accommodation: trip.accommodation || "",
      best_time_to_visit: trip.best_time_to_visit || "",
      difficulty_level: trip.difficulty_level || "",
      trip_type: trip.trip_type || "",
      trip_images: transformedImages,
      visibility: trip.is_public ? "public" : "private",
      is_public: trip.is_public,
      is_draft: trip.is_draft !== undefined ? trip.is_draft : true,
      cities:
        trip.cities
          ?.sort((a, b) => (a.city_order || 0) - (b.city_order || 0))
          .map((c, idx) => ({
            id: c.id,
            name: c.name,
            country: c.country?.name || "",
            latitude: c.latitude,
            longitude: c.longitude,
            photos: c.photos || [],
            placesCount: c.placesCount || 0,
            tripsCount: c.tripsCount || 0,
            order: idx,
          })) || [],
      tags: trip.tags?.map((t) => (typeof t === "string" ? t : t.tag)) || [],
      itinerary: (() => {
        const rawDays =
          Array.isArray(trip.itineraryDays) && trip.itineraryDays.length > 0
            ? trip.itineraryDays
            : Array.isArray(trip.itinerary) && trip.itinerary.length > 0
            ? trip.itinerary
            : Array.isArray(trip.itinerary_days) &&
              trip.itinerary_days.length > 0
            ? trip.itinerary_days
            : Array.isArray(trip.days) && trip.days.length > 0
            ? trip.days
            : [];

        if (rawDays.length === 0) {
          return [
            {
              day: 1,
              title: "",
              description: "",
              activities: [
                {
                  time: "",
                  name: "",
                  location: "",
                  description: "",
                  place_id: null,
                  place: null,
                },
              ],
            },
          ];
        }

        return rawDays
          .slice()
          .sort(
            (a, b) =>
              (a.day_number || a.day || 0) - (b.day_number || b.day || 0)
          )
          .map((day) => {
            const activitiesRaw = day.activities || day.activities_list || [];
            const activities = (activitiesRaw || [])
              .filter((act) => act && (act.name || act.place?.name))
              .sort(
                (a, b) =>
                  (a.activity_order || a.order || 0) -
                  (b.activity_order || b.order || 0)
              )
              .map((act) => ({
                time: act.time || "",
                name: act.name || act.place?.name || "",
                location: act.location || act.place?.address || "",
                description: act.description || "",
                place_id: act.place_id || act.place?.id || null,
                place: act.place
                  ? {
                      id: act.place.id,
                      name: act.place.name,
                      address: act.place.address,
                      latitude: act.place.latitude,
                      longitude: act.place.longitude,
                      rating: act.place.rating,
                      user_ratings_total: act.place.user_ratings_total,
                      price_level: act.place.price_level,
                      photos: act.place.photos || [],
                    }
                  : null,
              }));

            if (activities.length === 0) {
              activities.push({
                time: "",
                name: "",
                location: "",
                description: "",
                place_id: null,
                place: null,
              });
            }

            return {
              day: day.day_number || day.day || 1,
              title: day.title || "",
              description: day.description || "",
              activities,
            };
          });
      })(),
    });

    // Ensure first day is selected when loading existing trip
    setSelectedDayIndex(0);

  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title must be 200 characters or less";
    }

    if (!formData.durationDays || formData.durationDays < 1) {
      newErrors.durationDays = "Duration must be at least 1 day";
    }

    if (formData.description && formData.description.length > 5000) {
      newErrors.description = "Description must be 5000 characters or less";
    }

    if (!formData.itinerary || formData.itinerary.length === 0) {
      newErrors.itinerary = "Trip must have at least one day";
    } else {
      const emptyDays = formData.itinerary.filter(
        (day) => !day.activities || day.activities.length === 0
      );
      if (emptyDays.length > 0) {
        newErrors.itinerary = `Day ${emptyDays[0].day} must have at least one activity`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Image management functions
  const collectAvailableImages = () => {
    const imagesMap = new Map(); // Use map to deduplicate by URL (since place photos may not have IDs)

    // Get images from cities
    formData.cities.forEach((city) => {
      if (city.photos && Array.isArray(city.photos)) {
        city.photos.forEach((photo) => {
          const key = photo.id || photo.url; // Use URL as fallback key
          if (photo.url && !imagesMap.has(key)) {
            imagesMap.set(key, {
              id: photo.id || photo.url, // Use URL as ID if no ID exists
              url: photo.url,
              source: "city",
              sourceName: city.name,
              cityPhotoId: photo.id || null,
              placePhotoId: null,
            });
          }
        });
      }
    });

    // Get images from itinerary places
    formData.itinerary.forEach((day) => {
      (day.activities || []).forEach((activity) => {
        if (activity.place && activity.place.photos) {
          activity.place.photos.forEach((photo) => {
            const key = photo.id || photo.url; // Use URL as fallback key
            if (photo.url && !imagesMap.has(key)) {
              imagesMap.set(key, {
                id: photo.id || photo.url, // Use URL as ID if no ID exists
                url: photo.url,
                source: "place",
                sourceName: activity.place.name,
                placePhotoId: photo.id || null,
                cityPhotoId: null,
              });
            }
          });
        }
      });
    });

    return Array.from(imagesMap.values());
  };

  const handleManageImages = async () => {
    setShowManageImagesModal(true);
    setLoadingImages(true);

    try {
      // Collect city and place IDs from current form data
      const cityIds = formData.cities.map(c => c.id);
      const placeIds = [];

      formData.itinerary.forEach(day => {
        (day.activities || []).forEach(activity => {
          if (activity.place_id) {
            placeIds.push(activity.place_id);
          }
        });
      });

      // Fetch available images from backend
      const response = await apiClient.post(
        endpoints.trips.availableImages(tripId || 'new'),
        { cityIds, placeIds }
      );

      const images = response.data.images || [];
      setAvailableImages(images);

      // Pre-select images that are already selected
      const selected = new Set(
        images.filter(img => img.isSelected).map(img => img.id)
      );
      setSelectedImageIds(selected);
    } catch (error) {
      console.error('Error fetching images:', error);
      showNotification({
        type: 'error',
        title: 'Error loading images',
        message: error.message || 'Failed to load available images',
      });
    } finally {
      setLoadingImages(false);
    }
  };

  const handleToggleImage = (imageId) => {
    setSelectedImageIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const handleSaveImages = () => {
    // Convert selected IDs back to trip_images format
    const selectedImagesArray = availableImages
      .filter(img => selectedImageIds.has(img.id))
      .map((img, index) => ({
        id: img.id,
        url: img.url,
        source: img.source,
        sourceName: img.sourceName,
        placePhotoId: img.placePhotoId,
        cityPhotoId: img.cityPhotoId,
        imageOrder: index,
      }));

    setFormData(prev => ({
      ...prev,
      trip_images: selectedImagesArray,
    }));

    setShowManageImagesModal(false);
  };

  const handleImageDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormData(prev => {
        const oldIndex = prev.trip_images.findIndex(img => img.id === active.id);
        const newIndex = prev.trip_images.findIndex(img => img.id === over.id);

        const newImages = [...prev.trip_images];
        const [movedImage] = newImages.splice(oldIndex, 1);
        newImages.splice(newIndex, 0, movedImage);

        // Update image_order
        return {
          ...prev,
          trip_images: newImages.map((img, idx) => ({ ...img, imageOrder: idx })),
        };
      });
    }
  };

  // Transform form data to API format
  const transformFormDataToAPI = (formData) => {
    return {
      title: formData.title.trim(),
      description: formData.description?.trim() || "",
      duration: formData.durationDays ? `${formData.durationDays} days` : null,
      budget: formData.budget || null,
      transportation: formData.transportation || null,
      accommodation: formData.accommodation || null,
      best_time_to_visit: formData.best_time_to_visit || null,
      difficulty_level: formData.difficulty_level || null,
      trip_type: formData.trip_type || null,
      trip_images: (formData.trip_images || []).map((img) => ({
        place_photo_id: img.placePhotoId || null,
        city_photo_id: img.cityPhotoId || null,
        image_order: img.imageOrder,
      })),
      is_public: formData.is_public,
      cities: formData.cities.map((c) => ({ id: c.id })),
      tags: formData.tags || [],
      itinerary: formData.itinerary.map((day) => ({
        day: day.day,
        title: day.title || "",
        activities: day.activities.map((activity) => ({
          time: activity.time || "",
          name: activity.name,
          location: activity.location || "",
          description: activity.description || "",
          place_id: activity.place_id || null,
        })),
      })),
    };
  };

  // Create handler
  const handleCreate = async () => {
    if (!validateForm()) {
      showNotification({
        type: "error",
        title: "Validation Error",
        message: "Please fix the errors before saving",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = transformFormDataToAPI(formData);
      const response = await Trip.create(payload);

      showNotification({
        type: "success",
        title: "Trip created",
        message: "Your trip has been created successfully",
      });

      navigate(`/TripDetails/${response.id}`);
    } catch (error) {
      showNotification({
        type: "error",
        title: "Error creating trip",
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Update handler
  const handleUpdate = async () => {
    if (!validateForm()) {
      showNotification({
        type: "error",
        title: "Validation Error",
        message: "Please fix the errors before saving",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = transformFormDataToAPI(formData);
      await Trip.update(tripId, payload);

      showNotification({
        type: "success",
        title: "Trip updated",
        message: "Your changes have been saved",
      });

      navigate(`/TripDetails/${tripId}`);
    } catch (error) {
      if (error.status === 403) {
        showNotification({
          type: "error",
          title: "Unauthorized",
          message: "You don't have permission to edit this trip",
        });
        navigate(`/TripDetails/${tripId}`);
      } else {
        showNotification({
          type: "error",
          title: "Error updating trip",
          message: error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle visibility handler (local state only, saved on Save button click)
  const handleToggleVisibility = (checked) => {
    setFormData((prev) => ({
      ...prev,
      is_public: checked,
      visibility: checked ? "public" : "private", // Keep for UI consistency
    }));
  };

  // City search handler
  const handleCitySearch = async (query) => {
    setCitySearchQuery(query);
    if (!query.trim()) {
      setCitySearchResults([]);
      setShowCityDropdown(false);
      return;
    }

    setSearchingCities(true);
    try {
      const response = await apiClient.get(endpoints.cities.search, {
        query: query.trim(),
      });
      if (response && response.success && response.data) {
        setCitySearchResults(response.data);
        setShowCityDropdown(true);
      } else {
        setCitySearchResults([]);
      }
    } catch (error) {
      console.error("Error searching cities:", error);
      setCitySearchResults([]);
    } finally {
      setSearchingCities(false);
    }
  };

  // Add city handler
  const handleAddCity = (city) => {
    if (!formData.cities.find((c) => c.id === city.id)) {
      setFormData((prev) => ({
        ...prev,
        cities: [
          ...prev.cities,
          {
            id: city.id,
            name: city.name,
            country: city.country?.name || "",
            latitude: city.latitude,
            longitude: city.longitude,
            photos: city.photos || [],
            placesCount: city.placesCount || 0,
            tripsCount: city.tripsCount || 0,
            order: prev.cities.length,
          },
        ],
      }));
    }
    setCitySearchQuery("");
    setCitySearchResults([]);
    setShowCityDropdown(false);
  };

  // Remove city handler
  const handleRemoveCity = (cityId) => {
    setFormData((prev) => ({
      ...prev,
      cities: prev.cities
        .filter((c) => c.id !== cityId)
        .map((c, idx) => ({ ...c, order: idx })),
    }));
  };

  // City drag and drop handler
  const handleCityDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFormData((prev) => {
      const oldIndex = prev.cities.findIndex((c) => c.id === active.id);
      const newIndex = prev.cities.findIndex((c) => c.id === over.id);

      const reordered = arrayMove(prev.cities, oldIndex, newIndex).map(
        (c, idx) => ({ ...c, order: idx })
      );

      return { ...prev, cities: reordered };
    });
  };

  // Tag handlers
  function addTagsFromString(raw) {
    if (!raw) return;
    const parts = raw
      .split(/[;,\n]/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (parts.length === 0) return;

    setFormData((prev) => {
      const newTags = [...prev.tags];
      parts.forEach((p) => {
        if (!newTags.includes(p)) newTags.push(p);
      });
      return { ...prev, tags: newTags };
    });

    setTagInput("");
  }

  const handleAddTag = (value) => {
    // If a value is provided, add from that string; otherwise use current input
    const source = typeof value === "string" ? value : tagInput;
    addTagsFromString(source);
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // Day handlers
  const handleAddDay = () => {
    setFormData((prev) => {
      const newItinerary = [
        ...prev.itinerary,
        {
          day: prev.itinerary.length + 1,
          title: "",
          description: "",
          activities: [
            {
              time: "",
              name: "",
              location: "",
              description: "",
              place_id: null,
              place: null,
            },
          ],
        },
      ];
      // Select the newly added day
      setSelectedDayIndex(newItinerary.length - 1);
      return { ...prev, itinerary: newItinerary };
    });
  };

  const handleRemoveDay = (dayIndex) => {
    if (formData.itinerary.length === 1) {
      showNotification({
        type: "error",
        title: "Cannot remove",
        message: "Trip must have at least one day",
      });
      return;
    }

    setFormData((prev) => {
      const newItinerary = prev.itinerary
        .filter((_, idx) => idx !== dayIndex)
        .map((day, idx) => ({ ...day, day: idx + 1 }));

      // Ensure selected day index stays within bounds
      const newIndex = Math.max(
        0,
        Math.min(selectedDayIndex, newItinerary.length - 1)
      );
      setSelectedDayIndex(newIndex);

      return { ...prev, itinerary: newItinerary };
    });
  };

  const handleDayDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFormData((prev) => {
      const oldIndex = prev.itinerary.findIndex((d) => d.day === active.id);
      const newIndex = prev.itinerary.findIndex((d) => d.day === over.id);

      const reordered = arrayMove(prev.itinerary, oldIndex, newIndex).map(
        (day, idx) => ({ ...day, day: idx + 1 })
      );

      return { ...prev, itinerary: reordered };
    });
  };

  // Activity handlers
  const handleAddActivity = (dayIndex) => {
    setFormData((prev) => {
      const newItinerary = [...prev.itinerary];
      newItinerary[dayIndex].activities.push({
        time: "",
        name: "",
        location: "",
        description: "",
        place_id: null,
        place: null,
      });
      return { ...prev, itinerary: newItinerary };
    });
  };

  const handleRemoveActivity = (dayIndex, activityIndex) => {
    if (formData.itinerary[dayIndex].activities.length === 1) {
      showNotification({
        type: "error",
        title: "Cannot remove",
        message: "Each day must have at least one activity",
      });
      return;
    }

    setFormData((prev) => {
      const newItinerary = [...prev.itinerary];
      newItinerary[dayIndex].activities = newItinerary[
        dayIndex
      ].activities.filter((_, idx) => idx !== activityIndex);
      return { ...prev, itinerary: newItinerary };
    });
  };

  const handleActivityDragEnd = (dayIndex) => (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFormData((prev) => {
      const newItinerary = [...prev.itinerary];
      const activities = newItinerary[dayIndex].activities;

      const oldIndex = parseInt(active.id.split("-")[1]);
      const newIndex = parseInt(over.id.split("-")[1]);

      newItinerary[dayIndex].activities = arrayMove(
        activities,
        oldIndex,
        newIndex
      );

      return { ...prev, itinerary: newItinerary };
    });
  };

  const handleUpdateActivity = (dayIndex, activityIndex, field, value) => {
    setFormData((prev) => {
      const newItinerary = [...prev.itinerary];
      newItinerary[dayIndex].activities[activityIndex][field] = value;
      return { ...prev, itinerary: newItinerary };
    });
  };

  // Place search handler
  const handlePlaceSearch = async (dayIndex, activityIndex, query) => {
    const key = `${dayIndex}-${activityIndex}`;
    setPlaceSearchQueries((prev) => ({ ...prev, [key]: query }));

    if (!query.trim()) {
      setPlaceSearchResults((prev) => ({ ...prev, [key]: [] }));
      setShowPlaceDropdowns((prev) => ({ ...prev, [key]: false }));
      return;
    }

    try {
      const response = await apiClient.get(
        `/places/search?query=${encodeURIComponent(query)}`
      );
      const results = response.success ? response.data : [];
      setPlaceSearchResults((prev) => ({ ...prev, [key]: results }));
      setShowPlaceDropdowns((prev) => ({ ...prev, [key]: true }));
    } catch (error) {
      console.error("Error searching places:", error);
    }
  };

  const handleSelectPlace = (dayIndex, activityIndex, place) => {
    const key = `${dayIndex}-${activityIndex}`;

    setFormData((prev) => {
      const newItinerary = [...prev.itinerary];
      const activity = newItinerary[dayIndex].activities[activityIndex];

      activity.place_id = place.id;
      activity.place = place;
      if (!activity.name) activity.name = place.name;
      activity.location = place.address || "";

      return { ...prev, itinerary: newItinerary };
    });

    setShowPlaceDropdowns((prev) => ({ ...prev, [key]: false }));
    setPlaceSearchQueries((prev) => ({ ...prev, [key]: "" }));
  };

  const handleUnlinkPlace = (dayIndex, activityIndex) => {
    setFormData((prev) => {
      const newItinerary = [...prev.itinerary];
      newItinerary[dayIndex].activities[activityIndex].place_id = null;
      newItinerary[dayIndex].activities[activityIndex].place = null;
      return { ...prev, itinerary: newItinerary };
    });
  };

  // Sortable Day Component
  const SortableDay = ({ day, dayIndex, children }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: day.day });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div ref={setNodeRef} style={style} className="mb-6">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300"
            >
              <GripVertical className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-white flex-1">
              Day {day.day}
            </h3>
            <button
              onClick={() => handleRemoveDay(dayIndex)}
              className="text-red-400 hover:text-red-300 p-2"
              title="Remove day"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-4">
            <Label
              htmlFor={`day-title-${dayIndex}`}
              className="text-sm font-semibold text-white mb-2"
            >
              Day Title (Optional)
            </Label>
            <Input
              id={`day-title-${dayIndex}`}
              value={day.title}
              onChange={(e) => {
                const newItinerary = [...formData.itinerary];
                newItinerary[dayIndex].title = e.target.value;
                setFormData((prev) => ({ ...prev, itinerary: newItinerary }));
              }}
              placeholder="e.g., Arrival & Eiffel Tower"
              className="bg-[#0D0D0D] border-gray-700 text-white h-12"
            />
          </div>

          {children}
        </div>
      </div>
    );
  };

  // Sortable Activity Component
  const SortableActivity = ({ activity, dayIndex, activityIndex }) => {
    const activityId = `${dayIndex}-${activityIndex}`;
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: activityId });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    const key = activityId;
    const searchQuery = placeSearchQueries[key] || "";
    const searchResults = placeSearchResults[key] || [];
    const showDropdown = showPlaceDropdowns[key] || false;

    return (
      <div ref={setNodeRef} style={style} className="mb-4">
        <div className="bg-[#0D1115] rounded-2xl p-4 border border-[#23262B] shadow-sm">
          <div className="flex items-start gap-4">
            {/* Left number badge */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center text-white font-semibold">
                {activityIndex + 1}
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 space-y-3">
              {/* Place selector button */}
              {activity.place ? (
                <button
                  onClick={() => {
                    setPlacePickerActivity({ dayIndex, activityIndex });
                    setShowPlacePickerModal(true);
                  }}
                  className="w-full text-left p-3 bg-blue-900/10 rounded-lg border border-blue-500/30 hover:bg-blue-900/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {activity.place.photos &&
                    activity.place.photos.length > 0 ? (
                      <img
                        src={activity.place.photos[0].url}
                        alt={activity.place.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-900/50 rounded-xl flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-blue-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold truncate">
                        {activity.place.name}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {activity.place.address}
                      </div>
                      {activity.place.rating && (
                        <div className="text-xs text-yellow-500 mt-1">
                          ⭐ {activity.place.rating ?? "N/A"}{" "}
                          {activity.place.user_ratings_total && (
                            <span className="text-gray-500">
                              ({activity.place.user_ratings_total})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Repeat className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setPlacePickerActivity({ dayIndex, activityIndex });
                    setShowPlacePickerModal(true);
                  }}
                  className="w-full text-left p-4 bg-[#1A1B23] rounded-lg border-2 border-dashed border-gray-600 hover:border-blue-500 hover:bg-[#1F2029] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-300 font-medium">
                        Add a place
                      </div>
                      <div className="text-xs text-gray-500">
                        Click to search for a place
                      </div>
                    </div>
                    <Plus className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              )}

              {/* Time input */}
              <div>
                <Label className="text-xs text-gray-400 mb-1">
                  Time (optional)
                </Label>
                <Input
                  type="time"
                  value={activity.time || ""}
                  onChange={(e) =>
                    handleUpdateActivity(
                      dayIndex,
                      activityIndex,
                      "time",
                      e.target.value
                    )
                  }
                  placeholder="e.g., 14:00"
                  className="bg-[#1A1B23] border-gray-700 text-white h-9"
                />
              </div>

              {/* Description input */}
              <div>
                <Label className="text-xs text-gray-400 mb-1">
                  Notes (optional)
                </Label>
                <Textarea
                  value={activity.description || ""}
                  onChange={(e) =>
                    handleUpdateActivity(
                      dayIndex,
                      activityIndex,
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Add notes about this activity..."
                  className="bg-[#1A1B23] border-gray-700 text-white min-h-[60px] resize-none"
                  rows={2}
                />
              </div>
            </div>

            {/* Actions: drag and remove */}
            <div className="flex flex-col items-end gap-2">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-300 p-1"
              >
                <GripVertical className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRemoveActivity(dayIndex, activityIndex)}
                className="text-red-400 hover:text-red-300 p-1"
                title="Remove activity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Sortable Day Tab Component
  const SortableDayTab = ({ day, dayIndex }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: day.day });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.6 : 1,
    };

    const isActive = selectedDayIndex === dayIndex;

    return (
      <div ref={setNodeRef} style={style}>
        <button
          {...attributes}
          {...listeners}
          onClick={() => setSelectedDayIndex(dayIndex)}
          className={`shrink-0 px-4 py-3 rounded-lg text-sm transition-all relative ${
            isActive
              ? "bg-gray-900 text-white"
              : "bg-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          <div className="font-semibold mb-0.5">{`Day ${String(
            day.day
          ).padStart(2, "0")}`}</div>
          <div className="text-xs opacity-80">
            {(day.activities || []).length} places
          </div>
          {isActive && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
          )}
        </button>
      </div>
    );
  };

  // Sortable City Component
  const handleCityClick = async (city) => {
    setSelectedCity(city);
    setShowCityModal(true);
    setCityPlaceType("all");
    setCityPlaceSearch("");

    // Fetch places for this city using the city name as the query
    try {
      const response = await apiClient.get(`/places/search`, {
        query: city.name,
      });
      if (response && response.data) {
        // Normalize different possible response shapes (array or object with data/results)
        const places = Array.isArray(response.data)
          ? response.data
          : response.data.data || response.data.results || [];
        setCityPlaces((prev) => ({ ...prev, [city.id]: places }));
      }
    } catch (error) {
      console.error("Error fetching city places:", error);
      setCityPlaces((prev) => ({ ...prev, [city.id]: [] }));
    }
  };

  // Debounced city places search effect (searches backend when typing in modal)
  useEffect(() => {
    if (!showCityModal || !selectedCity) return;

    const query = cityPlaceSearch?.trim() || selectedCity.name || "";
    let active = true;
    setCityPlacesLoading(true);

    const timer = setTimeout(async () => {
      try {
        const url = `/places/search?query=${encodeURIComponent(query)}${
          cityPlaceType && cityPlaceType !== "all"
            ? `&type=${encodeURIComponent(cityPlaceType)}`
            : ""
        }${
          selectedCity && selectedCity.name
            ? `&city=${encodeURIComponent(selectedCity.name)}`
            : ""
        }`;
        const response = await apiClient.get(url);
        const places =
          response && response.data
            ? Array.isArray(response.data)
              ? response.data
              : response.data.data || response.data.results || []
            : [];
        if (active && selectedCity) {
          setCityPlaces((prev) => ({ ...prev, [selectedCity.id]: places }));
        }
      } catch (err) {
        console.error("Error searching city places:", err);
        if (active && selectedCity) {
          setCityPlaces((prev) => ({ ...prev, [selectedCity.id]: [] }));
        }
      } finally {
        if (active) setCityPlacesLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [cityPlaceSearch, cityPlaceType, showCityModal, selectedCity]);

  // Don't pre-load places for all cities when modal opens — wait for user input.
  // Debounce user input and perform a search across cities when the user types.
  useEffect(() => {
    if (!showPlacePickerModal) return;

    let active = true;
    const timer = setTimeout(() => {
      if (!cityPlaceSearch || !cityPlaceSearch.trim()) {
        // Clear global search results if any
        setGlobalPlaceSearchResults([]);
        return;
      }

      (async () => {
        try {
          await searchCityPlacesNow(cityPlaceSearch);
        } catch (err) {
          if (active)
            console.error("Error searching places on user input:", err);
        }
      })();
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [showPlacePickerModal, cityPlaceSearch, cityPlaceType, selectedCity]);

  const searchCityPlacesNow = async (query) => {
    setCityPlacesLoading(true);
    try {
      const q = query?.trim() || selectedCity?.name || "";
      const url = `/places/search?query=${encodeURIComponent(q)}${
        cityPlaceType && cityPlaceType !== "all"
          ? `&type=${encodeURIComponent(cityPlaceType)}`
          : ""
      }${
        selectedCity && selectedCity.name
          ? `&city=${encodeURIComponent(selectedCity.name)}`
          : ""
      }`;
      const response = await apiClient.get(url);
      const places =
        response && response.data
          ? Array.isArray(response.data)
            ? response.data
            : response.data.data || response.data.results || []
          : [];

      if (selectedCity) {
        setCityPlaces((prev) => ({ ...prev, [selectedCity.id]: places }));
        setGlobalPlaceSearchResults([]);
      } else {
        // Global search across cities — store in separate state so UI can show results
        setGlobalPlaceSearchResults(places);
      }
    } catch (err) {
      console.error("Error searching city places:", err);
      if (selectedCity) {
        setCityPlaces((prev) => ({ ...prev, [selectedCity.id]: [] }));
      } else {
        setGlobalPlaceSearchResults([]);
      }
    } finally {
      setCityPlacesLoading(false);
    }
  };

  const SortableCity = ({ city, index }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: city.id,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-full bg-gray-800/50 rounded-xl p-3 hover:bg-gray-800 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-12 h-12 bg-blue-900/50 rounded-xl flex items-center justify-center overflow-hidden">
              {city.photos && city.photos.length > 0 ? (
                <img
                  src={city.photos[0].url}
                  alt={city.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <MapPin className="w-6 h-6 text-blue-400" />
              )}
            </div>
            <div className="absolute -top-1 -left-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
              {index + 1}
            </div>
          </div>
          <button
            onClick={() => handleCityClick(city)}
            className="flex-1 min-w-0 text-left overflow-hidden"
          >
            <h4 className="font-semibold mb-1 truncate">{city.name}</h4>
            <p className="text-xs text-gray-400 mb-1.5 truncate">
              {city.state && `${city.state}, `}
              {city.country?.name || city.country}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">
                  {city.placesCount || 0} places • {city.tripsCount || 0} trips
                </span>
              </div>
            </div>
          </button>
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-300 p-2"
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleRemoveCity(city.id)}
            className="text-gray-400 hover:text-red-400 p-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const SortableImage = ({ image, index }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: image.id,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="relative group rounded-lg overflow-hidden bg-[#0D0D0D] border border-gray-700"
      >
        <div className="aspect-video relative">
          <img
            src={image.url}
            alt={image.sourceName}
            className="w-full h-full object-cover"
          />
          {index === 0 && (
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
              Cover
            </div>
          )}
          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 right-2 cursor-grab active:cursor-grabbing bg-black/50 hover:bg-black/70 rounded p-1.5"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        </div>
        <div className="p-2">
          <p className="text-xs text-gray-400 truncate">
            {image.source === "city" ? "City: " : "Place: "}
            {image.sourceName}
          </p>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading && mode === "edit") {
    return (
      <div className="min-h-screen bg-[#0A0B0F] flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0A0B0F] text-white overflow-hidden pt-16 flex flex-col">
      <style>{`
        body {
          overflow: hidden;
        }

        /* Custom visible scrollbar for vertical scrolling */
        .trip-editor-scroll::-webkit-scrollbar {
          width: 8px;
        }

        .trip-editor-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .trip-editor-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
        }

        .trip-editor-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        /* Firefox support */
        .trip-editor-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
        }

        /* Hide scrollbars for horizontal tab navigation */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Header Section - Full Width */}
      <div className="bg-[#0A0B0F] border-b border-[#1F1F1F] flex-shrink-0">
        <div className="px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link
                to={tripId ? `/TripDetails/${tripId}` : createPageUrl("Home")}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </Link>
              <h1 className="text-xl font-bold">
                {mode === "create" ? "Create Trip" : "Edit Trip"}
              </h1>
            </div>

            <div className="flex gap-3 items-center">
              {mode === "edit" && tripId && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="visibility-toggle" className="text-sm font-medium text-gray-300 cursor-pointer">
                    {formData.is_public ? "Public" : "Private"}
                  </Label>
                  <Switch
                    id="visibility-toggle"
                    checked={formData.is_public}
                    onCheckedChange={handleToggleVisibility}
                    disabled={loading}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-600 data-[state=checked]:to-emerald-600"
                  />
                </div>
              )}
              <Button
                onClick={mode === "create" ? handleCreate : handleUpdate}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-semibold h-10 px-6 rounded-lg my-2 md:my-0"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {mode === "create" ? "Creating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {mode === "create" ? "Create Trip" : "Save Changes"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Full Width */}
        <div className="border-t border-[#1F1F1F]">
          <div className="px-4">
            <div className="flex overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab("basic")}
                className={`flex flex-col items-center gap-1 px-4 py-3 min-w-[80px] transition-all ${
                  activeTab === "basic"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <Info
                  className={`w-5 h-5 ${
                    activeTab === "basic" ? "text-white" : "text-gray-400"
                  }`}
                />
                <span className="text-xs font-medium mt-1">Basic</span>
              </button>

              <button
                onClick={() => setActiveTab("details")}
                className={`flex flex-col items-center gap-1 px-4 py-3 min-w-[80px] transition-all ${
                  activeTab === "details"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <FileText
                  className={`w-5 h-5 ${
                    activeTab === "details" ? "text-white" : "text-gray-400"
                  }`}
                />
                <span className="text-xs font-medium mt-1">Details</span>
              </button>

              <button
                onClick={() => setActiveTab("tags")}
                className={`flex flex-col items-center gap-1 px-4 py-3 min-w-[80px] transition-all ${
                  activeTab === "tags"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <Tag
                  className={`w-5 h-5 ${
                    activeTab === "tags" ? "text-white" : "text-gray-400"
                  }`}
                />
                <span className="text-xs font-medium mt-1">Tags</span>
              </button>

              <button
                onClick={() => setActiveTab("location")}
                className={`flex flex-col items-center gap-1 px-4 py-3 min-w-[80px] transition-all ${
                  activeTab === "location"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <MapIcon
                  className={`w-5 h-5 ${
                    activeTab === "location" ? "text-white" : "text-gray-400"
                  }`}
                />
                <span className="text-xs font-medium mt-1">Location</span>
              </button>

              <button
                onClick={() => setActiveTab("itinerary")}
                className={`flex flex-col items-center gap-1 px-4 py-3 min-w-[80px] transition-all ${
                  activeTab === "itinerary"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <MapPin
                  className={`w-5 h-5 ${
                    activeTab === "itinerary" ? "text-white" : "text-gray-400"
                  }`}
                />
                <span className="text-xs font-medium mt-1">Itinerary</span>
              </button>

              <button
                onClick={() => setActiveTab("images")}
                className={`flex flex-col items-center gap-1 px-4 py-3 min-w-[80px] transition-all ${
                  activeTab === "images"
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <ImageIcon
                  className={`w-5 h-5 ${
                    activeTab === "images" ? "text-white" : "text-gray-400"
                  }`}
                />
                <span className="text-xs font-medium mt-1">Photos</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[minmax(360px,420px)_1fr] min-h-0">
        {/* Left Column - Form */}
        <aside className="bg-[#0A0B0F] border-r border-[#1F1F1F] flex flex-col overflow-hidden min-h-0">
          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto trip-editor-scroll space-y-4">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <>
                <div className="p-4">
                  <h2 className="text-base font-semibold text-white mb-3">
                    Basic Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="title"
                        className="text-sm font-semibold text-white mb-2"
                      >
                        Trip Title <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder="e.g., Amazing Week in Paris"
                        className="bg-[#0D0D0D] border-gray-700 text-white h-12"
                        maxLength={200}
                      />
                      <div className="flex justify-between mt-1">
                        {errors.title && (
                          <p className="text-sm text-red-400">{errors.title}</p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">
                          {formData.title.length}/200
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="description"
                        className="text-sm font-semibold text-white mb-2"
                      >
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Describe your trip..."
                        className="bg-[#0D0D0D] border-gray-700 text-white min-h-[120px]"
                        maxLength={5000}
                        rows={5}
                      />
                      <div className="flex justify-between mt-1">
                        {errors.description && (
                          <p className="text-sm text-red-400">
                            {errors.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">
                          {formData.description.length}/5000
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Trip Details Tab */}
            {activeTab === "details" && (
              <>
                <div className="p-4">
                  <h2 className="text-base font-semibold text-white mb-3">
                    Trip Details
                  </h2>

                  <div className="pr-2">
                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="duration"
                          className="text-sm font-semibold text-white mb-2"
                        >
                          Duration (Days){" "}
                          <span className="text-red-400">*</span>
                        </Label>
                        <Input
                          id="duration"
                          type="number"
                          min="1"
                          value={formData.durationDays}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              durationDays: parseInt(e.target.value) || 1,
                            }))
                          }
                          className="bg-[#0D0D0D] border-gray-700 text-white h-12"
                        />
                        {errors.durationDays && (
                          <p className="text-sm text-red-400 mt-1">
                            {errors.durationDays}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="budget"
                          className="text-sm font-semibold text-white mb-2"
                        >
                          Budget
                        </Label>
                        <Input
                          id="budget"
                          value={formData.budget}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              budget: e.target.value,
                            }))
                          }
                          placeholder="e.g., $2000 - $3000"
                          className="bg-[#0D0D0D] border-gray-700 text-white h-12"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="transportation"
                          className="text-sm font-semibold text-white mb-2"
                        >
                          Transportation
                        </Label>
                        <Input
                          id="transportation"
                          value={formData.transportation}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              transportation: e.target.value,
                            }))
                          }
                          placeholder="e.g., Metro, Walking"
                          className="bg-[#0D0D0D] border-gray-700 text-white h-12"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="accommodation"
                          className="text-sm font-semibold text-white mb-2"
                        >
                          Accommodation
                        </Label>
                        <Input
                          id="accommodation"
                          value={formData.accommodation}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              accommodation: e.target.value,
                            }))
                          }
                          placeholder="e.g., Hotel, Airbnb"
                          className="bg-[#0D0D0D] border-gray-700 text-white h-12"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="best_time"
                          className="text-sm font-semibold text-white mb-2"
                        >
                          Best Time to Visit
                        </Label>
                        <Input
                          id="best_time"
                          value={formData.best_time_to_visit}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              best_time_to_visit: e.target.value,
                            }))
                          }
                          placeholder="e.g., Spring, Summer"
                          className="bg-[#0D0D0D] border-gray-700 text-white h-12"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="difficulty"
                          className="text-sm font-semibold text-white mb-2"
                        >
                          Difficulty Level
                        </Label>
                        <Input
                          id="difficulty"
                          value={formData.difficulty_level}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              difficulty_level: e.target.value,
                            }))
                          }
                          placeholder="e.g., Easy, Moderate"
                          className="bg-[#0D0D0D] border-gray-700 text-white h-12"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="trip_type"
                          className="text-sm font-semibold text-white mb-2"
                        >
                          Trip Type
                        </Label>
                        <Input
                          id="trip_type"
                          value={formData.trip_type}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              trip_type: e.target.value,
                            }))
                          }
                          placeholder="e.g., Cultural, Adventure"
                          className="bg-[#0D0D0D] border-gray-700 text-white h-12"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="visibility"
                          className="text-sm font-semibold text-white mb-2"
                        >
                          Visibility
                        </Label>
                        <select
                          id="visibility"
                          value={formData.visibility}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              visibility: e.target.value,
                              is_public: e.target.value === "public",
                            }))
                          }
                          className="w-full bg-[#0D0D0D] border border-gray-700 text-white h-12 rounded-md px-3"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags moved to its own tab */}
              </>
            )}

            {/* Tags Tab */}
            {activeTab === "tags" && (
              <div className="p-4">
                <h2 className="text-base font-semibold text-white mb-3">
                  Tags
                </h2>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        } else if (e.key === ",") {
                          e.preventDefault();
                          handleAddTag(tagInput);
                        }
                      }}
                      onPaste={(e) => {
                        const text = e.clipboardData?.getData("text") || "";
                        if (text.includes(",") || text.includes(";")) {
                          e.preventDefault();
                          handleAddTag(text);
                        }
                      }}
                      placeholder="Add tags (press Enter or comma)"
                      className="bg-[#0D0D0D] border-gray-700 text-white h-12"
                    />
                    <Button
                      onClick={handleAddTag}
                      className="bg-blue-600 hover:bg-blue-700 h-12 px-6"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <div
                          key={tag}
                          className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 rounded-full px-3 py-1.5"
                        >
                          <span className="text-sm text-purple-300">
                            #{tag}
                          </span>
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location Tab */}
            {activeTab === "location" && (
              <div className="h-full flex flex-col">
                {/* Header with Add Button */}
                <div className="p-4 border-b border-[#1F1F1F] flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">Cities</h3>
                  <Button
                    onClick={() => setShowAddCityModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 h-9 px-4 text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add City
                  </Button>
                </div>

                {/* Cities List */}
                <div className="flex-1 overflow-y-auto trip-editor-scroll">
                  <div className="px-4 pb-20">
                    {formData.cities.length > 0 ? (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleCityDragEnd}
                      >
                        <SortableContext
                          items={formData.cities
                            .filter((c) => c && c.id)
                            .map((c) => c.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-3 pt-4">
                            {formData.cities
                              .filter((c) => c && c.id)
                              .map((city, index) => (
                                <SortableCity
                                  key={city.id}
                                  city={city}
                                  index={index}
                                />
                              ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    ) : (
                      <div className="text-center py-12">
                        <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">
                          No cities added yet
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Click "Add City" to get started
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Itinerary Tab */}
            {activeTab === "itinerary" && (
              <>
                <div className="">
                  {/* Header */}
                  <div className="relative flex items-center gap-2 p-4 border-b border-[#1F1F1F]">
                    <h2 className="text-base font-semibold text-white flex-1">
                      Itinerary
                    </h2>
                    <Button
                      onClick={handleAddDay}
                      className="bg-blue-600 hover:bg-blue-700 h-9 px-3 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Day
                    </Button>
                  </div>

                  {errors.itinerary && (
                    <div className="px-4 py-2 bg-red-900/20 border-b border-red-900/30">
                      <p className="text-sm text-red-400">{errors.itinerary}</p>
                    </div>
                  )}

                  {/* Days Tabs */}
                  <div className="relative flex items-center gap-2 p-4 border-b border-[#1F1F1F]">
                    <button
                      onClick={() =>
                        setSelectedDayIndex(Math.max(0, selectedDayIndex - 1))
                      }
                      disabled={selectedDayIndex === 0}
                      className="shrink-0 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors disabled:opacity-30"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDayDragEnd}
                      >
                        <SortableContext
                          items={formData.itinerary
                            .filter((d) => d && d.day)
                            .map((d) => d.day)}
                          strategy={horizontalListSortingStrategy}
                        >
                          {formData.itinerary
                            .filter((d) => d && d.day)
                            .map((day, dayIndex) => (
                              <SortableDayTab
                                key={day.day}
                                day={day}
                                dayIndex={dayIndex}
                              />
                            ))}
                        </SortableContext>
                      </DndContext>
                    </div>

                    <button
                      onClick={() =>
                        setSelectedDayIndex(
                          Math.min(
                            formData.itinerary.length - 1,
                            selectedDayIndex + 1
                          )
                        )
                      }
                      disabled={
                        selectedDayIndex === formData.itinerary.length - 1
                      }
                      className="shrink-0 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors disabled:opacity-30"
                    >
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </button>
                  </div>

                  {/* Day Content */}
                  {(() => {
                    // Use the selectedDayIndex state but clamp it to valid bounds
                    const boundedIndex = Math.max(
                      0,
                      Math.min(selectedDayIndex, formData.itinerary.length - 1)
                    );
                    const selectedDay = formData.itinerary[boundedIndex];

                    if (!selectedDay) return null;

                    return (
                      <div className="p-4 space-y-3">
                        {/* Day list view - Click to edit */}
                        <button
                          onClick={() => setEditingDayIndex(boundedIndex)}
                          className="w-full text-left p-4 bg-[#0D1115] rounded-xl border border-[#23262B] hover:bg-[#13151A] transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white mb-1">
                                {selectedDay.title || `Day ${boundedIndex + 1}`}
                              </h3>
                              {selectedDay.description && (
                                <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                                  {selectedDay.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>
                                  {(selectedDay.activities || []).filter((a) => a).length} activities
                                </span>
                              </div>
                            </div>
                            <Edit2 className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                          </div>
                        </button>

                        {/* Activities list */}
                        <div className="space-y-2">
                          {(selectedDay.activities || [])
                            .filter((a) => a)
                            .map((activity, activityIndex) => (
                              <button
                                key={`${boundedIndex}-${activityIndex}`}
                                onClick={() => {
                                  // Open place picker to view/change place
                                  setPlacePickerActivity({ dayIndex: boundedIndex, activityIndex });
                                  setShowPlacePickerModal(true);
                                }}
                                className="w-full flex items-center gap-3 p-3 bg-[#0D1115] rounded-lg border border-[#23262B] hover:bg-[#13151A] transition-colors text-left"
                              >
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-700 rounded flex items-center justify-center text-white text-sm font-semibold">
                                  {activityIndex + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  {activity.place ? (
                                    <>
                                      <div className="font-medium text-white text-sm truncate">
                                        {activity.place.name}
                                      </div>
                                      {activity.time && (
                                        <div className="text-xs text-gray-400">
                                          {activity.time}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="text-sm text-gray-400">
                                      No place selected
                                    </div>
                                  )}
                                </div>
                              </button>
                            ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}

            {/* Images Tab */}
            {activeTab === "images" && (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-white">
                    Trip Images ({formData.trip_images?.length || 0})
                  </h2>
                  <button
                    onClick={handleManageImages}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Manage Images
                  </button>
                </div>

                {!formData.trip_images || formData.trip_images.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No images selected</p>
                    <p className="text-xs mt-1">
                      Click "Manage Images" to select photos from your cities and places
                    </p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleImageDragEnd}
                  >
                    <SortableContext
                      items={formData.trip_images.map((img) => img.id)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-2 gap-3">
                        {formData.trip_images.map((image, index) => (
                          <SortableImage
                            key={image.id}
                            image={image}
                            index={index}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Right Column - Map */}
        <main className="relative bg-[#0A0B0F] min-h-0">
          <div className="h-full min-h-0">
            <TripMap
              markers={mapMarkers}
              center={mapCenter}
              zoom={mapMarkers.length > 0 ? 12 : 5}
            />
          </div>
        </main>
      </div>

      {/* City Modal */}
      {showCityModal && selectedCity && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0A0B0F] rounded-xl shadow-2xl border border-[#1F1F1F]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#2A2B35]">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selectedCity.name}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedCity.placesCount > 0 &&
                    `${selectedCity.placesCount} places`}
                  {selectedCity.placesCount > 0 &&
                    selectedCity.tripsCount > 0 &&
                    " • "}
                  {selectedCity.tripsCount > 0 &&
                    `${selectedCity.tripsCount} trips`}
                </p>
              </div>
              <button
                onClick={() => setShowCityModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-6 border-b border-[#2A2B35]">
              <div className="flex items-center gap-3">
                <Input
                  value={cityPlaceSearch}
                  onChange={(e) => setCityPlaceSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      searchCityPlacesNow(e.target.value);
                    }
                  }}
                  placeholder="Search places..."
                  className="flex-1 bg-[#0D0D0D] border-gray-700 text-white h-12"
                />
                {cityPlacesLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    <span>Searching...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Type Filter Tabs */}
            <div className="px-6 border-b border-[#2A2B35] overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 min-w-max">
                {[
                  "all",
                  "restaurant",
                  "attraction",
                  "hotel",
                  "cafe",
                  "museum",
                  "park",
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() => setCityPlaceType(type)}
                    className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      cityPlaceType === type
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Places List */}
            <div className="flex-1 overflow-y-auto p-6">
              {(() => {
                // Ensure we have an array to filter (defensive against unexpected API shapes)
                const placesArray = Array.isArray(cityPlaces)
                  ? cityPlaces
                  : cityPlaces?.data || cityPlaces?.results || [];
                const filteredPlaces = placesArray.filter((place) => {
                  const matchesSearch =
                    !cityPlaceSearch ||
                    place.name
                      ?.toLowerCase()
                      .includes(cityPlaceSearch.toLowerCase()) ||
                    place.address
                      ?.toLowerCase()
                      .includes(cityPlaceSearch.toLowerCase());
                  const matchesType =
                    cityPlaceType === "all" || place.type === cityPlaceType;
                  return matchesSearch && matchesType;
                });

                if (filteredPlaces.length === 0) {
                  return (
                    <div className="text-center py-12 text-gray-400">
                      <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No places found</p>
                      {cityPlaceSearch && (
                        <p className="text-xs mt-1">
                          Try a different search term
                        </p>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPlaces.map((place) => (
                      <div
                        key={place.id}
                        className="bg-[#0D0D0D] rounded-lg border border-gray-700 p-4 hover:border-blue-500/50 transition-colors"
                      >
                        {place.photos && place.photos[0] && (
                          <div className="aspect-video rounded-lg overflow-hidden mb-3">
                            <img
                              src={place.photos[0].url}
                              alt={place.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <h3 className="text-white font-medium mb-1">
                          {place.name}
                        </h3>
                        {place.address && (
                          <p className="text-xs text-gray-400 mb-2">
                            {place.address}
                          </p>
                        )}
                        {place.rating && (
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-yellow-400 text-sm">
                              ★ {place.rating}
                            </span>
                            {place.user_ratings_total && (
                              <span className="text-xs text-gray-500">
                                ({place.user_ratings_total} reviews)
                              </span>
                            )}
                          </div>
                        )}
                        <Button
                          onClick={() => {
                            // Add this place to the itinerary
                            // Find or create a day to add to
                            const lastDay =
                              formData.itinerary[formData.itinerary.length - 1];
                            if (lastDay) {
                              const updatedItinerary = [...formData.itinerary];
                              updatedItinerary[updatedItinerary.length - 1] = {
                                ...lastDay,
                                activities: [
                                  ...(lastDay.activities || []),
                                  {
                                    time: "",
                                    name: place.name,
                                    location: place.address || "",
                                    description: "",
                                    place_id: place.id,
                                    place: place,
                                  },
                                ],
                              };
                              setFormData((prev) => ({
                                ...prev,
                                itinerary: updatedItinerary,
                              }));
                              showNotification({
                                type: "success",
                                title: "Place added",
                                message: `${place.name} added to day ${lastDay.day}`,
                              });
                              setShowCityModal(false);
                            }
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 h-9 text-sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add to Itinerary
                        </Button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Add City Modal */}
      {showAddCityModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative bg-[#0D0D0D] rounded-2xl border border-[#1F1F1F] shadow-2xl transition-all w-full max-w-3xl h-[600px] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1F1F1F] shrink-0">
              <h2 className="text-xl font-bold text-white">Add City</h2>
              <button
                onClick={() => {
                  setShowAddCityModal(false);
                  setCitySearchQuery("");
                  setShowCityDropdown(false);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Section */}
            <div className="p-6 shrink-0">
              <Input
                value={citySearchQuery}
                onChange={(e) => handleCitySearch(e.target.value)}
                placeholder="Search for cities..."
                className="bg-[#0A0B0F] border-gray-700 text-white h-12"
                autoFocus
              />
            </div>

            {/* Results Section */}
            <div className="flex-1 overflow-y-auto trip-editor-scroll">
              {!showCityDropdown && !citySearchQuery && (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500 text-sm">
                    Start typing to search for cities...
                  </p>
                </div>
              )}

              {showCityDropdown &&
                citySearchResults.length === 0 &&
                citySearchQuery && (
                  <div className="px-6 py-12 text-center">
                    <p className="text-gray-400 text-sm">No cities found</p>
                  </div>
                )}

              {showCityDropdown && citySearchResults.length > 0 && (
                <div className="p-4 space-y-1">
                  {citySearchResults.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => {
                        handleAddCity(city);
                        setShowAddCityModal(false);
                        setCitySearchQuery("");
                        setShowCityDropdown(false);
                      }}
                      className="flex items-center gap-4 p-4 hover:bg-[#1A1B23] rounded-xl transition-colors group w-full"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        {city.image ? (
                          <img
                            src={`http://localhost:3000${city.image}`}
                            alt={city.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <MapPin className="w-8 h-8 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                          {city.name}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">
                          {city.country?.name || city.country} •{" "}
                          {city.tripsCount || 0} trips • {city.placesCount || 0}{" "}
                          places
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manage Images Modal */}
      {showManageImagesModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative bg-[#0D0D0D] rounded-2xl border border-[#1F1F1F] shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1F1F1F] shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white">Manage Trip Images</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Select photos from your cities and places ({selectedImageIds.size} selected)
                </p>
              </div>
              <button
                onClick={() => setShowManageImagesModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Image Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingImages ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
                </div>
              ) : availableImages.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No images available</p>
                  <p className="text-xs mt-1">
                    Add cities and places with photos to your trip first
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {availableImages.map((image) => {
                    const isSelected = selectedImageIds.has(image.id);
                    return (
                      <div
                        key={image.id}
                        onClick={() => handleToggleImage(image.id)}
                        className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${
                          isSelected
                            ? "ring-2 ring-blue-500 scale-95"
                            : "hover:ring-2 hover:ring-gray-600"
                        }`}
                      >
                        <div className="aspect-video relative">
                          <img
                            src={image.url}
                            alt={image.sourceName}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                              <div className="bg-blue-600 rounded-full p-2">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-2 bg-[#0D0D0D]">
                          <p className="text-xs text-gray-400 truncate">
                            {image.source === "city" ? "City: " : "Place: "}
                            {image.sourceName}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-[#1F1F1F] shrink-0">
              <button
                onClick={() => {
                  setSelectedImageIds(new Set());
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear Selection
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowManageImagesModal(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveImages}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Save ({selectedImageIds.size})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Place Picker Modal */}
      {showPlacePickerModal && placePickerActivity && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4">
          <div className="relative bg-[#0D0D0D] rounded-2xl border border-[#1F1F1F] shadow-2xl transition-all w-full max-w-3xl h-[600px] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1F1F1F] shrink-0">
              <h2 className="text-xl font-bold text-white">Select a Place</h2>
              <button
                onClick={() => {
                  setShowPlacePickerModal(false);
                  setPlacePickerActivity(null);
                  setCityPlaceSearch("");
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Section */}
            <div className="p-6 shrink-0 space-y-4">
              <Input
                value={cityPlaceSearch}
                onChange={(e) => setCityPlaceSearch(e.target.value)}
                placeholder="Search for places..."
                className="bg-[#0A0B0F] border-gray-700 text-white h-12"
                autoFocus
              />

              {/* Filter Tabs */}
              <div className="flex gap-2 flex-wrap">
                {[
                  "all",
                  "restaurant",
                  "tourist_attraction",
                  "museum",
                  "park",
                  "shopping_mall",
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() => setCityPlaceType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      cityPlaceType === type
                        ? "bg-blue-600 text-white"
                        : "bg-[#1A1B23] text-gray-400 hover:text-white"
                    }`}
                  >
                    {type === "all"
                      ? "All"
                      : type === "tourist_attraction"
                      ? "Attractions"
                      : type === "shopping_mall"
                      ? "Shopping"
                      : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Places List */}
            <div className="flex-1 overflow-y-auto trip-editor-scroll">
              {(() => {
                // Get places to show: if user is searching globally, use the global results;
                // otherwise, use preloaded city places (per-city lists).
                const allPlaces =
                  cityPlaceSearch && globalPlaceSearchResults.length > 0
                    ? globalPlaceSearchResults.map((p) => ({
                        ...p,
                        cityName: p.city || p.cityName || "",
                      }))
                    : formData.cities.flatMap((city) => {
                        if (!cityPlaces[city.id]) return [];
                        return cityPlaces[city.id].map((place) => ({
                          ...place,
                          cityName: city.name,
                        }));
                      });

                // Filter places
                const filteredPlaces = allPlaces.filter((place) => {
                  const matchesSearch = cityPlaceSearch
                    ? place.name
                        ?.toLowerCase()
                        .includes(cityPlaceSearch.toLowerCase())
                    : true;
                  const matchesType =
                    cityPlaceType === "all" ||
                    (place.types && place.types.includes(cityPlaceType));
                  return matchesSearch && matchesType;
                });

                if (filteredPlaces.length === 0) {
                  return (
                    <div className="px-6 py-12 text-center">
                      <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                      <p className="text-gray-400 text-sm">
                        {cityPlaceSearch
                          ? "No places found matching your search"
                          : "No places available. Add cities to your trip first."}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="p-4 space-y-2">
                    {filteredPlaces.map((place) => (
                      <button
                        key={place.id}
                        onClick={() => {
                          // Update the activity with the selected place
                          const updatedItinerary = [...formData.itinerary];
                          updatedItinerary[
                            placePickerActivity.dayIndex
                          ].activities[placePickerActivity.activityIndex] = {
                            ...updatedItinerary[placePickerActivity.dayIndex]
                              .activities[placePickerActivity.activityIndex],
                            name: place.name,
                            location: place.address || "",
                            place_id: place.id,
                            place: place,
                          };
                          setFormData((prev) => ({
                            ...prev,
                            itinerary: updatedItinerary,
                          }));
                          setShowPlacePickerModal(false);
                          setPlacePickerActivity(null);
                          setCityPlaceSearch("");
                          showNotification({
                            type: "success",
                            title: "Place added",
                            message: `${place.name} added to itinerary`,
                          });
                        }}
                        className="w-full text-left p-4 hover:bg-[#1A1B23] rounded-xl transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          {place.photos && place.photos.length > 0 ? (
                            <img
                              src={
                                place.photos[0].url ||
                                place.photos[0].url
                              }
                              alt={place.name}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-blue-900/50 rounded-xl flex items-center justify-center">
                              <MapPin className="w-6 h-6 text-blue-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                              {place.name}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              {place.address}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {place.rating && (
                                <span className="text-xs text-yellow-500">
                                  ⭐ {place.rating ?? "N/A"}
                                </span>
                              )}
                              {place.user_ratings_total && (
                                <span className="text-xs text-gray-500">
                                  ({place.user_ratings_total})
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                • {place.cityName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}


      {/* Edit Day Modal */}
      {editingDayIndex !== null && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative bg-[#0D0D0D] rounded-2xl border border-[#1F1F1F] shadow-2xl transition-all w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#1F1F1F] shrink-0">
              <h2 className="text-xl font-bold text-white">
                Edit Day {editingDayIndex + 1}
              </h2>
              <button
                onClick={() => setEditingDayIndex(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Day Title */}
              <div>
                <Label className="text-sm font-semibold text-white mb-2">
                  Day Title (Optional)
                </Label>
                <Input
                  value={formData.itinerary[editingDayIndex]?.title || ""}
                  onChange={(e) => {
                    const newItinerary = [...formData.itinerary];
                    newItinerary[editingDayIndex].title = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      itinerary: newItinerary,
                    }));
                  }}
                  placeholder={`e.g., Exploring ${
                    formData.cities[0]?.name || "the city"
                  }`}
                  className="bg-[#1A1B23] border-gray-700 text-white h-12"
                />
              </div>

              {/* Day Description */}
              <div>
                <Label className="text-sm font-semibold text-white mb-2">
                  Day Description (Optional)
                </Label>
                <Textarea
                  value={formData.itinerary[editingDayIndex]?.description || ""}
                  onChange={(e) => {
                    const newItinerary = [...formData.itinerary];
                    newItinerary[editingDayIndex].description = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      itinerary: newItinerary,
                    }));
                  }}
                  placeholder="Add a description for this day..."
                  className="bg-[#1A1B23] border-gray-700 text-white min-h-[80px] resize-none"
                  rows={3}
                />
              </div>

              {/* Activities */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-semibold text-white">
                    Activities
                  </Label>
                  <Button
                    onClick={() => handleAddActivity(editingDayIndex)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 h-8"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Activity
                  </Button>
                </div>

                <div className="space-y-3">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleActivityDragEnd(editingDayIndex)}
                  >
                    <SortableContext
                      items={(formData.itinerary[editingDayIndex]?.activities || [])
                        .filter((a) => a)
                        .map((_, idx) => `${editingDayIndex}-${idx}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {(formData.itinerary[editingDayIndex]?.activities || [])
                        .filter((a) => a)
                        .map((activity, activityIndex) => (
                          <SortableActivity
                            key={`${editingDayIndex}-${activityIndex}`}
                            activity={activity}
                            dayIndex={editingDayIndex}
                            activityIndex={activityIndex}
                          />
                        ))}
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#1F1F1F] shrink-0">
              <Button
                onClick={() => setEditingDayIndex(null)}
                variant="outline"
                className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
