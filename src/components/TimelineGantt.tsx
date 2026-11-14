"use client";

import React, { useState, useEffect } from "react";
import { EphemerisSeries, CelestialState } from "../lib/ephemerisEngine";
import { Play, Pause, RotateCcw, Calendar, Zap, Radio, Sparkles } from "lucide-react";

interface TimelineGanttProps {
  series: EphemerisSeries;
  currentIndex: number;
  onIndexChange: (index: number | ((prev: number) => number)) => void;
  targetDate: string;
  onDateChange: (dateStr: string) => void;
}

export function TimelineGantt({
  series,
  currentIndex,
  onIndexChange,
  targetDate,
  onDateChange,
}: TimelineGanttProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      onIndexChange((prev: number) => {
        const next = prev + 1;
        if (next >= series.data.length) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, 500 / playSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playSpeed, series.data.length, onIndexChange]);

  const currentState = series.data[currentIndex] || series.data[0];
  const dateFormatted = new Date(currentState.timeIso).toUTCString().replace("GMT", "UTC");

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3 font-mono">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Mission Timeline & Concurrency Analyzer
            </h3>
            <p className="text-xs text-slate-400">
              14-Day Lunar Day Cycle • Solar Power vs Direct-to-Earth Communications
            </p>
          </div>
        </div>

        {/* Date Selector & Playback */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px]">LAUNCH:</span>
            <input
              type="date"
              value={targetDate.slice(0, 10)}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-cyan-300 focus:outline-none font-mono text-xs cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded hover:bg-slate-800 text-cyan-300 transition-colors"
              title={isPlaying ? "Pause Simulation" : "Play Simulation"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                onIndexChange(0);
              }}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Reset to Day 0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPlaySpeed((s) => (s === 1 ? 5 : s === 5 ? 20 : 1))}
              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300 hover:bg-slate-700"
            >
              {playSpeed}x
            </button>
          </div>
        </div>
      </div>

      {/* Scrubbable Timeline Track */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="text-cyan-400 font-bold">{dateFormatted}</span>
          <span className="text-slate-400">
            Step {currentIndex + 1} / {series.data.length} ({series.stepHours}h increments)
          </span>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min={0}
          max={series.data.length - 1}
          value={currentIndex}
          onChange={(e) => onIndexChange(Number(e.target.value))}
          className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-2"
        />

        {/* Multi-Track Gantt Bars */}
        <div className="grid grid-cols-1 gap-1.5 mt-2 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
          {/* Track 1: Solar Illumination */}
          <div className="flex items-center gap-2 text-[11px]">
            <div className="w-24 text-slate-400 flex items-center gap-1 shrink-0">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Solar Power</span>
            </div>
            <div className="flex-1 flex h-4 rounded overflow-hidden bg-slate-900 border border-slate-800">
              {series.data.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => onIndexChange(idx)}
                  className={`flex-1 cursor-pointer transition-opacity ${
                    step.isSunAboveHorizon
                      ? "bg-amber-500/80 hover:bg-amber-400"
                      : "bg-slate-900"
                  } ${idx === currentIndex ? "ring-2 ring-white z-10" : ""}`}
                  title={`${new Date(step.timeIso).toLocaleDateString()} - Sun: ${
                    step.isSunAboveHorizon ? "Visible" : "Blocked"
                  }`}
                />
              ))}
            </div>
            <span className="w-12 text-right text-amber-400 shrink-0 font-bold">
              {series.sunVisibilityPct}%
            </span>
          </div>

          {/* Track 2: Direct-to-Earth Line of Sight */}
          <div className="flex items-center gap-2 text-[11px]">
            <div className="w-24 text-slate-400 flex items-center gap-1 shrink-0">
              <Radio className="w-3 h-3 text-cyan-400" />
              <span>DTE Comms</span>
            </div>
            <div className="flex-1 flex h-4 rounded overflow-hidden bg-slate-900 border border-slate-800">
              {series.data.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => onIndexChange(idx)}
                  className={`flex-1 cursor-pointer transition-opacity ${
                    step.isEarthAboveHorizon
                      ? "bg-cyan-500/80 hover:bg-cyan-400"
                      : "bg-slate-900"
                  } ${idx === currentIndex ? "ring-2 ring-white z-10" : ""}`}
                  title={`${new Date(step.timeIso).toLocaleDateString()} - Earth: ${
                    step.isEarthAboveHorizon ? "Line-of-Sight" : "Blackout"
                  }`}
                />
              ))}
            </div>
            <span className="w-12 text-right text-cyan-400 shrink-0 font-bold">
              {series.earthVisibilityPct}%
            </span>
          </div>

          {/* Track 3: The Golden Window (Power + Comms Overlap) */}
          <div className="flex items-center gap-2 text-[11px]">
            <div className="w-24 text-emerald-400 flex items-center gap-1 shrink-0 font-bold">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Golden Window</span>
            </div>
            <div className="flex-1 flex h-4 rounded overflow-hidden bg-slate-900 border border-slate-800">
              {series.data.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => onIndexChange(idx)}
                  className={`flex-1 cursor-pointer transition-opacity ${
                    step.isGoldenWindow
                      ? "bg-emerald-500 hover:bg-emerald-400"
                      : "bg-slate-900"
                  } ${idx === currentIndex ? "ring-2 ring-white z-10" : ""}`}
                  title={`${new Date(step.timeIso).toLocaleDateString()} - Golden Window: ${
                    step.isGoldenWindow ? "ACTIVE" : "NO"
                  }`}
                />
              ))}
            </div>
            <span className="w-12 text-right text-emerald-400 shrink-0 font-bold">
              {series.goldenWindowHours}h
            </span>
          </div>
        </div>
      </div>

      {/* Aggregate Metrics Footer */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-slate-800/80">
        <div className="bg-slate-950 p-2 rounded border border-slate-800">
          <div className="text-slate-400 text-[10px]">TOTAL SUNLIGHT</div>
          <div className="text-amber-400 font-bold text-sm">
            {series.sunVisibilityHours} hrs
          </div>
        </div>
        <div className="bg-slate-950 p-2 rounded border border-slate-800">
          <div className="text-slate-400 text-[10px]">DTE COMMS UPTIME</div>
          <div className="text-cyan-400 font-bold text-sm">
            {series.earthVisibilityHours} hrs
          </div>
        </div>
        <div className="bg-slate-950 p-2 rounded border border-slate-800">
          <div className="text-slate-400 text-[10px]">CONCURRENT WINDOW</div>
          <div className="text-emerald-400 font-bold text-sm">
            {series.goldenWindowHours} hrs
          </div>
        </div>
      </div>
    </div>
  );
}
