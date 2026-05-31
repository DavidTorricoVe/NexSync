import { NextResponse } from "next/server";
import { isGeminiConfigured } from "@/lib/gemini";

export async function GET() {
  const configured = isGeminiConfigured();
  return NextResponse.json({
    geminiConfigured: configured,
    model: configured ? "gemini-2.5-flash" : null,
    mode: configured ? "agente_ia" : "requiere_api_key",
    message: configured
      ? "Agente Gemini activo — análisis y búsqueda con IA"
      : "Configura GEMINI_API_KEY para activar el agente IA",
    setupUrl: "https://aistudio.google.com/apikey",
  });
}
