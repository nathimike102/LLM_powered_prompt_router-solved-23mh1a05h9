import Groq from "groq-sdk";

let groqClient: Groq | null = null;

/**
 * Returns a singleton Groq client instance.
 */
export function getGroqClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

/**
 * Reset the Groq client (useful for testing).
 */
export function resetGroqClient(): void {
  groqClient = null;
}
