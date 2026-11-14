"use client";

import React, { useState, useEffect } from "react";
import { MoonNavLogo } from "./MoonNavLogo";
import {
  Satellite,
  Compass,
  FileText,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface HeaderProps {
  onOpenApiInspector: () => void;
  onOpenReportModal: () => void;
  selectedSiteName: string;
}

export function Header({
  onOpenApiInspector,
  onOpenReportModal,
  selectedSiteName,
}: HeaderProps) {
  const [timeUtc, setTimeUtc] = useState<string>("");
  const [lunarDayCycle, setLunarDayCycle] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().replace("GMT", "UTC"));

      // Approximate lunar synodic phase angle
      const j2000 = new Date("2000-01-01T12:00:00Z").getTime();
      const diffDays = (now.getTime() - j2000) / 86400000;
      const lunarAge = (diffDays % 29.53059).toFixed(1);
      setLunarDayCycle(`Day ${lunarAge} / 29.5`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-cyan-900/40 bg-slate-950/85 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-2.5">
      <div className="w-full max-w-[1850px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Branding & Mission Badge */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <MoonNavLogo className="w-11 h-11" size={46} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-white text-base font-mono">
                  SELENESIGHT
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Artemis & CLPS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <span>NASA South Pole Mission Navigator</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-400 truncate max-w-[180px] font-semibold">
                  {selectedSiteName}
                </span>
              </p>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onOpenApiInspector}
              className="px-2.5 py-1.5 text-xs bg-slate-900 text-cyan-300 border border-cyan-800 rounded flex items-center gap-1"
            >
              <Activity className="w-3.5 h-3.5" />
              API
            </button>
            <button
              onClick={onOpenReportModal}
              className="px-2.5 py-1.5 text-xs bg-cyan-600 text-white rounded font-medium flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Mission Clock Telemetry */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-900/60 border border-slate-800/80 rounded-lg px-3.5 py-1.5 font-mono text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">EPOCH:</span>
            <span className="text-white font-medium">{timeUtc || "SYNCHRONIZING..."}</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">LUNAR SYNODIC:</span>
            <span className="text-cyan-300">{lunarDayCycle}</span>
          </div>
        </div>

        {/* Right: Quick Action Modals */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* NASA API Inspector Button */}
          <button
            onClick={onOpenApiInspector}
            className="px-3 py-1.5 rounded-md text-xs font-mono font-medium bg-slate-900/90 text-cyan-300 hover:text-cyan-200 border border-cyan-800/80 hover:border-cyan-600 flex items-center gap-1.5 transition-all shadow-sm group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
            <span>NASA JPL Horizons API</span>
            <span className="text-[10px] bg-cyan-950 px-1 rounded text-cyan-400 border border-cyan-800">
              Live
            </span>
          </button>

          {/* Mission Readiness Brief */}
          <button
            onClick={onOpenReportModal}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-cyan-900/30 transition-all font-mono"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Flight Readiness Brief</span>
          </button>
        </div>
      </div>
    </header>
  );
}
