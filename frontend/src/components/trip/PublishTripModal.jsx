import React, { useState, useEffect } from "react";
import { X, Image as ImageIcon, Check, GripVertical, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable photo item component
function SortablePhotoItem({ photo, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 hover:border-blue-500 transition-colors"
    >
      <img
        src={photo.url}
        alt={photo.name || "Trip photo"}
        className="w-full h-32 object-cover"
      />
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-black/80 transition-colors"
      >
        <GripVertical className="w-4 h-4 text-white" />
      </div>
      <button
        onClick={() => onRemove(photo.id)}
        className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
      >
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}

export default function PublishTripModal({
  isOpen,
  onClose,
  trip,
  onPublish,
  isPublishing = false,
}) {
  const [mainTab, setMainTab] = useState("details");
  const [photoTab, setPhotoTab] = useState("cities");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [availablePhotos, setAvailablePhotos] = useState({
    cities: [],
    places: [],
  });

  // Trip details state
  const [tripTitle, setTripTitle] = useState("");
  const [tripDescription, setTripDescription] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load photos and trip details from trip data
  useEffect(() => {
    if (!trip) return;

    // Set trip details
    setTripTitle(trip.title || "");
    setTripDescription(trip.description || "");

    const cityPhotos = [];
    const placePhotos = [];

    // Extract city photos
    if (trip.cities && Array.isArray(trip.cities)) {
      trip.cities.forEach((city) => {
        if (city.photos && Array.isArray(city.photos)) {
          city.photos.forEach((photo) => {
            cityPhotos.push({
              ...photo,
              type: "city",
              cityName: city.name,
              name: `${city.name} - Photo`,
            });
          });
        }
      });
    }

    // Extract place photos from places
    if (trip.places && Array.isArray(trip.places)) {
      trip.places.forEach((tripPlace) => {
        const place = tripPlace.place || tripPlace;
        if (place.photos && Array.isArray(place.photos)) {
          place.photos.forEach((photo) => {
            placePhotos.push({
              ...photo,
              type: "place",
              placeName: place.name,
              name: `${place.name} - Photo`,
            });
          });
        }
      });
    }

    setAvailablePhotos({
      cities: cityPhotos,
      places: placePhotos,
    });

    // Pre-select existing trip images if any
    if (trip.trip_images && Array.isArray(trip.trip_images)) {
      const existingPhotos = trip.trip_images
        .sort((a, b) => a.image_order - b.image_order)
        .map((tripImage) => {
          if (tripImage.place_photo_id && tripImage.placePhoto) {
            return {
              ...tripImage.placePhoto,
              type: "place",
              tripImageId: tripImage.id,
            };
          } else if (tripImage.city_photo_id && tripImage.cityPhoto) {
            return {
              ...tripImage.cityPhoto,
              type: "city",
              tripImageId: tripImage.id,
            };
          }
          return null;
        })
        .filter(Boolean);

      setSelectedPhotos(existingPhotos);
    }
  }, [trip]);

  const handlePhotoToggle = (photo) => {
    const isSelected = selectedPhotos.some((p) => p.id === photo.id);

    if (isSelected) {
      setSelectedPhotos(selectedPhotos.filter((p) => p.id !== photo.id));
    } else {
      if (selectedPhotos.length >= 10) {
        return; // Max 10 photos
      }
      setSelectedPhotos([...selectedPhotos, photo]);
    }
  };

  const handleRemoveSelected = (photoId) => {
    setSelectedPhotos(selectedPhotos.filter((p) => p.id !== photoId));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSelectedPhotos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handlePublish = () => {
    // Prepare photos with order
    const photosToSave = selectedPhotos.map((photo, index) => ({
      place_photo_id: photo.type === "place" ? photo.id : null,
      city_photo_id: photo.type === "city" ? photo.id : null,
      image_order: index,
      is_cover: index === 0, // First photo is the cover
    }));

    onPublish(photosToSave, { title: tripTitle, description: tripDescription });
  };

  if (!isOpen) return null;

  const currentPhotos =
    photoTab === "cities" ? availablePhotos.cities : availablePhotos.places;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center border border-blue-500/30">
              <ImageIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Publish Trip</h3>
              <p className="text-sm text-gray-400">
                Add details and select photos for your trip
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPublishing}
            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b border-gray-700">
          <button
            onClick={() => setMainTab("details")}
            className={`px-4 py-2 text-sm font-medium transition-all relative ${
              mainTab === "details"
                ? "text-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <Info className="w-4 h-4 inline mr-2" />
            Trip Details
            {mainTab === "details" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
            )}
          </button>
          <button
            onClick={() => setMainTab("photos")}
            className={`px-4 py-2 text-sm font-medium transition-all relative ${
              mainTab === "photos"
                ? "text-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <ImageIcon className="w-4 h-4 inline mr-2" />
            Photos {selectedPhotos.length > 0 && `(${selectedPhotos.length})`}
            {mainTab === "photos" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {mainTab === "details" ? (
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Trip Title *
                </label>
                <Input
                  value={tripTitle}
                  onChange={(e) => setTripTitle(e.target.value)}
                  placeholder="Enter a catchy title for your trip"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <Textarea
                  value={tripDescription}
                  onChange={(e) => setTripDescription(e.target.value)}
                  placeholder="Describe your amazing journey..."
                  rows={6}
                  className="bg-gray-800 border-gray-700 text-white resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Photos Section */}
              {selectedPhotos.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">
                      Selected Photos ({selectedPhotos.length}/10)
                    </h4>
                    <span className="text-xs text-gray-400">
                      Drag to reorder • First photo will be the cover
                    </span>
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={selectedPhotos.map((p) => p.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {selectedPhotos.map((photo, index) => (
                          <div key={photo.id} className="relative">
                            <SortablePhotoItem
                              photo={photo}
                              onRemove={handleRemoveSelected}
                            />
                            {index === 0 && (
                              <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                                COVER
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}

              {/* Photo Selection Tabs */}
              <div className="space-y-4">
                <div className="flex gap-2 border-b border-gray-700">
                  <button
                    onClick={() => setPhotoTab("cities")}
                    className={`px-4 py-2 text-sm font-medium transition-all ${
                      photoTab === "cities"
                        ? "text-blue-400 border-b-2 border-blue-400"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    City Photos ({availablePhotos.cities.length})
                  </button>
                  <button
                    onClick={() => setPhotoTab("places")}
                    className={`px-4 py-2 text-sm font-medium transition-all ${
                      photoTab === "places"
                        ? "text-blue-400 border-b-2 border-blue-400"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    Place Photos ({availablePhotos.places.length})
                  </button>
                </div>

                {/* Available Photos Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {currentPhotos.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                      <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No {photoTab} photos available</p>
                    </div>
                  ) : (
                    currentPhotos.map((photo) => {
                      const isSelected = selectedPhotos.some(
                        (p) => p.id === photo.id
                      );
                      const canSelect =
                        isSelected || selectedPhotos.length < 10;

                      return (
                        <button
                          key={photo.id}
                          onClick={() => canSelect && handlePhotoToggle(photo)}
                          disabled={!canSelect}
                          className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                            isSelected
                              ? "border-blue-500 ring-2 ring-blue-500/50"
                              : canSelect
                              ? "border-gray-700 hover:border-blue-400"
                              : "border-gray-800 opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <img
                            src={photo.url}
                            alt={photo.name || "Photo"}
                            className="w-full h-32 object-cover"
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-xs text-white truncate">
                              {photo.placeName || photo.cityName || "Photo"}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black/20">
          <div className="flex gap-3">
            <Button
              onClick={handlePublish}
              disabled={isPublishing || !tripTitle.trim()}
              className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isPublishing ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publishing...
                </span>
              ) : (
                <span>
                  Publish Trip
                  {selectedPhotos.length === 0 && (
                    <span className="text-xs ml-1 opacity-75">
                      (auto-select photos)
                    </span>
                  )}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPublishing}
              className="h-11 px-6 bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 rounded-lg transition-all"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
