"use client";

import React, { useState, useMemo } from "react";
import { Header } from "../components/Header";
import { HorizonSkyChart } from "../components/HorizonSkyChart";
import { TimelineGantt } from "../components/TimelineGantt";
import { LunarPolarMap } from "../components/LunarPolarMap";
import { SiteScorer } from "../components/SiteScorer";
import { CraterHazardPanel } from "../components/CraterHazardPanel";
import { ApiInspectorModal } from "../components/ApiInspectorModal";
import { MissionReportModal } from "../components/MissionReportModal";
import {
  ARTEMIS_CANDIDATE_SITES,
  HISTORICAL_BENCHMARKS,
  LunarSite,
} from "../lib/artemisSites";
import { calculateHorizonProfile } from "../lib/horizonMath";
import { generateEphemerisSeries, calculateLunarEphemeris } from "../lib/ephemerisEngine";
import { scoreLunarSite, MISSION_PRESETS } from "../lib/mcdaScoring";
import {
  Compass,
  MapPin,
  Mountain,
  Zap,
  Radio,
  Sparkles,
  ExternalLink,
  Code2,
} from "lucide-react";

export default function Home() {
  const [selectedSite, setSelectedSite] = useState<LunarSite>(ARTEMIS_CANDIDATE_SITES[0]);
  const [targetDate, setTargetDate] = useState<string>("2026-10-01T00:00:00Z");
  const [timelineIndex, setTimelineIndex] = useState<number>(0);
  const [isApiInspectorOpen, setIsApiInspectorOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Compute 360° local horizon obstruction profile
  const horizonAnalysis = useMemo(() => {
    return calculateHorizonProfile(
      selectedSite.lat,
      selectedSite.lon,
      2.0,
      selectedSite.elevationMeters
    );
  }, [selectedSite]);

  // Fast mask function for ephemeris checks
  const horizonMask = useMemo(() => {
    const table = horizonAnalysis.points.map((p) => p.elevationDeg);
    return (az: number) => {
      const normAz = Math.floor(((az % 360) + 360) % 360);
      return table[normAz] ?? 0;
    };
  }, [horizonAnalysis]);

  // Compute 14-day ephemeris time series
  const series = useMemo(() => {
    const startDate = new Date(targetDate);
    return generateEphemerisSeries(
      selectedSite.lat,
      selectedSite.lon,
      startDate,
      14,
      2,
      horizonMask
    );
  }, [selectedSite, targetDate, horizonMask]);

  // Current single-point celestial state for the scrubbed index
  const currentCelestialState = series.data[timelineIndex] || series.data[0];

  // Current site score
  const currentScore = useMemo(() => {
    return scoreLunarSite(selectedSite, MISSION_PRESETS.CREWED_ARTEMIS.weights);
  }, [selectedSite]);

  // Handle custom coordinate drop on map
  const handleCustomCoordinate = (lat: number, lon: number) => {
    const customSite: LunarSite = {
      id: `custom-${Date.now()}`,
      name: `Custom Target (${lat}°, ${lon}°)`,
      designation: "User Custom Landing Site",
      lat,
      lon,
      elevationMeters: 1200,
      averageSlopeDeg: 5.4,
      maxSlopeDeg: 11.8,
      psrDistanceKm: 1.2,
      sunlightPctAnnual: 75.0,
      dteVisibilityPct: 77.0,
      geologicalContext: "Custom coordinate selected via GIS interactive map.",
      primaryTarget: "Custom",
      hazardLevel: "MODERATE",
    };
    setSelectedSite(customSite);
  };

  const allSites = [...ARTEMIS_CANDIDATE_SITES, ...HISTORICAL_BENCHMARKS];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Mission Control Header */}
      <Header
        onOpenApiInspector={() => setIsApiInspectorOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        selectedSiteName={selectedSite.name}
      />

      {/* Telemetry Status Ribbon */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">ACTIVE TARGET:</span>
            <span className="text-cyan-400 font-bold">{selectedSite.name}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">
              {selectedSite.lat.toFixed(2)}° S, {selectedSite.lon.toFixed(2)}° E
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Elev: +{selectedSite.elevationMeters}m</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">TOUCHDOWN SLOPE:</span>
              <span
                className={`font-bold ${
                  selectedSite.averageSlopeDeg < 5 ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {selectedSite.averageSlopeDeg}° avg
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">DISPOSITION:</span>
              <span
                className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                  currentScore.readinessRating === "GO"
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    : currentScore.readinessRating === "CAUTION"
                    ? "bg-amber-950 text-amber-400 border border-amber-800"
                    : "bg-red-950 text-red-400 border border-red-800"
                }`}
              >
                {currentScore.readinessRating} ({currentScore.compositeScore}/100)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Cockpit */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Analytical Charts & Timeline (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* 1. 360° Panoramic Horizon Chart */}
          <HorizonSkyChart
            horizonPoints={horizonAnalysis.points}
            celestialState={currentCelestialState}
            siteName={selectedSite.name}
          />

          {/* 2. Mission Timeline & Gantt Concurrency */}
          <TimelineGantt
            series={series}
            currentIndex={timelineIndex}
            onIndexChange={setTimelineIndex}
            targetDate={targetDate}
            onDateChange={(d) => setTargetDate(`${d}T00:00:00Z`)}
          />

          {/* 3. Multi-Criteria Decision Analysis Ranking Leaderboard */}
          <SiteScorer
            sites={allSites}
            selectedSite={selectedSite}
            onSelectSite={setSelectedSite}
          />
        </div>

        {/* Right Column: GIS Polar Map & Planetary AI Modules (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* 1. Lunar Polar Map */}
          <LunarPolarMap
            sites={allSites}
            selectedSite={selectedSite}
            onSelectSite={setSelectedSite}
            onCustomCoordinatePick={handleCustomCoordinate}
          />

          {/* 2. Kaggle Planetary Crater & AI Hazard Scanner */}
          <CraterHazardPanel selectedSite={selectedSite} />
        </div>
      </main>

      {/* Global Modals */}
      <ApiInspectorModal
        isOpen={isApiInspectorOpen}
        onClose={() => setIsApiInspectorOpen(false)}
        selectedSite={selectedSite}
        targetDate={targetDate}
      />

      <MissionReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        site={selectedSite}
        score={currentScore}
        horizonAnalysis={horizonAnalysis}
        series={series}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="text-slate-400 font-bold">SELENESIGHT</span> • NASA International Space Apps Challenge 2026
            <div className="text-[11px] text-slate-600">
              Designed for Artemis III Human Landing System (HLS) & CLPS Robotic Missions
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="https://github.com/Jeffreyryan2005/SeleneSight"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>GitHub Repo</span>
            </a>
            <a
              href="https://www.spaceappschallenge.org/2026/challenges/lunar-landing-site-navigator/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Challenge Brief</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
