import React from "react";
import { MapPin, Star, X, Sparkles, Camera, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PlacesSidebar({
  activeCity,
  places = [],
  organizedItinerary = null,
  onOrganizeClick,
  onPlaceClick,
  onRemovePlace,
  onClearItinerary,
  getPriceRangeInfo,
  onOpenPlaceDetails,
}) {
  return (
    <aside className="places-sidebar open">
      <div className="places-sidebar-header">
        <h3 className="text-base font-bold text-white mb-1">{activeCity}</h3>
        <p className="text-sm text-gray-400">
          {places.length} {places.length === 1 ? "place" : "places"} added
        </p>
        <div className="mt-3 flex gap-2">
          <Button
            onClick={onOrganizeClick}
            className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Sparkles className="w-4 h-4" /> Organize Trip
          </Button>
          {organizedItinerary && (
            <Button
              onClick={() => onClearItinerary()}
              className="bg-gray-800/50"
            >
              Clear itinerary
            </Button>
          )}
        </div>
      </div>

      <div className="places-sidebar-content">
        {places.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-sm text-gray-400 mb-2">No places added yet</p>
            <p className="text-xs text-gray-500">
              Start exploring and add places to build your itinerary
            </p>
          </div>
        ) : (
          <div>
            {places.map((place, idx) => {
              const priceInfo = place.price_level
                ? getPriceRangeInfo(place.price_level)
                : null;

              // Get primary type for display
              const primaryType = place.types?.[0]
                ?.replace(/_/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase());

              // Check if place has photos
              const hasPhotos = place.photos && place.photos.length > 0;

              return (
                <div
                  key={`${place.name}-${idx}`}
                  className="group relative mb-3 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                >
                  {/* Card Content */}
                  <button
                    className="w-full text-left p-3.5"
                    onClick={() => onPlaceClick(place)}
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center border border-blue-500/30 shadow-sm">
                        <MapPin className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm mb-1.5 line-clamp-2 leading-snug">
                          {place.name}
                        </div>
                        {place.address && (
                          <div className="text-xs text-gray-400 line-clamp-1">
                            {place.address}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meta information badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {place.rating && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/15 border border-yellow-500/30">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          <span className="text-xs font-semibold text-yellow-400">
                            {place.rating ?? "N/A"}
                          </span>
                        </div>
                      )}
                      {priceInfo && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/15 border border-green-500/30">
                          <span className="text-xs font-semibold text-green-400">
                            {priceInfo.symbol}
                          </span>
                        </div>
                      )}
                      {primaryType && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/15 border border-blue-500/30">
                          <Tag className="w-3 h-3 text-blue-400" />
                          <span className="text-xs font-medium text-blue-400 line-clamp-1">
                            {primaryType}
                          </span>
                        </div>
                      )}
                      {hasPhotos && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/15 border border-purple-500/30">
                          <Camera className="w-3 h-3 text-purple-400" />
                          <span className="text-xs font-medium text-purple-400">
                            {place.photos.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Remove button - appears on hover */}
                  <button
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                    onClick={() => onRemovePlace(place.name)}
                    title="Remove from trip"
                    aria-label="Remove place"
                  >
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              );
            })}

            {organizedItinerary && (
              <div className="mt-6 text-sm text-gray-300 bg-gray-900/30 p-3 rounded-lg">
                <div className="font-semibold mb-2">Organized Itinerary</div>
                {organizedItinerary.length === 0 ? (
                  <div className="text-gray-400">
                    No itinerary generated yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {organizedItinerary.map((day, i) => (
                      <div key={i} className="bg-gray-800/40 p-2 rounded">
                        <div className="font-semibold">
                          Day {day.day}: {day.title}
                        </div>
                        <div className="text-gray-400 text-sm mt-1">
                          {day.description}
                        </div>
                        <div className="text-gray-300 text-sm mt-1">
                          Places: {day.places.map((p) => p.name).join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
