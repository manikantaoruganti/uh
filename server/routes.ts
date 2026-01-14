import type { Express } from "express";
import type { Server } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Fix: Use process.cwd() to get absolute path from project root
const dataDir = path.join(process.cwd(), "data");

// Cache for loaded CSV data
let cachedScores: any[] | null = null;
let cachedPatterns: any[] | null = null;

// Load CSV data files
function loadCsvData() {
  try {
    if (cachedScores) return cachedScores;
    
    // Debug logging
    console.log(`[CSV Loader] Looking for data in: ${dataDir}`);
    
    // Check if directory exists
    if (!fs.existsSync(dataDir)) {
      console.error(`[CSV Loader] Directory not found: ${dataDir}`);
      return [];
    }
    
    const csvFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
    console.log(`[CSV Loader] Found ${csvFiles.length} CSV files`);
    
    if (csvFiles.length === 0) {
      console.warn(`[CSV Loader] No CSV files found in ${dataDir}`);
      return [];
    }
    
    const allScores: any[] = [];
    
    csvFiles.forEach(file => {
      try {
        const filePath = path.join(dataDir, file);
        console.log(`[CSV Loader] Processing file: ${file}`);
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.trim().split('\n');
        
        if (lines.length < 2) {
          console.warn(`[CSV Loader] File ${file} has no data rows`);
          return;
        }
        
        const headers = lines[0].split(',').map(h => h.trim());
        console.log(`[CSV Loader] Headers: ${headers.join(', ')}`);
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const row: any = {};
          headers.forEach((header, idx) => {
            const value = values[idx];
            // Try to convert to number if possible
            row[header] = isNaN(Number(value)) ? value : Number(value);
          });
          allScores.push(row);
        }
        
        console.log(`[CSV Loader] Loaded ${allScores.length} total records from ${file}`);
      } catch (fileError) {
        console.error(`[CSV Loader] Error processing file ${file}:`, fileError);
      }
    });
    
    console.log(`[CSV Loader] Total records loaded: ${allScores.length}`);
    cachedScores = allScores;
    return allScores;
  } catch (error) {
    console.error('[CSV Loader] Error loading CSV data:', error);
    return [];
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Get ADI scores for all districts from CSV
  app.get("/api/adi/get", (req, res) => {
    const scores = loadCsvData();
    console.log(`[API] /api/adi/get returning ${scores.length} records`);
    res.json({
      responses: [scores]
    });
  });

  // Get regions list extracted from data
  app.get("/api/regions", (req, res) => {
    const scores = loadCsvData();
    const regions = [...new Set(scores.map((s: any) => s.state || s.district || s.region).filter(Boolean))];
    console.log(`[API] /api/regions returning ${regions.length} regions`);
    res.json({
      regions,
      totalRegions: regions.length
    });
  });

  // Get detailed region profile
  app.get("/api/region/profile", (req, res) => {
    const regionName = req.query.state || '';
    const scores = loadCsvData();
    const regionScores = scores.filter((s: any) => 
      (s.state === regionName || s.region === regionName || s.district?.includes(regionName))
    );
    
    const avgScore = regionScores.length > 0 
      ? regionScores.reduce((sum: number, s: any) => sum + (s.adiScore || s.drift || 0), 0) / regionScores.length
      : 0;

    console.log(`[API] /api/region/profile for ${regionName} returning ${regionScores.length} records`);
    res.json({
      region: regionName,
      totalDistricts: regionScores.length,
      avgAdiScore: avgScore,
      topDriftZones: regionScores.slice(0, 5),
      data: regionScores
    });
  });

  // Get pattern data - analyze from actual data
  app.get("/api/patterns/get", (req, res) => {
    const scores = loadCsvData();
    
    // Analyze patterns from real data
    const patterns = [
      {
        pattern: "High Drift Zones",
        regions: scores.filter((s: any) => (s.adiScore || s.drift || 0) > 0.7).length,
        severity: "high",
        description: "Areas with significant ADI drift"
      },
      {
        pattern: "Moderate Drift Zones",
        regions: scores.filter((s: any) => (s.adiScore || s.drift || 0) > 0.4 && (s.adiScore || s.drift || 0) <= 0.7).length,
        severity: "moderate",
        description: "Areas with moderate ADI drift"
      },
      {
        pattern: "Stable Zones",
        regions: scores.filter((s: any) => (s.adiScore || s.drift || 0) <= 0.4).length,
        severity: "low",
        description: "Stable regions with low drift"
      }
    ];
    console.log(`[API] /api/patterns/get returning pattern analysis`);
    res.json({ responses: [patterns] });
  });

  return httpServer;
}
