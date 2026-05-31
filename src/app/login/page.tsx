"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Loader2, LogIn } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/buscar";

  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => {
        if (r.ok) router.replace(next);
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router, next]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al iniciar sesión");

      window.location.assign(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-action" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="text-center mb-8">
        <LogIn className="h-10 w-10 text-brand-action mx-auto" />
        <h1 className="mt-3 text-3xl font-black text-slate-900">Iniciar sesión</h1>
        <p className="mt-2 text-slate-600">
          Accede a tu cuenta empresarial de NexSync
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 mb-6 space-y-4">
        <div>
          <p className="font-semibold text-slate-800">Cuentas demo para pruebas</p>
          <p className="mt-2 text-xs text-slate-500">
            Flujo recomendado: entra como contratante → busca y contrata → cierra sesión → entra
            como ofertante y revisa la campana de notificaciones.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <DemoAccount
            role="Quiere contratar"
            email="contrata@recursolink.sc"
            password="contrata1234"
            company="Manufactura del Valle SC"
            onUse={() => {
              setEmail("contrata@recursolink.sc");
              setPassword("contrata1234");
            }}
          />
          <DemoAccount
            role="Ofrece recurso"
            email="oferta@recursolink.sc"
            password="oferta1234"
            company="AgroFrío Santa Cruz"
            onUse={() => {
              setEmail("oferta@recursolink.sc");
              setPassword("oferta1234");
            }}
          />
        </div>
        <p className="text-xs text-slate-500 pt-2 border-t border-slate-200">
          General: demo@recursolink.sc / demo1234
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <Field label="Correo electrónico">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
            placeholder="tu@empresa.bo"
          />
        </Field>

        <Field label="Contraseña">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClass}
            placeholder="••••••••"
          />
        </Field>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-action py-3 font-bold text-white hover:bg-brand-secondary disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Entrar"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600 mt-6">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-brand-secondary hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-action" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-brand-action focus:ring-2 focus:ring-brand-light outline-none";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function DemoAccount({
  role,
  email,
  password,
  company,
  onUse,
}: {
  role: string;
  email: string;
  password: string;
  company: string;
  onUse: () => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-brand-secondary">{role}</p>
      <p className="mt-1 font-semibold text-slate-800">{company}</p>
      <p className="mt-1 text-xs">{email}</p>
      <p className="text-xs">Contraseña: {password}</p>
      <button
        type="button"
        onClick={onUse}
        className="mt-2 w-full rounded-lg border border-brand-light bg-brand-light py-1.5 text-xs font-semibold text-brand-secondary hover:bg-brand-light"
      >
        Usar esta cuenta
      </button>
    </div>
  );
}
