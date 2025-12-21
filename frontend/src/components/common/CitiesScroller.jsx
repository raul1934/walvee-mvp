import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createCityUrl } from "@/utils";

export default function CitiesScroller({
  cities,
  className = "",
  makeLinks = true,
  useButtons = false,
  showSeparators = true,
}) {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const navigate = useNavigate();

  const checkScroll = () => {
    const element = scrollRef.current;
    if (!element) return;

    setShowLeftArrow(element.scrollLeft > 5);
    setShowRightArrow(
      element.scrollLeft < element.scrollWidth - element.clientWidth - 5
    );
  };

  useEffect(() => {
    checkScroll();
    const element = scrollRef.current;
    if (element) {
      element.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }

    return () => {
      if (element) {
        element.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, [cities]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -100 : 100,
        behavior: "smooth",
      });
    }
  };

  if (!cities || cities.length === 0) return null;

  // If only one city
  if (cities.length === 1) {
    if (useButtons && cities[0].id) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(createCityUrl(cities[0].id));
          }}
          className={`${className} hover:text-blue-400 transition-colors text-left`}
        >
          {cities[0].name}
        </button>
      );
    }

    if (makeLinks && cities[0].id) {
      return (
        <Link
          to={createCityUrl(cities[0].id)}
          onClick={(e) => e.stopPropagation()}
          className={`${className} hover:text-blue-400 transition-colors`}
        >
          {cities[0].name}
        </Link>
      );
    }

    return <span className={className}>{cities[0].name}</span>;
  }

  return (
    <div className="relative flex items-center gap-1 min-w-0">
      {showLeftArrow && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            scroll("left");
          }}
          className="absolute left-0 z-10 w-5 h-5 flex items-center justify-center bg-[#1A1B23]/95 hover:bg-[#2A2B35] rounded-full transition-all shadow-lg"
        >
          <ChevronLeft className="w-3 h-3 text-gray-400" />
        </button>
      )}

      <div
        ref={scrollRef}
        className={`flex items-center gap-1.5 overflow-x-auto scrollbar-hide scroll-smooth ${className}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {cities.map((city, idx) => (
          <React.Fragment key={idx}>
            {useButtons && city.id ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(createCityUrl(city.id));
                }}
                className="whitespace-nowrap hover:text-blue-400 transition-colors text-left"
              >
                {city.name}
              </button>
            ) : makeLinks && city.id ? (
              <Link
                to={createCityUrl(city.id)}
                onClick={(e) => e.stopPropagation()}
                className="whitespace-nowrap hover:text-blue-400 transition-colors"
              >
                {city.name}
              </Link>
            ) : (
              <span className="whitespace-nowrap">{city.name}</span>
            )}
            {showSeparators && idx < cities.length - 1 && (
              <span className="text-gray-600">•</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {showRightArrow && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            scroll("right");
          }}
          className="absolute right-0 z-10 w-5 h-5 flex items-center justify-center bg-[#1A1B23]/95 hover:bg-[#2A2B35] rounded-full transition-all shadow-lg"
        >
          <ChevronRight className="w-3 h-3 text-gray-400" />
        </button>
      )}
    </div>
  );
}
