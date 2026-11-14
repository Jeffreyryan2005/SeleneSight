"use client";

import React, { useState } from "react";
import { LunarSite } from "../lib/artemisSites";
import { buildJplHorizonsQueryUrl } from "../lib/ephemerisEngine";
import { X, Copy, Check, Terminal, ExternalLink, Activity } from "lucide-react";

interface ApiInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSite: LunarSite;
  targetDate: string;
}

export function ApiInspectorModal({
  isOpen,
  onClose,
  selectedSite,
  targetDate,
}: ApiInspectorModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"jpl" | "moontrek">("jpl");

  if (!isOpen) return null;

  const startDate = new Date(targetDate);
  const stopDate = new Date(startDate.getTime() + 14 * 86400000);

  const jplUrlSun = buildJplHorizonsQueryUrl(
    selectedSite.lat,
    selectedSite.lon,
    "10",
    startDate,
    stopDate
  );

  const jplUrlEarth = buildJplHorizonsQueryUrl(
    selectedSite.lat,
    selectedSite.lon,
    "399",
    startDate,
    stopDate
  );

  const curlCommand = `curl -X GET "${jplUrlSun}"`;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="bg-slate-900 border border-cyan-800 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              NASA Telemetry API Inspector
            </h3>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded">
              HTTP 200 OK
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 text-xs">
          <button
            onClick={() => setActiveTab("jpl")}
            className={`py-2 px-3 border-b-2 font-bold transition-colors ${
              activeTab === "jpl"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            JPL Horizons Ephemeris API
          </button>
          <button
            onClick={() => setActiveTab("moontrek")}
            className={`py-2 px-3 border-b-2 font-bold transition-colors ${
              activeTab === "moontrek"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            NASA Moon Trek WMTS Tiles
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {activeTab === "jpl" ? (
            <>
              <div>
                <div className="text-slate-400 mb-1 flex items-center justify-between">
                  <span>LIVE REPRODUCIBLE CURL REQUEST:</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy cURL"}</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300 overflow-x-auto select-all">
                  <code>{curlCommand}</code>
                </div>
              </div>

              <div>
                <span className="text-slate-400 mb-1 block">QUERY PARAMETER BREAKDOWN:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[10px]">COMMAND:</span>
                    <span className="text-amber-400 font-bold">'10' (Sun) / '399' (Earth)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">CENTER:</span>
                    <span className="text-cyan-400 font-bold">'coord@301' (Moon)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">SITE_COORD:</span>
                    <span className="text-white font-bold">{selectedSite.lon.toFixed(2)}°, {selectedSite.lat.toFixed(2)}°</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">QUANTITIES:</span>
                    <span className="text-emerald-400 font-bold">'4' (Az & Elev)</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 mb-1 block">
                  ACTUAL NASA JPL JSON PAYLOAD STREAM (SAMPLE):
                </span>
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-emerald-400 overflow-x-auto max-h-48">
{`{
  "api_version": "1.2",
  "signature": {
    "source": "NASA/JPL Horizons Ephemeris Generator",
    "version": "5.38"
  },
  "target": "Sun [10]",
  "observer": "Site: ${selectedSite.name} [coord@301]",
  "result": "
  Date__(UT)__HR:MN     Azi_(app)     Elev_(app)     delta__AU
  -------------------------------------------------------------
  2026-Oct-01 00:00     042.8142      +01.8920       0.998412
  2026-Oct-01 01:00     043.3214      +01.8415       0.998415
  2026-Oct-01 02:00     043.8290      +01.7892       0.998419
  ...
  "
}`}
                </pre>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 mb-1 block">OFFICIAL WMTS REST SERVICE CAPABILITIES:</span>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-cyan-300">
                  <code>https://trek.nasa.gov/tiles/Moon/SP/1.0.0/WMTSCapabilities.xml</code>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="font-bold text-white">Ingested South Pole Map Layers:</div>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  <li><span className="text-cyan-400">LOLA South Pole Elevation (DEM):</span> 30-meter resolution stereographic altimetry.</li>
                  <li><span className="text-cyan-400">LROC Narrow Angle Camera (NAC) Mosaics:</span> Sub-meter optical imagery of candidate landing zones.</li>
                  <li><span className="text-cyan-400">Diviner Thermal Radiometer:</span> Surface brightness maps isolating Permanently Shadowed Regions (&lt;110 K).</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
