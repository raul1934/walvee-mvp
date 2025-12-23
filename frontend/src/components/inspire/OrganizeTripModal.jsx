import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrganizeTripModal({
  isOpen,
  onClose,
  places = [],
  tripDays,
  setTripDays,
  isOrganizing,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div className="place-modal-container">
      <div className="place-modal-backdrop" onClick={onClose} />
      <div className="place-modal-content p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Organize Trip</h3>
          <button className="prompt-action-btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-300 mb-2">
            Number of days
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={tripDays}
            onChange={(e) => setTripDays(Number(e.target.value))}
            className="w-32 p-2 rounded bg-gray-800 border border-gray-700 text-white"
          />
        </div>

        <div className="mb-4 text-sm text-gray-300">
          <div className="font-semibold mb-2">
            Places included ({places.length})
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {places.map((p, idx) => (
              <div
                key={`${p.name}-${idx}`}
                className="flex items-center justify-between bg-gray-800/40 p-2 rounded"
              >
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-gray-400 text-sm">{p.address}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onConfirm}
            disabled={isOrganizing}
            className="bg-gradient-to-r from-blue-500 to-violet-500"
          >
            {isOrganizing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Organizing...
              </span>
            ) : (
              "Create Itinerary"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-gray-800/60"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
