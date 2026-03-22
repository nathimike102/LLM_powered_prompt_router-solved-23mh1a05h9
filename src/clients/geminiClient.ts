import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

/**
 * Returns a singleton Google Generative AI client instance.
 */
export function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Returns a Gemini generative model instance for the given model name.
 * @param {string} modelName - e.g. "gemini-2.5-flash"
 */
export function getGeminiModel(modelName: string): GenerativeModel {
  return getGeminiClient().getGenerativeModel({ model: modelName });
}

/**
 * Reset the Gemini client (useful for testing).
 */
export function resetGeminiClient(): void {
  genAI = null;
}
