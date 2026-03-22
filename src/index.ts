/**
 * Type-safe entry point exporting all public API interfaces and functions
 * @module intent-router
 */

export { handleMessage } from "./core/router";
export {
  classifyIntent,
  parseClassifierResponse,
  VALID_INTENTS,
} from "./core/classifier";
export { logRouteDecision, LOG_FILE, initializeLogFile } from "./utils/logger";
export { getGroqClient, resetGroqClient } from "./clients/groqClient";
export { getGeminiClient, getGeminiModel, resetGeminiClient } from "./clients/geminiClient";

// Type exports
export type {
  ClassificationResult,
  RouteResult,
  PersonaPrompt,
  PromptsConfig,
  OverrideDetection,
  RequestMetrics,
  LogEntry,
} from "./types";
