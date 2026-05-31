import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Building2,
  Handshake,
  LogIn,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Agentes IA de matching",
    desc: "Analizan necesidades y comparan ofertas por precio, ubicación, disponibilidad y condiciones.",
  },
  {
    icon: Handshake,
    title: "Intercambio comercial",
    desc: "No es caridad: empresas monetizan recursos ociosos y otras resuelven necesidades operativas.",
  },
  {
    icon: Building2,
    title: "Enfoque Santa Cruz",
    desc: "Problemática local verificable: subutilización de activos empresariales en la región.",
  },
  {
    icon: TrendingUp,
    title: "Impacto medible",
    desc: "Reduce tiempo de búsqueda de semanas a horas y genera ingresos por capacidad ociosa.",
  },
];

const sectors = ["Agro", "Industria", "Logística", "Energía", "Agua"];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-primary text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-brand-action blur-3xl" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-teal-400 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-action/20 border border-brand-accent/30 px-3 py-1 text-xs font-semibold text-brand-accent">
              <Sparkles className="h-3.5 w-3.5" />
              NexSync · Santa Cruz, Bolivia
            </span>
            <h1 className="mt-6 text-4xl md:text-6xl font-black leading-tight tracking-tight">
              Conecta recursos ociosos con{" "}
              <span className="text-brand-accent">necesidades reales</span> en Santa Cruz
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-2xl">
              NexSync es un marketplace inteligente donde agentes de IA analizan,
              comparan y recomiendan la mejor opción entre empresas que ofrecen bodegas,
              maquinaria, transporte, personal y más — a cambio de remuneración comercial.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/login?next=/buscar"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-action px-6 py-3.5 font-bold text-white hover:bg-brand-accent transition-colors"
              >
                <Zap className="h-5 w-5" />
                Buscar con agente IA
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login?next=/publicar"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Ofrecer un recurso
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/30 px-6 py-3.5 font-semibold text-white hover:bg-white/20 transition-colors"
              >
                <LogIn className="h-5 w-5" />
                Iniciar sesión
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "12+", label: "Empresas demo" },
              { value: "< 2s", label: "Tiempo de match IA" },
              { value: "5", label: "Sectores cubiertos" },
              { value: "10%", label: "Comisión plataforma" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/5 border border-white/10 p-4 text-center backdrop-blur-sm"
              >
                <p className="text-2xl md:text-3xl font-black text-brand-accent">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900">
              El problema en Santa Cruz
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Miles de PyMEs en Santa Cruz tienen recursos subutilizados — bodegas vacías,
              maquinaria parada, flota ociosa, personal disponible — mientras otras empresas
              pierden semanas buscando esos mismos recursos por redes informales.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              {[
                "40-70% más tiempo en búsqueda manual de proveedores",
                "Capacidad ociosa que no genera ingresos",
                "Sin comparación objetiva de precio y logística",
                "Dependencia de contactos personales y WhatsApp",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-action shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-brand-light border border-brand-light p-8">
            <h3 className="font-bold text-brand-primary text-lg">Nuestra solución</h3>
            <p className="mt-3 text-brand-secondary text-sm leading-relaxed">
              Agentes de IA que analizan la necesidad del solicitante, evalúan ofertas
              disponibles y recomiendan las 5 mejores opciones considerando costo,
              ubicación, disponibilidad y condiciones — todo en segundos.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {sectors.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-secondary border border-brand-light"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-black text-slate-900 text-center">
            ¿Cómo funciona?
          </h2>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-xl border border-slate-200 p-6 hover:border-brand-light hover:shadow-md transition-all"
              >
                <div className="rounded-lg bg-brand-light w-10 h-10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-brand-secondary" />
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-3xl font-black text-slate-900">
          Prueba el agente IA ahora
        </h2>
        <p className="mt-3 text-slate-600 max-w-xl mx-auto">
          Describe una necesidad empresarial y el agente encontrará las mejores opciones
          entre empresas reales de Santa Cruz.
        </p>
        <Link
          href="/login?next=/buscar"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-action px-8 py-3.5 font-bold text-white hover:bg-brand-secondary transition-colors"
        >
          <Bot className="h-5 w-5" />
          Iniciar búsqueda inteligente
        </Link>
      </section>
    </div>
  );
}
