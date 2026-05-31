import Link from "next/link";
import { getStats } from "@/lib/store";
import {
  ArrowRight,
  BarChart3,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const stats = getStats();

  const impactMetrics = [
    {
      icon: Users,
      label: "Empresas conectadas",
      value: stats.totalCompanies.toString(),
      desc: "Participantes activos en la plataforma",
    },
    {
      icon: BarChart3,
      label: "Ofertas activas",
      value: stats.totalOffers.toString(),
      desc: "Recursos disponibles para monetizar",
    },
    {
      icon: Clock,
      label: "Tiempo ahorrado",
      value: "~85%",
      desc: "Reducción vs. búsqueda manual (2 sem → <24h)",
    },
    {
      icon: DollarSign,
      label: "Precio prom. oferta",
      value: `Bs. ${stats.avgOfferPrice}`,
      desc: "Ticket promedio por recurso publicado",
    },
  ];

  const financials = [
    { label: "Comisión por transacción", value: "10%", detail: "Sobre valor del intercambio" },
    { label: "Ticket promedio match", value: "Bs. 3.500", detail: "~USD 500 por conexión" },
    { label: "Margen bruto / transacción", value: "86%", detail: "Bs. 210 de margen neto" },
    { label: "Proyección año 1", value: "Bs. 65.000", detail: "35 transacciones/mes al mes 12" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900">Dashboard de impacto</h1>
        <p className="mt-2 text-slate-600">
          Métricas de impacto regional y modelo económico de NexSync
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {impactMetrics.map(({ icon: Icon, label, value, desc }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <Icon className="h-5 w-5 text-brand-action" />
            <p className="mt-3 text-2xl font-black text-slate-900">{value}</p>
            <p className="text-sm font-semibold text-slate-700 mt-1">{label}</p>
            <p className="text-xs text-slate-500 mt-1">{desc}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-brand-action" />
            <h2 className="text-lg font-bold text-slate-900">Modelo de ingresos</h2>
          </div>
          <div className="space-y-4">
            {financials.map((f) => (
              <div
                key={f.label}
                className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">{f.label}</p>
                  <p className="text-xs text-slate-500">{f.detail}</p>
                </div>
                <p className="text-lg font-black text-brand-secondary">{f.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-brand-light bg-brand-light p-6">
          <h2 className="text-lg font-bold text-brand-primary">Valor para cada parte</h2>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="font-semibold text-brand-secondary">Empresa solicitante</p>
              <p className="text-brand-secondary mt-1">
                Ahorra 40-70% del tiempo de búsqueda. Encuentra opciones que no conocía
                con comparación objetiva de precio y logística.
              </p>
            </div>
            <div>
              <p className="font-semibold text-brand-secondary">Empresa ofertante</p>
              <p className="text-brand-secondary mt-1">
                Monetiza capacidad ociosa. Ej: bodega 500 m² vacía → Bs. 7.500/mes
                de ingreso adicional sin crear un negocio nuevo.
              </p>
            </div>
            <div>
              <p className="font-semibold text-brand-secondary">Plataforma (NexSync)</p>
              <p className="text-brand-secondary mt-1">
                Comisión 10% + suscripción Pro + destacados. Efecto red: más ofertas =
                más valor = más empresas.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-slate-900 text-white p-8 text-center">
        <h2 className="text-2xl font-black">Prueba el agente IA en vivo</h2>
        <p className="mt-2 text-slate-400 max-w-lg mx-auto">
          Describe una necesidad y observa cómo el agente encuentra, compara y recomienda
          la mejor opción en segundos.
        </p>
        <Link
          href="/buscar"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-action px-6 py-3 font-bold hover:bg-brand-accent transition-colors"
        >
          Ir al buscador IA
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
