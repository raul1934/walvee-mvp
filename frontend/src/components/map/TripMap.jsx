import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/**
 * Component to auto-fit bounds when markers change
 */
function MapBounds({ markers, cityMarkers = [] }) {
  const map = useMap();

  useEffect(() => {
    const allMarkers = [...(cityMarkers || []), ...(markers || [])];

    if (allMarkers.length > 0) {
      const bounds = L.latLngBounds(allMarkers.map((m) => [m.lat, m.lng]));

      if (allMarkers.length === 1) {
        map.setView([allMarkers[0].lat, allMarkers[0].lng], 13);
      } else {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [markers, cityMarkers, map]);

  return null;
}

/**
 * Component to handle map centering and zoom
 */
function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

/**
 * Create numbered marker icon for places
 */
function createNumberedIcon(number) {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 32px;
        height: 42px;
        position: relative;
        display: flex;
        align-items: flex-start;
        justify-content: center;
      ">
        <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="marker-gradient-${number}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
          </defs>
          <path d="M16 0C7.163 0 0 7.163 0 16c0 16 16 26 16 26s16-10 16-26C32 7.163 24.837 0 16 0z"
                fill="url(#marker-gradient-${number})"
                stroke="#fff"
                stroke-width="2"/>
        </svg>
        <span style="
          position: absolute;
          top: calc(50% + 2px);
          left: 50%;
          transform: translate(-50%, -50%);
          margin-top: -5px;
          color: white;
          font-weight: bold;
          font-size: 14px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          line-height: 1;
          z-index: 100000;
        ">${number}</span>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
}

/**
 * Create city marker icon
 */
function createCityIcon() {
  return L.divIcon({
    className: "city-marker",
    html: `
      <div style="
        width: 28px;
        height: 28px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="city-marker-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
            </linearGradient>
          </defs>
          <circle cx="14" cy="14" r="12"
                  fill="url(#city-marker-gradient)"
                  stroke="#fff"
                  stroke-width="2"/>
          <circle cx="14" cy="14" r="4" fill="#fff"/>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

/**
 * TripMap Component - OpenStreetMap with Leaflet
 */
export default function TripMap({
  center = { lat: -23.5505, lng: -46.6333 }, // Default to São Paulo
  zoom = 13,
  markers = [],
  cityMarkers = [], // Array of city markers { lat, lng, title }
  onMarkerClick,
  selectedPlaceIndex,
  className = "",
}) {
  const mapRef = useRef(null);

  // Auto-center on selected place
  const selectedCenter =
    selectedPlaceIndex !== null && markers[selectedPlaceIndex]
      ? {
          lat: markers[selectedPlaceIndex].lat,
          lng: markers[selectedPlaceIndex].lng,
        }
      : null;

  const selectedZoom = selectedPlaceIndex !== null ? 16 : null;

  return (
    <div
      className={className}
      style={{ height: "100%", width: "100%", position: "relative" }}
    >
      <style>{`
        .leaflet-tile-pane {
          filter: grayscale(20%) brightness(0.85) contrast(1.1) hue-rotate(200deg) saturate(1.3);
        }
        .leaflet-control-attribution {
          background: rgba(17, 24, 39, 0.8) !important;
          color: rgba(156, 163, 175, 0.8) !important;
        }
        .leaflet-control-attribution a {
          color: rgba(147, 197, 253, 0.8) !important;
        }
      `}</style>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Auto-fit bounds when markers change */}
        {(markers.length > 0 || cityMarkers.length > 0) &&
          selectedPlaceIndex === null && (
            <MapBounds markers={markers} cityMarkers={cityMarkers} />
          )}

        {/* Control center and zoom for selected place */}
        {selectedCenter && selectedZoom && (
          <MapController
            center={[selectedCenter.lat, selectedCenter.lng]}
            zoom={selectedZoom}
          />
        )}

        {/* Render city markers */}
        {cityMarkers.map((cityMarker, index) => (
          <Marker
            key={`city-${cityMarker.id || index}`}
            position={[cityMarker.lat, cityMarker.lng]}
            icon={createCityIcon()}
          >
            <Popup>
              <div style={{ minWidth: "120px" }}>
                <strong>{cityMarker.title}</strong>
                {cityMarker.subtitle && (
                  <div
                    style={{
                      fontSize: "12px",
                      marginTop: "4px",
                      color: "#666",
                    }}
                  >
                    {cityMarker.subtitle}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render place markers */}
        {markers.map((marker, index) => (
          <Marker
            key={marker.id || index}
            position={[marker.lat, marker.lng]}
            icon={createNumberedIcon(marker.number || index + 1)}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(index);
                }
              },
            }}
          >
            {marker.title && (
              <Popup>
                <div style={{ minWidth: "150px" }}>
                  <strong>{marker.title}</strong>
                  {marker.address && (
                    <div
                      style={{
                        fontSize: "12px",
                        marginTop: "4px",
                        color: "#666",
                      }}
                    >
                      {marker.address}
                    </div>
                  )}
                  {marker.place_id && (
                    <div
                      style={{
                        fontSize: "11px",
                        marginTop: "6px",
                        padding: "4px 6px",
                        background: "rgba(147, 197, 253, 0.1)",
                        borderRadius: "4px",
                        color: "#93C5FD",
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                      }}
                    >
                      ID: {marker.place_id}
                    </div>
                  )}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
