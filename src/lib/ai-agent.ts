import {
  generateGeminiJson,
  GeminiNotConfiguredError,
  GEMINI_MODEL,
  isGeminiConfigured,
} from "./gemini";
import type { Listing, MatchResponse, ParsedNeed, ResourceType } from "./types";
import { getOffers } from "./store";
import { distanceBetweenListings } from "./zones";
import type { MatchResult, ScoreBreakdown } from "./types";

const RESOURCE_TYPES: ResourceType[] = [
  "bodega",
  "maquinaria",
  "transporte",
  "personal",
  "servicio_tecnico",
  "infraestructura",
  "herramientas",
  "capacidad_operativa",
];

interface GeminiRankedMatch {
  offerId: string;
  totalScore: number;
  scores: {
    price: number;
    location: number;
    availability: number;
    compatibility: number;
    conditions: number;
  };
  explanation: string;
}

interface FullAgentResponse {
  parsedNeed: {
    resourceType: ResourceType;
    title: string;
    description: string;
    zone: string;
    maxBudget: number | null;
    duration: string;
    urgency: "baja" | "media" | "alta";
    mandatoryRequirements: string[];
    preferredRequirements: string[];
  };
  needAnalysis: string;
  searchStrategy: string;
  offersReviewed: number;
  rankedMatches: GeminiRankedMatch[];
  agentSummary: string;
  noMatchReason?: string;
}

function compactOffer(offer: Listing) {
  return {
    id: offer.id,
    empresa: offer.companyName,
    tipo: offer.resourceType,
    titulo: offer.title,
    descripcion: offer.description,
    zona: offer.zone,
    precioBs: offer.price,
    unidad: offer.priceUnit,
    disponibilidad: offer.availability,
    condiciones: offer.conditions,
    limitaciones: offer.limitations,
  };
}

function clampScore(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}

function toScoreBreakdown(scores: GeminiRankedMatch["scores"], total: number): ScoreBreakdown {
  return {
    price: clampScore(scores.price),
    location: clampScore(scores.location),
    availability: clampScore(scores.availability),
    compatibility: clampScore(scores.compatibility),
    conditions: clampScore(scores.conditions),
    total: clampScore(total),
  };
}

function buildMatchResults(
  ranked: GeminiRankedMatch[],
  offers: Listing[],
  need: ParsedNeed
): MatchResult[] {
  const offerMap = new Map(offers.map((o) => [o.id, o]));
  const results: MatchResult[] = [];

  for (const rank of ranked) {
    const listing = offerMap.get(rank.offerId);
    if (!listing) continue;

    const distanceKm = distanceBetweenListings(
      { zone: need.zone },
      { zone: listing.zone, lat: listing.lat, lng: listing.lng }
    );
    const score = toScoreBreakdown(rank.scores, rank.totalScore);

    results.push({
      listing,
      score,
      aiExplanation: rank.explanation,
      distanceKm,
    });
  }

  return results.sort((a, b) => b.score.total - a.score.total);
}

/** Un solo agente Gemini: analiza necesidad + busca en catálogo + rankea */
async function runFullGeminiAgent(
  query: string,
  zone: string | undefined,
  offers: Listing[]
): Promise<{ response: FullAgentResponse; model: string }> {
  const catalog = offers.map(compactOffer);

  const prompt = `Eres el Agente Principal de NexSync (Santa Cruz, Bolivia).
Debes ANALIZAR la necesidad del cliente y BUSCAR en el catálogo real de ofertas.

=== NECESIDAD DEL CLIENTE ===
"${query}"
Zona preferida: "${zone ?? "no especificada"}"

=== CATÁLOGO REAL (${catalog.length} ofertas — NO inventes otras) ===
${JSON.stringify(catalog)}

=== INSTRUCCIONES ===
1. Analiza la necesidad: extrae tipo de recurso, presupuesto (Bs.), urgencia, requisitos
2. Revisa CADA oferta del catálogo
3. Descarta incompatibles; puntúa las viables 0-100 (price, location, availability, compatibility, conditions)
4. Devuelve máximo 5 mejores con offerId EXACTO del catálogo
5. Explicaciones específicas citando precio, zona y condiciones de cada oferta
6. resourceType debe ser: ${RESOURCE_TYPES.join(", ")}

JSON:
{
  "parsedNeed": {
    "resourceType": "...",
    "title": "...",
    "description": "...",
    "zone": "...",
    "maxBudget": number|null,
    "duration": "...",
    "urgency": "baja"|"media"|"alta",
    "mandatoryRequirements": [],
    "preferredRequirements": []
  },
  "needAnalysis": "qué busca el cliente",
  "searchStrategy": "cómo filtraste el catálogo",
  "offersReviewed": ${catalog.length},
  "rankedMatches": [
    {
      "offerId": "id del catálogo",
      "totalScore": 0-100,
      "scores": {"price":0-100,"location":0-100,"availability":0-100,"compatibility":0-100,"conditions":0-100},
      "explanation": "por qué encaja o no"
    }
  ],
  "agentSummary": "recomendación ejecutiva 2-3 oraciones",
  "noMatchReason": "solo si rankedMatches vacío"
}`;

  const { data, model } = await generateGeminiJson<FullAgentResponse>(
    prompt,
    "agente-completo"
  );

  return { response: data, model };
}

export async function runMatchAgent(
  query: string,
  zone?: string,
  extraListings: Listing[] = []
): Promise<MatchResponse> {
  const start = Date.now();

  if (!isGeminiConfigured()) {
    throw new GeminiNotConfiguredError();
  }

  const offers = getOffers(extraListings);

  const agentSteps = [
    "🤖 Agente Gemini: analizando tu necesidad...",
    `📂 Agente Gemini: buscando en ${offers.length} ofertas reales de Santa Cruz...`,
    "✅ Agente Gemini: evaluando compatibilidad y generando ranking...",
  ];

  const { response, model } = await runFullGeminiAgent(query, zone, offers);

  if (!RESOURCE_TYPES.includes(response.parsedNeed.resourceType)) {
    throw new Error("Gemini devolvió un tipo de recurso inválido");
  }

  const parsedNeed: ParsedNeed = {
    resourceType: response.parsedNeed.resourceType,
    title: response.parsedNeed.title,
    description: response.parsedNeed.description,
    zone: response.parsedNeed.zone,
    maxBudget: response.parsedNeed.maxBudget ?? undefined,
    duration: response.parsedNeed.duration,
    urgency: response.parsedNeed.urgency,
    mandatoryRequirements: response.parsedNeed.mandatoryRequirements ?? [],
    preferredRequirements: response.parsedNeed.preferredRequirements ?? [],
  };

  const matches = buildMatchResults(response.rankedMatches ?? [], offers, parsedNeed);

  const agentSummary =
    response.agentSummary ||
    (matches.length > 0
      ? `Recomendación: ${matches[0].listing.companyName}`
      : response.noMatchReason ?? "Sin matches en el catálogo.");

  return {
    parsedNeed,
    matches,
    agentSummary,
    needAnalysis: response.needAnalysis,
    searchStrategy: response.searchStrategy,
    usedAI: true,
    aiModel: model,
    offersAnalyzed: offers.length,
    agentSteps,
    searchTimeMs: Date.now() - start,
  };
}

export { GeminiNotConfiguredError, isGeminiConfigured };
