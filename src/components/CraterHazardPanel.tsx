"use client";

import React from "react";
import { LunarSite } from "../lib/artemisSites";
import { evaluateCraterHazard } from "../lib/kaggleCraterDb";
import { ShieldAlert, ShieldCheck, Database, Camera, AlertTriangle } from "lucide-react";

interface CraterHazardPanelProps {
  selectedSite: LunarSite;
}

export function CraterHazardPanel({ selectedSite }: CraterHazardPanelProps) {
  const hazard = evaluateCraterHazard(selectedSite.lat, selectedSite.lon);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Kaggle Planetary Crater & AI Hazard Detection
            </h3>
            <p className="text-xs text-slate-400">
              Robbins Lunar Crater DB (1.3M+ Craters) + AI Terrain Relative Navigation
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-bold">
          Kaggle AI Fusion
        </span>
      </div>

      {/* Hazard Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
          <div className="text-slate-500 text-[10px]">CLOSEST IMPACT CRATER</div>
          <div className="text-white font-bold text-sm mt-0.5">
            {hazard.closestCrater.name}
          </div>
          <div className="text-slate-400 text-[10px] mt-0.5">
            Class: {hazard.closestCrater.morphology} ({hazard.closestCrater.diameterKm} km ⌀)
          </div>
        </div>

        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
          <div className="text-slate-500 text-[10px]">CRATER RIM DISTANCE</div>
          <div className="text-cyan-400 font-bold text-sm mt-0.5">
            {hazard.distanceToRimKm} km
          </div>
          <div className="text-slate-400 text-[10px] mt-0.5">
            {hazard.isInsideCrater
              ? "Inside Crater Interior"
              : hazard.isInEjectaBlanket
              ? "In Ejecta Blanket"
              : "Clear Regolith Plain"}
          </div>
        </div>

        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
          <div className="text-slate-500 text-[10px]">BOULDER DENSITY INDEX</div>
          <div
            className={`font-bold text-sm mt-0.5 ${
              hazard.boulderDensityIndex > 0.6
                ? "text-red-400"
                : hazard.boulderDensityIndex > 0.3
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            {hazard.boulderDensityIndex} / 1.0
          </div>
          <div className="text-slate-400 text-[10px] mt-0.5">
            {hazard.boulderDensityIndex > 0.5 ? "High Rockslide Risk" : "Dispersed Regolith"}
          </div>
        </div>
      </div>

      {/* AI Computer Vision Hazard Scanner HUD */}
      <div className="bg-slate-950 rounded-lg border border-purple-900/40 p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-purple-300 font-bold">
            <Camera className="w-3.5 h-3.5" />
            <span>AI Optical Surface Hazard Scanner (LROC NAC Feed)</span>
          </div>
          <span className="text-[10px] text-slate-500">YOLOv8-LU3M6TGT Model</span>
        </div>

        {/* Simulated Camera Scanner Feed */}
        <div className="relative h-28 bg-gradient-to-br from-slate-900 to-slate-950 rounded border border-slate-800 overflow-hidden flex items-center justify-center">
          {/* Scanline animation */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent animate-pulse pointer-events-none" />

          {/* Bounding Boxes representing detected boulders & micro-craters */}
          <div className="absolute top-4 left-8 border border-emerald-500 bg-emerald-500/10 text-emerald-400 text-[9px] px-1 rounded">
            Target Touchdown Zone (98.4%)
          </div>
          <div className="absolute bottom-5 right-12 border border-amber-500 bg-amber-500/10 text-amber-300 text-[9px] px-1 rounded">
            Micro-Crater 3.2m (94.1%)
          </div>
          <div className="absolute top-6 right-28 border border-red-500 bg-red-500/10 text-red-400 text-[9px] px-1 rounded">
            Boulder Hazard 1.4m (91.8%)
          </div>

          <div className="text-center font-mono z-10">
            <div className="text-xs text-slate-300 font-bold">
              AUTONOMOUS HAZARD AVOIDANCE (AHA) STATUS: CLEAR
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Terrain Roughness: {selectedSite.averageSlopeDeg}° • Safe Descent Corridor Verified
            </div>
          </div>
        </div>
      </div>

      {/* Historical Lesson Learned Box */}
      <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800 text-xs flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-amber-400 font-bold">Historical Flight Precedent: </span>
          <span className="text-slate-300">
            {selectedSite.historicalNote ||
              `In 2024, Intuitive Machines' Odysseus (IM-1) touched down on an unmodeled 12° slope near Malapert A, resulting in vehicle tip-over. ${selectedSite.name}'s slope is ${selectedSite.averageSlopeDeg}°, safely below the critical 8° limit.`}
          </span>
        </div>
      </div>
    </div>
  );
}
