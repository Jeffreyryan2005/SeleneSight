"use client";

import React from "react";
import { LunarSite } from "../lib/artemisSites";
import { HorizonAnalysisResult } from "../lib/horizonMath";
import { EphemerisSeries } from "../lib/ephemerisEngine";
import { SiteScoreBreakdown } from "../lib/mcdaScoring";
import { X, Printer, Download, CheckCircle, Shield, Award } from "lucide-react";

interface MissionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: LunarSite;
  score: SiteScoreBreakdown;
  horizonAnalysis: HorizonAnalysisResult;
  series: EphemerisSeries;
}

export function MissionReportModal({
  isOpen,
  onClose,
  site,
  score,
  horizonAnalysis,
  series,
}: MissionReportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="bg-slate-900 border border-cyan-800 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              NASA Flight Readiness Review (FRR) Brief
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs flex items-center gap-1 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div id="printable-brief" className="p-6 overflow-y-auto space-y-6 text-xs bg-slate-950 text-slate-200">
          {/* Document Header */}
          <div className="border-b-2 border-cyan-500/80 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <div className="text-lg font-black tracking-widest text-white uppercase">
                NATIONAL AERONAUTICS AND SPACE ADMINISTRATION
              </div>
              <div className="text-cyan-400 font-bold">
                ARTEMIS & CLPS LUNAR SURFACE LANDING OPERATIONS DIRECTIVE
              </div>
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-[10px]">DOCUMENT NO:</div>
              <div className="text-white font-bold">SLS-AR3-NAV-2026-X</div>
            </div>
          </div>

          {/* Site Overview Section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <div className="text-slate-500 text-[10px]">TARGET CANDIDATE</div>
              <div className="text-white font-bold text-sm mt-0.5">{site.name}</div>
              <div className="text-slate-400 text-[10px]">{site.designation}</div>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <div className="text-slate-500 text-[10px]">COORDINATES (LAT/LON)</div>
              <div className="text-cyan-400 font-bold text-sm mt-0.5">
                {site.lat.toFixed(2)}° S, {site.lon.toFixed(2)}° E
              </div>
              <div className="text-slate-400 text-[10px]">Elev: +{site.elevationMeters}m</div>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <div className="text-slate-500 text-[10px]">TOPOGRAPHIC SLOPE</div>
              <div
                className={`font-bold text-sm mt-0.5 ${
                  site.averageSlopeDeg < 5 ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                Avg {site.averageSlopeDeg}° / Max {site.maxSlopeDeg}°
              </div>
              <div className="text-slate-400 text-[10px]">
                {site.averageSlopeDeg < 5 ? "Leg Stability OK" : "Touchdown Thruster Margin Low"}
              </div>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <div className="text-slate-500 text-[10px]">MISSION DISPOSITION</div>
              <div
                className={`font-bold text-sm mt-0.5 ${
                  score.readinessRating === "GO"
                    ? "text-emerald-400"
                    : score.readinessRating === "CAUTION"
                    ? "text-amber-400"
                    : "text-red-400"
                }`}
              >
                {score.readinessRating} ({score.compositeScore}/100)
              </div>
              <div className="text-slate-400 text-[10px]">Flight Readiness Index</div>
            </div>
          </div>

          {/* Horizon & Terrain Obstruction Analysis */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1">
              1.0 Topological Horizon Obstruction Evaluation (LOLA 30m DEM)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">MAX HORIZON ELEVATION:</span>
                <span className="text-amber-400 font-bold">+{horizonAnalysis.maxObstructionDeg}°</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">MEAN HORIZON DIP/TILT:</span>
                <span className="text-cyan-400 font-bold">{horizonAnalysis.meanObstructionDeg}°</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">PRIMARY OBSTRUCTING FEATURE:</span>
                <span className="text-white font-bold truncate block">{horizonAnalysis.highestFeature}</span>
              </div>
            </div>
          </div>

          {/* Power & Communication Feasibility */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1">
              2.0 Telemetry, Power & Communications Concurrency
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ANNUAL DIRECT SUNLIGHT:</span>
                <span className="text-amber-400 font-bold">{site.sunlightPctAnnual}% of Lunar Year</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">DIRECT-TO-EARTH (DTE) LINK:</span>
                <span className="text-cyan-400 font-bold">{site.dteVisibilityPct}% Visibility</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">SIMULATED GOLDEN WINDOW:</span>
                <span className="text-emerald-400 font-bold">{series.goldenWindowHours} Uninterrupted Hours</span>
              </div>
            </div>
          </div>

          {/* Kaggle Planetary & Scientific Value */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1">
              3.0 Science Return & Planetary Volatiles Access
            </h4>
            <div className="bg-slate-900 p-3 rounded border border-slate-800 space-y-1.5">
              <div className="text-slate-300">
                <span className="font-bold text-white">Permanently Shadowed Region (PSR) Distance: </span>
                <span className="text-cyan-300 font-bold">{site.psrDistanceKm} km</span>
              </div>
              <p className="text-slate-400 text-[11px]">{site.geologicalContext}</p>
            </div>
          </div>

          {/* Signoff Certification */}
          <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-[10px] text-slate-500">
            <div>
              Generated by SeleneSight v1.0 • NASA Space Apps 2026
            </div>
            <div className="text-right">
              CONFIDENTIAL • FLIGHT CREW AND MISSION CONTROL DISTRIBUTION ONLY
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
