"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, Circle, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export interface Incident {
  id: string;
  lat: number;
  lng: number;
  category: string;
  date: string;
  time: string;
  description: string;
  meTooCount?: number;
}

interface MapProps {
  incidents: Incident[];
  onMapClick: (lat: number, lng: number) => void;
  onMeToo?: (id: string) => void;
  userVotedIncidentIds?: string[];
  isModalOpen?: boolean;
  onCloseModal?: () => void;
}

function isWithinTrinidadAndTobago(lat: number, lng: number): boolean {
  const MIN_LAT = 10.0;
  const MAX_LAT = 11.4;
  const MIN_LNG = -61.9;
  const MAX_LNG = -60.4;
  return lat >= MIN_LAT && lat <= MAX_LAT && lng >= MIN_LNG && lng <= MAX_LNG;
}

function MapClickHandler({
  onMapClick,
  isModalOpen,
  onCloseModal,
}: {
  onMapClick: (lat: number, lng: number) => void;
  isModalOpen?: boolean;
  onCloseModal?: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    const handlePopupCloseClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest(".custom-popup-close-btn")) {
        map.closePopup();
      }
    };

    document.addEventListener("click", handlePopupCloseClick);
    return () => {
      document.removeEventListener("click", handlePopupCloseClick);
    };
  }, [map]);

  useMapEvents({
    click(e) {
      if (isModalOpen && onCloseModal) {
        onCloseModal();
        return;
      }

      const target = e.originalEvent.target as HTMLElement | null;
      if (
        target &&
        (target.closest(".leaflet-popup") ||
          target.closest(".leaflet-marker-icon") ||
          target.closest(".custom-popup-close-btn") ||
          target.closest(".custom-metoo-btn"))
      ) {
        return;
      }

      if (!isWithinTrinidadAndTobago(e.latlng.lat, e.latlng.lng)) {
        alert("Reports can only be placed within Trinidad & Tobago.");
        return;
      }

      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Map({
  incidents,
  onMapClick,
  onMeToo,
  userVotedIncidentIds = [],
  isModalOpen,
  onCloseModal,
}: MapProps) {
  const trinidadCenter: [number, number] = [10.5, -61.35];

  // Memoize density zones so they don't recalculate and destroy/rebuild Tooltips on every render
  const densityZones = useMemo(() => {
    return incidents.reduce((acc, current, _, arr) => {
      const nearby = arr.filter((other) => getDistanceKm(current.lat, current.lng, other.lat, other.lng) <= 5);

      if (nearby.length >= 3) {
        const exists = acc.some((zone) => getDistanceKm(zone.lat, zone.lng, current.lat, current.lng) < 3);
        if (!exists) {
          acc.push({
            lat: current.lat,
            lng: current.lng,
            count: nearby.length,
          });
        }
      }
      return acc;
    }, [] as { lat: number; lng: number; count: number }[]);
  }, [incidents]);

  return (
    <div className="w-full space-y-4">
      {/* Top Map Description Banner */}
      <div className="bg-slate-900/90 border border-pink-500/30 rounded-2xl p-4 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2 mb-1.5 text-pink-400 font-bold text-sm sm:text-base">
          <span>📍 Community Safety & Incident Map</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 border-t border-slate-800 pt-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0"></span>
            <span>
              <strong>How to Report:</strong> Click anywhere on the map to log a report.
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0"></span>
            <span>
              <strong>Caution Zones:</strong> Highlights area with 3+ nearby reports.
            </span>
          </div>
        </div>
      </div>

      {/* CSS Overrides */}
      <style jsx global>{`
        .leaflet-popup-close-button {
          display: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 1rem !important;
          padding: 4px !important;
          background-color: #0f172a !important;
          color: #f8fafc !important;
          border: 1px solid rgba(244, 63, 94, 0.3) !important;
        }
        .leaflet-popup-tip {
          background-color: #0f172a !important;
        }
        .leaflet-tooltip.custom-caution-tooltip {
          background-color: #0f172a;
          border: 1px solid rgba(244, 63, 94, 0.5);
          color: #f1f5f9;
          border-radius: 0.5rem;
          padding: 0.5rem;
        }
        .leaflet-tooltip-top.custom-caution-tooltip::before {
          border-top-color: #0f172a;
        }
      `}</style>

      {/* Map Container */}
      <div className="h-[490px] w-full rounded-2xl overflow-hidden border border-pink-900/40 shadow-2xl relative z-0">
        <MapContainer center={trinidadCenter} zoom={10} scrollWheelZoom={true} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          />

          <MapClickHandler onMapClick={onMapClick} isModalOpen={isModalOpen} onCloseModal={onCloseModal} />

          {/* Caution Zones */}
          {densityZones.map((zone) => (
            <Circle
              // Stable coordinate-based key prevents constant unmounting
              key={`zone-${zone.lat}-${zone.lng}`}
              center={[zone.lat, zone.lng]}
              radius={3000}
              pathOptions={{
                color: "#f43f5e",
                fillColor: "#e11d48",
                fillOpacity: 0.2,
                weight: 2,
                dashArray: "5, 5",
              }}
              eventHandlers={{
                click: (e) => {
                  if (isModalOpen && onCloseModal) {
                    onCloseModal();
                  } else {
                    onMapClick(e.latlng.lat, e.latlng.lng);
                  }
                },
              }}
            >
              <Tooltip sticky direction="top" className="custom-caution-tooltip">
                <div className="font-sans text-center">
                  <p className="font-bold text-xs text-rose-400">⚠️ Caution Zone</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">Click to report incident</p>
                </div>
              </Tooltip>
            </Circle>
          ))}

          {/* User-Reported Incident Markers */}
          {incidents.map((incident) => {
            const hasVoted = userVotedIncidentIds.includes(incident.id);

            return (
              <CircleMarker
                key={incident.id}
                center={[incident.lat, incident.lng]}
                radius={6}
                pathOptions={{
                  color: "#f43f5e",
                  fillColor: "#ec4899",
                  fillOpacity: 0.95,
                  weight: 1.5,
                }}
              >
                <Popup>
                  <div className="p-2 text-slate-100 font-sans min-w-[200px]">
                    <div className="inline-block px-2 py-0.5 text-[10px] font-bold rounded text-white bg-rose-600 mb-1.5">
                      {incident.category}
                    </div>
                    <h4 className="font-bold text-xs text-slate-100">{incident.description || "Reported Incident"}</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      📅 {incident.date} | 🕒 {incident.time}
                    </p>

                    <button
                      type="button"
                      onClick={() => onMeToo && onMeToo(incident.id)}
                      className={`custom-metoo-btn mt-2.5 w-full text-[11px] font-medium py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 border ${
                        hasVoted
                          ? "bg-pink-600 text-white border-pink-400 font-semibold"
                          : "bg-slate-800 hover:bg-pink-950/60 text-pink-300 border-pink-800/50"
                      }`}
                    >
                      <span>{hasVoted ? "✓ Experienced this too" : "✋ Experienced this too"}</span>
                      {incident.meTooCount && incident.meTooCount > 0 ? (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            hasVoted ? "bg-white text-pink-600" : "bg-pink-600 text-white"
                          }`}
                        >
                          {incident.meTooCount}
                        </span>
                      ) : null}
                    </button>

                    <button
                      type="button"
                      className="custom-popup-close-btn mt-2 w-full bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors shadow-md"
                    >
                      Close
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}