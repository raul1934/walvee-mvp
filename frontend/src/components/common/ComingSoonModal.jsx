import React from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/contexts/NotificationContext";

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

  const { showNotification } = useNotification();

  if (!isOpen) return null;

  const handlePrimary = () => {
    if (onPrimary) {
      onPrimary();
    } else {
      // default behaviour: show success notification
      try {
        showNotification({
          type: "success",
          title: "Thanks!",
          message: "We'll notify you when this feature is available.",
        });
      } catch (e) {
        console.log("Notify me clicked");
      }
    }
    onClose();
  };
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-labelledby="coming-soon-title"
      aria-describedby="coming-soon-desc"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl p-6 border border-[#2A2B35] shadow-2xl bg-gradient-to-br from-[#07080a] to-[#0b0c10] transform transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: "0 14px 48px rgba(2,6,23,0.7)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 text-gray-300" />
        </button>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-18 h-18 flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <div className="min-w-0">
            <h2
              id="coming-soon-title"
              className="text-2xl font-bold text-white"
            >
              {title}
            </h2>
            <p id="coming-soon-desc" className="text-sm text-gray-300 mt-1">
              {description}
            </p>
          </div>
        </div>

        {features && features.length > 0 && (
          <div className="mb-4">
            <ul className="grid grid-cols-1 gap-2 text-sm text-gray-300">
              {features.map((f, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1 shrink-0" />
                  <div className="flex-1">{f}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 max-w-[160px] h-11 border-gray-600 text-gray-400 hover:bg-gray-800"
          >
            Close
          </Button>

          <Button
            onClick={handlePrimary}
            className="flex-1 max-w-[160px] h-11 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold shadow-lg hover:brightness-95"
          >
            {primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
