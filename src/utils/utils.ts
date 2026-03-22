/**
 * Utility functions for the application
 * @module utils
 */

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff wait time
 * @param attempt - The current attempt number (1-indexed)
 * @param baseMs - Base milliseconds to wait
 */
export function exponentialBackoff(attempt: number, baseMs: number = 1000): number {
  return baseMs * Math.pow(2, attempt - 1);
}

/**
 * Format a duration in milliseconds to a human-readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

/**
 * Sanitize a string for logging (remove sensitive data patterns)
 */
export function sanitizeForLogging(str: string): string {
  return str
    .replace(/[A-Za-z0-9_-]{32,}/g, "*****") // Token-like strings
    .replace(/sk-[A-Za-z0-9]{20,}/g, "sk-*****") // API keys
    .substring(0, 200); // Limit length
}

/**
 * Validate that a value is a valid intent
 */
export function isValidIntent(intent: string): boolean {
  const validIntents = ["code", "data", "writing", "career", "unclear"];
  return validIntents.includes(intent);
}

/**
 * Validate confidence score
 */
export function isValidConfidence(confidence: number): boolean {
  return typeof confidence === "number" && confidence >= 0 && confidence <= 1;
}

/**
 * Get average of numbers
 */
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

/**
 * Format confidence as percentage
 */
export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(0)}%`;
}

/**
 * Get emoji for intent
 */
export function getIntentEmoji(intent: string): string {
  const emoji: Record<string, string> = {
    code: "🧑‍💻",
    data: "📊",
    writing: "✍️",
    career: "💼",
    unclear: "🤔",
  };
  return emoji[intent] || "❓";
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}
