/**
 * Horizon Mathematics & Terrain Obstruction Engine
 * Computes 360-degree topographic horizon masks and celestial line-of-sight
 * using Lunar Orbiter Laser Altimeter (LOLA) elevation principles.
 */

export interface HorizonProfilePoint {
  azimuthDeg: number;       // 0° (North) to 359° (clockwise)
  elevationDeg: number;     // Horizon obstruction angle above local tangent plane (-2° to +25°)
  distanceKm: number;       // Distance to the limiting topographic feature
  featureName?: string;     // Name of the obstructing crater rim / massif
}

export interface CelestialPosition {
  azimuthDeg: number;       // 0° to 360°
  elevationDeg: number;     // degrees above local tangent plane
  distanceKm: number;
  isVisible: boolean;       // true if elevationDeg > local horizon elevation at that azimuth
}

export interface HorizonAnalysisResult {
  points: HorizonProfilePoint[];
  maxObstructionDeg: number;
  minObstructionDeg: number;
  meanObstructionDeg: number;
  highestFeature: string;
}

// Major Lunar South Pole topographic features that cast horizon silhouettes
interface SouthPoleMassif {
  name: string;
  lat: number;
  lon: number;
  rimHeightKm: number; // Height above lunar reference sphere (1737.4 km)
  radiusKm: number;
}

const SOUTH_POLE_MASSIFS: SouthPoleMassif[] = [
  { name: "Shackleton Crater Rim", lat: -89.9, lon: 0.0, rimHeightKm: 1.4, radiusKm: 10.5 },
  { name: "Malapert Massif Peak", lat: -85.9, lon: 2.9, rimHeightKm: 5.1, radiusKm: 25.0 },
  { name: "de Gerlache Rim", lat: -88.5, lon: 271.0, rimHeightKm: 2.2, radiusKm: 16.0 },
  { name: "Faustini Crater Rim", lat: -87.3, lon: 77.0, rimHeightKm: 2.4, radiusKm: 20.0 },
  { name: "Shoemaker Rim", lat: -88.1, lon: 45.0, rimHeightKm: 1.8, radiusKm: 25.0 },
  { name: "Haworth Rim", lat: -87.4, lon: 355.0, rimHeightKm: 2.0, radiusKm: 18.0 },
  { name: "Amundsen North Ridge", lat: -84.5, lon: 83.0, rimHeightKm: 3.2, radiusKm: 40.0 },
  { name: "Nobile Rim Massif", lat: -85.2, lon: 53.0, rimHeightKm: 2.1, radiusKm: 35.0 },
  { name: "Cabeus Crater Rim", lat: -84.9, lon: 325.0, rimHeightKm: 2.8, radiusKm: 45.0 },
  { name: "Leibnitz Beta Peak", lat: -85.8, lon: 331.0, rimHeightKm: 4.2, radiusKm: 30.0 },
];

const R_MOON_KM = 1737.4;

/**
 * Calculates the 360° panoramic horizon elevation mask for a given lunar location
 */
export function calculateHorizonProfile(
  lat: number,
  lon: number,
  observerHeightMeters = 2.0, // standard 2m astronaut/lander sensor mast
  baseElevationMeters = 0
): HorizonAnalysisResult {
  const points: HorizonProfilePoint[] = [];
  let maxObs = -999;
  let minObs = 999;
  let sumObs = 0;
  let highestFeatureName = "Local Horizon Ridge";

  const obsLatRad = (lat * Math.PI) / 180;
  const obsLonRad = (lon * Math.PI) / 180;
  const obsElevKm = baseElevationMeters / 1000 + observerHeightMeters / 1000;

  for (let az = 0; az < 360; az++) {
    const azRad = (az * Math.PI) / 180;
    let maxAngleAtAzimuth = -0.5; // geometric dip angle of flat spherical horizon
    let dominantFeature = "Rolling Regolith";
    let dominantDist = 12.0;

    // Check line of sight against all regional massifs
    for (const massif of SOUTH_POLE_MASSIFS) {
      const massifLatRad = (massif.lat * Math.PI) / 180;
      const massifLonRad = (massif.lon * Math.PI) / 180;

      // Great circle distance on Moon
      const dLon = massifLonRad - obsLonRad;
      const cosAngle =
        Math.sin(obsLatRad) * Math.sin(massifLatRad) +
        Math.cos(obsLatRad) * Math.cos(massifLatRad) * Math.cos(dLon);
      const angularDist = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
      const distKm = angularDist * R_MOON_KM;

      if (distKm < 0.1 || distKm > 95.0) continue; // too close (self) or beyond horizon range

      // Azimuth from observer to massif
      const y = Math.sin(dLon) * Math.cos(massifLatRad);
      const x =
        Math.cos(obsLatRad) * Math.sin(massifLatRad) -
        Math.sin(obsLatRad) * Math.cos(massifLatRad) * Math.cos(dLon);
      let bearingDeg = (Math.atan2(y, x) * 180) / Math.PI;
      bearingDeg = (bearingDeg + 360) % 360;

      // Angular difference between ray azimuth and feature bearing
      let diff = Math.abs(az - bearingDeg);
      if (diff > 180) diff = 360 - diff;

      // Apparent angular width of the massif
      const halfWidthDeg = (Math.atan2(massif.radiusKm, distKm) * 180) / Math.PI;

      if (diff <= halfWidthDeg) {
        // Feature falls in this azimuth line of sight
        const proximityFactor = Math.cos((diff / halfWidthDeg) * (Math.PI / 2));
        const effectiveHeightKm = massif.rimHeightKm * proximityFactor;
        const deltaZ = effectiveHeightKm - obsElevKm;

        // Curvature correction: d^2 / (2 * R_moon)
        const curvatureDrop = (distKm * distKm) / (2 * R_MOON_KM);
        const apparentElevationDeg =
          (Math.atan2(deltaZ - curvatureDrop, distKm) * 180) / Math.PI;

        if (apparentElevationDeg > maxAngleAtAzimuth) {
          maxAngleAtAzimuth = apparentElevationDeg;
          dominantFeature = massif.name;
          dominantDist = distKm;
        }
      }
    }

    // Add high-frequency topographic roughness (micro-crater slopes & local topography noise)
    const localNoise =
      Math.sin(azRad * 3.5 + lon * 0.1) * 0.4 +
      Math.cos(azRad * 7.1 + lat * 0.2) * 0.25;
    const finalElevationDeg = Math.max(-1.5, maxAngleAtAzimuth + localNoise);

    if (finalElevationDeg > maxObs) {
      maxObs = finalElevationDeg;
      highestFeatureName = dominantFeature;
    }
    if (finalElevationDeg < minObs) {
      minObs = finalElevationDeg;
    }
    sumObs += finalElevationDeg;

    points.push({
      azimuthDeg: az,
      elevationDeg: Number(finalElevationDeg.toFixed(2)),
      distanceKm: Number(dominantDist.toFixed(1)),
      featureName: dominantFeature,
    });
  }

  return {
    points,
    maxObstructionDeg: Number(maxObs.toFixed(2)),
    minObstructionDeg: Number(minObs.toFixed(2)),
    meanObstructionDeg: Number((sumObs / 360).toFixed(2)),
    highestFeature: highestFeatureName,
  };
}

/**
 * Checks if a celestial body is visible above the local horizon profile
 */
export function checkVisibility(
  celestialAzDeg: number,
  celestialElevDeg: number,
  horizonPoints: HorizonProfilePoint[]
): { isVisible: boolean; horizonElevation: number; marginDeg: number } {
  const normAz = Math.floor(((celestialAzDeg % 360) + 360) % 360);
  const horizonPoint = horizonPoints[normAz] || horizonPoints[0];
  const horizonElev = horizonPoint.elevationDeg;
  const marginDeg = celestialElevDeg - horizonElev;

  return {
    isVisible: marginDeg > 0,
    horizonElevation: horizonElev,
    marginDeg: Number(marginDeg.toFixed(2)),
  };
}
