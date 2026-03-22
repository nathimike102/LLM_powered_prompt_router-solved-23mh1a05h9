// Type definitions for the application

export interface ClassificationResult {
  intent: string;
  confidence: number;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface RouteResult {
  intent: string;
  confidence: number;
  persona: string;
  emoji: string;
  response: string;
  responseTime?: number;
}

export interface PersonaPrompt {
  label: string;
  emoji: string;
  systemPrompt: string;
}

export interface PromptsConfig {
  [key: string]: PersonaPrompt;
}

export interface OverrideDetection {
  override: string | null;
  cleanMessage: string;
}

export interface RequestMetrics {
  total: number;
  byIntent: { [key: string]: number };
  avgResponseTime: number;
  responseTimes: number[];
}

export interface LogEntry {
  timestamp: string;
  intent: string;
  confidence: number;
  user_message: string;
  final_response: string;
}
