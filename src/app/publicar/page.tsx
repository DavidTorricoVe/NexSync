"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LocationPickerMap from "@/components/LocationPickerMap";
import { SANTA_CRUZ_ZONES } from "@/lib/zones";
import type { ResourceType, Sector } from "@/lib/types";
import { ArrowRight, Bot, CheckCircle, Loader2, PlusCircle } from "lucide-react";

const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: "bodega", label: "Bodega / Almacén" },
  { value: "maquinaria", label: "Maquinaria" },
  { value: "transporte", label: "Transporte" },
  { value: "personal", label: "Personal especializado" },
  { value: "servicio_tecnico", label: "Servicio técnico" },
  { value: "infraestructura", label: "Infraestructura" },
  { value: "herramientas", label: "Herramientas / Equipos" },
  { value: "capacidad_operativa", label: "Capacidad operativa" },
];

const SECTORS: { value: Sector; label: string }[] = [
  { value: "industria", label: "Industria" },
  { value: "agro", label: "Agro" },
  { value: "logistica", label: "Logística" },
  { value: "energia", label: "Energía" },
  { value: "agua", label: "Agua" },
];

export default function PublicarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    companyName: "",
    sector: "industria" as Sector,
    resourceType: "bodega" as ResourceType,
    title: "",
    description: "",
    zone: "Centro / Equipetrol",
    lat: null as number | null,
    lng: null as number | null,
    price: "",
    priceUnit: "mes" as "hora" | "dia" | "mes" | "proyecto",
    availability: "",
    capacity: "",
    conditions: "",
    limitations: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) {
          router.push("/login?next=/publicar");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.user) {
          setForm((prev) => ({
            ...prev,
            companyName: d.user.companyName,
            sector: d.user.sector,
          }));
        }
      })
      .finally(() => setAuthLoading(false));
  }, [router]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.lat == null || form.lng == null) {
      setError("Marca la ubicación exacta en el mapa antes de publicar.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const payload = {
        kind: "oferta" as const,
        companyId: `user-${Date.now()}`,
        companyName: form.companyName,
        sector: form.sector,
        resourceType: form.resourceType,
        title: form.title,
        description: form.description,
        zone: form.zone,
        lat: form.lat ?? undefined,
        lng: form.lng ?? undefined,
        price: parseFloat(form.price) || 0,
        priceUnit: form.priceUnit,
        availability: form.availability,
        capacity: form.capacity || undefined,
        conditions: form.conditions,
        limitations: form.limitations,
      };

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al publicar");
      }

      const { listing } = await res.json();

      const stored = JSON.parse(
        localStorage.getItem("recursolink_extra_listings") ?? "[]"
      );
      stored.push(listing);
      localStorage.setItem("recursolink_extra_listings", JSON.stringify(stored));

      setSuccess(true);
      setForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        zone: "Centro / Equipetrol",
        lat: null,
        lng: null,
        price: "",
        priceUnit: "mes",
        availability: "",
        capacity: "",
        conditions: "",
        limitations: "",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {authLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-action" />
        </div>
      ) : (
        <>
      <div className="text-center mb-8">
        <PlusCircle className="h-10 w-10 text-brand-action mx-auto" />
        <h1 className="mt-3 text-3xl font-black text-slate-900">
          Ofrecer recurso
        </h1>
        <p className="mt-2 text-slate-600">
          Publica un recurso, espacio o servicio disponible. Las empresas que
          buscan lo encontrarán automáticamente con el agente IA.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-semibold flex items-center gap-2">
          <Bot className="h-4 w-4" />
          ¿Buscas algo para tu empresa?
        </p>
        <p className="mt-1 text-blue-800">
          No necesitas publicar nada. Describe tu necesidad y el agente Gemini la
          analiza y busca en el catálogo por ti.
        </p>
        <Link
          href="/buscar"
          className="mt-3 inline-flex items-center gap-1 font-semibold text-brand-secondary hover:text-brand-secondary"
        >
          Ir al buscador IA
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nombre de la empresa" required>
          <input
            value={form.companyName}
            onChange={(e) => update("companyName", e.target.value)}
            required
            className={inputClass}
            placeholder="Ej: Mi Empresa SC"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Sector" required>
            <select
              value={form.sector}
              onChange={(e) => update("sector", e.target.value)}
              className={inputClass}
            >
              {SECTORS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tipo de recurso" required>
            <select
              value={form.resourceType}
              onChange={(e) => update("resourceType", e.target.value)}
              className={inputClass}
            >
              {RESOURCE_TYPES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Título de la oferta" required>
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
            className={inputClass}
            placeholder="Ej: Bodega seca 400 m² disponible"
          />
        </Field>

        <Field label="Descripción detallada" required>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            required
            rows={3}
            className={inputClass}
            placeholder="Características, especificaciones, condiciones..."
          />
        </Field>

        <Field label="Zona en Santa Cruz" required>
          <select
            value={form.zone}
            onChange={(e) => update("zone", e.target.value)}
            className={inputClass}
          >
            {SANTA_CRUZ_ZONES.map((z) => (
              <option key={z.id} value={z.name}>
                {z.name}
              </option>
            ))}
          </select>
        </Field>

        {form.zone && (
          <Field label="Ubicación exacta en el mapa" required>
            <LocationPickerMap
              zone={form.zone}
              lat={form.lat}
              lng={form.lng}
              label={form.companyName || "Tu empresa"}
              onLocationChange={(lat, lng) =>
                setForm((prev) => ({ ...prev, lat, lng }))
              }
              heightClass="h-64"
            />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Precio (Bs.)" required>
            <input
              type="number"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              required
              min="0"
              className={inputClass}
              placeholder="1200"
            />
          </Field>
          <Field label="Unidad" required>
            <select
              value={form.priceUnit}
              onChange={(e) => update("priceUnit", e.target.value)}
              className={inputClass}
            >
              <option value="hora">Por hora</option>
              <option value="dia">Por día</option>
              <option value="mes">Por mes</option>
              <option value="proyecto">Por proyecto</option>
            </select>
          </Field>
        </div>

        <Field label="Disponibilidad" required>
          <input
            value={form.availability}
            onChange={(e) => update("availability", e.target.value)}
            required
            className={inputClass}
            placeholder="Ej: Disponible inmediato, lunes a viernes"
          />
        </Field>

        <Field label="Capacidad / Especificaciones">
          <input
            value={form.capacity}
            onChange={(e) => update("capacity", e.target.value)}
            className={inputClass}
            placeholder="Ej: 500 m² / 80 toneladas"
          />
        </Field>

        <Field label="Condiciones comerciales" required>
          <textarea
            value={form.conditions}
            onChange={(e) => update("conditions", e.target.value)}
            required
            rows={2}
            className={inputClass}
            placeholder="Contrato mínimo, forma de pago, seguros..."
          />
        </Field>

        <Field label="Limitaciones">
          <textarea
            value={form.limitations}
            onChange={(e) => update("limitations", e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="Restricciones, exclusiones..."
          />
        </Field>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
        )}

        {success && (
          <div className="flex items-center gap-2 text-sm text-brand-secondary bg-brand-light rounded-lg px-4 py-3">
            <CheckCircle className="h-5 w-5" />
            Recurso publicado. El agente IA ya puede encontrarlo para otras empresas.
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-action px-6 py-3.5 font-bold text-white hover:bg-brand-secondary disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Publicando...
            </>
          ) : (
            <>
              <PlusCircle className="h-5 w-5" />
              Publicar recurso disponible
            </>
          )}
        </button>
      </form>
        </>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-brand-action focus:ring-2 focus:ring-brand-light outline-none";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
