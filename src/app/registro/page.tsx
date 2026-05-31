"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import type { Sector } from "@/lib/types";

const SECTORS: { value: Sector; label: string }[] = [
  { value: "industria", label: "Industria" },
  { value: "agro", label: "Agro" },
  { value: "logistica", label: "Logística" },
  { value: "energia", label: "Energía" },
  { value: "agua", label: "Agua" },
];

export default function RegistroPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    sector: "industria" as Sector,
  });

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => {
        if (r.ok) router.replace("/buscar");
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al registrarse");

      window.location.assign("/buscar");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      {checking ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-action" />
        </div>
      ) : (
        <>
      <div className="text-center mb-8">
        <UserPlus className="h-10 w-10 text-brand-action mx-auto" />
        <h1 className="mt-3 text-3xl font-black text-slate-900">Crear cuenta</h1>
        <p className="mt-2 text-slate-600">
          Registra tu empresa y publica recursos disponibles
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <Field label="Nombre de la empresa">
          <input
            value={form.companyName}
            onChange={(e) => update("companyName", e.target.value)}
            required
            className={inputClass}
            placeholder="Mi Empresa SC"
          />
        </Field>

        <Field label="Sector">
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

        <Field label="Correo electrónico">
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
            className={inputClass}
            placeholder="tu@empresa.bo"
          />
        </Field>

        <Field label="Contraseña">
          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
            minLength={6}
            className={inputClass}
            placeholder="Mínimo 6 caracteres"
          />
        </Field>

        <Field label="Confirmar contraseña">
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            required
            className={inputClass}
            placeholder="Repite tu contraseña"
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
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crear cuenta"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600 mt-6">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-brand-secondary hover:underline">
          Inicia sesión
        </Link>
      </p>
        </>
      )}
    </div>
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
