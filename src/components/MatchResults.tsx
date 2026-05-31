"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MatchResult } from "@/lib/types";
import { isListingContractedLocal } from "@/lib/contracts-client";
import LocationMap, { ResultsMap } from "@/components/LocationMap";
import ContractModal from "@/components/ContractModal";
import {
  Brain,
  Handshake,
  MapPin,
  Search,
  Star,
  TrendingDown,
  Zap,
} from "lucide-react";

const RESOURCE_LABELS: Record<string, string> = {
  bodega: "Bodega",
  maquinaria: "Maquinaria",
  transporte: "Transporte",
  personal: "Personal",
  servicio_tecnico: "Servicio técnico",
  infraestructura: "Infraestructura",
  herramientas: "Herramientas",
  capacidad_operativa: "Capacidad operativa",
};

interface Props {
  matches: MatchResult[];
  agentSummary: string;
  usedAI: boolean;
  searchTimeMs: number;
  aiModel?: string;
  offersAnalyzed?: number;
  agentSteps?: string[];
  needAnalysis?: string;
  searchStrategy?: string;
  needZone?: string;
}

export default function MatchResults({
  matches,
  agentSummary,
  usedAI,
  searchTimeMs,
  aiModel,
  offersAnalyzed,
  agentSteps,
  needAnalysis,
  searchStrategy,
  needZone,
}: Props) {
  const router = useRouter();
  const [contractMatch, setContractMatch] = useState<MatchResult | null>(null);
  const [hiddenListingIds, setHiddenListingIds] = useState<Set<string>>(() => new Set());

  const visibleMatches = useMemo(
    () =>
      matches.filter(
        (m) =>
          !hiddenListingIds.has(m.listing.id) && !isListingContractedLocal(m.listing.id)
      ),
    [matches, hiddenListingIds]
  );

  async function handleContratar(match: MatchResult) {
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      router.push(`/login?next=/buscar`);
      return;
    }
    setContractMatch(match);
  }

  if (matches.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="font-medium text-amber-800">
          Gemini revisó el catálogo y no encontró ofertas compatibles.
        </p>
        <p className="text-sm text-amber-600 mt-1">
          Intenta ampliar tu búsqueda o ajustar el presupuesto en el agente IA.
        </p>
      </div>
    );
  }

  if (visibleMatches.length === 0) {
    return (
      <div className="rounded-xl border border-brand-light bg-brand-light p-6 text-center">
        <p className="font-medium text-brand-secondary">
          Las ofertas de esta búsqueda ya fueron contratadas.
        </p>
        <p className="text-sm text-brand-secondary mt-1">
          Busca otro recurso o revisa nuevas publicaciones en Recursos.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {agentSteps && agentSteps.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Proceso del agente (tiempo real)
            </p>
            <ol className="space-y-2">
              {agentSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand-secondary">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {(needAnalysis || searchStrategy) && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-blue-800">
              <Brain className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Análisis Gemini
              </span>
            </div>
            {needAnalysis && (
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Qué buscas: </span>
                {needAnalysis}
              </p>
            )}
            {searchStrategy && (
              <p className="text-sm text-slate-700">
                <span className="font-semibold">Cómo buscó: </span>
                {searchStrategy}
              </p>
            )}
          </div>
        )}

        <div className="rounded-xl border border-brand-light bg-gradient-to-br from-brand-light to-brand-light p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-brand-action p-2 text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
                {usedAI
                  ? `Google Gemini · ${aiModel ?? "gemini-2.5-flash"}`
                  : "Modo no disponible"}
              </p>
              <p className="mt-1 text-slate-800 leading-relaxed">{agentSummary}</p>
              <p className="mt-2 text-xs text-slate-500 flex flex-wrap gap-2 items-center">
                <span className="flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  {offersAnalyzed ?? matches.length} ofertas analizadas en catálogo
                </span>
                <span>·</span>
                <span>{searchTimeMs}ms</span>
                <span>·</span>
                <span>{visibleMatches.length} recomendaciones</span>
              </p>
            </div>
          </div>
        </div>

        <ResultsMap
          needZone={needZone}
          points={visibleMatches.map((m) => ({
            zone: m.listing.zone,
            label: m.listing.companyName,
            type: "offer" as const,
          }))}
        />

        <div className="space-y-4">
          {visibleMatches.map((match, index) => (
            <div
              key={match.listing.id}
              className={`rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
                index === 0 ? "border-brand-accent ring-2 ring-brand-light" : "border-slate-200"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {index === 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-action px-2.5 py-0.5 text-xs font-bold text-white">
                        <Star className="h-3 w-3 fill-white" /> Mejor match · Gemini
                      </span>
                    )}
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {RESOURCE_LABELS[match.listing.resourceType]}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">
                    {match.listing.title}
                  </h3>
                  <p className="text-sm font-medium text-brand-secondary">
                    {match.listing.companyName}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {match.listing.description}
                  </p>
                  <p className="mt-3 text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <span className="font-semibold text-brand-secondary">
                      Evaluación Gemini:{" "}
                    </span>
                    {match.aiExplanation}
                  </p>
                </div>

                <div className="lg:w-52 shrink-0 space-y-3">
                  <div className="text-center rounded-xl bg-slate-900 text-white p-4">
                    <p className="text-3xl font-black">{match.score.total}</p>
                    <p className="text-xs text-slate-300">/ 100 · puntuado por IA</p>
                  </div>
                  <div className="text-sm space-y-1.5">
                    <ScoreBar label="Precio" value={match.score.price} />
                    <ScoreBar label="Ubicación" value={match.score.location} />
                    <ScoreBar label="Disponibilidad" value={match.score.availability} />
                    <ScoreBar label="Compatibilidad" value={match.score.compatibility} />
                    <ScoreBar label="Condiciones" value={match.score.conditions} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {match.distanceKm} km
                    </span>
                    <span className="font-semibold text-slate-800">
                      Bs. {match.listing.price}/{match.listing.priceUnit}
                    </span>
                  </div>
                  {match.estimatedSavings != null && match.estimatedSavings > 0 && (
                    <p className="flex items-center gap-1 text-xs font-medium text-brand-secondary">
                      <TrendingDown className="h-3 w-3" />
                      Ahorro est. Bs. {match.estimatedSavings}/mes
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => handleContratar(match)}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-white transition-colors ${
                      index === 0
                        ? "bg-brand-action hover:bg-brand-secondary shadow-lg shadow-brand-light"
                        : "bg-slate-800 hover:bg-slate-900"
                    }`}
                  >
                    <Handshake className="h-4 w-4" />
                    Contratar
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Ubicación en mapa · {match.distanceKm} km desde tu zona
                </p>
                <LocationMap
                  zone={match.listing.zone}
                  lat={match.listing.lat}
                  lng={match.listing.lng}
                  label={match.listing.companyName}
                  originZone={needZone}
                  originLabel="Tu necesidad"
                  heightClass="h-48"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {contractMatch && (
        <ContractModal
          match={contractMatch}
          open={!!contractMatch}
          onClose={() => setContractMatch(null)}
          onContracted={(listingId) =>
            setHiddenListingIds((prev) => new Set(prev).add(listingId))
          }
        />
      )}
    </>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-action transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
