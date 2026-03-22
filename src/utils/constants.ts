/**
 * Application constants and configuration
 * @module constants
 */

// Environment-based configuration
export const CONFIG = {
  PORT: parseInt(process.env.PORT || "3000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  CONFIDENCE_THRESHOLD: parseFloat(process.env.CONFIDENCE_THRESHOLD || "0.7"),
  
  // LLM Models
  CLASSIFIER_MODEL: process.env.CLASSIFIER_MODEL || "llama-3.1-8b-instant",
  GENERATION_MODEL: process.env.GENERATION_MODEL || "llama-3.3-70b-versatile",
  
  // API Keys
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
} as const;

// Intent categories
export const INTENT_CATEGORIES = {
  CODE: "code",
  DATA: "data",
  WRITING: "writing",
  CAREER: "career",
  UNCLEAR: "unclear",
} as const;

// LLM Configuration
export const LLM_CONFIG = {
  CLASSIFIER: {
    temperature: 0,
    max_tokens: 60,
    response_format: { type: "json_object" },
  },
  GENERATION: {
    temperature: 0.7,
    max_tokens: 1024,
  },
  RETRY_ATTEMPTS: 3,
  RATE_LIMIT_BACKOFF_MS: 15000,
} as const;

// Request/Response limits
export const LIMITS = {
  MAX_MESSAGE_LENGTH: 8192,
  MAX_LOG_ENTRIES_IN_MEMORY: 100,
  MAX_RESPONSE_TIME_SAMPLES: 100,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  ROUTE: "/api/route",
  CHAT: "/chat",
  HEALTH: "/api/health",
  LOGS: "/api/logs",
} as const;

// Validation patterns
export const PATTERNS = {
  OVERRIDE_PREFIX: /^@(code|data|writing|career)\s+/i,
} as const;
