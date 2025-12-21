import React from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ComingSoonModal({
  isOpen,
  onClose,
  title = "Coming soon",
  description = "We're working on new features to make this experience even better. Stay tuned!",
  features = [],
  primaryLabel = "Notify me",
  onPrimary = null,
}) {
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrimary = () => {
    if (onPrimary) {
      onPrimary();
    } else {
      // default behaviour: simple acknowledgement
      try {
        window.alert(
          "Thanks! We'll notify you when this feature is available."
        );
      } catch (e) {
        console.log("Notify me clicked");
      }
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-labelledby="coming-soon-title"
      aria-describedby="coming-soon-desc"
    >
      <div
        className="relative w-full max-w-md bg-[#0B0C10] rounded-2xl p-6 border border-[#2A2B35] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          {/* Use a slightly darker gray for the icon so it's less bright */}
          <X className="w-4 h-4 text-gray-300" />
        </button>

        <div className="flex flex-col items-center text-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white">
            <Sparkles className="w-8 h-8" />
          </div>

          <h2 id="coming-soon-title" className="text-2xl font-bold text-white">
            {title}
          </h2>

          <p id="coming-soon-desc" className="text-sm text-gray-400">
            {description}
          </p>
        </div>

        {features && features.length > 0 && (
          <div className="mb-4">
            <ul className="space-y-2 text-sm text-gray-300">
              {features.map((f, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />
                  <div className="flex-1">{f}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 h-11 border-gray-600 text-gray-500 hover:bg-gray-800"
          >
            Close
          </Button>

          <Button
            onClick={handlePrimary}
            className="flex-1 h-11 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold"
          >
            {primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
