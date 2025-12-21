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
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 10);

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const iconMap = {
    success: { Icon: Check, bg: "bg-green-500" },
    error: { Icon: AlertTriangle, bg: "bg-red-500" },
    info: { Icon: Info, bg: "bg-blue-500" },
  };

  const { Icon, bg } = iconMap[type] || iconMap.info;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal
    >
      <div
        className={`relative w-full max-w-md rounded-2xl pt-6 pb-6 px-6 border border-[#2A2B35] shadow-2xl bg-gradient-to-br from-[#07080a] to-[#0b0c10] transform transition-all duration-220 ${
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: "0 12px 40px rgba(2,6,23,0.7)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 text-gray-300" />
        </button>

        {/* Icon centered in flow (non-absolute) so it occupies its own height */}
        <div className="flex justify-center mb-2">
          <div
            className={`${bg} w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl border-2 border-[#0B0C10]`}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold text-white leading-tight">
            {title}
          </h3>
          {message && <p className="text-sm text-gray-300 mt-2">{message}</p>}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={onClose}
            className="h-10 bg-[#111317] hover:bg-[#1f2937]"
          >
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
