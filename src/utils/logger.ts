import fs from "fs";
import path from "path";
import { LogEntry } from "../types";

export const LOG_FILE: string = path.join(process.cwd(), "route_log.jsonl");

/**
 * Appends a structured log entry to route_log.jsonl.
 * Each entry is a single JSON object on its own line (JSON Lines format).
 */
export function logRouteDecision(entry: Omit<LogEntry, "timestamp">): void {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
  };

  const line: string = JSON.stringify(logEntry) + "\n";
  fs.appendFileSync(LOG_FILE, line, "utf-8");
}

/**
 * Creates the log file if it doesn't exist.
 */
export function initializeLogFile(): void {
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, "", "utf-8");
  }
}
