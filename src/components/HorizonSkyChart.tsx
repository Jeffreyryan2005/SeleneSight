"use client";

import React, { useState } from "react";
import { HorizonProfilePoint } from "../lib/horizonMath";
import { CelestialState } from "../lib/ephemerisEngine";
import { Sun, Globe, Mountain, Compass, Eye, ShieldAlert, Sparkles } from "lucide-react";

interface HorizonSkyChartProps {
  horizonPoints: HorizonProfilePoint[];
  celestialState: CelestialState;
  siteName: string;
}

export function HorizonSkyChart({
  horizonPoints,
  celestialState,
  siteName,
}: HorizonSkyChartProps) {
  const [viewMode, setViewMode] = useState<"panoramic" | "polar">("panoramic");
  const [hoveredAz, setHoveredAz] = useState<number | null>(null);

  // SVG dimensions for panoramic ribbon
  const svgWidth = 800;
  const svgHeight = 280;
  const padding = { top: 30, right: 20, bottom: 40, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Elevation scale: -3° to +20°
  const minElev = -3;
  const maxElev = 18;
  const elevRange = maxElev - minElev;

  const getX = (azDeg: number) => padding.left + (azDeg / 360) * graphWidth;
  const getY = (elevDeg: number) =>
    padding.top + graphHeight - ((elevDeg - minElev) / elevRange) * graphHeight;

  // Build horizon polygon path
  const horizonPathD = horizonPoints.reduce((acc, pt, idx) => {
    const x = getX(pt.azimuthDeg);
    const y = getY(pt.elevationDeg);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, "");

  // Close the polygon to the bottom of the graph
  const groundPolygonD = `${horizonPathD} L ${getX(360)} ${getY(minElev)} L ${getX(0)} ${getY(minElev)} Z`;

  // Sun and Earth coordinates
  const sunX = getX(celestialState.sunAzimuthDeg);
  const sunY = getY(celestialState.sunElevationDeg);

  const earthX = getX(celestialState.earthAzimuthDeg);
  const earthY = getY(celestialState.earthElevationDeg);

  const hoveredPoint =
    hoveredAz !== null ? horizonPoints[Math.floor(hoveredAz)] || null : null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
      {/* Chart Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Mountain className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              360° Local Topographic Horizon & Sky Tracking
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Obstruction line from LOLA DEM vs. Real-time Sun & Earth Topocentric Vectors
          </p>
        </div>

        {/* View Mode Toggle & Telemetry Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px] font-mono">
            <button
              onClick={() => setViewMode("panoramic")}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === "panoramic"
                  ? "bg-cyan-900/80 text-cyan-200 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Panoramic (0-360°)
            </button>
            <button
              onClick={() => setViewMode("polar")}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === "polar"
                  ? "bg-cyan-900/80 text-cyan-200 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Polar Dome
            </button>
          </div>
        </div>
      </div>

      {/* Main Visualizer Canvas */}
      {viewMode === "panoramic" ? (
        <div className="relative w-full overflow-hidden bg-slate-950 rounded-lg border border-slate-800/80 p-1">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto select-none"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clientX = e.clientX - rect.left;
              const scale = svgWidth / rect.width;
              const svgX = clientX * scale;
              const normX = Math.max(0, Math.min(graphWidth, svgX - padding.left));
              const az = Math.floor((normX / graphWidth) * 360);
              setHoveredAz(az);
            }}
            onMouseLeave={() => setHoveredAz(null)}
          >
            <defs>
              {/* Gradients */}
              <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#334155" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.98" />
              </linearGradient>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#020617" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#091427" stopOpacity="0.7" />
              </linearGradient>
              {/* Glow filter for Sun */}
              <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="earthGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Sky Background */}
            <rect
              x={padding.left}
              y={padding.top}
              width={graphWidth}
              height={graphHeight}
              fill="url(#skyGrad)"
            />

            {/* Elevation Horizontal Grid Lines */}
            {[-2, 0, 5, 10, 15].map((elev) => {
              const y = getY(elev);
              const isZero = elev === 0;
              return (
                <g key={elev}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + graphWidth}
                    y2={y}
                    stroke={isZero ? "#38bdf8" : "#1e293b"}
                    strokeWidth={isZero ? "1.5" : "1"}
                    strokeDasharray={isZero ? "4 4" : "none"}
                    strokeOpacity={isZero ? 0.7 : 0.4}
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    fill={isZero ? "#38bdf8" : "#64748b"}
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {elev > 0 ? `+${elev}°` : `${elev}°`}
                  </text>
                </g>
              );
            })}

            {/* Azimuth Vertical Cardinal Lines */}
            {[
              { az: 0, label: "N (0°)" },
              { az: 90, label: "E (90°)" },
              { az: 180, label: "S (180°)" },
              { az: 270, label: "W (270°)" },
              { az: 360, label: "N (360°)" },
            ].map(({ az, label }) => {
              const x = getX(az);
              return (
                <g key={az}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + graphHeight}
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray="2 4"
                  />
                  <text
                    x={x}
                    y={padding.top + graphHeight + 18}
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Lunar Horizon Ground Obstruction Profile */}
            <path d={groundPolygonD} fill="url(#groundGrad)" />
            <path
              d={horizonPathD}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Sun Vector Marker */}
            <g
              transform={`translate(${sunX}, ${sunY})`}
              filter={celestialState.isSunAboveHorizon ? "url(#sunGlow)" : "none"}
            >
              {celestialState.isSunAboveHorizon ? (
                <>
                  <circle r="12" fill="#fbbf24" fillOpacity="0.25" />
                  <circle r="7" fill="#f59e0b" />
                  <circle r="4" fill="#fef08a" />
                  {/* Rays */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                    const r1 = 9;
                    const r2 = 14;
                    const rad = (angle * Math.PI) / 180;
                    return (
                      <line
                        key={angle}
                        x1={Math.cos(rad) * r1}
                        y1={Math.sin(rad) * r1}
                        x2={Math.cos(rad) * r2}
                        y2={Math.sin(rad) * r2}
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </>
              ) : (
                <>
                  <circle
                    r="8"
                    fill="#451a03"
                    stroke="#b45309"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <line x1="-5" y1="-5" x2="5" y2="5" stroke="#ef4444" strokeWidth="1.5" />
                </>
              )}
            </g>

            {/* Earth Vector Marker */}
            <g
              transform={`translate(${earthX}, ${earthY})`}
              filter={celestialState.isEarthAboveHorizon ? "url(#earthGlow)" : "none"}
            >
              {celestialState.isEarthAboveHorizon ? (
                <>
                  <circle r="11" fill="#38bdf8" fillOpacity="0.25" />
                  <circle r="7" fill="#0284c7" />
                  <circle r="5" fill="#38bdf8" fillOpacity="0.8" />
                  {/* Atmosphere rim */}
                  <circle r="7" fill="none" stroke="#7dd3fc" strokeWidth="1" />
                </>
              ) : (
                <>
                  <circle
                    r="7"
                    fill="#082f49"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <line x1="-5" y1="-5" x2="5" y2="5" stroke="#ef4444" strokeWidth="1.5" />
                </>
              )}
            </g>

            {/* Hover Crosshair */}
            {hoveredPoint && (
              <g>
                <line
                  x1={getX(hoveredPoint.azimuthDeg)}
                  y1={padding.top}
                  x2={getX(hoveredPoint.azimuthDeg)}
                  y2={padding.top + graphHeight}
                  stroke="#38bdf8"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={getX(hoveredPoint.azimuthDeg)}
                  cy={getY(hoveredPoint.elevationDeg)}
                  r="4"
                  fill="#38bdf8"
                />
              </g>
            )}
          </svg>

          {/* Hover Telemetry Card */}
          {hoveredPoint && (
            <div className="absolute top-2 right-2 bg-slate-900/95 border border-cyan-800/80 rounded-md px-3 py-1.5 text-xs font-mono shadow-lg">
              <span className="text-cyan-400 font-bold">{hoveredPoint.featureName}</span>
              <div className="text-slate-300 flex items-center gap-2 mt-0.5">
                <span>Az: {hoveredPoint.azimuthDeg}°</span>
                <span>•</span>
                <span>Elevation: {hoveredPoint.elevationDeg}°</span>
                <span>•</span>
                <span>Dist: {hoveredPoint.distanceKm} km</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Polar Dome View */
        <div className="w-full h-64 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-center relative p-2">
          <svg viewBox="0 0 300 300" className="w-64 h-64 select-none">
            {/* Concentric Elevation Rings (Zenith = Center, Horizon = Outer Circle) */}
            <circle cx="150" cy="150" r="130" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
            <circle cx="150" cy="150" r="85" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="150" cy="150" r="45" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="150" cy="150" r="3" fill="#38bdf8" />

            {/* Compass Radii */}
            <line x1="150" y1="20" x2="150" y2="280" stroke="#1e293b" strokeWidth="1" />
            <line x1="20" y1="150" x2="280" y2="150" stroke="#1e293b" strokeWidth="1" />

            {/* Labels */}
            <text x="150" y="15" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">N (0°)</text>
            <text x="285" y="154" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="start">E</text>
            <text x="150" y="295" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">S (180°)</text>
            <text x="10" y="154" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="end">W</text>

            {/* Horizon Ring Mask */}
            {(() => {
              const polyPoints = horizonPoints.map((pt) => {
                const azRad = ((pt.azimuthDeg - 90) * Math.PI) / 180;
                // radius from center: 0° elev = 130r, 20° elev = 70r
                const r = 130 - Math.max(0, pt.elevationDeg) * 3.5;
                const x = 150 + Math.cos(azRad) * r;
                const y = 150 + Math.sin(azRad) * r;
                return `${x},${y}`;
              });
              return (
                <polygon
                  points={polyPoints.join(" ")}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeOpacity="0.8"
                />
              );
            })()}

            {/* Sun in Polar Dome */}
            {(() => {
              const azRad = ((celestialState.sunAzimuthDeg - 90) * Math.PI) / 180;
              const r = 130 - Math.max(0, celestialState.sunElevationDeg) * 3.5;
              const x = 150 + Math.cos(azRad) * r;
              const y = 150 + Math.sin(azRad) * r;
              return (
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill="#f59e0b"
                  stroke="#fef08a"
                  strokeWidth="1.5"
                />
              );
            })()}

            {/* Earth in Polar Dome */}
            {(() => {
              const azRad = ((celestialState.earthAzimuthDeg - 90) * Math.PI) / 180;
              const r = 130 - Math.max(0, celestialState.earthElevationDeg) * 3.5;
              const x = 150 + Math.cos(azRad) * r;
              const y = 150 + Math.sin(azRad) * r;
              return (
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill="#0284c7"
                  stroke="#7dd3fc"
                  strokeWidth="1.5"
                />
              );
            })()}
          </svg>
        </div>
      )}

      {/* Real-time Vector HUD Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Sun Vector Card */}
        <div
          className={`p-3 rounded-lg border font-mono text-xs flex items-center justify-between transition-colors ${
            celestialState.isSunAboveHorizon
              ? "bg-amber-950/20 border-amber-500/40 text-amber-200"
              : "bg-red-950/20 border-red-800/40 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-md ${
                celestialState.isSunAboveHorizon
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold">
                <span>SOLAR VECTOR (SUN)</span>
                <span
                  className={`text-[10px] px-1 rounded ${
                    celestialState.isSunAboveHorizon
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-red-500/20 text-red-300 border border-red-500/40"
                  }`}
                >
                  {celestialState.isSunAboveHorizon ? "ILLUMINATED" : "OCCULTED / SHADOW"}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Az: <span className="text-white">{celestialState.sunAzimuthDeg}°</span> | Elev:{" "}
                <span className="text-white">{celestialState.sunElevationDeg}°</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-amber-400">
              {celestialState.sunSolarFluxWattsM2} W/m²
            </div>
            <div className="text-[10px] text-slate-500">Solar Irradiance</div>
          </div>
        </div>

        {/* Earth Vector Card */}
        <div
          className={`p-3 rounded-lg border font-mono text-xs flex items-center justify-between transition-colors ${
            celestialState.isEarthAboveHorizon
              ? "bg-cyan-950/20 border-cyan-500/40 text-cyan-200"
              : "bg-red-950/20 border-red-800/40 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-md ${
                celestialState.isEarthAboveHorizon
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold">
                <span>DIRECT-TO-EARTH (DTE)</span>
                <span
                  className={`text-[10px] px-1 rounded ${
                    celestialState.isEarthAboveHorizon
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "bg-red-500/20 text-red-300 border border-red-500/40"
                  }`}
                >
                  {celestialState.isEarthAboveHorizon ? "LINK ACTIVE" : "RADIO BLACKOUT"}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Az: <span className="text-white">{celestialState.earthAzimuthDeg}°</span> | Elev:{" "}
                <span className="text-white">{celestialState.earthElevationDeg}°</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-cyan-400">
              {celestialState.earthDistanceKm.toLocaleString()} km
            </div>
            <div className="text-[10px] text-slate-500">DSN Range</div>
          </div>
        </div>
      </div>
    </div>
  );
}
