import React from "react";
import { MapPin, Star, X, Sparkles } from "lucide-react";
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
          <Button onClick={onOrganizeClick} className="bg-gray-800/60">
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

              return (
                <div
                  key={`${place.name}-${idx}`}
                  className="place-sidebar-item"
                >
                  <div className="place-sidebar-item-header">
                    <div className="place-sidebar-item-icon">
                      <MapPin className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="place-sidebar-item-content">
                      <button
                        className="text-left w-full"
                        onClick={() => onPlaceClick(place)}
                      >
                        <div
                          className="place-sidebar-item-name"
                          title={place.name}
                        >
                          {place.name}
                        </div>
                        <div
                          className="place-sidebar-item-address"
                          title={place.address}
                        >
                          {place.address}
                        </div>
                      </button>
                    </div>
                  </div>

                  {(place.rating || priceInfo) && (
                    <div className="place-sidebar-item-meta">
                      {place.rating && (
                        <div className="place-sidebar-item-rating">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{place.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {priceInfo && (
                        <div className="place-sidebar-item-price">
                          {priceInfo.symbol}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    className="place-sidebar-item-remove"
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
