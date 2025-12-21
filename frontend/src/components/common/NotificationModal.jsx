import React from "react";
import { X, Check, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationModal({
  isOpen,
  onClose,
  type = "info",
  title,
  message,
}) {
  const dialogRef = React.useRef(null);
  const okButtonRef = React.useRef(null);
  const lastActiveElement = React.useRef(null);

  const [mounted, setMounted] = React.useState(false);

  // Mount / unmount animation
  React.useEffect(() => {
    if (!isOpen) return;

    lastActiveElement.current = document.activeElement;
    setMounted(true);

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") okButtonRef.current?.click();
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      setMounted(false);
      lastActiveElement.current?.focus?.();
    };
  }, [isOpen, onClose]);

  // Auto-focus OK button
  React.useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => okButtonRef.current?.focus());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const iconMap = {
    success: { Icon: Check, bg: "bg-green-500" },
    error: { Icon: AlertTriangle, bg: "bg-red-500" },
    info: { Icon: Info, bg: "bg-blue-500" },
  };

  const { Icon, bg } = iconMap[type] || iconMap.info;

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-title"
        aria-describedby={message ? "notification-message" : undefined}
        onClick={(e) => e.stopPropagation()}
        className={`
          relative w-full max-w-md rounded-2xl px-6 pt-6 pb-6
          border border-[#2A2B35]
          bg-gradient-to-br from-[#07080a] to-[#0b0c10]
          shadow-2xl
          transform transition-all
          ${prefersReducedMotion ? "" : "duration-200 ease-out"}
          ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        `}
        style={{ boxShadow: "0 12px 40px rgba(2,6,23,0.7)" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 w-9 h-9 rounded-full
            bg-gray-800 hover:bg-gray-700
            flex items-center justify-center
            transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <X className="w-4 h-4 text-gray-300" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-3">
          <div
            className={`${bg} w-14 h-14 rounded-full flex items-center justify-center
              text-white shadow-2xl border-2 border-[#0B0C10]`}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3
            id="notification-title"
            className="text-xl font-bold text-white leading-tight"
          >
            {title}
          </h3>

          {message && (
            <p id="notification-message" className="text-sm text-gray-300 mt-2">
              {message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-6">
          <Button
            ref={okButtonRef}
            onClick={onClose}
            className="h-10 bg-[#111317] hover:bg-[#1f2937]
              focus:ring-2 focus:ring-blue-500"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
