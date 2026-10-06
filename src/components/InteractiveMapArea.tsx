import React, { useState } from 'react';
import {
  MapPin,
  Award,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Truck,
  Building2,
  Compass,
  Navigation,
} from 'lucide-react';
import { MandiEvaluation, UserLocationState } from '../types';

interface InteractiveMapAreaProps {
  userLocation: UserLocationState;
  nearbyMandis: MandiEvaluation[];
  recommendedMandiId: string;
  selectedMandiId: string;
  onSelectMandi: (mandiId: string) => void;
}

export const InteractiveMapArea: React.FC<InteractiveMapAreaProps> = ({
  userLocation,
  nearbyMandis,
  recommendedMandiId,
  selectedMandiId,
  onSelectMandi,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredMandi, setHoveredMandi] = useState<MandiEvaluation | null>(null);

  const hasUserLocation =
    userLocation.isCustomUserLocation &&
    typeof userLocation.lat === 'number' &&
    typeof userLocation.lng === 'number' &&
    !isNaN(userLocation.lat) &&
    !isNaN(userLocation.lng);

  // Compute bounding box for projection
  const allLats = [
    ...(hasUserLocation ? [userLocation.lat!] : []),
    ...nearbyMandis.map((m) => m.lat),
  ];
  const allLngs = [
    ...(hasUserLocation ? [userLocation.lng!] : []),
    ...nearbyMandis.map((m) => m.lng),
  ];

  const minLat = (allLats.length ? Math.min(...allLats) : 13.5) - 0.25;
  const maxLat = (allLats.length ? Math.max(...allLats) : 17.5) + 0.25;
  const minLng = (allLngs.length ? Math.min(...allLngs) : 77.0) - 0.3;
  const maxLng = (allLngs.length ? Math.max(...allLngs) : 82.5) + 0.3;

  const mapWidth = 800;
  const mapHeight = 420;
  const padding = 50;

  // Projection formula: convert (lat, lng) to (x, y)
  const project = (lat: number, lng: number) => {
    const x = padding + ((lng - minLng) / (maxLng - minLng || 1)) * (mapWidth - 2 * padding);
    const y = padding + ((maxLat - lat) / (maxLat - minLat || 1)) * (mapHeight - 2 * padding);
    return { x, y };
  };

  const userPos = hasUserLocation ? project(userLocation.lat!, userLocation.lng!) : null;
  const recommendedMandi = nearbyMandis.find((m) => m.id === recommendedMandiId);
  const recommendedPos = recommendedMandi ? project(recommendedMandi.lat, recommendedMandi.lng) : null;

  return (
    <div className="bg-white rounded-[20px] p-5 sm:p-6 border border-emerald-900/12 shadow-sm shadow-emerald-950/5">
      {/* Header and Map Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </span>
            <span>Regional Mandi Geospatial Map</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {hasUserLocation
              ? `Plotted relative to your verified GPS position (${userLocation.lat!.toFixed(4)}° N, ${userLocation.lng!.toFixed(4)}° E)`
              : 'Location unavailable in preview. Plotting regional Andhra Pradesh APMC mandis.'}
          </p>
        </div>

        {/* Legend: User, Nearby Markets, Recommended Market */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* User Location Marker Legend */}
          {hasUserLocation ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-blue-50 text-blue-900 border-blue-200">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="font-semibold">User (GPS)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-slate-100 text-slate-600 border-slate-200">
              <Navigation className="w-3.5 h-3.5 text-slate-400" />
              <span>User (Enable GPS)</span>
            </div>
          )}

          {/* Nearby Mandis Legend */}
          <div className="flex items-center gap-1.5 bg-[#F2F8F4] text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-lg">
            <Building2 className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-semibold">Nearby Markets</span>
          </div>

          {/* Recommended Marker Legend */}
          <div className="flex items-center gap-1.5 bg-emerald-900 text-white border border-emerald-800 px-2.5 py-1 rounded-lg shadow-2xs">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-bold">★ Recommended Market</span>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center bg-[#F2F7F4] p-0.5 rounded-lg border border-emerald-900/10">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1.5 hover:bg-white rounded text-slate-700 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
              className="p-1.5 hover:bg-white rounded text-slate-700 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:bg-white rounded text-slate-700 transition-colors cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map — Clean Light Map-Style Background */}
      <div className="relative rounded-2xl overflow-hidden border border-emerald-900/15 bg-gradient-to-br from-[#F2F8F4] via-[#F9FBF9] to-[#EEF5F0] shadow-inner">
        <div className="absolute inset-0 pointer-events-none bg-agri-grid"></div>

        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-auto min-h-[320px] sm:min-h-[380px] transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          {/* Topographic regional outline */}
          <path
            d="M 50 120 Q 200 80 400 130 T 750 180 Q 700 350 450 380 T 100 320 Z"
            fill="#ecfdf5"
            stroke="#a7f3d0"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            opacity="0.6"
          />

          {/* Route line connecting User to Recommended Mandi (ONLY when user location is available!) */}
          {hasUserLocation && userPos && recommendedPos && (
            <g>
              <line
                x1={userPos.x}
                y1={userPos.y}
                x2={recommendedPos.x}
                y2={recommendedPos.y}
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
              <g
                transform={`translate(${(userPos.x + recommendedPos.x) / 2}, ${
                  (userPos.y + recommendedPos.y) / 2
                })`}
              >
                <rect
                  x="-35"
                  y="-11"
                  width="70"
                  height="22"
                  rx="6"
                  fill="#ffffff"
                  stroke="#059669"
                  strokeWidth="1.5"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#047857"
                  fontFamily="sans-serif"
                >
                  {recommendedMandi?.distanceKm} km
                </text>
              </g>
            </g>
          )}

          {/* Nearby Mandi Markers */}
          {nearbyMandis.map((mandi) => {
            const pos = project(mandi.lat, mandi.lng);
            const isRecommended = mandi.id === recommendedMandiId;
            const isSelected = mandi.id === selectedMandiId;

            if (isRecommended) return null;

            return (
              <g
                key={mandi.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer group"
                onClick={() => onSelectMandi(mandi.id)}
                onMouseEnter={() => setHoveredMandi(mandi)}
                onMouseLeave={() => setHoveredMandi(null)}
              >
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? '11' : '8.5'}
                  fill={isSelected ? '#047857' : '#ffffff'}
                  stroke="#059669"
                  strokeWidth="2"
                  filter="drop-shadow(0 2px 3px rgba(0,0,0,0.12))"
                />
                <circle cx="0" cy="0" r="3" fill={isSelected ? '#ffffff' : '#059669'} />

                {/* Mandi Name Tag */}
                <rect
                  x="-50"
                  y="-26"
                  width="100"
                  height="17"
                  rx="4"
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  filter="drop-shadow(0 1px 2px rgba(0,0,0,0.06))"
                />
                <text
                  x="0"
                  y="-14"
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="600"
                  fill="#334155"
                  fontFamily="sans-serif"
                >
                  {mandi.name.split(' ')[0]} {mandi.distanceKm != null ? `(${mandi.distanceKm}km)` : ''}
                </text>
              </g>
            );
          })}

          {/* RECOMMENDED MANDI MARKER */}
          {recommendedMandi && recommendedPos && (
            <g
              transform={`translate(${recommendedPos.x}, ${recommendedPos.y})`}
              className="cursor-pointer"
              onClick={() => onSelectMandi(recommendedMandi.id)}
              onMouseEnter={() => setHoveredMandi(recommendedMandi)}
              onMouseLeave={() => setHoveredMandi(null)}
            >
              <circle cx="0" cy="0" r="22" fill="#10b981" opacity="0.25" className="animate-ping" />
              <circle cx="0" cy="0" r="16" fill="#064e3b" stroke="#fbbf24" strokeWidth="2.5" />

              <path
                d="M 0 -7 L 2 -2 L 7 -1.5 L 3.5 2 L 4.5 7 L 0 4.5 L -4.5 7 L -3.5 2 L -7 -1.5 L -2 -2 Z"
                fill="#fbbf24"
              />

              <g transform="translate(0, -30)">
                <rect
                  x="-74"
                  y="-15"
                  width="148"
                  height="24"
                  rx="6"
                  fill="#064e3b"
                  stroke="#10b981"
                  strokeWidth="1"
                  filter="drop-shadow(0 3px 5px rgba(0,0,0,0.18))"
                />
                <text
                  x="0"
                  y="1"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="#ffffff"
                  fontFamily="sans-serif"
                >
                  ★ {recommendedMandi.name.split('(')[0]}
                </text>
              </g>

              <g transform="translate(0, 22)">
                <rect
                  x="-48"
                  y="-8"
                  width="96"
                  height="17"
                  rx="4"
                  fill="#065f46"
                  filter="drop-shadow(0 2px 3px rgba(0,0,0,0.12))"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#a7f3d0"
                  fontFamily="monospace"
                >
                  {recommendedMandi.netReturnPerQuintal != null
                    ? `₹${recommendedMandi.netReturnPerQuintal}/Q Net`
                    : `₹${recommendedMandi.currentPrice}/Q Spot`}
                </text>
              </g>
            </g>
          )}

          {/* REAL USER LOCATION MARKER - ONLY rendered when actual GPS permission is granted! */}
          {hasUserLocation && userPos && (
            <g transform={`translate(${userPos.x}, ${userPos.y})`}>
              <circle cx="0" cy="0" r="20" fill="#3b82f6" opacity="0.25" className="animate-ping" />
              <circle cx="0" cy="0" r="13" fill="#60a5fa" opacity="0.4" />
              <circle
                cx="0"
                cy="0"
                r="7"
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="2.5"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.25))"
              />
              <g transform="translate(0, -22)">
                <rect
                  x="-55"
                  y="-13"
                  width="110"
                  height="20"
                  rx="5"
                  fill="#1e3a8a"
                  filter="drop-shadow(0 2px 5px rgba(0,0,0,0.2))"
                />
                <text
                  x="0"
                  y="1"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#ffffff"
                  fontFamily="sans-serif"
                >
                  📍 Your Location
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* Hovered Mandi Floating Info Card */}
        {hoveredMandi && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md p-3 rounded-xl border border-emerald-200 shadow-lg text-xs animate-fade-in pointer-events-none">
            <div className="flex items-center justify-between mb-1">
              <span className="font-extrabold text-slate-800">{hoveredMandi.name}</span>
              {hoveredMandi.id === recommendedMandiId && (
                <span className="text-[10px] font-bold bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded">
                  Best Net Gain
                </span>
              )}
            </div>
            <div className="text-slate-500 mb-1.5 text-[11px]">
              {hoveredMandi.district} • {hoveredMandi.distanceKm != null ? `${hoveredMandi.distanceKm} km from you` : 'Location unavailable in preview'}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px]">Mandi Price</span>
                <span className="font-bold text-slate-800">
                  ₹{hoveredMandi.currentPrice.toLocaleString('en-IN')}/Q
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">
                  {hoveredMandi.netReturnPerQuintal != null ? 'Net Realization' : '7-Day Forecast'}
                </span>
                <span className="font-extrabold text-emerald-700">
                  {hoveredMandi.netReturnPerQuintal != null
                    ? `₹${hoveredMandi.netReturnPerQuintal.toLocaleString('en-IN')}/Q`
                    : `₹${hoveredMandi.predictedPrice7d.toLocaleString('en-IN')}/Q`}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
