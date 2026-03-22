/**
 * Configuration management
 * @module config
 */

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export interface AppConfig {
  server: {
    port: number;
    nodeEnv: string;
  };
  llm: {
    groqApiKey: string | undefined;
    geminiApiKey: string | undefined;
    classifierModel: string;
    generationModel: string;
  };
  thresholds: {
    confidence: number;
  };
  limits: {
    maxMessageLength: number;
    maxLogEntries: number;
  };
}

/**
 * Get application configuration from environment
 */
export function getConfig(): AppConfig {
  return {
    server: {
      port: parseInt(process.env.PORT || "3000", 10),
      nodeEnv: process.env.NODE_ENV || "development",
    },
    llm: {
      groqApiKey: process.env.GROQ_API_KEY,
      geminiApiKey: process.env.GEMINI_API_KEY,
      classifierModel: process.env.CLASSIFIER_MODEL || "llama-3.1-8b-instant",
      generationModel: process.env.GENERATION_MODEL || "llama-3.3-70b-versatile",
    },
    thresholds: {
      confidence: parseFloat(process.env.CONFIDENCE_THRESHOLD || "0.7"),
    },
    limits: {
      maxMessageLength: 10000,
      maxLogEntries: 1000,
    },
  };
}

/**
 * Validate configuration
 */
export function validateConfig(config: AppConfig): string[] {
  const errors: string[] = [];

  if (!config.llm.groqApiKey) {
    errors.push("GROQ_API_KEY environment variable is required");
  }

  if (config.thresholds.confidence < 0 || config.thresholds.confidence > 1) {
    errors.push("CONFIDENCE_THRESHOLD must be between 0 and 1");
  }

  if (config.server.port < 1 || config.server.port > 65535) {
    errors.push("PORT must be a valid port number (1-65535)");
  }

  return errors;
}

/**
 * Get configuration singleton
 */
let configInstance: AppConfig | null = null;

export function initializeConfig(): AppConfig {
  if (!configInstance) {
    configInstance = getConfig();
    const errors = validateConfig(configInstance);
    if (errors.length > 0) {
      console.error("Configuration validation errors:");
      errors.forEach((error) => console.error(`  - ${error}`));
      throw new Error("Configuration validation failed");
    }
  }
  return configInstance;
}
