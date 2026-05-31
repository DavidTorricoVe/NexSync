import { NextRequest, NextResponse } from "next/server";
import { runMatchAgent, GeminiNotConfiguredError } from "@/lib/ai-agent";
import type { Listing } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, zone, extraListings } = body as {
      query: string;
      zone?: string;
      extraListings?: Listing[];
    };

    if (!query || query.trim().length < 10) {
      return NextResponse.json(
        { error: "Describe tu necesidad con al menos 10 caracteres." },
        { status: 400 }
      );
    }

    const result = await runMatchAgent(query.trim(), zone, extraListings ?? []);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GeminiNotConfiguredError) {
      return NextResponse.json(
        {
          error: error.message,
          code: "GEMINI_NOT_CONFIGURED",
          setupUrl: "https://aistudio.google.com/apikey",
        },
        { status: 503 }
      );
    }

    console.error("Match error:", error);
    const message =
      error instanceof Error ? error.message : "Error al procesar la búsqueda.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
