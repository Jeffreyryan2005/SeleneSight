/**
 * Ephemeris Engine (JPL Horizons & Analytical Topocentric Calculator)
 * Calculates topocentric Azimuth & Elevation for Sun and Earth
 * relative to a specific lunar surface landing site.
 */

export interface CelestialState {
  timeIso: string;
  sunAzimuthDeg: number;
  sunElevationDeg: number;
  sunDistanceAU: number;
  sunSolarFluxWattsM2: number;
  earthAzimuthDeg: number;
  earthElevationDeg: number;
  earthDistanceKm: number;
  isSunAboveHorizon: boolean;
  isEarthAboveHorizon: boolean;
  isGoldenWindow: boolean; // Both Sun & Earth visible simultaneously
}

export interface EphemerisSeries {
  startTime: string;
  endTime: string;
  stepHours: number;
  data: CelestialState[];
  sunVisibilityHours: number;
  earthVisibilityHours: number;
  goldenWindowHours: number;
  sunVisibilityPct: number;
  earthVisibilityPct: number;
}

const LUNAR_SYNODIC_DAYS = 29.530588853;
const LUNAR_OBLIQUITY_DEG = 1.5424; // Moon's obliquity to ecliptic
const SOLAR_CONSTANT_1AU = 1361.0; // W/m^2

/**
 * Calculates topocentric Sun & Earth angles at a specific epoch for a lunar landing site.
 */
export function calculateLunarEphemeris(
  lat: number,
  lon: number,
  date: Date,
  horizonMask?: (azimuthDeg: number) => number
): CelestialState {
  // Epoch relative to J2000.0 (2000-01-01 12:00 UTC)
  const j2000Ms = Date.UTC(2000, 0, 1, 12, 0, 0);
  const tDays = (date.getTime() - j2000Ms) / 86400000.0;

  // 1. SUN POSITION in Lunar Topocentric Coordinates
  // Mean longitude of the Moon's rotation (sub-solar longitude on the equator)
  const subSolarLon = ((tDays / LUNAR_SYNODIC_DAYS) * 360.0) % 360.0;
  // Azimuth of the sun advances as the Moon rotates: 360° per synodic month
  let sunAzimuth = (subSolarLon - lon + 180.0) % 360.0;
  if (sunAzimuth < 0) sunAzimuth += 360.0;

  // Sub-solar latitude oscillates with the lunar seasons (period = tropical year ~365.25 days)
  const seasonPhaseRad = ((tDays / 365.256363) * 2 * Math.PI) + 0.35;
  const subSolarLat = LUNAR_OBLIQUITY_DEG * Math.sin(seasonPhaseRad);

  // Elevation of the Sun above the local tangent plane at the South Pole
  // For polar latitude (e.g., -89° to -90°):
  const colatitudeDeg = 90.0 + lat; // For -89°, colatitude is 1°
  const sunElevation = subSolarLat * Math.cos(colatitudeDeg * (Math.PI / 180)) -
    colatitudeDeg * Math.cos(sunAzimuth * (Math.PI / 180)) * 0.9;

  // Distance variations (Moon eccentric orbit around Sun)
  const distAU = 1.0 + 0.0167 * Math.cos(seasonPhaseRad);
  const solarFlux = Math.max(0, SOLAR_CONSTANT_1AU / (distAU * distAU) * Math.max(0, Math.sin(Math.max(0, sunElevation) * (Math.PI / 180))));

  // 2. EARTH POSITION (Libration & Topocentric Coordinates)
  // The Earth stays roughly near the local meridian of lunar longitude, but librates by ±6.7° lat, ±7.9° lon
  const librationLatRad = ((tDays / 27.2122) * 2 * Math.PI); // Draconic month
  const librationLonRad = ((tDays / 27.5545) * 2 * Math.PI); // Anomalistic month

  const deltaLatLibration = 6.68 * Math.sin(librationLatRad);
  const deltaLonLibration = 7.91 * Math.sin(librationLonRad);

  // Azimuth to Earth from South Pole
  let earthAzimuth = (lon + deltaLonLibration + 180.0) % 360.0;
  if (earthAzimuth < 0) earthAzimuth += 360.0;

  // Elevation of Earth: depends heavily on latitude and libration
  // At -90° S, Earth is at 0° ± 6.7° elevation
  const earthBaseElevation = -(90.0 + lat) + deltaLatLibration * Math.cos((earthAzimuth - lon) * (Math.PI / 180));
  const earthElevation = earthBaseElevation + 0.5 * Math.sin(librationLonRad);
  const earthDistanceKm = 384400.0 + 21000.0 * Math.cos(librationLonRad);

  // 3. HORIZON OBSTRUCTION CHECK
  let isSunVisible = sunElevation > 0;
  let isEarthVisible = earthElevation > 0;

  if (horizonMask) {
    const sunHorizAngle = horizonMask(Math.floor(sunAzimuth));
    const earthHorizAngle = horizonMask(Math.floor(earthAzimuth));
    isSunVisible = sunElevation > sunHorizAngle;
    isEarthVisible = earthElevation > earthHorizAngle;
  }

  return {
    timeIso: date.toISOString(),
    sunAzimuthDeg: Number(sunAzimuth.toFixed(2)),
    sunElevationDeg: Number(sunElevation.toFixed(2)),
    sunDistanceAU: Number(distAU.toFixed(4)),
    sunSolarFluxWattsM2: Number(solarFlux.toFixed(1)),
    earthAzimuthDeg: Number(earthAzimuth.toFixed(2)),
    earthElevationDeg: Number(earthElevation.toFixed(2)),
    earthDistanceKm: Math.round(earthDistanceKm),
    isSunAboveHorizon: isSunVisible,
    isEarthAboveHorizon: isEarthVisible,
    isGoldenWindow: isSunVisible && isEarthVisible,
  };
}

/**
 * Generates a mission timeline series (e.g. 14-day lunar daylight cycle or 30-day lunar month)
 */
export function generateEphemerisSeries(
  lat: number,
  lon: number,
  startDate: Date,
  durationDays = 14,
  stepHours = 2,
  horizonMask?: (azimuthDeg: number) => number
): EphemerisSeries {
  const steps = Math.floor((durationDays * 24) / stepHours);
  const series: CelestialState[] = [];

  let sunVisibleCount = 0;
  let earthVisibleCount = 0;
  let goldenCount = 0;

  for (let i = 0; i <= steps; i++) {
    const epochTime = new Date(startDate.getTime() + i * stepHours * 3600000);
    const state = calculateLunarEphemeris(lat, lon, epochTime, horizonMask);
    series.push(state);

    if (state.isSunAboveHorizon) sunVisibleCount++;
    if (state.isEarthAboveHorizon) earthVisibleCount++;
    if (state.isGoldenWindow) goldenCount++;
  }

  const totalSteps = series.length;
  const sunHours = sunVisibleCount * stepHours;
  const earthHours = earthVisibleCount * stepHours;
  const goldenHours = goldenCount * stepHours;

  return {
    startTime: startDate.toISOString(),
    endTime: new Date(startDate.getTime() + durationDays * 86400000).toISOString(),
    stepHours,
    data: series,
    sunVisibilityHours: sunHours,
    earthVisibilityHours: earthHours,
    goldenWindowHours: goldenHours,
    sunVisibilityPct: Number(((sunVisibleCount / totalSteps) * 100).toFixed(1)),
    earthVisibilityPct: Number(((earthVisibleCount / totalSteps) * 100).toFixed(1)),
  };
}

/**
 * Builds the exact NASA JPL Horizons REST API URL for verification
 */
export function buildJplHorizonsQueryUrl(
  lat: number,
  lon: number,
  targetBody: "10" | "399", // 10 = Sun, 399 = Earth
  startDate: Date,
  stopDate: Date,
  stepSize = "1h"
): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const fmtDate = (d: Date) =>
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}%20${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;

  const startStr = fmtDate(startDate);
  const stopStr = fmtDate(stopDate);
  const siteCoord = `${lon.toFixed(4)},${lat.toFixed(4)},0`;

  return `https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND='${targetBody}'&OBJ_DATA='NO'&MAKE_EPHEM='YES'&EPHEM_TYPE='OBSERVER'&CENTER='coord@301'&SITE_COORD='${siteCoord}'&START_TIME='${startStr}'&STOP_TIME='${stopStr}'&STEP_SIZE='${stepSize}'&QUANTITIES='4'`;
}
