"use client";

import { useEffect, useState } from "react";
import MatchResults from "@/components/MatchResults";
import { SANTA_CRUZ_ZONES } from "@/lib/zones";
import type { MatchResponse } from "@/lib/types";
import { AlertCircle, Bot, CheckCircle2, ExternalLink, Loader2, Search } from "lucide-react";

const EXAMPLES = [
  "Necesito una bodega refrigerada de 300 m² en Warnes por 3 meses, presupuesto máximo Bs. 1000/mes",
  "Busco camión de 8 toneladas con chofer para distribución los sábados, presupuesto Bs. 350/día",
  "Requiero torno CNC con operador en Plan 3000 para piezas industriales, urgente esta semana",
  "Necesito técnico solar certificado para mantenimiento de planta fotovoltaica en Urubó",
];

const LOADING_STEPS = [
  "Agente 1: Gemini analiza tu necesidad...",
  "Agente 2: Gemini busca en el catálogo de empresas...",
  "Agente 3: Gemini evalúa y rankea cada oferta...",
];

export default function BuscarPage() {
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState("Centro / Equipetrol");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [error, setError] = useState("");
  const [geminiReady, setGeminiReady] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/ai-status")
      .then((r) => r.json())
      .then((d) => setGeminiReady(d.geminiConfigured))
      .catch(() => setGeminiReady(false));
  }, []);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep((s) => (s + 1) % LOADING_STEPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [loading]);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (query.trim().length < 10) {
      setError("Describe tu necesidad con al menos 10 caracteres.");
      return;
    }

    setLoading(true);
    setLoadingStep(0);
    setError("");
    setResult(null);

    try {
      const extraListings = JSON.parse(
        localStorage.getItem("recursolink_extra_listings") ?? "[]"
      );

      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, zone, extraListings }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "GEMINI_NOT_CONFIGURED") {
          throw new Error(
            `${data.error} Obtén tu key gratis en aistudio.google.com/apikey y agrégala como GEMINI_API_KEY en Vercel.`
          );
        }
        throw new Error(data.error ?? "Error en la búsqueda");
      }

      setResult(data as MatchResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="text-center mb-8">
        <div
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
            geminiReady === true
              ? "bg-brand-light text-brand-secondary"
              : geminiReady === false
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-600"
          }`}
        >
          {geminiReady === true ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Gemini activo — matching inteligente
            </>
          ) : geminiReady === false ? (
            <>
              <AlertCircle className="h-4 w-4" />
              Requiere GEMINI_API_KEY para funcionar
            </>
          ) : (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verificando agente...
            </>
          )}
        </div>
        <h1 className="mt-4 text-3xl font-black text-slate-900">
          Agente IA con Google Gemini
        </h1>
        <p className="mt-2 text-slate-600 max-w-lg mx-auto">
          El agente <strong>lee tu necesidad</strong>, <strong>busca en el catálogo</strong>{" "}
          de empresas y <strong>evalúa cada oferta</strong> con Gemini.
        </p>
      </div>

      {geminiReady === false && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Para activar el agente IA:</p>
          <ol className="mt-2 list-decimal list-inside space-y-1 text-amber-800">
            <li>
              Crea API key en{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium inline-flex items-center gap-1"
              >
                Google AI Studio <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              En Vercel → proyecto hackaton → Settings → Environment Variables →{" "}
              <code className="bg-amber-100 px-1 rounded">GEMINI_API_KEY</code>
            </li>
            <li>Redeploy y recarga esta página</li>
          </ol>
        </div>
      )}

      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            ¿Qué necesitas?
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={4}
            placeholder="Ej: Necesito bodega seca de 500m² cerca de Warnes por 6 meses, con seguridad 24h..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-brand-action focus:ring-2 focus:ring-brand-light outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Zona preferida en Santa Cruz
          </label>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-brand-action focus:ring-2 focus:ring-brand-light outline-none"
          >
            {SANTA_CRUZ_ZONES.map((z) => (
              <option key={z.id} value={z.name}>
                {z.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || geminiReady === false}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-action px-6 py-3.5 font-bold text-white hover:bg-brand-secondary disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {LOADING_STEPS[loadingStep]}
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Buscar con Gemini
            </>
          )}
        </button>
      </form>

      <div className="mt-6">
        <p className="text-xs font-medium text-slate-500 mb-2">Ejemplos rápidos:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setQuery(ex)}
              className="text-xs rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-600 hover:border-brand-accent hover:text-brand-secondary transition-colors text-left"
            >
              {ex.slice(0, 60)}...
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className="mt-10">
          <div className="mb-4 rounded-lg bg-slate-100 px-4 py-3 text-sm space-y-1">
            <p>
              <span className="font-semibold">Necesidad (Gemini):</span>{" "}
              {result.parsedNeed.title}
            </p>
            <p>
              {result.parsedNeed.zone} · Urgencia: {result.parsedNeed.urgency}
              {result.parsedNeed.maxBudget && (
                <> · Presupuesto: Bs. {result.parsedNeed.maxBudget}</>
              )}
              {result.parsedNeed.mandatoryRequirements.length > 0 && (
                <> · Requisitos: {result.parsedNeed.mandatoryRequirements.join(", ")}</>
              )}
            </p>
          </div>
          <MatchResults
            matches={result.matches}
            agentSummary={result.agentSummary}
            usedAI={result.usedAI}
            searchTimeMs={result.searchTimeMs}
            aiModel={result.aiModel}
            offersAnalyzed={result.offersAnalyzed}
            agentSteps={result.agentSteps}
            needAnalysis={result.needAnalysis}
            searchStrategy={result.searchStrategy}
            needZone={result.parsedNeed.zone}
          />
        </div>
      )}
    </div>
  );
}
