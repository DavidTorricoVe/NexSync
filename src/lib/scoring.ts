import type { Listing, ParsedNeed, ScoreBreakdown } from "./types";
import { distanceBetweenZones } from "./zones";

const RESOURCE_SYNONYMS: Record<string, string[]> = {
  bodega: ["bodega", "almacén", "almacen", "depósito", "deposito", "cámara", "camara"],
  maquinaria: ["maquinaria", "torno", "grúa", "grua", "cnc", "equipo industrial"],
  transporte: ["transporte", "camión", "camion", "flota", "logística", "logistica"],
  personal: ["personal", "técnico", "tecnico", "operador", "ingeniero", "equipo"],
  servicio_tecnico: ["servicio", "mantenimiento", "consultoría", "consultoria", "instalación"],
  infraestructura: ["infraestructura", "línea", "linea", "planta", "producción"],
  herramientas: ["herramientas", "kit", "sensor", "equipo portátil", "equipo portatil"],
  capacidad_operativa: ["capacidad", "procesamiento", "turno", "planta"],
};

function normalizeMonthlyPrice(price: number, unit: Listing["priceUnit"]): number {
  switch (unit) {
    case "hora":
      return price * 8 * 22;
    case "dia":
      return price * 22;
    case "mes":
      return price;
    case "proyecto":
      return price;
    default:
      return price;
  }
}

function scorePrice(offer: Listing, need: ParsedNeed): number {
  if (!need.maxBudget || need.maxBudget <= 0) return 80;
  const monthly = normalizeMonthlyPrice(offer.price, offer.priceUnit);
  if (monthly <= need.maxBudget) return 100;
  const ratio = need.maxBudget / monthly;
  return Math.max(0, Math.round(ratio * 100));
}

function scoreLocation(offer: Listing, need: ParsedNeed): number {
  const km = distanceBetweenZones(need.zone, offer.zone);
  if (km <= 5) return 100;
  if (km <= 15) return 85;
  if (km <= 30) return 70;
  if (km <= 50) return 50;
  return Math.max(20, 100 - km);
}

function scoreAvailability(offer: Listing, need: ParsedNeed): number {
  const text = offer.availability.toLowerCase();
  if (text.includes("inmediato") || text.includes("disponible")) {
    if (need.urgency === "alta") return 100;
    return 90;
  }
  if (need.urgency === "baja") return 75;
  if (need.urgency === "media") return 65;
  return 45;
}

function scoreCompatibility(offer: Listing, need: ParsedNeed): number {
  if (offer.resourceType === need.resourceType) return 100;

  const needSynonyms = RESOURCE_SYNONYMS[need.resourceType] ?? [];
  const offerText = `${offer.title} ${offer.description}`.toLowerCase();
  const synonymMatch = needSynonyms.some((s) => offerText.includes(s));
  if (synonymMatch) return 75;

  return 30;
}

function scoreConditions(offer: Listing, need: ParsedNeed): number {
  let score = 80;
  const combined = `${offer.conditions} ${offer.limitations}`.toLowerCase();

  for (const req of need.mandatoryRequirements) {
    const reqLower = req.toLowerCase();
    if (
      combined.includes(reqLower) ||
      offer.description.toLowerCase().includes(reqLower) ||
      offer.title.toLowerCase().includes(reqLower)
    ) {
      score += 5;
    } else {
      score -= 15;
    }
  }

  for (const req of need.preferredRequirements) {
    if (offer.description.toLowerCase().includes(req.toLowerCase())) {
      score += 3;
    }
  }

  return Math.min(100, Math.max(0, score));
}

export function computeScore(
  offer: Listing,
  need: ParsedNeed,
  distanceKm: number
): ScoreBreakdown {
  const price = scorePrice(offer, need);
  const location = scoreLocation(offer, need);
  const availability = scoreAvailability(offer, need);
  const compatibility = scoreCompatibility(offer, need);
  const conditions = scoreConditions(offer, need);

  const total = Math.round(
    price * 0.3 +
      location * 0.2 +
      availability * 0.15 +
      compatibility * 0.25 +
      conditions * 0.1
  );

  return { price, location, availability, compatibility, conditions, total };
}

export function estimateSavings(
  offer: Listing,
  need: ParsedNeed,
  allOffers: Listing[]
): number {
  const sameType = allOffers.filter(
    (o) => o.kind === "oferta" && o.resourceType === need.resourceType
  );
  if (sameType.length === 0) return 0;

  const prices = sameType.map((o) => normalizeMonthlyPrice(o.price, o.priceUnit));
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const selected = normalizeMonthlyPrice(offer.price, offer.priceUnit);
  return Math.max(0, Math.round(avg - selected));
}

export function buildFallbackExplanation(
  offer: Listing,
  score: ScoreBreakdown,
  distanceKm: number
): string {
  const parts: string[] = [];

  if (score.compatibility >= 90) {
    parts.push(`Coincidencia directa en tipo de recurso (${offer.resourceType}).`);
  }
  if (score.price >= 80) {
    parts.push(`Precio competitivo: Bs. ${offer.price}/${offer.priceUnit}.`);
  } else if (score.price < 60) {
    parts.push(`Precio por encima del presupuesto estimado.`);
  }
  if (score.location >= 80) {
    parts.push(`Ubicación favorable a ${distanceKm} km de ${offer.zone}.`);
  } else {
    parts.push(`Distancia de ${distanceKm} km — considerar costos logísticos.`);
  }
  if (score.availability >= 85) {
    parts.push(`Alta disponibilidad según calendario publicado.`);
  }

  return parts.join(" ");
}
