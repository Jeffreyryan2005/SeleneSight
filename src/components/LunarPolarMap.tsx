"use client";

import React, { useState } from "react";
import { LunarSite } from "../lib/artemisSites";
import { SOUTH_POLE_CRATERS } from "../lib/kaggleCraterDb";
import { Layers, MapPin, Eye, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

interface LunarPolarMapProps {
  sites: LunarSite[];
  selectedSite: LunarSite;
  onSelectSite: (site: LunarSite) => void;
  onCustomCoordinatePick: (lat: number, lon: number) => void;
}

export function LunarPolarMap({
  sites,
  selectedSite,
  onSelectSite,
  onCustomCoordinatePick,
}: LunarPolarMapProps) {
  const [showSlopes, setShowSlopes] = useState(true);
  const [showPsrs, setShowPsrs] = useState(true);
  const [showKaggleCraters, setShowKaggleCraters] = useState(true);

  // Map projection: Polar Stereographic
  // Center (280, 280) is South Pole (lat = -90°)
  // Radius = (90 + lat) * scale. At -84° (6° from pole), radius is ~240px.
  const mapCenter = 280;
  const mapSize = 560;
  const maxColatitude = 10.0; // Show down to -80° latitude
  const scale = (mapCenter - 30) / maxColatitude;

  const latLonToXY = (lat: number, lon: number) => {
    const colat = Math.abs(lat) - 90.0; // negative or positive distance from pole
    const r = Math.abs(90.0 + lat) * scale;
    // lon in degrees: 0° points up (top), 90° East points right
    const lonRad = ((lon - 90) * Math.PI) / 180;
    const x = mapCenter + r * Math.cos(lonRad);
    const y = mapCenter + r * Math.sin(lonRad);
    return { x, y, r };
  };

  const xyToLatLon = (x: number, y: number) => {
    const dx = x - mapCenter;
    const dy = y - mapCenter;
    const r = Math.sqrt(dx * dx + dy * dy);
    const colat = r / scale;
    const lat = Number((-90.0 + colat).toFixed(2));
    let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (angleDeg < 0) angleDeg += 360;
    const lon = Number(angleDeg.toFixed(2));
    return { lat, lon };
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * mapSize;
    const clickY = ((e.clientY - rect.top) / rect.height) * mapSize;
    const { lat, lon } = xyToLatLon(clickX, clickY);

    if (lat <= -80.0 && lat >= -90.0) {
      onCustomCoordinatePick(lat, lon);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3 font-mono">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Lunar South Pole GIS Stereographic Map
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            80°S to 90°S • Click any crater or coordinate to reposition navigator
          </p>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-2 text-[11px]">
          <button
            onClick={() => setShowSlopes(!showSlopes)}
            className={`px-2 py-1 rounded border transition-colors ${
              showSlopes
                ? "bg-amber-950/60 border-amber-600/80 text-amber-300"
                : "bg-slate-950 border-slate-800 text-slate-500"
            }`}
          >
            Slope Hazards
          </button>
          <button
            onClick={() => setShowPsrs(!showPsrs)}
            className={`px-2 py-1 rounded border transition-colors ${
              showPsrs
                ? "bg-cyan-950/60 border-cyan-600/80 text-cyan-300"
                : "bg-slate-950 border-slate-800 text-slate-500"
            }`}
          >
            Water-Ice PSRs
          </button>
          <button
            onClick={() => setShowKaggleCraters(!showKaggleCraters)}
            className={`px-2 py-1 rounded border transition-colors ${
              showKaggleCraters
                ? "bg-purple-950/60 border-purple-600/80 text-purple-300"
                : "bg-slate-950 border-slate-800 text-slate-500"
            }`}
          >
            Kaggle Craters
          </button>
        </div>
      </div>

      {/* SVG Stereographic Map */}
      <div className="relative w-full aspect-square max-w-[620px] mx-auto bg-slate-950 rounded-xl border border-slate-800/90 overflow-hidden shadow-inner">
        <svg
          viewBox={`0 0 ${mapSize} ${mapSize}`}
          className="w-full h-full cursor-crosshair select-none"
          onClick={handleMapClick}
        >
          <defs>
            {/* Crater Pattern */}
            <radialGradient id="poleGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="80%" stopColor="#020617" />
              <stop offset="100%" stopColor="#091427" />
            </radialGradient>
            <radialGradient id="psrGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0369a1" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#082f49" stopOpacity="0.2" />
            </radialGradient>
          </defs>

          {/* Lunar Disk Background */}
          <rect width={mapSize} height={mapSize} fill="#020617" />
          <circle cx={mapCenter} cy={mapCenter} r={mapCenter - 15} fill="url(#poleGlow)" stroke="#1e293b" strokeWidth="2" />

          {/* Latitude Concentric Rings */}
          {[-88, -86, -84, -82].map((lat) => {
            const { r } = latLonToXY(lat, 0);
            return (
              <g key={lat}>
                <circle
                  cx={mapCenter}
                  cy={mapCenter}
                  r={r}
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />
                <text
                  x={mapCenter + 4}
                  y={mapCenter - r - 3}
                  fill="#475569"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {lat}°S
                </text>
              </g>
            );
          })}

          {/* Longitude Spokes */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((lon) => {
            const { x, y } = latLonToXY(-80, lon);
            return (
              <line
                key={lon}
                x1={mapCenter}
                y1={mapCenter}
                x2={x}
                y2={y}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="2 6"
              />
            );
          })}

          {/* Major South Pole Craters (Kaggle Robbins Database) */}
          {showKaggleCraters &&
            SOUTH_POLE_CRATERS.map((crater) => {
              const { x, y } = latLonToXY(crater.lat, crater.lon);
              const craterRadiusPx = (crater.diameterKm / 2 / 1737.4) * (scale * (180 / Math.PI));
              const r = Math.max(8, craterRadiusPx * 2.8);

              return (
                <g key={crater.id} className="pointer-events-none">
                  {/* Crater Body */}
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill={crater.hasIceVolatiles && showPsrs ? "url(#psrGrad)" : "#1e293b"}
                    stroke={crater.hasIceVolatiles ? "#38bdf8" : "#475569"}
                    strokeWidth="1.2"
                    strokeDasharray={crater.morphology === "Degraded" ? "3 2" : "none"}
                    opacity="0.8"
                  />
                  {/* Crater Name */}
                  <text
                    x={x}
                    y={y + r + 11}
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {crater.name}
                  </text>
                </g>
              );
            })}

          {/* South Pole Marker (-90°) */}
          <circle cx={mapCenter} cy={mapCenter} r="3" fill="#ef4444" />
          <text
            x={mapCenter}
            y={mapCenter - 7}
            fill="#ef4444"
            fontSize="9"
            fontFamily="monospace"
            textAnchor="middle"
            fontWeight="bold"
          >
            SOUTH POLE (90°S)
          </text>

          {/* Artemis Candidate Landing Sites */}
          {sites.map((site) => {
            const { x, y } = latLonToXY(site.lat, site.lon);
            const isSelected = selectedSite.id === site.id;
            const isHistorical = site.primaryTarget === "Historical Benchmark";

            return (
              <g
                key={site.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSite(site);
                }}
                className="cursor-pointer group"
              >
                {/* Slope Hazard Ring */}
                {showSlopes && (
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? "14" : "10"}
                    fill="none"
                    stroke={
                      site.averageSlopeDeg < 5.0
                        ? "#10b981"
                        : site.averageSlopeDeg < 8.0
                        ? "#f59e0b"
                        : "#ef4444"
                    }
                    strokeWidth="1.5"
                    strokeOpacity={isSelected ? 0.9 : 0.4}
                    strokeDasharray="2 2"
                  />
                )}

                {/* Pin Core */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? "6" : "4"}
                  fill={isSelected ? "#38bdf8" : isHistorical ? "#a855f7" : "#0284c7"}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? "2" : "1"}
                  className="transition-transform group-hover:scale-125"
                />

                {/* Pin Label on Select */}
                {isSelected && (
                  <g className="pointer-events-none">
                    <rect
                      x={x - 45}
                      y={y - 25}
                      width="90"
                      height="16"
                      rx="3"
                      fill="#020617"
                      stroke="#38bdf8"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={y - 14}
                      fill="#38bdf8"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {site.name.slice(0, 14)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend Overlay in corner */}
        <div className="absolute bottom-2 left-2 bg-slate-950/90 border border-slate-800 rounded p-2 text-[10px] text-slate-300 font-mono space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Artemis III Candidate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Historical Benchmark</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Slope &lt; 5° (Safe)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
