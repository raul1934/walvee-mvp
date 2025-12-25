import React from "react";
import PlaceDetails from "@/components/trip/PlaceDetails";

export default function SidebarPlaceModal({
  isOpen,
  onClose,
  place,
  user,
  onAddToTrip,
  onRemove,
  isInTrip = true, // Sidebar places are typically already in the trip
}) {
  if (!isOpen || !place) return null;

  return (
    <div className="place-modal-container">
      <div className="place-modal-backdrop" onClick={onClose} />
      <div className="place-modal-content">
        <PlaceDetails
          place={place}
          trip={{ destination: place.city || place.address }}
          onClose={onClose}
          user={user}
          isInTrip={isInTrip}
          onAddToTrip={() => {
            onAddToTrip?.();
          }}
          onRemoveFromTrip={() => {
            onRemove?.();
          }}
        />
        <div className="p-4 border-t border-gray-800 bg-gray-900/20 flex gap-2">
          {!isInTrip && (
            <button
              className="prompt-action-btn"
              onClick={() => {
                onAddToTrip?.();
                onClose();
              }}
            >
              Add to trip
            </button>
          )}
          {isInTrip && (
            <button
              className="prompt-action-btn"
              onClick={() => {
                onRemove?.();
                onClose();
              }}
            >
              Remove place
            </button>
          )}
          <button className="prompt-action-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
