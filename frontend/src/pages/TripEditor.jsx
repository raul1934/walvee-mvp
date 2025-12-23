import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Trip, Upload } from "@/api/entities";
import { apiClient, endpoints } from "@/api/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const fileInputRef = useRef(null);

  // State management
  const [mode, setMode] = useState("create");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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
    cover_image: "",
    images: [],
    visibility: "public",
    is_public: true,
    cities: [],
    tags: [],
    itinerary: [
      {
        day: 1,
        title: "",
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
  const [coverImageId, setCoverImageId] = useState(null);

  // City modal state
  const [selectedCity, setSelectedCity] = useState(null);
  const [showCityModal, setShowCityModal] = useState(false);
  const [cityPlaces, setCityPlaces] = useState([]);
  const [cityPlacesLoading, setCityPlacesLoading] = useState(false);
  const [cityPlaceType, setCityPlaceType] = useState("all");
  const [cityPlaceSearch, setCityPlaceSearch] = useState("");

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
        cities.push({
          id: `city-${city.id}`,
          lat: city.latitude,
          lng: city.longitude,
          title: city.name,
          subtitle: city.country || "",
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
      cover_image: trip.cover_image || "",
      images: trip.images || [],
      visibility: trip.is_public ? "public" : "private",
      is_public: trip.is_public,
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
              activities,
            };
          });
      })(),
    });

    // Ensure first day is selected when loading existing trip
    setSelectedDayIndex(0);

    // Set cover image ID if available
    if (trip.cover_image) {
      // Try to find the image ID from trip photos or place photos
      const allImages = [];

      // Collect images from itinerary places
      trip.itineraryDays?.forEach((day) => {
        day.activities?.forEach((activity) => {
          if (activity.place && activity.place.photos) {
            activity.place.photos.forEach((photo) => {
              if (photo.url === trip.cover_image) {
                setCoverImageId(photo.id || photo.url);
              }
              allImages.push({ id: photo.id || photo.url, url: photo.url });
            });
          }
        });
      });

      // Collect images from cities
      trip.cities?.forEach((city) => {
        if (city.photos && Array.isArray(city.photos)) {
          city.photos.forEach((photo) => {
            if (photo.url === trip.cover_image) {
              setCoverImageId(photo.id || photo.url);
            }
            allImages.push({ id: photo.id || photo.url, url: photo.url });
          });
        }
      });

      // If not found in images, just use the URL
      if (allImages.length === 0) {
        setCoverImageId(trip.cover_image);
      }
    }
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

  // Transform form data to API format
  const transformFormDataToAPI = (formData) => {
    return {
      title: formData.title.trim(),
      description: formData.description?.trim() || "",
      durationDays: parseInt(formData.durationDays),
      budget: formData.budget || null,
      transportation: formData.transportation || null,
      accommodation: formData.accommodation || null,
      best_time_to_visit: formData.best_time_to_visit || null,
      difficulty_level: formData.difficulty_level || null,
      trip_type: formData.trip_type || null,
      imageUrl: formData.cover_image || null,
      images: formData.images || [],
      visibility: formData.visibility,
      cities: formData.cities.map((c) => c.id),
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

  // Image upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification({
        type: "error",
        title: "Invalid file",
        message: "Please select an image file",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification({
        type: "error",
        title: "File too large",
        message: "Image size must be less than 5MB",
      });
      return;
    }

    setUploadingImage(true);
    try {
      const { fileUrl } = await Upload.uploadImage(file);
      setFormData((prev) => ({ ...prev, cover_image: fileUrl }));
      showNotification({
        type: "success",
        title: "Image uploaded",
        message: "Cover image uploaded successfully",
      });
    } catch (error) {
      showNotification({
        type: "error",
        title: "Upload failed",
        message: "Failed to upload image. Please try again.",
      });
    } finally {
      setUploadingImage(false);
    }
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
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Input
                    value={activity.name}
                    onChange={(e) =>
                      handleUpdateActivity(
                        dayIndex,
                        activityIndex,
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="e.g., Greek Dinner"
                    className="bg-transparent border-0 text-white text-lg font-semibold p-0 placeholder:text-gray-400 focus:ring-0 focus:outline-none"
                  />
                  <div className="text-xs text-gray-400 mt-1 truncate">
                    {activity.place?.address || activity.location || ""}
                  </div>
                </div>

                <div className="flex-shrink-0 text-xs text-yellow-400">
                  N/A (0)
                </div>
              </div>

              {/* Linked place / search input (kept for functionality) */}
              <div className="mt-3">
                <Input
                  value={activity.place_id ? activity.location : searchQuery}
                  onChange={(e) => {
                    if (!activity.place_id) {
                      handlePlaceSearch(
                        dayIndex,
                        activityIndex,
                        e.target.value
                      );
                    }
                  }}
                  placeholder="Search for a place..."
                  className="bg-transparent border-0 text-gray-300 p-0 placeholder:text-gray-500 focus:ring-0 focus:outline-none"
                  disabled={!!activity.place_id}
                />

                {!activity.place_id &&
                  showDropdown &&
                  searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-[#1A1B23] border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((place) => (
                        <button
                          key={place.id}
                          onClick={() =>
                            handleSelectPlace(dayIndex, activityIndex, place)
                          }
                          className="w-full text-left px-4 py-3 hover:bg-[#2A2B35] transition-colors border-b border-gray-700 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            {place.photos && place.photos.length > 0 ? (
                              <img
                                src={
                                  place.photos[0].url_small ||
                                  place.photos[0].url_medium
                                }
                                alt={place.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-semibold text-white text-sm">
                                {place.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                {place.address}
                              </div>
                              {place.rating && (
                                <div className="text-xs text-yellow-500 mt-1">
                                  ⭐ {place.rating.toFixed(1)} (
                                  {place.user_ratings_total || 0} reviews)
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                {activity.place && (
                  <div className="mt-2 p-3 bg-blue-900/10 rounded-lg border border-blue-500/30">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-blue-300">
                        Linked to: {activity.place.name}
                      </span>
                      {activity.place.rating && (
                        <span className="text-xs text-yellow-500">
                          ⭐ {activity.place.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {activity.description && (
                  <div className="text-sm text-gray-400 mt-3">
                    {activity.description}
                  </div>
                )}
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
      <div ref={setNodeRef} style={style} className="relative mr-2">
        <button
          {...attributes}
          {...listeners}
          onClick={() => setSelectedDayIndex(dayIndex)}
          className={`flex flex-col items-start gap-1 min-w-max px-3 py-2 rounded-md ${
            isActive
              ? "bg-[#0B1220] text-blue-400"
              : "bg-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          <span className="text-sm font-medium">{`Day ${String(
            day.day
          ).padStart(2, "0")}`}</span>
          <span className="text-xs text-gray-500">
            {(day.activities || []).length} places
          </span>
          {isActive && (
            <div className="mt-2 h-1 w-full bg-blue-500 rounded-full" />
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
        setCityPlaces(places);
      }
    } catch (error) {
      console.error("Error fetching city places:", error);
      setCityPlaces([]);
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
        if (active) setCityPlaces(places);
      } catch (err) {
        console.error("Error searching city places:", err);
        if (active) setCityPlaces([]);
      } finally {
        if (active) setCityPlacesLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [cityPlaceSearch, cityPlaceType, showCityModal, selectedCity]);

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
      setCityPlaces(places);
    } catch (err) {
      console.error("Error searching city places:", err);
      setCityPlaces([]);
    } finally {
      setCityPlacesLoading(false);
    }
  };

  const SortableCity = ({ city }) => {
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
        className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-lg px-3 py-2"
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-blue-400"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleCityClick(city)}
          className="flex-1 text-left"
        >
          <div className="text-sm font-medium text-blue-300">
            {city.name}
            {city.country && `, ${city.country}`}
          </div>
          {(city.placesCount > 0 || city.tripsCount > 0) && (
            <div className="text-xs text-blue-400/70 mt-0.5">
              {city.placesCount > 0 && `${city.placesCount} places`}
              {city.placesCount > 0 && city.tripsCount > 0 && " • "}
              {city.tripsCount > 0 && `${city.tripsCount} trips`}
            </div>
          )}
        </button>
        <button
          onClick={() => handleRemoveCity(city.id)}
          className="text-blue-400 hover:text-blue-300"
        >
          <X className="w-4 h-4" />
        </button>
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
    <div className="min-h-screen bg-[#0A0B0F] text-white overflow-x-hidden pt-16">
      <style>{`
        body {
          overflow: hidden;
        }
        .trip-editor-layout {
          display: grid;
          grid-template-columns: minmax(360px, 420px) 1fr;
          height: calc(100vh - 4rem);
          min-height: calc(100vh - 4rem);
          max-height: calc(100vh - 4rem);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Header Section - Full Width */}
      <div className="bg-[#0A0B0F] border-b border-[#1F1F1F]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-2 mt-2">
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

              {/* Tabs for medium+ screens: placed between title and save button, left-aligned */}
              <div className="hidden md:flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("basic")}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-all ${
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
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-all ${
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
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-all ${
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
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-all ${
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
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-all ${
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
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-all ${
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

            <Button
              onClick={mode === "create" ? handleCreate : handleUpdate}
              disabled={loading || uploadingImage}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-semibold h-10 px-6 rounded-lg"
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

        {/* Tab Navigation - Full Width (small screens only) */}
        <div className="border-t border-[#1F1F1F] md:hidden">
          <div className="container mx-auto px-4">
            <div className="flex overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab("basic")}
                className={`flex flex-col items-center gap-1 px-4 py-3 min-w-[72px] rounded-md transition-all ${
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
                className={`flex flex-col items-center gap-1 px-4 py-3 min-w-[72px] rounded-md transition-all ${
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
                className={`flex flex-col items-center gap-1 px-4 py-3 min-w-[72px] rounded-md transition-all ${
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
                className={`flex flex-col items-center gap-1 px-4 py-3 min-w-[72px] rounded-md transition-all ${
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
                className={`flex flex-col items-center gap-1 px-4 py-3 min-w-[72px] rounded-md transition-all ${
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
                className={`flex flex-col items-center gap-1 px-4 py-3 min-w-[72px] rounded-md transition-all ${
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

      <div className="trip-editor-layout">
        {/* Left Column - Form */}
        <aside className="bg-[#0A0B0F] border-r border-[#1F1F1F] flex flex-col overflow-hidden min-h-0">
          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4">
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

                <div className="p-4">
                  <h2 className="text-base font-semibold text-white mb-3">
                    Cover Image
                  </h2>

                  <div className="space-y-4">
                    {formData.cover_image ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden">
                        <img
                          src={formData.cover_image}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              cover_image: "",
                            }))
                          }
                          className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-video rounded-xl border-2 border-dashed border-gray-700 hover:border-gray-600 flex flex-col items-center justify-center cursor-pointer bg-[#0D0D0D] transition-colors"
                      >
                        {uploadingImage ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
                            <p className="text-sm text-gray-400">
                              Uploading...
                            </p>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="w-12 h-12 text-gray-600 mb-3" />
                            <p className="text-sm text-gray-400">
                              Click to upload cover image
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Max size: 5MB
                            </p>
                          </>
                        )}
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
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

                  <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
                    <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="duration"
                        className="text-sm font-semibold text-white mb-2"
                      >
                        Duration (Days) <span className="text-red-400">*</span>
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
              <>
                <div className="p-4">
                  <h2 className="text-base font-semibold text-white mb-3">
                    Cities
                  </h2>

                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        value={citySearchQuery}
                        onChange={(e) => handleCitySearch(e.target.value)}
                        placeholder="Search for cities..."
                        className="bg-[#0D0D0D] border-gray-700 text-white h-12"
                      />

                      {showCityDropdown && citySearchResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-[#1A1B23] border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {citySearchResults.map((city) => (
                            <button
                              key={city.id}
                              onClick={() => handleAddCity(city)}
                              className="w-full text-left px-4 py-3 hover:bg-[#2A2B35] transition-colors border-b border-gray-700 last:border-0"
                            >
                              <div className="font-semibold text-white text-sm">
                                {city.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                {city.state && `${city.state}, `}
                                {city.country?.name}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {formData.cities.length > 0 && (
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
                          <div className="grid grid-cols-1 gap-3">
                            {formData.cities
                              .filter((c) => c && c.id)
                              .map((city) => (
                                <SortableCity key={city.id} city={city} />
                              ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                </div>
              </>
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
                  <div className="border-b border-[#1F1F1F] overflow-x-auto scrollbar-hide">
                    <div className="flex min-w-max">
                      <button className="relative flex items-center gap-2 p-4 border-b border-[#1F1F1F] text-gray-400 font-medium">
                        Days
                      </button>

                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDayDragEnd}
                      >
                        <SortableContext
                          items={formData.itinerary
                            .filter((d) => d && d.day)
                            .map((d) => d.day)}
                          strategy={verticalListSortingStrategy}
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
                      <div className="p-4">
                        {/* Day Title */}
                        <div className="mb-4">
                          <Label className="text-sm font-semibold text-white mb-2">
                            Day Title (Optional)
                          </Label>
                          <Input
                            value={selectedDay.title}
                            onChange={(e) => {
                              const newItinerary = [...formData.itinerary];
                              newItinerary[boundedIndex].title = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                itinerary: newItinerary,
                              }));
                            }}
                            placeholder={`e.g., Exploring ${
                              formData.cities[0]?.name || "the city"
                            }`}
                            className="bg-[#0D0D0D] border-gray-700 text-white h-12"
                          />
                        </div>

                        {/* Activities */}
                        <div className="space-y-3">
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleActivityDragEnd(boundedIndex)}
                          >
                            <SortableContext
                              items={(selectedDay.activities || [])
                                .filter((a) => a)
                                .map((_, idx) => `${boundedIndex}-${idx}`)}
                              strategy={verticalListSortingStrategy}
                            >
                              {(selectedDay.activities || [])
                                .filter((a) => a)
                                .map((activity, activityIndex) => (
                                  <SortableActivity
                                    key={`${boundedIndex}-${activityIndex}`}
                                    activity={activity}
                                    dayIndex={boundedIndex}
                                    activityIndex={activityIndex}
                                  />
                                ))}
                            </SortableContext>
                          </DndContext>

                          <Button
                            onClick={() => handleAddActivity(boundedIndex)}
                            className="w-full bg-[#0D0D0D] hover:bg-gray-800 border border-gray-700 text-gray-300 h-10"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Activity
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}

            {/* Images Tab */}
            {activeTab === "images" && (
              <>
                <div className="p-4">
                  <h2 className="text-base font-semibold text-white mb-3">
                    Trip Images
                  </h2>

                  <div className="space-y-4">
                    {/* Collect all images from places and cities */}
                    {(() => {
                      const allImages = [];

                      // Get images from itinerary places
                      formData.itinerary.forEach((day) => {
                        (day.activities || []).forEach((activity) => {
                          if (activity.place && activity.place.photos) {
                            activity.place.photos.forEach((photo) => {
                              allImages.push({
                                id: photo.id || photo.url,
                                url: photo.url,
                                source: "place",
                                sourceName: activity.place.name,
                                placeId: activity.place.id,
                              });
                            });
                          }
                        });
                      });

                      // Get images from cities
                      formData.cities.forEach((city) => {
                        if (city.photos && Array.isArray(city.photos)) {
                          city.photos.forEach((photo) => {
                            allImages.push({
                              id: photo.id || photo.url,
                              url: photo.url,
                              source: "city",
                              sourceName: city.name,
                              cityId: city.id,
                            });
                          });
                        }
                      });

                      if (allImages.length === 0) {
                        return (
                          <div className="text-center py-12 text-gray-400">
                            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No images yet</p>
                            <p className="text-xs mt-1">
                              Add places or cities to see their images here
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-2 gap-3">
                          {allImages.map((image) => (
                            <div
                              key={image.id}
                              className="relative group rounded-lg overflow-hidden bg-[#0D0D0D] border border-gray-700"
                            >
                              <div className="aspect-video relative">
                                <img
                                  src={image.url}
                                  alt={image.sourceName}
                                  className="w-full h-full object-cover"
                                />
                                {coverImageId === image.id && (
                                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                    Cover
                                  </div>
                                )}
                              </div>
                              <div className="p-2">
                                <p className="text-xs text-gray-400 truncate">
                                  From {image.sourceName}
                                </p>
                                <Button
                                  onClick={() => {
                                    setCoverImageId(image.id);
                                    setFormData((prev) => ({
                                      ...prev,
                                      cover_image: image.url,
                                    }));
                                    showNotification({
                                      type: "success",
                                      title: "Cover image set",
                                      message:
                                        "This image is now your trip cover",
                                    });
                                  }}
                                  className={`w-full mt-2 h-8 text-xs ${
                                    coverImageId === image.id
                                      ? "bg-gray-600"
                                      : "bg-blue-600 hover:bg-blue-700"
                                  }`}
                                  disabled={coverImageId === image.id}
                                >
                                  {coverImageId === image.id
                                    ? "Current Cover"
                                    : "Set as Cover"}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </>
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
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col">
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
    </div>
  );
}
