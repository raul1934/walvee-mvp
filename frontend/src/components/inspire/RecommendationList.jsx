import React from "react";
import { MapPin } from "lucide-react";

export default function RecommendationList({
  recommendations = [],
  onCardClick,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {recommendations.map((rec, idx) => (
        <button
          key={`${rec.name}-${idx}`}
          className="bg-gray-800/60 p-4 rounded-xl text-left w-full hover:bg-gray-700"
          onClick={() => onCardClick(rec)}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-md bg-blue-800 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white">{rec.name}</div>
              {rec.city && (
                <div className="text-sm text-gray-400">
                  {rec.city}
                  {rec.country ? `, ${rec.country}` : ""}
                </div>
              )}
              {rec.description && (
                <div className="text-sm text-gray-300 mt-2 line-clamp-3">
                  {rec.description}
                </div>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
