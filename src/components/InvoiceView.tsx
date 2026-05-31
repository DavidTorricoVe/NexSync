"use client";

import Link from "next/link";
import Image from "next/image";
import type { Contract } from "@/lib/contracts-store";
import { BRAND_NAME, PLATFORM_FEE_LABEL } from "@/lib/brand";
import {
  documentTypeLabel,
  formatContractDate,
  paymentLabel,
} from "@/lib/invoice-utils";
import { ArrowLeft, Download, Mail, Printer } from "lucide-react";

interface ContactParty {
  role: string;
  companyName: string;
  email: string;
  nit?: string;
  note: string;
}

interface Props {
  contract: Contract;
  buyerContact: ContactParty;
  sellerContact: ContactParty;
  viewerRole: "buyer" | "seller" | "other";
}

export default function InvoiceView({
  contract,
  buyerContact,
  sellerContact,
  viewerRole,
}: Props) {
  const counterpart = viewerRole === "seller" ? buyerContact : sellerContact;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 print:py-0 print:px-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/buscar"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            Imprimir / PDF
          </button>
        </div>
      </div>

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl print:rounded-none print:border-0 print:shadow-none">
        <header className="bg-gradient-to-br from-brand-primary via-brand-secondary to-slate-900 px-8 py-8 text-white print:bg-brand-primary">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Image
                src="/nexsync-logo.png"
                alt={BRAND_NAME}
                width={160}
                height={40}
                className="h-10 w-auto brightness-0 invert"
              />
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-light">
                {BRAND_NAME} · Santa Cruz, Bolivia
              </p>
              <h1 className="mt-2 text-3xl font-black">
                {documentTypeLabel(contract)} · Contrato comercial
              </h1>
              <p className="mt-2 text-brand-light">{contract.id}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-5 py-4 text-right backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wide text-brand-light">Total</p>
              <p className="text-3xl font-black">Bs. {contract.total}</p>
              <p className="mt-1 text-xs text-brand-light">
                incl. comisión {PLATFORM_FEE_LABEL} (Bs. {contract.comision})
              </p>
            </div>
          </div>
        </header>

        <div className="px-8 py-8 space-y-8">
          <div className="rounded-2xl bg-brand-light border border-brand-light p-5">
            <p className="text-sm font-bold text-brand-primary">
              ¡Felicitaciones por usar {BRAND_NAME}!
            </p>
            <p className="mt-2 text-sm text-brand-secondary leading-relaxed">
              Este documento resume el acuerdo registrado en la plataforma. Coordina entrega,
              plazos y condiciones operativas directamente con tu contraparte usando los contactos
              de abajo.
            </p>
          </div>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Detalle del recurso
            </h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <tbody>
                  <Row label="Recurso" value={contract.title} />
                  <Row label="Empresa ofertante" value={contract.companyName} />
                  <Row
                    label="Precio"
                    value={`Bs. ${contract.price} / ${contract.priceUnit}`}
                  />
                  <Row label="Calificación IA" value={`${contract.score}/100`} />
                  <Row label="Método de pago" value={paymentLabel(contract.paymentMethod)} />
                  <Row label="Fecha" value={formatContractDate(contract.createdAt)} />
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Datos de facturación
            </h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <tbody>
                  <Row label="Documento" value={documentTypeLabel(contract)} />
                  <Row label="NIT / CI" value={contract.billing.nit} />
                  <Row label="Razón social" value={contract.billing.razonSocial} />
                  <Row label="Dirección fiscal" value={contract.billing.direccionFiscal} />
                  <Row label="Correo registrado" value={contract.billing.emailFactura} />
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <ContactCard party={buyerContact} accent="blue" />
            <ContactCard party={sellerContact} accent="emerald" />
          </section>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="flex items-start gap-2 text-sm font-semibold text-amber-900">
              <Mail className="h-4 w-4 mt-0.5 shrink-0" />
              Contacto para logística
            </p>
            <p className="mt-2 text-sm text-amber-800 leading-relaxed">
              Escríbele a <strong>{counterpart.companyName}</strong> en{" "}
              <strong>{counterpart.email}</strong> para acordar fechas, acceso al recurso y
              entrega del servicio.
            </p>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-6">
            {BRAND_NAME} actúa como facilitador digital. La ejecución del acuerdo comercial es
            responsabilidad directa entre las empresas participantes. Documento generado
            automáticamente — válido como comprobante de registro en la plataforma.
          </p>
        </div>
      </article>

      <p className="mt-4 text-center text-xs text-slate-400 print:hidden">
        <Download className="inline h-3.5 w-3.5 mr-1" />
        Usa &quot;Imprimir / PDF&quot; y elige &quot;Guardar como PDF&quot; para descargar.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-4 py-3 text-slate-500 w-2/5">{label}</td>
      <td className="px-4 py-3 font-semibold text-slate-900">{value}</td>
    </tr>
  );
}

function ContactCard({
  party,
  accent,
}: {
  party: ContactParty;
  accent: "blue" | "emerald";
}) {
  const colors =
    accent === "blue"
      ? "border-blue-100 bg-blue-50 text-blue-900"
      : "border-brand-light bg-brand-light text-brand-primary";

  return (
    <div className={`rounded-2xl border p-5 ${colors}`}>
      <p className="text-xs font-bold uppercase tracking-wide opacity-70">{party.role}</p>
      <p className="mt-2 text-lg font-black">{party.companyName}</p>
      <a
        href={`mailto:${party.email}`}
        className="mt-2 inline-block text-sm font-semibold underline underline-offset-2"
      >
        {party.email}
      </a>
      {party.nit && <p className="mt-2 text-sm opacity-80">NIT: {party.nit}</p>}
      <p className="mt-3 text-xs leading-relaxed opacity-80">{party.note}</p>
    </div>
  );
}
