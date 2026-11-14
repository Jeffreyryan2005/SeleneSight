"use client";

import React, { useState } from "react";
import { LunarSite } from "../lib/artemisSites";
import {
  MissionProfile,
  MISSION_PRESETS,
  McdaWeights,
  scoreLunarSite,
  rankSites,
} from "../lib/mcdaScoring";
import { Award, Sliders, CheckCircle2, AlertCircle, XCircle, ArrowUpDown } from "lucide-react";

interface SiteScorerProps {
  sites: LunarSite[];
  selectedSite: LunarSite;
  onSelectSite: (site: LunarSite) => void;
}

export function SiteScorer({ sites, selectedSite, onSelectSite }: SiteScorerProps) {
  const [profile, setProfile] = useState<MissionProfile>("CREWED_ARTEMIS");
  const [showWeightSliders, setShowWeightSliders] = useState(false);
  const [customWeights, setCustomWeights] = useState<McdaWeights>(
    MISSION_PRESETS.CREWED_ARTEMIS.weights
  );

  const handleProfileSelect = (p: MissionProfile) => {
    setProfile(p);
    setCustomWeights(MISSION_PRESETS[p].weights);
  };

  // Rank sites
  const ranked = sites
    .map((site) => scoreLunarSite(site, customWeights))
    .sort((a, b) => b.compositeScore - a.compositeScore);

  const currentSiteScore = scoreLunarSite(selectedSite, customWeights);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Multi-Criteria Decision Analysis (MCDA) Ranking
            </h3>
            <p className="text-xs text-slate-400">
              Evaluates Safety, Illumination, Comms, and Volatiles
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowWeightSliders(!showWeightSliders)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-950 hover:bg-slate-800 text-cyan-300 rounded border border-slate-800 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showWeightSliders ? "Hide Weights" : "Adjust Weights"}</span>
        </button>
      </div>

      {/* Preset Profiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(Object.keys(MISSION_PRESETS) as MissionProfile[]).map((key) => {
          const isSelected = profile === key;
          return (
            <button
              key={key}
              onClick={() => handleProfileSelect(key)}
              className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                isSelected
                  ? "bg-cyan-950/80 border-cyan-500/80 text-cyan-200"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <div className="font-bold truncate">{MISSION_PRESETS[key].name.split("(")[0]}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                {key === "CREWED_ARTEMIS" ? "Slope < 7° & Comms" : key === "SOLAR_CLPS" ? "Max Sunlight" : "Ice Cold Traps"}
              </div>
            </button>
          );
        })}
      </div>

      {/* Optional Weight Sliders Drawer */}
      {showWeightSliders && (
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <div className="flex justify-between text-slate-400">
              <span>Solar Power:</span>
              <span className="text-cyan-400 font-bold">{Math.round(customWeights.solarWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={customWeights.solarWeight}
              onChange={(e) =>
                setCustomWeights({ ...customWeights, solarWeight: Number(e.target.value) })
              }
              className="w-full accent-cyan-400"
            />
          </div>
          <div>
            <div className="flex justify-between text-slate-400">
              <span>DTE Comms:</span>
              <span className="text-cyan-400 font-bold">{Math.round(customWeights.commsWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={customWeights.commsWeight}
              onChange={(e) =>
                setCustomWeights({ ...customWeights, commsWeight: Number(e.target.value) })
              }
              className="w-full accent-cyan-400"
            />
          </div>
          <div>
            <div className="flex justify-between text-slate-400">
              <span>Slope Safety:</span>
              <span className="text-cyan-400 font-bold">{Math.round(customWeights.slopeSafetyWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={customWeights.slopeSafetyWeight}
              onChange={(e) =>
                setCustomWeights({ ...customWeights, slopeSafetyWeight: Number(e.target.value) })
              }
              className="w-full accent-cyan-400"
            />
          </div>
        </div>
      )}

      {/* Selected Site Score Highlight */}
      <div className="bg-slate-950 p-3 rounded-lg border border-cyan-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">CURRENT TARGET:</span>
            <span className="text-white font-bold">{selectedSite.name}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                currentSiteScore.readinessRating === "GO"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : currentSiteScore.readinessRating === "CAUTION"
                  ? "bg-amber-950 text-amber-400 border border-amber-800"
                  : "bg-red-950 text-red-400 border border-red-800"
              }`}
            >
              {currentSiteScore.readinessRating}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-emerald-400">✓ {currentSiteScore.keyStrength}</span>
            <span className="mx-2">•</span>
            <span className="text-amber-400">⚠ {currentSiteScore.keyLimitation}</span>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
          <div className="text-2xl font-extrabold text-cyan-400">
            {currentSiteScore.compositeScore}
            <span className="text-xs text-slate-500 font-normal"> / 100</span>
          </div>
          <div className="text-[10px] text-slate-500">Flight Readiness Index</div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto max-h-56 overflow-y-auto rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
            <tr>
              <th className="py-2 px-3">Rank</th>
              <th className="py-2 px-3">Site Designation</th>
              <th className="py-2 px-3 text-center">Slope</th>
              <th className="py-2 px-3 text-center">Sunlight</th>
              <th className="py-2 px-3 text-center">DTE Comms</th>
              <th className="py-2 px-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
            {ranked.map((item, index) => {
              const isSelected = item.site.id === selectedSite.id;
              return (
                <tr
                  key={item.site.id}
                  onClick={() => onSelectSite(item.site)}
                  className={`cursor-pointer transition-colors hover:bg-slate-800/80 ${
                    isSelected ? "bg-cyan-950/60 font-bold" : ""
                  }`}
                >
                  <td className="py-2 px-3 text-slate-400">#{index + 1}</td>
                  <td className="py-2 px-3">
                    <div className="text-white">{item.site.name}</div>
                    <div className="text-[10px] text-slate-500">{item.site.designation}</div>
                  </td>
                  <td className="py-2 px-3 text-center text-slate-300">
                    {item.site.averageSlopeDeg}°
                  </td>
                  <td className="py-2 px-3 text-center text-amber-400">
                    {item.site.sunlightPctAnnual}%
                  </td>
                  <td className="py-2 px-3 text-center text-cyan-400">
                    {item.site.dteVisibilityPct}%
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-cyan-300">
                    {item.compositeScore}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
