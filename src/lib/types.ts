export type ResourceType =
  | "bodega"
  | "maquinaria"
  | "transporte"
  | "personal"
  | "servicio_tecnico"
  | "infraestructura"
  | "herramientas"
  | "capacidad_operativa";

export type ListingKind = "oferta" | "necesidad";

export type ListingStatus = "available" | "contracted";

export type Sector = "agro" | "industria" | "logistica" | "energia" | "agua";

export interface Company {
  id: string;
  name: string;
  sector: Sector;
  zone: string;
  contact: string;
  description: string;
}

export interface Listing {
  id: string;
  kind: ListingKind;
  companyId: string;
  companyName: string;
  sector: Sector;
  resourceType: ResourceType;
  title: string;
  description: string;
  zone: string;
  lat?: number;
  lng?: number;
  price: number;
  priceUnit: "hora" | "dia" | "mes" | "proyecto";
  availability: string;
  capacity?: string;
  conditions: string;
  limitations: string;
  ownerUserId?: string;
  status?: ListingStatus;
  requirements?: string[];
  maxBudget?: number;
  urgency?: "baja" | "media" | "alta";
  createdAt: string;
}

export interface ParsedNeed {
  resourceType: ResourceType;
  title: string;
  description: string;
  zone: string;
  maxBudget?: number;
  duration: string;
  urgency: "baja" | "media" | "alta";
  mandatoryRequirements: string[];
  preferredRequirements: string[];
}

export interface ScoreBreakdown {
  price: number;
  location: number;
  availability: number;
  compatibility: number;
  conditions: number;
  total: number;
}

export interface MatchResult {
  listing: Listing;
  score: ScoreBreakdown;
  aiExplanation: string;
  estimatedSavings?: number;
  distanceKm: number;
}

export interface MatchResponse {
  parsedNeed: ParsedNeed;
  matches: MatchResult[];
  agentSummary: string;
  needAnalysis?: string;
  searchStrategy?: string;
  usedAI: boolean;
  aiModel?: string;
  offersAnalyzed?: number;
  agentSteps?: string[];
  searchTimeMs: number;
}
