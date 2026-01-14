import type { Express } from "express";
import type { Server } from "http";

// Mock data for regions with ADI scores
const REGIONS = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttarakhand", "Uttar Pradesh",
  "West Bengal", "Chandigarh", "Delhi", "Puducherry", "Ladakh"
];

interface AdiScore {
  district: string;
  state: string;
  adiScore: number;
  updateCount: number;
  populationEstimate: number;
  latitude: number;
  longitude: number;
}

interface RegionData {
  state: string;
  totalUpdates: number;
  avgScore: number;
  highDriftZones: number;
}

// Generate mock ADI scores for districts
function generateMockAdiScores(): AdiScore[] {
  const scores: AdiScore[] = [];
  const districtNames = [
    "Bangalore", "Hyderabad", "Chennai", "Mumbai", "Delhi", "Kolkata",
    "Pune", "Jaipur", "Lucknow", "Kanpur", "Ahmedabad", "Surat",
    "Calcutta", "Coimbatore", "Visakhapatnam", "Indore", "Thane",
    "Nagpur", "Bhopal", "Vadodara", "Ghaziabad", "Ludhiana", "Patna",
    "Srinagar", "Ranchi", "Erode", "Aurangabad", "Dhanbad"
  ];

  REGIONS.forEach((region, index) => {
    const numDistricts = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numDistricts; i++) {
      const districtName = districtNames[(index + i) % districtNames.length];
      scores.push({
        district: `${districtName}-${region}`,
        state: region,
        adiScore: Math.random() * 0.95,
        updateCount: Math.floor(Math.random() * 500000) + 10000,
        populationEstimate: Math.floor(Math.random() * 5000000) + 100000,
        latitude: 8 + Math.random() * 30,
        longitude: 68 + Math.random() * 32
      });
    }
  });

  return scores;
}

// Generate regional summary data
function generateRegionData(): RegionData[] {
  return REGIONS.map(region => ({
    state: region,
    totalUpdates: Math.floor(Math.random() * 1000000) + 50000,
    avgScore: Math.random() * 0.8,
    highDriftZones: Math.floor(Math.random() * 15) + 1
  }));
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Get all regions
  app.get("/api/regions", (req, res) => {
    res.json({
      regions: REGIONS,
      totalRegions: REGIONS.length
    });
  });

  // Get ADI scores for all districts
  app.get("/api/adi/get", (req, res) => {
    const scores = generateMockAdiScores();
    res.json({
      responses: [scores]
    });
  });

  // Get region-level aggregated data
  app.get("/api/adi/get/path", (req, res) => {
    const regionData = generateRegionData();
    res.json({ responses: [regionData] });
  });

  // Get detailed region profile
  app.get("/api/region/profile", (req, res) => {
    const region = req.query.state || "Andhra Pradesh";
    const scores = generateMockAdiScores()
      .filter(s => s.state === region);
    
    res.json({
      region,
      totalDistricts: scores.length,
      avgAdiScore: scores.reduce((sum, s) => sum + s.adiScore, 0) / scores.length || 0,
      topDriftZones: scores
        .sort((a, b) => b.adiScore - a.adiScore)
        .slice(0, 5),
      data: scores
    });
  });

  // Get pattern data
  app.get("/api/patterns/get", (req, res) => {
    const patterns = [
      {
        pattern: "Urban Migration",
        regions: 12,
        severity: "high",
        description: "Significant movement to urban centers"
      },
      {
        pattern: "Age Group Shift",
        regions: 8,
        severity: "moderate",
        description: "Unusual age distribution changes"
      },
      {
        pattern: "Biometric Surge",
        regions: 5,
        severity: "high",
        description: "Unusual increase in biometric updates"
      },
      {
        pattern: "Gender Ratio Anomaly",
        regions: 3,
        severity: "low",
        description: "Deviation from expected gender distribution"
      }
    ];
    res.json({ responses: [patterns] });
  });

  return httpServer;
}
