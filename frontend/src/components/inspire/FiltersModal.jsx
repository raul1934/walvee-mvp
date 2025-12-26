import React, { useState } from 'react';
import { X, Sparkles, DollarSign, Gauge, Users, Calendar, Heart, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const INTERESTS = [
  { name: 'Adventure', icon: '🏔️', color: 'from-orange-500/20 to-red-500/20 border-orange-500/30' },
  { name: 'Sports', icon: '⚽', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' },
  { name: 'Gastronomy', icon: '🍽️', color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30' },
  { name: 'Ecotourism', icon: '🌿', color: 'from-green-500/20 to-emerald-500/20 border-green-500/30' },
  { name: 'Experiential travel', icon: '✨', color: 'from-purple-500/20 to-violet-500/20 border-purple-500/30' },
  { name: 'Cultural', icon: '🏛️', color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30' },
  { name: 'History', icon: '📜', color: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30' }
];

const GASTRONOMY_SUB = [
  'Low budget', 'Fine dining', 'Vegan / Vegetarian', 'More meat', 'Seafood', 'Regional specialties', 'Michelin stars', 'Street food'
];

const ECOTOURISM_SUB = [
  'More land', 'Wildlife watching', 'Hiking', 'More sea', 'Safaris', 'Eco-farms', 'Local culture'
];

const EXPERIENTIAL_SUB = [
  'More nature', 'More sea', 'Photos', 'History', 'Urban exploration', 'Nightlife', 'More relaxation', 'More adventure'
];

const CULTURAL_SUB = [
  'Museums', 'Archaeological sites', 'Photos', 'Historical sites', 'Historical tours', 'Natural parks', 'Cultural events'
];

const BUDGETS = [
  { name: 'Budget', icon: '💰', desc: 'Cost-effective' },
  { name: 'Mid-range', icon: '💵', desc: 'Balanced comfort' },
  { name: 'Comfortable', icon: '💳', desc: 'Premium quality' },
  { name: 'Luxury', icon: '💎', desc: 'Exclusive experiences' }
];

const PACES = [
  { name: 'Relaxed', icon: '🧘', desc: 'Take it slow' },
  { name: 'Moderate', icon: '🚶', desc: 'Balanced pace' },
  { name: 'Fast-paced', icon: '🏃', desc: 'See it all' }
];

const COMPANIONS = [
  { name: 'Solo', icon: '🎒' },
  { name: 'Couple', icon: '💑' },
  { name: 'Family', icon: '👨‍👩‍👧‍👦' },
  { name: 'Friends', icon: '👥' },
  { name: 'Group', icon: '🚌' }
];

const SEASONS = [
  { name: 'Spring', icon: '🌸', color: 'from-pink-500/20 to-green-500/20 border-pink-500/30' },
  { name: 'Summer', icon: '☀️', color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30' },
  { name: 'Fall', icon: '🍂', color: 'from-orange-500/20 to-red-500/20 border-orange-500/30' },
  { name: 'Winter', icon: '❄️', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' },
  { name: 'Flexible', icon: '🌍', color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30' }
];

export default function FiltersModal({ isOpen, onClose, selectedFilters, onApply }) {
  const [filters, setFilters] = useState(selectedFilters);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const toggleInterest = (interest) => {
    const current = filters.interests || [];
    const interestName = typeof interest === 'string' ? interest : interest.name;
    if (current.includes(interestName)) {
      setFilters({ ...filters, interests: current.filter(i => i !== interestName) });
    } else {
      setFilters({ ...filters, interests: [...current, interestName] });
    }
  };

  const toggleExpanded = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const getSubCategories = (category) => {
    switch(category) {
      case 'Gastronomy': return GASTRONOMY_SUB;
      case 'Ecotourism': return ECOTOURISM_SUB;
      case 'Experiential travel': return EXPERIENTIAL_SUB;
      case 'Cultural': return CULTURAL_SUB;
      default: return [];
    }
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      interests: [],
      budget: null,
      pace: null,
      companions: null,
      season: null
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-3xl max-h-[90vh] bg-gradient-to-br from-[#1A1B23] to-[#14151B] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

          {/* Header */}
          <div className="relative flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Trip Preferences
                </h2>
                <p className="text-sm text-gray-400">Customize your perfect journey</p>
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
          <div className="relative flex-1 overflow-y-auto p-6 space-y-8">
            {/* Interests */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Interests & Activities</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {INTERESTS.map(interest => {
                  const hasSubCategories = getSubCategories(interest.name).length > 0;
                  const isSelected = filters.interests?.includes(interest.name);
                  const isExpanded = expandedCategory === interest.name;

                  return (
                    <div key={interest.name} className="col-span-2">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => hasSubCategories ? toggleExpanded(interest.name) : toggleInterest(interest)}
                        className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all duration-300 ${
                          isSelected
                            ? `bg-gradient-to-r ${interest.color} shadow-lg shadow-blue-500/10`
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{interest.icon}</span>
                          <span className="font-medium text-white">{interest.name}</span>
                        </div>
                        {hasSubCategories && (
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        )}
                      </motion.button>

                      {/* Sub-categories */}
                      <AnimatePresence>
                        {isExpanded && hasSubCategories && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="ml-6 mt-3 space-y-2 overflow-hidden"
                          >
                            <div className="grid grid-cols-2 gap-2">
                              {getSubCategories(interest.name).map(sub => {
                                const isSubSelected = filters.interests?.includes(sub);
                                return (
                                  <motion.button
                                    key={sub}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => toggleInterest(sub)}
                                    className={`px-3 py-2 rounded-xl border text-sm transition-all duration-200 ${
                                      isSubSelected
                                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/40 text-white shadow-md'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                                  >
                                    {sub}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Budget */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-4 h-4 text-green-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Budget Range</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {BUDGETS.map(budget => (
                  <motion.button
                    key={budget.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFilters({ ...filters, budget: filters.budget === budget.name ? null : budget.name })}
                    className={`px-5 py-4 rounded-2xl border-2 transition-all duration-300 ${
                      filters.budget === budget.name
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/40 shadow-lg shadow-green-500/10'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl">{budget.icon}</span>
                      <span className="font-medium text-white">{budget.name}</span>
                    </div>
                    <p className="text-xs text-gray-400 text-left ml-9">{budget.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Pace */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Travel Pace</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {PACES.map(pace => (
                  <motion.button
                    key={pace.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFilters({ ...filters, pace: filters.pace === pace.name ? null : pace.name })}
                    className={`px-4 py-4 rounded-2xl border-2 transition-all duration-300 ${
                      filters.pace === pace.name
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/40 shadow-lg shadow-blue-500/10'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="text-2xl mb-1">{pace.icon}</div>
                    <div className="font-medium text-white text-sm">{pace.name}</div>
                    <p className="text-xs text-gray-400 mt-1">{pace.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Companions */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Traveling With</h3>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {COMPANIONS.map(comp => (
                  <motion.button
                    key={comp.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilters({ ...filters, companions: filters.companions === comp.name ? null : comp.name })}
                    className={`px-3 py-4 rounded-2xl border-2 transition-all duration-300 ${
                      filters.companions === comp.name
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/40 shadow-lg shadow-purple-500/10'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="text-2xl mb-2">{comp.icon}</div>
                    <div className="font-medium text-white text-xs">{comp.name}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Season */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Preferred Season</h3>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {SEASONS.map(season => (
                  <motion.button
                    key={season.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilters({ ...filters, season: filters.season === season.name ? null : season.name })}
                    className={`px-3 py-4 rounded-2xl border-2 transition-all duration-300 ${
                      filters.season === season.name
                        ? `bg-gradient-to-r ${season.color} shadow-lg`
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="text-2xl mb-2">{season.icon}</div>
                    <div className="font-medium text-white text-xs">{season.name}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative flex items-center justify-between p-6 border-t border-white/10 bg-gradient-to-r from-[#1A1B23] to-[#14151B]">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="px-6 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
            >
              Reset All
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleApply}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200"
            >
              Apply Preferences
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
