import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { AI_MODELS, DEFAULT_SAFETY_SETTINGS, DEFAULT_GENERATION_CONFIG } from "./config";

const apiKey = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey || "");

export interface ModelOptions {
  model?: string;
  systemInstruction?: string;
}

/**
 * Shared Model Factory
 */
export function getAIModel(options: ModelOptions = {}): GenerativeModel {
  return genAI.getGenerativeModel({
    model: options.model || AI_MODELS.CHAT,
    systemInstruction: options.systemInstruction,
    safetySettings: DEFAULT_SAFETY_SETTINGS,
    generationConfig: DEFAULT_GENERATION_CONFIG,
  });
}

export function isAIConfigured(): boolean {
  return !!apiKey;
}
