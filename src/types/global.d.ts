// Type definitions for Node.js global objects and Express Request
// This allows for custom properties on Express Request object

declare global {
  namespace Express {
    interface Request {
      /**
       * Unique identifier for this request (added by middleware)
       */
      id?: string;

      /**
       * Start time of the request (added by timing middleware)
       */
      startTime?: number;

      /**
       * Current user context (if authentication is added)
       */
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }

  namespace NodeJS {
    /**
     * Environment variables for the application
     */
    interface ProcessEnv {
      /**
       * Server port
       * @default 3000
       */
      PORT?: string;

      /**
       * Node environment
       * @default development
       */
      NODE_ENV?: "development" | "production" | "test";

      /**
       * Groq API key - required for LLM inference
       */
      GROQ_API_KEY: string;

      /**
       * Google Gemini API key - optional
       */
      GEMINI_API_KEY?: string;

      /**
       * Model for intent classification
       * @default llama-3.1-8b-instant
       */
      CLASSIFIER_MODEL?: string;

      /**
       * Model for response generation
       * @default llama-3.3-70b-versatile
       */
      GENERATION_MODEL?: string;

      /**
       * Confidence threshold for intent classification (0-1)
       * Below this threshold, intent is set to "unclear"
       * @default 0.7
       */
      CONFIDENCE_THRESHOLD?: string;

      /**
       * Enable debug logging
       * @default false
       */
      DEBUG?: string;

      /**
       * API base URL (for client-side use)
       */
      REACT_APP_API_URL?: string;
    }
  }
}

export {};
