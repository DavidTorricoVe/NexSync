import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";

export const GEMINI_MODEL = "gemini-2.5-flash";
export const GEMINI_MODEL_FALLBACK = "gemini-2.5-flash-lite";

export class GeminiNotConfiguredError extends Error {
  constructor() {
    super(
      "GEMINI_API_KEY no configurada. Agrega tu API key en Vercel o en .env.local para usar el agente IA."
    );
    this.name = "GeminiNotConfiguredError";
  }
}

export function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new GeminiNotConfiguredError();
  return key;
}

export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY?.trim();
}

function createModel(apiKey: string, modelName: string): GenerativeModel {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });
}

export async function generateGeminiJson<T>(
  prompt: string,
  label: string
): Promise<{ data: T; model: string }> {
  const apiKey = getGeminiApiKey();
  const models = [GEMINI_MODEL, GEMINI_MODEL_FALLBACK, "gemini-flash-latest"];
  let lastError: unknown;

  for (const modelName of models) {
    try {
      const model = createModel(apiKey, modelName);
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      if (!text) throw new Error("Respuesta vacía de Gemini");

      const data = JSON.parse(text) as T;
      return { data, model: modelName };
    } catch (err) {
      lastError = err;
      console.error(`[Gemini ${label}] falló con ${modelName}:`, err);
    }
  }

  throw new Error(
    `El agente Gemini no pudo completar "${label}". ${
      lastError instanceof Error ? lastError.message : "Error desconocido"
    }`
  );
}

export function extractJsonFromText<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}
