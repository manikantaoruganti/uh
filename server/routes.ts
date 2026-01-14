import type { Express } from "express";
import type { Server } from "http";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Do NOT proxy here.
  // Proxy is already handled in server/index.ts

  // If you ever add real Express routes (not proxied), add them here.
  // Example:
  // app.get("/health", (req, res) => res.send("OK"));

  return httpServer;
}
