import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  MapPin,
  X as XIcon,
  Calendar,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ProposedChanges = ({ changes, onApprove, onReject, isApplying }) => {
  const [selectedChanges, setSelectedChanges] = useState(
    changes.map((c) => ({ ...c, approved: true }))
  );

  const toggleChange = (operationId) => {
    setSelectedChanges((prev) =>
      prev.map((c) =>
        c.operation_id === operationId ? { ...c, approved: !c.approved } : c
      )
    );
  };

  const handleApplyAll = () => {
    onApprove(selectedChanges);
  };

  const getOperationIcon = (operation) => {
    switch (operation) {
      case "ADD_CITY":
        return <Plus className="w-5 h-5 text-green-600" />;
      case "REMOVE_CITY":
        return <Trash2 className="w-5 h-5 text-red-600" />;
      case "ADD_PLACE":
        return <MapPin className="w-5 h-5 text-blue-600" />;
      case "REMOVE_PLACE":
        return <XIcon className="w-5 h-5 text-orange-600" />;
      case "ADD_ITINERARY":
        return <Calendar className="w-5 h-5 text-purple-600" />;
      default:
        return null;
    }
  };

  const formatOperationTitle = (operation, data) => {
    switch (operation) {
      case "ADD_CITY":
        const addCityCountry =
          typeof data.country === "object" ? data.country.name : data.country;
        return `Add ${data.city_name}${
          addCityCountry ? `, ${addCityCountry}` : ""
        }`;
      case "REMOVE_CITY":
        return `Remove ${data.city_name}`;
      case "ADD_PLACE":
        return `Add ${data.place_name}${
          data.city_name ? ` in ${data.city_name}` : ""
        }`;
      case "REMOVE_PLACE":
        return `Remove ${data.place_name}`;
      case "ADD_ITINERARY":
        return `Add ${data.days?.length || 0}-day itinerary${
          data.city_name ? ` for ${data.city_name}` : ""
        }`;
      default:
        return operation;
    }
  };

  const renderOperationDetails = (change) => {
    const { operation, data } = change;

    switch (operation) {
      case "ADD_CITY":
        return (
          <div className="text-xs text-gray-500">
            Destination: {data.city_name}
            {(() => {
              const countryName =
                typeof data.country === "object"
                  ? data.country.name
                  : data.country;
              return countryName ? `, ${countryName}` : null;
            })()}
          </div>
        );

      case "REMOVE_CITY":
        return (
          <div className="text-xs text-amber-600">
            Warning: This will remove all places and itinerary items for this
            city
          </div>
        );

      case "ADD_PLACE":
        return (
          <div className="text-xs text-gray-500 space-y-1">
            {data.place_name && <div>Place: {data.place_name}</div>}
            {data.city_name && <div>City: {data.city_name}</div>}
            {data.place_id && (
              <div className="font-mono text-[10px] text-gray-400">
                ID: {data.place_id.substring(0, 20)}...
              </div>
            )}
          </div>
        );

      case "REMOVE_PLACE":
        return (
          <div className="text-xs text-gray-500">
            {data.city_name && <span>From: {data.city_name}</span>}
          </div>
        );

      case "ADD_ITINERARY":
        return (
          <div className="text-xs text-gray-500 space-y-1">
            <div>{data.days?.length || 0} days of activities</div>
            {data.days && data.days.length > 0 && (
              <div className="mt-2 space-y-1">
                {data.days.slice(0, 2).map((day, idx) => (
                  <div key={idx} className="pl-2 border-l-2 border-gray-300">
                    <div className="font-medium">Day {day.day_number}</div>
                    <div className="text-gray-600">{day.title}</div>
                    {day.activities && (
                      <div className="text-gray-500">
                        {day.activities.length} activities
                      </div>
                    )}
                  </div>
                ))}
                {data.days.length > 2 && (
                  <div className="text-gray-400 italic">
                    +{data.days.length - 2} more days...
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const approvedCount = selectedChanges.filter((c) => c.approved).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 my-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Check className="w-6 h-6 text-blue-600" />
          Review Proposed Changes
        </h3>
        <button
          onClick={onReject}
          disabled={isApplying}
          className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          aria-label="Reject all changes"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Select the changes you want to apply to your trip
      </div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-3 mb-6 max-h-[500px] overflow-y-auto pr-2">
          {selectedChanges.map((change, index) => (
            <motion.div
              key={change.operation_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl border-2 p-4 transition-all duration-200 ${
                change.approved
                  ? "border-blue-500 bg-blue-50/50 shadow-sm"
                  : "border-gray-200 bg-gray-50/50 opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getOperationIcon(change.operation)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900 text-base">
                      {formatOperationTitle(change.operation, change.data)}
                    </h4>

                    <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={change.approved}
                        onChange={() => toggleChange(change.operation_id)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Apply
                      </span>
                    </label>
                  </div>

                  {change.reason && (
                    <p className="text-sm text-gray-600 mb-2">
                      {change.reason}
                    </p>
                  )}

                  <div className="mt-2">{renderOperationDetails(change)}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          onClick={handleApplyAll}
          disabled={isApplying || approvedCount === 0}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApplying ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              Applying...
            </>
          ) : (
            `Apply ${approvedCount} ${
              approvedCount === 1 ? "Change" : "Changes"
            }`
          )}
        </Button>

        <Button
          onClick={onReject}
          disabled={isApplying}
          className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          Cancel
        </Button>
      </div>
    </motion.div>
  );
};

export default ProposedChanges;
