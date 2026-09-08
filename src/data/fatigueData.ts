// IRS Steel Bridge Code - Fatigue Detail Categories as per Appendix G (Re-revised)
// Based on IRS SBC 2017 and amendments

export interface DetailCategory {
  id: number;
  category: number; // Detail category number (fatigue strength at 2 million cycles in MPa)
  description: string;
  group: string;
  deltaσC: number; // Reference fatigue strength at 2×10^6 cycles (MPa)
}

export const detailCategories: DetailCategory[] = [
  // Group 1: Non-welded details (Plain material)
  { id: 1, category: 160, description: "Rolled/extruded plates, flats with no flame-cut edges. Sharp edges, surface & rolling flaws removed by grinding.", group: "Plain Material", deltaσC: 160 },
  { id: 2, category: 140, description: "Rolled/extruded plates, flats with as-rolled edges. No repair by weld refill.", group: "Plain Material", deltaσC: 140 },
  { id: 3, category: 125, description: "Machine gas-cut or sheared material with subsequent dressing. No cracks by inspection.", group: "Plain Material", deltaσC: 125 },
  { id: 4, category: 112, description: "Material with machine gas-cut edges with shallow & regular drag lines.", group: "Plain Material", deltaσC: 112 },

  // Group 2: Bolted connections
  { id: 5, category: 112, description: "Bolted cover plates. Fitted bolts or HSFG bolts. Stress in gross section.", group: "Bolted Connections", deltaσC: 112 },
  { id: 6, category: 100, description: "Bolted connections with stress in net section. HSFG bolts bearing type.", group: "Bolted Connections", deltaσC: 100 },
  { id: 7, category: 90, description: "Bolted connections. Black bolts in shear/bearing. Stress at net section.", group: "Bolted Connections", deltaσC: 90 },

  // Group 3: Welded - Butt welds
  { id: 8, category: 125, description: "Transverse butt weld, full penetration, ground flush, 100% NDT. Weld overfill ≤ 10% of plate thickness.", group: "Butt Welds", deltaσC: 125 },
  { id: 9, category: 112, description: "Transverse butt weld, full penetration, ground flush. Welded from both sides.", group: "Butt Welds", deltaσC: 112 },
  { id: 10, category: 100, description: "Transverse butt weld, full penetration, welded from both sides, weld overfill ≤ 3mm.", group: "Butt Welds", deltaσC: 100 },
  { id: 11, category: 90, description: "Transverse butt weld, full penetration, welded from one side with backing strip.", group: "Butt Welds", deltaσC: 90 },
  { id: 12, category: 80, description: "Transverse butt weld on permanent backing bar.", group: "Butt Welds", deltaσC: 80 },
  { id: 13, category: 71, description: "Transverse partial penetration butt weld with fillet weld. Toe crack.", group: "Butt Welds", deltaσC: 71 },

  // Group 4: Welded - Longitudinal welds
  { id: 14, category: 125, description: "Automatic longitudinal fillet or butt weld with no stop/start positions.", group: "Longitudinal Welds", deltaσC: 125 },
  { id: 15, category: 112, description: "Automatic fillet or butt weld. Stop/start positions.", group: "Longitudinal Welds", deltaσC: 112 },
  { id: 16, category: 100, description: "Manual longitudinal fillet or butt weld.", group: "Longitudinal Welds", deltaσC: 100 },
  { id: 17, category: 90, description: "Intermittent longitudinal fillet weld. Gap ratio ≤ 2.5.", group: "Longitudinal Welds", deltaσC: 90 },

  // Group 5: Welded attachments (non-load carrying welds)
  { id: 18, category: 80, description: "Cruciform joints with full penetration butt welds and fillet welds. Attachment length ≤ 100mm.", group: "Welded Attachments", deltaσC: 80 },
  { id: 19, category: 71, description: "Fillet welded attachments. Attachment length > 100mm to ≤ 200mm.", group: "Welded Attachments", deltaσC: 71 },
  { id: 20, category: 63, description: "Fillet welded attachments. Attachment length > 200mm.", group: "Welded Attachments", deltaσC: 63 },
  { id: 21, category: 56, description: "Fillet welded shear connectors on base material.", group: "Welded Attachments", deltaσC: 56 },
  { id: 22, category: 50, description: "Transverse fillet welds with root gap. Cruciform joint with partial penetration.", group: "Welded Attachments", deltaσC: 50 },
  { id: 23, category: 45, description: "Bearing plates welded to underside of flange. Cover plates wider than flange.", group: "Welded Attachments", deltaσC: 45 },
  { id: 24, category: 40, description: "Welded stiffeners to web. Reinforcing plates welded to flanges. Weld termination at cope holes.", group: "Welded Attachments", deltaσC: 40 },
  { id: 25, category: 36, description: "Welded attachments to member edges. Transverse stiffener welded to member edge.", group: "Welded Attachments", deltaσC: 36 },
];

// Annual traffic volume table as per Appendix G-I Table 1(a) of IRS SBC 2017
export interface TrafficData {
  loadingType: string;
  description: string;
  gmtValues: { type: string; value: number }[];
}

export const trafficDataTable: TrafficData[] = [
  {
    loadingType: "25T Loading",
    description: "25 Tonne Axle Load",
    gmtValues: [
      { type: "Suburban", value: 30 },
      { type: "Sub-Urban", value: 60 },
      { type: "Main Line", value: 90 },
      { type: "Heavy Haul", value: 120 },
    ],
  },
  {
    loadingType: "DFC Loading",
    description: "Dedicated Freight Corridor",
    gmtValues: [
      { type: "Light", value: 50 },
      { type: "Medium", value: 100 },
      { type: "Heavy", value: 150 },
      { type: "Very Heavy", value: 200 },
    ],
  },
];

// S-N curve parameters as per IRS Steel Bridge Code
export interface SNParameters {
  m1: number; // Slope for N ≤ 5×10^6
  m2: number; // Slope for 5×10^6 < N ≤ 10^8
  NC: number; // Reference cycles (2×10^6)
  ND: number; // Constant amplitude fatigue limit cycles (5×10^6)
  NL: number; // Cut-off limit cycles (10^8)
}

export const snParameters: SNParameters = {
  m1: 3,
  m2: 5,
  NC: 2e6,
  ND: 5e6,
  NL: 1e8,
};

// Calculate constant amplitude fatigue limit
export function calculateΔσD(ΔσC: number): number {
  return Math.pow(2 / 5, 1 / 3) * ΔσC;
}

// Calculate cut-off limit
export function calculateΔσL(ΔσC: number): number {
  const ΔσD = calculateΔσD(ΔσC);
  return Math.pow(5 / 100, 1 / 5) * ΔσD;
}

// Calculate number of cycles to failure
export function calculateNR(Δσ: number, ΔσC: number): number {
  const ΔσD = calculateΔσD(ΔσC);
  const ΔσL = calculateΔσL(ΔσC);

  if (Δσ <= ΔσL) {
    return Infinity; // Below cut-off limit, infinite life
  } else if (Δσ <= ΔσD) {
    // Region with slope m2 = 5
    return (Math.pow(ΔσD, 5) * 5e6) / Math.pow(Δσ, 5);
  } else {
    // Region with slope m1 = 3
    return (Math.pow(ΔσC, 3) * 2e6) / Math.pow(Δσ, 3);
  }
}

// Calculate lambda2 factor (traffic volume factor) as per Cl. 14.6.4 of IRS SBC 2017
export function calculateλ2(Ta: number): number {
  return 0.5193 * Math.pow(Ta, 0.2036);
}

// Calculate lambda3 factor (design life factor)
export function calculateλ3(designLife: number): number {
  return Math.pow(designLife / 100, 1 / 3);
}

// Calculate lambda4 factor (multi-lane factor) as per Cl. 14.6.6 of IRS SBC 2017
export function calculateλ4(a: number): number {
  // a = σ1 / (σ1 + σ2), where σ1 = stress from 1 lane, σ1+σ2 = stress from all lanes
  return 0.7926 * a * a - 0.728 * a + 0.9371;
}

// Size effect factor for thickness > 25mm as per Cl. of IRS SBC 2017
export function calculateSizeEffect(thickness: number): number {
  if (thickness <= 25) return 1.0;
  return Math.pow(25 / thickness, 0.2);
}

// Generate S-N curve data points
export function generateSNCurveData(ΔσC: number): { N: number; sigma: number }[] {
  const ΔσD = calculateΔσD(ΔσC);
  const ΔσL = calculateΔσL(ΔσC);
  const points: { N: number; sigma: number }[] = [];

  // High stress range (m=3 region)
  for (let logN = 4; logN <= Math.log10(5e6); logN += 0.1) {
    const N = Math.pow(10, logN);
    const sigma = ΔσC * Math.pow(2e6 / N, 1 / 3);
    points.push({ N, sigma });
  }

  // Medium stress range (m=5 region)
  for (let logN = Math.log10(5e6); logN <= 8; logN += 0.1) {
    const N = Math.pow(10, logN);
    const sigma = ΔσD * Math.pow(5e6 / N, 1 / 5);
    points.push({ N, sigma });
  }

  // Cut-off limit
  points.push({ N: 1e8, sigma: ΔσL });
  points.push({ N: 1e9, sigma: ΔσL });

  return points;
}

// Partial safety factors
export const partialSafetyFactors = {
  γFf: 1.0,  // Partial factor for fatigue loads (as per IRS SBC)
  γMf: {
    safe_life_high_consequence: 1.35,
    safe_life_low_consequence: 1.15,
    damage_tolerant_high_consequence: 1.15,
    damage_tolerant_low_consequence: 1.0,
  },
};

// Steel grades as per IRS Steel Bridge Code
export interface SteelGrade {
  name: string;
  fy: number; // Yield stress in MPa
  fu: number; // Ultimate stress in MPa
  standard: string;
}

export const steelGrades: SteelGrade[] = [
  { name: "E250 (Fe 410W A)", fy: 250, fu: 410, standard: "IS 2062" },
  { name: "E250 (Fe 410W B)", fy: 250, fu: 410, standard: "IS 2062" },
  { name: "E250 (Fe 410W C)", fy: 250, fu: 410, standard: "IS 2062" },
  { name: "E300 (Fe 440)", fy: 300, fu: 440, standard: "IS 2062" },
  { name: "E350 (Fe 490)", fy: 350, fu: 490, standard: "IS 2062" },
  { name: "E410 (Fe 540)", fy: 410, fu: 540, standard: "IS 2062" },
  { name: "E450 (Fe 570) D", fy: 450, fu: 570, standard: "IS 2062" },
  { name: "E450 (Fe 590) E", fy: 450, fu: 590, standard: "IS 2062" },
  { name: "Mild Steel (IS 226)", fy: 236, fu: 412, standard: "IS 226 (Old)" },
  { name: "HTS Gr.58 (IS 961)", fy: 350, fu: 580, standard: "IS 961 (Old)" },
];
