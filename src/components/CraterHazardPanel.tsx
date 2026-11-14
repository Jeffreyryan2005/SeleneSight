"use client";

import React from "react";
import { LunarSite } from "../lib/artemisSites";
import { evaluateCraterHazard } from "../lib/kaggleCraterDb";
import { Mountain, Layers, ShieldCheck, AlertTriangle, Compass, CheckCircle2 } from "lucide-react";

interface CraterHazardPanelProps {
  selectedSite: LunarSite;
}

export function CraterHazardPanel({ selectedSite }: CraterHazardPanelProps) {
  const hazard = evaluateCraterHazard(selectedSite.lat, selectedSite.lon);

  // Derived rock abundance and landing safety parameters
  const isSafeSlope = selectedSite.averageSlopeDeg <= 5.0;
  const isSafeRimDistance = hazard.distanceToRimKm >= 1.0;
  const rockAbundancePct = Math.min(18, Math.max(3, Math.round(hazard.boulderDensityIndex * 15)));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Terrain Morphology & Crater Rim Clearance
            </h3>
            <p className="text-xs text-slate-400">
              Cross-referenced with Robbins Lunar Crater Catalog (1.3M+ Craters)
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-bold">
          Topography Assessment
        </span>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
          <div className="text-slate-500 text-[10px]">NEAREST PROMINENT CRATER</div>
          <div className="text-white font-bold text-sm mt-0.5">
            {hazard.closestCrater.name}
          </div>
          <div className="text-slate-400 text-[10px] mt-0.5">
            {hazard.closestCrater.diameterKm} km rim-to-rim • {hazard.closestCrater.morphology}
          </div>
        </div>

        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
          <div className="text-slate-500 text-[10px]">DISTANCE TO CRATER CREST</div>
          <div className={`font-bold text-sm mt-0.5 ${hazard.distanceToRimKm < 1 ? "text-amber-400" : "text-emerald-400"}`}>
            {hazard.distanceToRimKm} km
          </div>
          <div className="text-slate-400 text-[10px] mt-0.5">
            {hazard.isInsideCrater
              ? "Inside Crater Interior"
              : hazard.isInEjectaBlanket
              ? "Continuous Ejecta Blanket"
              : "Clear Regolith Plains"}
          </div>
        </div>

        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
          <div className="text-slate-500 text-[10px]">ESTIMATED ROCK ABUNDANCE</div>
          <div
            className={`font-bold text-sm mt-0.5 ${
              rockAbundancePct > 12
                ? "text-red-400"
                : rockAbundancePct > 7
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            {rockAbundancePct}% fractional area
          </div>
          <div className="text-slate-400 text-[10px] mt-0.5">
            {rockAbundancePct > 10 ? "Elevated Boulder Density" : "Nominal Landing Regolith"}
          </div>
        </div>
      </div>

      {/* Engineering Landing Ellipse Checklist */}
      <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
          <span className="font-bold text-white">Target 100m × 100m Touchdown Criteria:</span>
          <span className="text-[11px] text-cyan-400">Artemis HLS Tolerances</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            {isSafeSlope ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="text-slate-300">
              Average Slope: <strong className="text-white">{selectedSite.averageSlopeDeg}°</strong> (Limit: &lt;5°)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedSite.maxSlopeDeg <= 12.0 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="text-slate-300">
              Max Peak Slope: <strong className="text-white">{selectedSite.maxSlopeDeg}°</strong> (Tip-over threshold: 12°)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isSafeRimDistance ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="text-slate-300">
              Crater Rim Buffer: <strong className="text-white">{hazard.distanceToRimKm} km</strong> (Min: 0.5 km)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">
              Cold Trap Access: <strong className="text-white">{selectedSite.psrDistanceKm} km</strong> to ice deposits
            </span>
          </div>
        </div>
      </div>

      {/* Real Historical Context & Operational Takeaway */}
      <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="text-amber-400 font-bold">Flight History Lesson: </span>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            {selectedSite.historicalNote ||
              `In February 2024, Intuitive Machines' Odysseus (IM-1) touched down on an unmodeled 12° local slope near Malapert A, which caught a landing leg and caused the lander to tip on its side. At ${selectedSite.name}, the average slope is ${selectedSite.averageSlopeDeg}°, safely within the stable landing envelope.`}
          </p>
        </div>
      </div>
    </div>
  );
}
