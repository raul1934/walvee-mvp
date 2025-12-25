import React, { useState, useEffect, useRef } from "react";
import { Review } from "@/api/entities";
import { apiClient } from "@/api/apiClient";
import { useFavorites } from "@/components/hooks/useFavorites";
import {
  X,
  Clock,
  MapPin,
  Star,
  Phone,
  Globe,
  Heart,
  Navigation,
  Camera,
  Info,
  Image as ImageIcon,
  Car,
  Bus,
  Bike,
  Footprints,
  Trash2,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/contexts/NotificationContext";
import UserAvatar from "../common/UserAvatar";
import ImagePlaceholder from "../common/ImagePlaceholder";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { getPriceRangeInfo } from "../utils/priceFormatter";
import { tr } from "date-fns/locale";

const getPriceRangeText = (priceLevel) => {
  if (priceLevel === undefined || priceLevel === null || priceLevel === 0) {
    return null;
  }

  const priceRanges = {
    1: { label: "Inexpensive", symbol: "$", estimate: "$10-20 per person" },
    2: { label: "Moderate", symbol: "$$", estimate: "$20-40 per person" },
    3: { label: "Expensive", symbol: "$$$", estimate: "$40-80 per person" },
    4: { label: "Very Expensive", symbol: "$$$$", estimate: "$80+ per person" },
  };

  return priceRanges[priceLevel] || null;
};

const getPriceOpinionLabel = (opinion) => {
  const labels = {
    cheap: { label: "Cheap", symbol: "$" },
    fair: { label: "Fair", symbol: "$$" },
    expensive: { label: "Expensive", symbol: "$$$" },
    very_expensive: { label: "Very Expensive", symbol: "$$$$" },
  };
  return labels[opinion] || { label: opinion, symbol: "$" };
};

const formatAiReviewText = (text) => {
  if (!text) return { paragraphs: [], badges: [], sources: [] };

  const sourcesMatch = text.match(/Sources?:\s*([\s\S]*?)$/i);
  const sources = [];
  let mainText = text;

  if (sourcesMatch) {
    mainText = text.substring(0, sourcesMatch.index).trim();
    const sourcesText = sourcesMatch[1];

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(sourcesText)) !== null) {
      sources.push({ name: match[1], url: match[2] });
    }
  }

  mainText = mainText.replace(/https?:\/\/[^\s)]+/g, "");
  mainText = mainText.replace(/\(\s*\)/g, "");

  const badges = [];
  const badgePatterns = [
    {
      regex:
        /(?:cost|price|charge)[^.!?]*?\$\d+[-–]\$?\d+(?: per person)?[^.!?]*[.!?]/gi,
      icon: DollarSign,
      type: "price",
      extract: (match) =>
        match.match(/\$\d+[-–]\$?\d+(?: per person)?/)?.[0] || match,
    },
    {
      regex:
        /(?:open|hour|time)[^.!?]*?\d{1,2}:\d{2}\s*(?:AM|PM)\s*(?:to|-|–)\s*\d{1,2}:\d{2}\s*(?:AM|PM)[^.!?]*[.!?]/gi,
      icon: Clock,
      type: "hours",
      extract: (match) =>
        match.match(
          /\d{1,2}:\d{2}\s*(?:AM|PM)\s*(?:to|-|–)\s*\d{1,2}:\d{2}\s*(?:AM|PM)/
        )?.[0] || match,
    },
    {
      regex: /(?:reserv|book)[^.!?]*(?:recommend|advis|requir)[^.!?]*[.!?]/gi,
      icon: AlertTriangle,
      type: "reservation",
      extract: (match) => match,
    },
    {
      regex: /(?:wait|crowd|busy|peak)[^.!?]*(?:time|hour|avoid)[^.!?]*[.!?]/gi,
      icon: AlertTriangle,
      type: "timing",
      extract: (match) => match,
    },
    {
      regex:
        /(?:tip|suggest|recommend|best)[^.!?]*(?:visit|time|bring|wear)[^.!?]*[.!?]/gi,
      icon: Lightbulb,
      type: "tip",
      extract: (match) => match,
    },
  ];

  badgePatterns.forEach((pattern) => {
    const matches = mainText.match(pattern.regex);
    if (matches) {
      matches.forEach((match) => {
        const extracted = pattern.extract
          ? pattern.extract(match)
          : match.trim();
        if (extracted && !badges.some((b) => b.text === extracted)) {
          badges.push({
            text: extracted,
            icon: pattern.icon,
            type: pattern.type,
          });
        }
      });
    }
  });

  const paragraphs = mainText
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => {
      p = p.replace(
        /\b([A-Z][a-zA-Z\s]{2,}(?:Street|Avenue|Drive|Boulevard|Park|Beach|Museum|Restaurant|Cafe|Bar|Hotel|Gallery|Square|Garden))\b/g,
        "**$1**"
      );
      return p;
    });

  return { paragraphs, badges: badges.slice(0, 3), sources };
};

export default function PlaceDetails({
  place,
  trip,
  onClose,
  onPhotoClick,
  user,
  onAddToTrip,
  openLoginModal,
}) {
  const [enrichedPlace, setEnrichedPlace] = useState(place);
  const [isEnriching, setIsEnriching] = useState(false);

  const [activeTab, setActiveTab] = useState("general");
  const [imageErrors, setImageErrors] = useState(new Set());
  const [isScrolling, setIsScrolling] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  const [transportMode, setTransportMode] = useState("driving");

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewPriceOpinion, setReviewPriceOpinion] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  const [aiReviews, setAiReviews] = useState({});
  const [isLoadingAiReview, setIsLoadingAiReview] = useState(false);

  const [googleRatingsTotal, setGoogleRatingsTotal] = useState(
    enrichedPlace.user_ratings_total || enrichedPlace.reviews_count || 0
  );

  const [expandedSections, setExpandedSections] = useState({
    google: false,
    walvee: false,
    ai: false,
  });

  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  // Favorites hook
  const { isPlaceFavorited, togglePlaceFavorite, isTogglingPlace } =
    useFavorites(user);
  const placeId = enrichedPlace.id || enrichedPlace.place_id;
  const isFavorited = isPlaceFavorited(placeId);

  const headerRef = useRef(null);
  const tabsRef = useRef(null);
  const scrollRef = useRef(null);

  const priceLevel = enrichedPlace.price_level || 0;
  const priceInfo = getPriceRangeInfo(enrichedPlace.price_level);

  const { data: userReviews = [] } = useQuery({
    queryKey: ["reviews", "place", placeId],
    queryFn: async () => {
      if (!placeId) {
        console.warn("[PlaceDetails] No place_id found, returning empty array");
        return [];
      }

      const response = await apiClient.get(
        `/places/${placeId}/reviews`
      );

      return response.data || [];
    },
    enabled: !!placeId && activeTab === "reviews",
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const addReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      return Review.create({
        placeId: enrichedPlace.place_id,
        rating: reviewData.rating,
        priceOpinion: reviewData.price_opinion || null,
        comment: reviewData.comment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", "place", enrichedPlace.place_id],
      });
      setReviewRating(0);
      setReviewPriceOpinion("");
      setReviewComment("");
    },
  });

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      showNotification({
        type: "error",
        title: "Validation",
        message: "Please write a comment",
      });
      return;
    }

    if (reviewRating === 0) {
      showNotification({
        type: "error",
        title: "Validation",
        message: "Please select a star rating",
      });
      return;
    }

    if (priceLevel > 0 && !reviewPriceOpinion) {
      showNotification({
        type: "error",
        title: "Validation",
        message: "Please select your opinion about the price",
      });
      return;
    }

    await addReviewMutation.mutateAsync({
      rating: reviewRating,
      price_opinion: reviewPriceOpinion,
      comment: reviewComment,
    });
  };

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId) => {
      return Review.delete(reviewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", "place", enrichedPlace.place_id],
      });
    },
  });

  const handleDeleteReview = async (review) => {
    // Open confirmation modal
    setReviewPendingDelete(review);
  };

  const [reviewPendingDelete, setReviewPendingDelete] = useState(null);

  const confirmDeleteReview = async () => {
    if (!reviewPendingDelete) return;
    const review = reviewPendingDelete;
    const reviewIdToDelete =
      review.source === "walvee" ? review.originalId : review.id;
    await deleteReviewMutation.mutateAsync(reviewIdToDelete);
    setReviewPendingDelete(null);
  };

  const cancelDeleteReview = () => {
    setReviewPendingDelete(null);
  };

  useEffect(() => {
    const scrollEl = scrollRef.current;

    const handleScroll = () => {
      if (scrollEl) {
        setIsScrolling(scrollEl.scrollTop > 2);
      }
    };

    if (scrollEl) {
      scrollEl.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
    }

    return () => {
      if (scrollEl) {
        scrollEl.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    setEnrichedPlace(place);
  }, [place]);

  // Render confirmation modal for deleting reviews
  const renderConfirmationModal = () => (
    <ConfirmationModal
      isOpen={!!reviewPendingDelete}
      title={"Delete review"}
      description={
        "Are you sure you want to delete this review? This action cannot be undone."
      }
      confirmLabel={"Delete"}
      cancelLabel={"Cancel"}
      onConfirm={confirmDeleteReview}
      onCancel={cancelDeleteReview}
    />
  );

  // Normalize photos so UI can handle both string URLs and photo objects
  const normalizedPhotos = React.useMemo(() => {
    const src = enrichedPlace?.photos || place?.photos || [];
    if (!Array.isArray(src)) return [];

    return src
      .map((photo) => {
        if (!photo) return null;
        if (typeof photo === "string") return photo;
        if (typeof photo === "object") {
          return (
            photo.url ||
            photo.url_medium ||
            photo.url_large ||
            photo.url_small ||
            photo.photo_url ||
            photo.photo ||
            photo.src ||
            null
          );
        }
        return null;
      })
      .filter(Boolean);
  }, [enrichedPlace?.photos, place?.photos]);

  const googleReviewsList = enrichedPlace.reviews
    ? enrichedPlace.reviews.map((review, idx) => ({
        id: review.time + "-" + idx,
        author_name: review.author_name,
        author_photo: review.profile_photo_url,
        rating: review.rating,
        text: review.text,
        time: review.time,
        relative_time_description: review.relative_time_description,
        source: "google",
      }))
    : [];

  useEffect(() => {
    if (enrichedPlace.user_ratings_total !== undefined) {
      setGoogleRatingsTotal(enrichedPlace.user_ratings_total);
    } else if (enrichedPlace.reviews) {
      setGoogleRatingsTotal(enrichedPlace.reviews.length);
    } else {
      setGoogleRatingsTotal(0);
    }
  }, [enrichedPlace.user_ratings_total, enrichedPlace.reviews]);

  // Close modal on successful deletion
  useEffect(() => {
    if (deleteReviewMutation.isSuccess) {
      setReviewPendingDelete(null);
    }
  }, [deleteReviewMutation.isSuccess]);

  const formatReviewDate = (timestamp) => {
    if (!timestamp) return "Unknown date";

    let reviewDate;
    if (typeof timestamp === "string") {
      if (!isNaN(new Date(timestamp).getTime())) {
        reviewDate = new Date(timestamp);
      } else {
        return timestamp;
      }
    } else {
      reviewDate = new Date(timestamp * 1000);
    }

    if (isNaN(reviewDate.getTime())) return "Unknown date";

    const now = new Date();
    const diffTime = Math.abs(now - reviewDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return reviewDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format all reviews from the endpoint (AI review is already first)
  const formattedUserReviews = userReviews.map((review) => ({
    id: review.is_ai_generated ? "ai-walvee" : `walvee-${review.id}`,
    author_name: review.is_ai_generated
      ? "Walvee AI"
      : review.reviewer?.preferred_name ||
        review.reviewer?.full_name ||
        review.created_by,
    author_photo: review.is_ai_generated
      ? "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e82e0380ac6e4a26051c6f/0ec4e7e41_LogoWalvee.png"
      : review.reviewer?.photo_url || null,
    time: review.is_ai_generated ? "Recently" : review.created_at,
    rating: review.rating,
    text: review.comment,
    price_opinion: review.price_opinion,
    source: review.is_ai_generated ? "ai" : "walvee",
    isOwn:
      !review.is_ai_generated &&
      user &&
      (review.reviewer_id === user.id || review.created_by === user.email),
    originalId: review.id,
  }));

  const allReviewsForAvg = [...googleReviewsList, ...formattedUserReviews];
  const totalReviews = allReviewsForAvg.length;
  const averageRating =
    totalReviews > 0
      ? (
          allReviewsForAvg.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        ).toFixed(1)
      : "N/A";

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const renderReviewCard = (review) => {
    const priceOpinionData = review.price_opinion
      ? getPriceOpinionLabel(review.price_opinion)
      : null;
    const formattedAiReview =
      review.source === "ai" ? formatAiReviewText(review.text) : null;

    return (
      <div
        key={review.id}
        className="bg-[#0D0D0D] rounded-xl p-4 border border-[#1F1F1F] relative transition-all hover:border-[#2A2B38]"
      >
        {review.isOwn && (
          <button
            onClick={() => handleDeleteReview(review)}
            disabled={deleteReviewMutation.isPending}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-600/20 hover:bg-red-600/30 flex items-center justify-center transition-colors disabled:opacity-50"
            aria-label="Delete review"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        )}

        <div className="flex items-start gap-3 mb-3">
          <UserAvatar
            src={review.author_photo}
            name={review.author_name}
            size="md"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-1 pr-8">
              <div>
                <h4 className="font-semibold text-white text-sm">
                  {review.author_name}
                </h4>
                {priceOpinionData && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-sm font-bold text-green-400">
                      {priceOpinionData.symbol}
                    </span>
                    <span className="text-xs text-gray-400">
                      {priceOpinionData.label}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {review.relative_time_description ||
                  formatReviewDate(review.time)}
              </span>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < review.rating
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {formattedAiReview ? (
          <div className="space-y-3">
            {formattedAiReview.paragraphs.map((para, idx) => {
              const parts = para.split(/\*\*([^*]+)\*\*/g);
              return (
                <p key={idx} className="text-gray-300 text-sm leading-relaxed">
                  {parts.map((part, i) =>
                    i % 2 === 1 ? (
                      <strong key={i} className="font-semibold text-white">
                        {part}
                      </strong>
                    ) : (
                      part
                    )
                  )}
                </p>
              );
            })}

            {formattedAiReview.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {formattedAiReview.badges.map((badge, idx) => {
                  const Icon = badge.icon;
                  const colorClass =
                    badge.type === "price"
                      ? "bg-green-600/20 text-green-400 border-green-600/30"
                      : badge.type === "hours"
                      ? "bg-blue-600/20 text-blue-400 border-blue-600/30"
                      : badge.type === "reservation" || badge.type === "timing"
                      ? "bg-orange-600/20 text-orange-400 border-orange-600/30"
                      : "bg-purple-600/20 text-purple-400 border-purple-600/30";

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs ${colorClass}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="font-medium">{badge.text}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {formattedAiReview.sources.length > 0 && (
              <div className="pt-3 border-t border-[#2A2B38] mt-3">
                <p className="text-xs text-gray-500 mb-1.5">Sources:</p>
                <div className="flex flex-wrap gap-2">
                  {formattedAiReview.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      [{source.name}]
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-300 text-sm leading-relaxed">{review.text}</p>
        )}
      </div>
    );
  };

  const tabs = [
    { id: "general", label: "General", Icon: Info },
    { id: "reviews", label: "Reviews", Icon: Star },
    { id: "photos", label: "Photos", Icon: Camera },
    { id: "favorites", label: "Favorites", Icon: Heart },
    { id: "directions", label: "Directions", Icon: Navigation },
  ];

  const formatOpeningHours = () => {
    if (!place.opening_hours || !place.opening_hours.weekday_text) {
      return <p className="text-gray-400">Opening hours not available.</p>;
    }

    return place.opening_hours.weekday_text.map((dayText, idx) => {
      const parts = dayText.split(": ");
      const day = parts[0];
      const hours = parts[1] || "Closed";
      const isClosed = hours.toLowerCase() === "closed";

      return (
        <div key={idx} className="flex justify-between">
          <span className="text-gray-400">{day}</span>
          <span
            className={`font-medium ${
              isClosed ? "text-red-400" : "text-white"
            }`}
          >
            {hours}
          </span>
        </div>
      );
    });
  };

  const handleImageError = (index) => {
    setImageErrors((prev) => new Set([...prev, index]));
  };

  const openPhotoModal = (index) => {
    setSelectedPhotoIndex(index);
  };

  const closePhotoModal = () => {
    setSelectedPhotoIndex(null);
  };

  const nextPhoto = () => {
    if (normalizedPhotos.length > 0 && selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % normalizedPhotos.length);
    }
  };

  const prevPhoto = () => {
    if (normalizedPhotos.length > 0 && selectedPhotoIndex !== null) {
      setSelectedPhotoIndex(
        (selectedPhotoIndex - 1 + normalizedPhotos.length) %
          normalizedPhotos.length
      );
    }
  };

  const handlePhotoModalKeyDown = (e) => {
    if (e.key === "Escape") closePhotoModal();
    if (e.key === "ArrowRight") nextPhoto();
    if (e.key === "ArrowLeft") prevPhoto();
  };

  return (
    <aside className="place-panel">
      {renderConfirmationModal()}
      <style>{`
        :root {
          --sat: env(safe-area-inset-top, 0px);
        }

        .place-panel {
          position: relative;
          height: 100%;
          background: #0D0D0D;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .place-header {
          flex-shrink: 0;
          background: #0D0D0D;
          border-bottom: 1px solid #1F1F1F;
          padding: 16px;
          z-index: 10;
        }

        .place-tabs-fixed {
          flex-shrink: 0;
          background: #0D0D0D;
          padding: 8px 16px;
          border-bottom: 1px solid #1F1F1F;
          z-index: 9;
        }

        .place-tabs-fixed.scrolling {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .place-content-scroll {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          padding: 16px;
        }

        .place-content-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .place-content-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .place-content-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .place-content-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .place-tabs {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }

        @media (max-width: 720px) {
          .place-tabs {
            grid-template-columns: repeat(auto-fit, minmax(92px, 1fr));
          }
        }

        .place-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 64px;
          padding: 10px 8px;
          background: #1B1F2A;
          border-radius: 10px;
          color: #9CA3AF;
          font-weight: 600;
          font-size: 13px;
          line-height: 1.1;
          user-select: none;
          border: none;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .place-tab .icon {
          width: 22px;
          height: 22px;
          display: inline-block;
        }

        .place-tab[aria-selected="true"] {
          background: #2563EB;
          color: #FFFFFF;
        }

        .place-tab:hover:not([aria-selected="true"]) {
          background: #252A38;
          color: #D1D5DB;
        }

        .place-tab:focus-visible {
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.45);
        }

        .place-tab span.label {
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }

        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      <header ref={headerRef} id="placeHeaderFix" className="place-header">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-900/50 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white leading-tight truncate">
                  {place.name}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5 truncate">
                  {place.formatted_address || place.address}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onAddToTrip && (
              <Button
                onClick={() => {
                  onAddToTrip();
                }}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-4 py-2 h-10 text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 border-0"
              >
                Add to Trip
              </Button>
            )}

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {place.rating && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(place.rating || 0)
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-white">
                {place.rating ? parseFloat(place.rating).toFixed(1) : "N/A"}
              </span>
              <span className="text-sm text-gray-500">
                ({googleRatingsTotal.toLocaleString()} reviews)
              </span>
            </div>
          )}

          {priceInfo && (
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${priceInfo.color}`}>
                {priceInfo.symbol}
              </span>
              <span className="text-sm text-gray-300 font-medium">
                {priceInfo.label}
              </span>
              <span className="text-xs text-gray-500">
                ({priceInfo.estimate})
              </span>
            </div>
          )}
        </div>
      </header>

      <nav
        ref={tabsRef}
        id="placeTabsFix"
        className={`place-tabs-fixed ${isScrolling ? "scrolling" : ""}`}
        role="tablist"
        aria-label="Place sections"
      >
        <div className="place-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className="place-tab"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.Icon className="icon" aria-hidden="true" />
              <span className="label">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div
        ref={scrollRef}
        id="placeScroll"
        className="flex-1 overflow-y-auto scrollbar-hide"
      >
        {activeTab === "general" && (
          <div className="p-6 space-y-6">
            <div className="bg-[#111827] rounded-xl p-4 border border-[#1F1F1F]">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Opening Hours</h3>
                {place.opening_hours?.open_now !== undefined && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      place.opening_hours.open_now
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {place.opening_hours.open_now ? "Open now" : "Closed"}
                  </span>
                )}
              </div>
              <div className="space-y-1.5 text-sm">{formatOpeningHours()}</div>
            </div>

            <div className="bg-[#111827] rounded-xl p-4 border border-[#1F1F1F]">
              <h3 className="font-semibold text-white mb-2">About</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {place.description ||
                  "A wonderful place to visit with stunning views and great atmosphere. Perfect for spending quality time with family and friends."}
              </p>
            </div>

            {(place.formatted_phone_number || place.website) && (
              <div className="bg-[#111827] rounded-xl p-4 border border-[#1F1F1F]">
                <h3 className="font-semibold text-white mb-3">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  {place.formatted_phone_number && (
                    <a
                      href={`tel:${place.formatted_phone_number}`}
                      className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                    >
                      <Phone className="w-4 h-4" />
                      {place.formatted_phone_number}
                    </a>
                  )}
                  {place.website && (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                    >
                      <Globe className="w-4 h-4" />
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            )}

            {place.photos && place.photos.length > 0 && (
              <div>
                <h3 className="font-semibold text-white mb-3">Photos</h3>
                <div className="grid grid-cols-2 gap-2"></div>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Reviews ({totalReviews})
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(parseFloat(averageRating))
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {averageRating}
                  </span>
                  <span className="text-sm text-gray-500">average</span>
                </div>
              </div>
            </div>

            {formattedUserReviews.length > 0 ? (
              <div className="space-y-3">
                {formattedUserReviews.map(renderReviewCard)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <p className="text-sm text-gray-400">No reviews yet</p>
                <p className="text-xs text-gray-500">
                  Be the first to review this place!
                </p>
              </div>
            )}

            <div className="bg-[#111827] rounded-xl p-4 border border-[#1F1F1F]">
              <h4 className="font-semibold text-white mb-3">
                Share your experience
              </h4>

              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">
                  Your Rating <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoveredStar || reviewRating)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {priceLevel > 0 && (
                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-2 block">
                    Price Opinion <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "cheap", label: "Cheap", symbol: "$" },
                      { value: "fair", label: "Fair", symbol: "$$" },
                      { value: "expensive", label: "Expensive", symbol: "$$$" },
                      {
                        value: "very_expensive",
                        label: "Very Expensive",
                        symbol: "$$$$",
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setReviewPriceOpinion(option.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                          reviewPriceOpinion === option.value
                            ? "bg-blue-600 text-white"
                            : "bg-[#0D0D0D] text-gray-400 hover:bg-[#1F1F1F]"
                        }`}
                      >
                        <span className="font-bold text-green-400">
                          {option.symbol}
                        </span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">
                  Your Experience <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full bg-[#0D0D0D] border border-[#2A2B38] rounded-lg p-3 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <Button
                onClick={handleSubmitReview}
                disabled={addReviewMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
              >
                {addReviewMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  "POST REVIEW"
                )}
              </Button>
            </div>
          </div>
        )}

        {activeTab === "photos" && (
          <div className="p-6">
            {normalizedPhotos && normalizedPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {normalizedPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => openPhotoModal(idx)}
                    className="aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity"
                    style={{
                      backgroundImage: imageErrors.has(idx)
                        ? "linear-gradient(to bottom right, rgba(147, 51, 234, 0.2), rgba(219, 39, 119, 0.2))"
                        : `url(${photo})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    {imageErrors.has(idx) && (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ImageIcon className="w-16 h-16 text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg font-medium">
                  No photos available
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  This place doesn't have any photos yet
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <div className="p-6">
            <div className="bg-[#111827] rounded-xl p-6 border border-[#1F1F1F] text-center">
              <div className="mb-4">
                <Heart
                  className={`w-16 h-16 mx-auto mb-4 ${
                    isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"
                  }`}
                />
                <h3 className="text-xl font-bold text-white mb-2">
                  {isFavorited ? "Added to Favorites" : "Add to Favorites"}
                </h3>
                <p className="text-gray-400 text-sm">
                  {isFavorited
                    ? "You've saved this place to your favorites. Remove it to stop seeing it in your favorites list."
                    : "Save this place to quickly access it later. Your favorites are synced across all devices."}
                </p>
              </div>

              <Button
                onClick={async () => {
                  if (!user) {
                    openLoginModal?.();
                    return;
                  }
                  try {
                    await togglePlaceFavorite(placeId);
                  } catch (error) {
                    console.error("Error toggling favorite:", error);
                  }
                }}
                disabled={isTogglingPlace}
                className={`w-full h-12 font-semibold text-base ${
                  isFavorited
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
                }`}
              >
                {isTogglingPlace ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {isFavorited ? "Removing..." : "Adding..."}
                  </>
                ) : (
                  <>
                    <Heart
                      className={`w-5 h-5 mr-2 ${
                        isFavorited ? "fill-white" : ""
                      }`}
                    />
                    {isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {activeTab === "directions" && (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="max-w-md w-full space-y-6">
              <div className="text-center mb-8">
                <Navigation className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Get Directions
                </h3>
                <p className="text-gray-400 text-sm">
                  Choose your preferred mode of transportation and click the
                  button below to get directions to this location.
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-3 font-medium">
                  Select transportation mode:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTransportMode("walking")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      transportMode === "walking"
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-[#111827] border-[#2A2B38] text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    <Footprints className="w-6 h-6" />
                    <span className="text-sm font-medium">Walking</span>
                  </button>

                  <button
                    onClick={() => setTransportMode("driving")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      transportMode === "driving"
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-[#111827] border-[#2A2B38] text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    <Car className="w-6 h-6" />
                    <span className="text-sm font-medium">Car</span>
                  </button>

                  <button
                    onClick={() => setTransportMode("transit")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      transportMode === "transit"
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-[#111827] border-[#2A2B38] text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    <Bus className="w-6 h-6" />
                    <span className="text-sm font-medium">Public Transit</span>
                  </button>

                  <button
                    onClick={() => setTransportMode("bicycling")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      transportMode === "bicycling"
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-[#111827] border-[#2A2B38] text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    <Bike className="w-6 h-6" />
                    <span className="text-sm font-medium">Bike</span>
                  </button>
                </div>
              </div>

              <Button
                onClick={() => {
                  const destination = encodeURIComponent(
                    place.formatted_address || place.address || place.name
                  );
                  const travelModeMap = {
                    walking: "walking",
                    driving: "driving",
                    transit: "transit",
                    bicycling: "bicycling",
                  };
                  const travelMode = travelModeMap[transportMode] || "driving";
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=${travelMode}`;
                  window.open(url, "_blank");
                }}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-semibold text-base"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Open in Maps
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedPhotoIndex !== null && normalizedPhotos.length > 0 && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={closePhotoModal}
          onKeyDown={handlePhotoModalKeyDown}
          tabIndex={0}
        >
          <button
            onClick={closePhotoModal}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all border border-white/20"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="absolute top-6 left-6 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white font-medium text-xs border border-white/10">
            {selectedPhotoIndex + 1} / {normalizedPhotos.length}
          </div>

          {place.photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
              className="absolute left-6 top-1/2 -translate-y-2/4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all border border-white/20"
              aria-label="Previous photo"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {place.photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              className="absolute right-6 top-1/2 -translate-y-2/4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all border border-white/20"
              aria-label="Next photo"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          <div
            className="max-w-[90vw] max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {imageErrors.has(selectedPhotoIndex) ? (
              <div className="w-[80vw] h-[80vh] flex items-center justify-center">
                <ImagePlaceholder type="image" />
              </div>
            ) : (
              <img
                src={normalizedPhotos[selectedPhotoIndex]}
                alt={`${place.name} ${selectedPhotoIndex + 1}`}
                className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                onError={() => handleImageError(selectedPhotoIndex)}
              />
            )}
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md text-white font-medium text-sm border border-white/10">
            {place.name}
          </div>
        </div>
      )}
    </aside>
  );
}
