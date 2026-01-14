import type { Express } from "express";
import type { Server } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// FIXED: Use process.cwd() for absolute path resolution instead of relative path
const dataDir = path.join(process.cwd(), "data");

// Cache for loaded CSV data
let cachedScores: any[] | null = null;
let cachedPatterns: any[] | null = null;

/**
 * Load CSV data files from the data directory
 * Reads all CSV files, parses headers and values, and converts numeric strings to numbers
 */
function loadCsvData() {
  try {
    // Return cached data if already loaded
    if (cachedScores) return cachedScores;

    // Debug: Show where we're looking for data
    console.log(`[CSV Loader] Attempting to load CSV files from: ${dataDir}`);

    // Check if directory exists
    if (!fs.existsSync(dataDir)) {
      console.error(
        `[CSV Loader] ERROR: Data directory not found at ${dataDir}. Make sure /data folder exists in project root."
      );
      return [];
    }

    // Read all CSV files from directory
    const csvFiles = fs
      .readdirSync(dataDir)
      .filter((f) => f.endsWith(".csv"));

    if (csvFiles.length === 0) {
      console.warn(`[CSV Loader] WARNING: No CSV files found in ${dataDir}`);
      return [];
    }

    console.log(
      `[CSV Loader] Found ${csvFiles.length} CSV file(s) to process`
    );

    const allScores: any[] = [];
    let filesProcessed = 0;

    // Process each CSV file
    csvFiles.forEach((file) => {
      try {
        const filePath = path.join(dataDir, file);
        console.log(`[CSV Loader] Processing: ${file}`);

        // Read file content
        const content = fs.readFileSync(filePath, "utf-8");
        const lines = content.trim().split("\n");

        // Validate file has headers and data
        if (lines.length < 2) {
          console.warn(
            `[CSV Loader] WARNING: File ${file} has no data rows (only ${lines.length} line(s))`
          );
          return;
        }

        // Parse headers
        const headers = lines[0].split(",").map((h) => h.trim());
        console.log(
          `[CSV Loader] Headers found: [${headers.join(", ")}]`
        );

        let rowsInFile = 0;

        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue; // Skip empty lines

          const values = line.split(",").map((v) => v.trim());
          const row: any = {};

          // Map values to headers
          headers.forEach((header, idx) => {
            const value = values[idx] || "";
            // Try to parse as number, otherwise keep as string
            row[header] = isNaN(Number(value)) ? value : Number(value);
          });

          allScores.push(row);
          rowsInFile++;
        }

        console.log(
          `[CSV Loader] Successfully loaded ${rowsInFile} rows from ${file}`
        );
        filesProcessed++;
      } catch (fileError) {
        console.error(`[CSV Loader] ERROR processing ${file}:`, fileError);
      }
    });

    console.log(
      `[CSV Loader] ✅ Successfully loaded data from ${filesProcessed}/${csvFiles.length} files`
    );
    console.log(
      `[CSV Loader] ✅ Total records loaded: ${allScores.length}`
    );

    cachedScores = allScores;
    return allScores;
  } catch (error) {
    console.error("[CSV Loader] FATAL ERROR:", error);
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
    try {
      const scores = loadCsvData();
      console.log(`[API] /api/adi/get - Returning ${scores.length} records`);
      res.json({
        responses: [scores],
        total: scores.length,
        success: scores.length > 0,
      });
    } catch (error) {
      console.error("[API] /api/adi/get ERROR:", error);
      res.status(500).json({ error: "Failed to load ADI data" });
    }
  });

  // Get regions list extracted from data
  app.get("/api/regions", (req, res) => {
    try {
      const scores = loadCsvData();
      const regions = [
        ...new Set(
          scores
            .map((s: any) => s.state || s.district || s.region)
            .filter(Boolean)
        ),
      ];
      console.log(`[API] /api/regions - Returning ${regions.length} regions`);
      res.json({
        regions,
        totalRegions: regions.length,
      });
    } catch (error) {
      console.error("[API] /api/regions ERROR:", error);
      res.status(500).json({ error: "Failed to load regions" });
    }
  });

  // Get detailed region profile
  app.get("/api/region/profile", (req, res) => {
    try {
      const regionName = req.query.state || "";
      const scores = loadCsvData();
      const regionScores = scores.filter(
        (s: any) =>
          s.state === regionName ||
          s.region === regionName ||
          s.district?.includes(regionName)
      );

      const avgScore =
        regionScores.length > 0
          ? regionScores.reduce(
              (sum: number, s: any) => sum + (s.adiScore || s.drift || 0),
              0
            ) / regionScores.length
          : 0;

      console.log(
        `[API] /api/region/profile for ${regionName} - Returning ${regionScores.length} districts`
      );

      res.json({
        region: regionName,
        totalDistricts: regionScores.length,
        avgAdiScore: avgScore,
        topDriftZones: regionScores.slice(0, 5),
        data: regionScores,
      });
    } catch (error) {
      console.error("[API] /api/region/profile ERROR:", error);
      res.status(500).json({ error: "Failed to load region profile" });
    }
  });

  // Get pattern data - analyze from actual data
  app.get("/api/patterns/get", (req, res) => {
    try {
      const scores = loadCsvData();

      // Analyze patterns from real data
      const highDriftCount = scores.filter(
        (s: any) => (s.adiScore || s.drift || 0) > 0.7
      ).length;
      const moderateDriftCount = scores.filter(
        (s: any) =>
          (s.adiScore || s.drift || 0) > 0.4 &&
          (s.adiScore || s.drift || 0) <= 0.7
      ).length;
      const stableCount = scores.filter(
        (s: any) => (s.adiScore || s.drift || 0) <= 0.4
      ).length;

      const patterns = [
        {
          pattern: "High Drift Zones",
          regions: highDriftCount,
          severity: "high",
          description: "Areas with significant ADI drift",
          percentage: ((highDriftCount / scores.length) * 100).toFixed(2),
        },
        {
          pattern: "Moderate Drift Zones",
          regions: moderateDriftCount,
          severity: "moderate",
          description: "Areas with moderate ADI drift",
          percentage: ((moderateDriftCount / scores.length) * 100).toFixed(2),
        },
        {
          pattern: "Stable Zones",
          regions: stableCount,
          severity: "low",
          description: "Stable regions with low drift",
          percentage: ((stableCount / scores.length) * 100).toFixed(2),
        },
      ];

      console.log(`[API] /api/patterns/get - Pattern analysis complete`);
      res.json({ responses: [patterns] });
    } catch (error) {
      console.error("[API] /api/patterns/get ERROR:", error);
      res.status(500).json({ error: "Failed to load patterns" });
    }
  });

  return httpServer;
}
