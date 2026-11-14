import { LunarSite } from "./artemisSites";
import { evaluateCraterHazard } from "./kaggleCraterDb";

export interface McdaWeights {
  solarWeight: number;      // 0 to 1
  commsWeight: number;      // 0 to 1
  slopeSafetyWeight: number; // 0 to 1
  scienceIceWeight: number; // 0 to 1
  hazardClearanceWeight: number; // 0 to 1
}

export type MissionProfile = "CREWED_ARTEMIS" | "SOLAR_CLPS" | "ICE_PROSPECTOR" | "BALANCED";

export const MISSION_PRESETS: Record<MissionProfile, { name: string; description: string; weights: McdaWeights }> = {
  CREWED_ARTEMIS: {
    name: "Artemis III Crewed Mission",
    description: "Prioritizes astronaut safety, low landing slope (<7°), continuous Earth communication, and moderate solar lighting.",
    weights: {
      solarWeight: 0.20,
      commsWeight: 0.30,
      slopeSafetyWeight: 0.35,
      scienceIceWeight: 0.10,
      hazardClearanceWeight: 0.05,
    },
  },
  SOLAR_CLPS: {
    name: "CLPS Commercial Lander (Solar Powered)",
    description: "Maximizes uninterrupted solar illumination to keep non-nuclear batteries charged for maximum operational lifespan.",
    weights: {
      solarWeight: 0.50,
      commsWeight: 0.20,
      slopeSafetyWeight: 0.20,
      scienceIceWeight: 0.05,
      hazardClearanceWeight: 0.05,
    },
  },
  ICE_PROSPECTOR: {
    name: "Volatile / Water Ice Prospector (VIPER Class)",
    description: "Focuses on immediate proximity to Permanently Shadowed Regions (PSRs) and ancient ice deposits.",
    weights: {
      solarWeight: 0.20,
      commsWeight: 0.15,
      slopeSafetyWeight: 0.20,
      scienceIceWeight: 0.35,
      hazardClearanceWeight: 0.10,
    },
  },
  BALANCED: {
    name: "General Exploration Baseline",
    description: "Balanced multi-parameter trade study across all engineering and scientific variables.",
    weights: {
      solarWeight: 0.25,
      commsWeight: 0.25,
      slopeSafetyWeight: 0.25,
      scienceIceWeight: 0.15,
      hazardClearanceWeight: 0.10,
    },
  },
};

export interface SiteScoreBreakdown {
  site: LunarSite;
  solarScore: number;       // 0 - 100
  commsScore: number;       // 0 - 100
  slopeScore: number;       // 0 - 100
  scienceScore: number;     // 0 - 100
  hazardScore: number;      // 0 - 100
  compositeScore: number;   // 0 - 100 (weighted sum)
  readinessRating: "GO" | "CAUTION" | "NO-GO";
  keyStrength: string;
  keyLimitation: string;
}

/**
 * Calculates the MCDA score breakdown for a specific lunar site under chosen weights
 */
export function scoreLunarSite(site: LunarSite, weights: McdaWeights): SiteScoreBreakdown {
  // 1. Solar Score: based on annual direct illumination percentage
  const solarScore = Math.min(100, Math.max(0, (site.sunlightPctAnnual / 90.0) * 100));

  // 2. Comms Score: based on Direct-to-Earth line-of-sight availability
  const commsScore = Math.min(100, Math.max(0, (site.dteVisibilityPct / 95.0) * 100));

  // 3. Slope Score: penalty for slopes > 5°, severe penalty for max slopes > 12°
  let slopeScore = 100 - site.averageSlopeDeg * 8.0;
  if (site.maxSlopeDeg > 12.0) {
    slopeScore -= (site.maxSlopeDeg - 12.0) * 10.0;
  }
  slopeScore = Math.max(0, Math.min(100, slopeScore));

  // 4. Science Ice Score: proximity to Permanently Shadowed Region
  // Sites within 1 km get 100 points, sites > 10 km drop to 20
  let scienceScore = 100;
  if (site.psrDistanceKm > 0.5) {
    scienceScore = Math.max(10, 100 - (site.psrDistanceKm - 0.5) * 18.0);
  }

  // 5. Crater Hazard Clearance (using Kaggle / Robbins DB evaluation)
  const hazardEval = evaluateCraterHazard(site.lat, site.lon);
  const hazardScore = hazardEval.safetyScore;

  // Composite Weighted Sum
  const totalWeight =
    weights.solarWeight +
    weights.commsWeight +
    weights.slopeSafetyWeight +
    weights.scienceIceWeight +
    weights.hazardClearanceWeight;

  const compositeScore =
    (solarScore * weights.solarWeight +
      commsScore * weights.commsWeight +
      slopeScore * weights.slopeSafetyWeight +
      scienceScore * weights.scienceIceWeight +
      hazardScore * weights.hazardClearanceWeight) /
    (totalWeight || 1.0);

  const roundedComposite = Number(compositeScore.toFixed(1));

  let readinessRating: "GO" | "CAUTION" | "NO-GO" = "GO";
  if (roundedComposite < 55 || site.maxSlopeDeg > 15.0) {
    readinessRating = "NO-GO";
  } else if (roundedComposite < 72 || site.maxSlopeDeg > 11.0) {
    readinessRating = "CAUTION";
  }

  // Strengths and limitations
  let keyStrength = "Exceptional solar illumination duration";
  if (commsScore > 90) keyStrength = "Unobstructed continuous Direct-to-Earth radio link";
  else if (scienceScore > 90) keyStrength = "Immediate pedestrian access to water-ice volatiles (<500m)";
  else if (slopeScore > 85) keyStrength = "Extremely flat landing terrain with low tip-over hazard";

  let keyLimitation = "Moderate slope gradient on surrounding rim";
  if (solarScore < 65) keyLimitation = "Long periodic shadows from adjacent mountain ridges";
  else if (commsScore < 70) keyLimitation = "Frequent DTE communication blackouts";
  else if (scienceScore < 40) keyLimitation = "Long transit distance to nearest ice deposits";

  return {
    site,
    solarScore: Number(solarScore.toFixed(1)),
    commsScore: Number(commsScore.toFixed(1)),
    slopeScore: Number(slopeScore.toFixed(1)),
    scienceScore: Number(scienceScore.toFixed(1)),
    hazardScore: Number(hazardScore.toFixed(1)),
    compositeScore: roundedComposite,
    readinessRating,
    keyStrength,
    keyLimitation,
  };
}

/**
 * Ranks all candidate sites based on chosen mission profile
 */
export function rankSites(
  sites: LunarSite[],
  profile: MissionProfile = "CREWED_ARTEMIS"
): SiteScoreBreakdown[] {
  const weights = MISSION_PRESETS[profile].weights;
  return sites
    .map((site) => scoreLunarSite(site, weights))
    .sort((a, b) => b.compositeScore - a.compositeScore);
}
