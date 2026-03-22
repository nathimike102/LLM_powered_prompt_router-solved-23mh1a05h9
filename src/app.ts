import "dotenv/config";
import express, { Express, Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { handleMessage } from "./core/router";
import { LOG_FILE, initializeLogFile } from "./utils/logger";
import { RouteResult, RequestMetrics } from "./types";

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

function resolvePublicDir(): string {
  const candidates: string[] = [
    path.join(__dirname, "public"),
    path.join(__dirname, "..", "public"),
    path.join(process.cwd(), "src", "public"),
    path.join(process.cwd(), "public"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "index.html"))) {
      return candidate;
    }
  }

  return path.join(process.cwd(), "src", "public");
}

const PUBLIC_DIR: string = resolvePublicDir();

// Initialize log file
initializeLogFile();

// Track server start time and request metrics
const serverStartTime: number = Date.now();
const requestMetrics: RequestMetrics = {
  total: 0,
  byIntent: {},
  avgResponseTime: 0,
  responseTimes: [],
};

app.use(express.json());
app.use(express.static(PUBLIC_DIR));

/**
 * POST /api/route
 * Body: { "message": "user's message here", "history": [{ "role": "user", "content": "..." }] }
 * Returns: { intent, confidence, persona, emoji, response, responseTime }
 */
app.post("/api/route", async (req: Request, res: Response): Promise<void> => {
  const { message, history } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    res.status(400).json({
      error: "A non-empty 'message' string is required in the request body.",
    });
    return;
  }

  const startTime: number = Date.now();
  try {
    const result: RouteResult = await handleMessage(message.trim(), history);
    const responseTime: number = Date.now() - startTime;

    // Track metrics
    requestMetrics.total++;
    requestMetrics.byIntent[result.intent] = (requestMetrics.byIntent[result.intent] || 0) + 1;
    requestMetrics.responseTimes.push(responseTime);
    if (requestMetrics.responseTimes.length > 100) requestMetrics.responseTimes.shift();
    requestMetrics.avgResponseTime = Math.round(
      requestMetrics.responseTimes.reduce((a, b) => a + b, 0) / requestMetrics.responseTimes.length
    );

    res.json({ ...result, responseTime });
  } catch (error: any) {
    console.error("Error handling message:", error?.message);
    res.status(500).json({
      error: "An internal error occurred while processing your request.",
    });
  }
});

/**
 * POST /chat
 * Alias for /api/route — matches assignment spec endpoint
 * Body: { "message": "user's message here", "history": [] }
 * Returns: { intent, confidence, response }
 */
app.post("/chat", async (req: Request, res: Response): Promise<void> => {
  const { message, history } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    res.status(400).json({
      error: "A non-empty 'message' string is required in the request body.",
    });
    return;
  }

  const startTime: number = Date.now();
  try {
    const result: RouteResult = await handleMessage(message.trim(), history);
    const responseTime: number = Date.now() - startTime;

    requestMetrics.total++;
    requestMetrics.byIntent[result.intent] = (requestMetrics.byIntent[result.intent] || 0) + 1;
    requestMetrics.responseTimes.push(responseTime);
    if (requestMetrics.responseTimes.length > 100) requestMetrics.responseTimes.shift();

    res.json({
      intent: result.intent,
      confidence: result.confidence,
      response: result.response,
      responseTime,
    });
  } catch (error: any) {
    console.error("Error handling message:", error?.message);
    res.status(500).json({
      error: "An internal error occurred while processing your request.",
    });
  }
});

/**
 * GET /api/health
 * Health-check endpoint with uptime and metrics
 */
app.get("/api/health", (req: Request, res: Response): void => {
  const uptime: number = Date.now() - serverStartTime;
  res.json({
    status: "ok",
    uptime,
    uptimeSeconds: Math.floor(uptime / 1000),
    metrics: requestMetrics,
  });
});

/**
 * GET /api/logs
 * Returns recent log entries from route_log.jsonl (last 50 by default)
 */
app.get("/api/logs", (req: Request, res: Response): void => {
  const limit: number = parseInt(req.query.limit as string) || 50;

  try {
    if (!fs.existsSync(LOG_FILE)) {
      res.json({ logs: [] });
      return;
    }

    const fileContent: string = fs.readFileSync(LOG_FILE, "utf-8");
    const lines: string[] = fileContent.split("\n").filter((line) => line.trim());
    const logs: any[] = lines
      .slice(Math.max(0, lines.length - limit))
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter((log) => log !== null);

    res.json({ logs });
  } catch (error: any) {
    console.error("Error reading logs:", error?.message);
    res.status(500).json({ error: "Failed to read log entries." });
  }
});

/**
 * Root path — serves public UI
 */
app.get("/", (req: Request, res: Response): void => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

/**
 * Error handling middleware
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "An unexpected error occurred.",
  });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response): void => {
  res.status(404).json({ error: "Not found." });
});

// Start the server
app.listen(PORT, (): void => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`View logs: http://localhost:${PORT}/api/logs`);
});

export default app;
