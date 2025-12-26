import React from "react";
import { Loader2, X, Calendar, MapPin, Sparkles } from "lucide-react";
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
    <div className="organize-trip-modal-container">
      <div className="organize-trip-modal-backdrop" onClick={onClose} />
      <div className="organize-trip-modal-content">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Organize Trip</h3>
              <p className="text-sm text-gray-400">
                Create your personalized itinerary
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Trip Duration */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Calendar className="w-4 h-4 text-blue-400" />
              Trip Duration
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={30}
                value={tripDays}
                onChange={(e) => setTripDays(Number(e.target.value))}
                className="w-24 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
              <span className="text-sm text-gray-400">
                {tripDays === 1 ? "day" : "days"}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Choose between 1-30 days for your trip
            </p>
          </div>

          {/* Places List */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <MapPin className="w-4 h-4 text-violet-400" />
              Places Included
              <span className="ml-auto px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold">
                {places.length}
              </span>
            </label>
            <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-2">
              {places.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-lg bg-white/5 border border-dashed border-white/10">
                  <MapPin className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No places added yet</p>
                </div>
              ) : (
                places.map((p, idx) => (
                  <div
                    key={`${p.name}-${idx}`}
                    className="group p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-blue-400">
                          {idx + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white mb-1 truncate">
                          {p.name}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {p.address}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-300 leading-relaxed">
              Our AI will create an optimized itinerary based on your selected
              places and trip duration, including suggested timings and routes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-black/20">
          <div className="flex gap-3">
            <Button
              onClick={onConfirm}
              disabled={isOrganizing || places.length === 0}
              className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isOrganizing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Organizing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Create Itinerary
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isOrganizing}
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
