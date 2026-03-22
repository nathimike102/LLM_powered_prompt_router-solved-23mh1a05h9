import { getGroqClient } from "../clients/groqClient";
import { classifyIntent } from "./classifier";
import { logRouteDecision } from "../utils/logger";
import { RouteResult, OverrideDetection, ClassificationResult, PromptsConfig, ChatMessage } from "../types";
import prompts from "./prompts.json";

// Confidence threshold – below this, treat as 'unclear'
const CONFIDENCE_THRESHOLD: number = parseFloat(process.env.CONFIDENCE_THRESHOLD || "0.7");

// Manual override prefix pattern: @code, @data, @writing, @career
const OVERRIDE_REGEX: RegExp = /^@(code|data|writing|career)\s+/i;

/**
 * Detects manual intent override from message prefix (e.g., "@code Fix this bug").
 */
function detectOverride(message: string): OverrideDetection {
  const match: RegExpMatchArray | null = message.match(OVERRIDE_REGEX);
  if (match) {
    return {
      override: match[1].toLowerCase(),
      cleanMessage: message.slice(match[0].length).trim(),
    };
  }
  return { override: null, cleanMessage: message };
}

/**
 * Routes the message to the appropriate expert persona and generates a response.
 */
async function routeAndRespond(message: string, intentData: ClassificationResult, history: ChatMessage[] = []): Promise<string> {
  const groq = getGroqClient();
  let { intent, confidence } = intentData;

  // Apply confidence threshold: if below threshold, treat as unclear
  if (intent !== "unclear" && confidence < CONFIDENCE_THRESHOLD) {
    intent = "unclear";
  }

  // Get the system prompt for the resolved intent
  const promptsConfig = prompts as unknown as PromptsConfig;
  const persona = promptsConfig[intent] || promptsConfig["unclear"];
  const systemPrompt: string = persona.systemPrompt;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await groq.chat.completions.create({
        model: process.env.GENERATION_MODEL || "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });

      return (result.choices[0]?.message?.content ?? "").trim() ||
        "I'm sorry, I encountered an error while generating a response. Please try again.";
    } catch (error: any) {
      const is429: boolean = error?.status === 429 || (error?.message && error.message.includes("429"));
      if (is429 && attempt < 3) {
        const waitMs: number = attempt * 15000;
        console.error(`Generation rate limited (429). Retrying in ${waitMs / 1000}s... (attempt ${attempt}/3)`);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      console.error("Generation LLM call failed:", error?.message);
      return "I'm sorry, I encountered an error while generating a response. Please try again.";
    }
  }
  return "I'm sorry, I encountered an error while generating a response. Please try again.";
}

/**
 * Full pipeline: classify intent, route to expert, generate response, and log.
 */
export async function handleMessage(message: string, history: ChatMessage[] = []): Promise<RouteResult> {
  // Step 1: Check for manual override
  const { override, cleanMessage } = detectOverride(message);

  let intentData: ClassificationResult;
  let actualMessage: string = message;

  if (override) {
    // Manual override: skip classification
    intentData = { intent: override, confidence: 1.0 };
    actualMessage = cleanMessage;
  } else {
    // Step 2: Classify intent via LLM
    intentData = await classifyIntent(message);
  }

  // Step 3: Route and generate response
  const response: string = await routeAndRespond(actualMessage, intentData, history);

  // Step 4: Resolve final intent (in case confidence fell below threshold)
  let { intent, confidence } = intentData;
  if (intent !== "unclear" && confidence < CONFIDENCE_THRESHOLD) {
    intent = "unclear";
  }

  // Step 5: Log the decision and get persona info
  const promptsConfig = prompts as unknown as PromptsConfig;
  const persona = promptsConfig[intent] || promptsConfig["unclear"];
  const emoji: string = persona.emoji;
  const personaLabel: string = persona.label;

  logRouteDecision({
    intent,
    confidence,
    user_message: message,
    final_response: response,
  });

  return {
    intent,
    confidence,
    persona: personaLabel,
    emoji,
    response,
  };
}
