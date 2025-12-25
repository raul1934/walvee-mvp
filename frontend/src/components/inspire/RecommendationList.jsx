import React, { useState } from "react";
import {
  MapPin,
  Globe,
  ShoppingBag,
  Ticket,
  Activity,
  Store,
  Utensils,
  Building,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function RecommendationList({
  recommendations = [],
  onCardClick,
}) {
  // Track which descriptions are expanded
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());

  const toggleDescription = (index, e) => {
    e.stopPropagation(); // Prevent card click
    setExpandedDescriptions(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const getCategoryConfig = (type) => {
    const typeNormalized = type?.toLowerCase().trim();

    const categoryMap = {
      'cidade': { color: 'blue', icon: Globe, label: 'City', bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/40' },
      'city': { color: 'blue', icon: Globe, label: 'City', bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/40' },
      'local': { color: 'purple', icon: MapPin, label: 'Place', bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/40' },
      'place': { color: 'purple', icon: MapPin, label: 'Place', bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/40' },
      'compras': { color: 'pink', icon: ShoppingBag, label: 'Shopping', bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-500/40' },
      'shopping': { color: 'pink', icon: ShoppingBag, label: 'Shopping', bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-500/40' },
      'entrada paga': { color: 'amber', icon: Ticket, label: 'Paid Entry', bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40' },
      'paid_entry': { color: 'amber', icon: Ticket, label: 'Paid Entry', bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40' },
      'atividade': { color: 'cyan', icon: Activity, label: 'Activity', bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/40' },
      'activity': { color: 'cyan', icon: Activity, label: 'Activity', bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/40' },
      'negócio': { color: 'emerald', icon: Store, label: 'Business', bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/40' },
      'business': { color: 'emerald', icon: Store, label: 'Business', bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/40' },
      'restaurante': { color: 'orange', icon: Utensils, label: 'Restaurant', bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/40' },
      'restaurant': { color: 'orange', icon: Utensils, label: 'Restaurant', bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/40' },
      'museu': { color: 'violet', icon: Building, label: 'Museum', bg: 'bg-violet-500/20', text: 'text-violet-300', border: 'border-violet-500/40' },
      'museum': { color: 'violet', icon: Building, label: 'Museum', bg: 'bg-violet-500/20', text: 'text-violet-300', border: 'border-violet-500/40' },
    };

    return categoryMap[typeNormalized] || {
      color: 'gray',
      icon: MapPin,
      label: 'Other',
      bg: 'bg-gray-500/20',
      text: 'text-gray-300',
      border: 'border-gray-500/40'
    };
  };

  return (
    <div className="grid grid-cols-1 gap-4 mt-4">
      {recommendations.map((rec, idx) => {
        const category = getCategoryConfig(rec.type);
        const CategoryIcon = category.icon;
        const isExpanded = expandedDescriptions.has(idx);
        const hasLongDescription = rec.description && rec.description.length > 150;

        return (
          <div
            key={`${rec.name}-${idx}`}
            className="bg-gray-800/60 p-4 rounded-xl text-left w-full hover:bg-gray-700 cursor-pointer transition-colors"
            onClick={() => onCardClick(rec)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCardClick(rec);
              }
            }}
          >
            <div className="flex items-start gap-3">
              {/* Category Icon */}
              <div className={`w-10 h-10 rounded-md ${category.bg} ${category.border} border flex items-center justify-center`}>
                <CategoryIcon className={`w-4 h-4 ${category.text}`} />
              </div>

              <div className="flex-1">
                {/* Category Badge */}
                <div className="mb-2">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${category.bg} ${category.text} ${category.border} border`}>
                    {category.label}
                  </span>
                </div>

                {/* Place Name */}
                <div className="font-semibold text-white">{rec.name}</div>

                {/* Location */}
                {rec.city && (
                  <div className="text-sm text-gray-400">
                    {rec.city}
                    {rec.country ? `, ${rec.country}` : ""}
                  </div>
                )}

                {/* Description with Read More */}
                {rec.description && (
                  <div className="mt-2">
                    <div className={`text-sm text-gray-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {rec.description}
                    </div>

                    {/* Read More Button (only show if description is long) */}
                    {hasLongDescription && (
                      <button
                        onClick={(e) => toggleDescription(idx, e)}
                        className="mt-1 text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            Read less
                            <ChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            Read more
                            <ChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
