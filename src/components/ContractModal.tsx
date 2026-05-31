"use client";

import { useEffect, useState } from "react";
import type { MatchResult } from "@/lib/types";
import { TERMS_AND_CONDITIONS } from "@/lib/terms";
import { PLATFORM_FEE, PLATFORM_FEE_LABEL, BRAND_NAME } from "@/lib/brand";
import PaymentProcessing from "@/components/PaymentProcessing";
import { saveContractLocal, markListingContractedLocal } from "@/lib/contracts-client";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  QrCode,
  ScrollText,
  X,
} from "lucide-react";

type PaymentMethod = "qr" | "transferencia" | "tarjeta";

interface BillingForm {
  nit: string;
  razonSocial: string;
  direccionFiscal: string;
  emailFactura: string;
  tipoDocumento: "factura" | "recibo";
}

interface Props {
  match: MatchResult;
  open: boolean;
  onClose: () => void;
  onContracted?: (listingId: string) => void;
}

export default function ContractModal({ match, open, onClose, onContracted }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qr");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailsSent, setEmailsSent] = useState<string[]>([]);
  const [emailsConfigured, setEmailsConfigured] = useState(true);
  const [invoiceUrl, setInvoiceUrl] = useState("");
  const [error, setError] = useState("");
  const [billing, setBilling] = useState<BillingForm>({
    nit: "",
    razonSocial: "",
    direccionFiscal: "",
    emailFactura: "",
    tipoDocumento: "factura",
  });

  const subtotal = match.listing.price;
  const comision = Math.round(subtotal * PLATFORM_FEE * 100) / 100;
  const total = Math.round((subtotal + comision) * 100) / 100;

  useEffect(() => {
    if (open) {
      fetch("/api/auth/me")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.user) {
            setBilling((prev) => ({
              ...prev,
              razonSocial: prev.razonSocial || d.user.companyName,
              emailFactura: prev.emailFactura || d.user.email,
            }));
          }
        });
    } else {
      setStep(1);
      setSuccess(false);
      setError("");
      setPaymentMethod("qr");
      setTermsAccepted(false);
      setProcessingPayment(false);
      setEmailsSent([]);
      setEmailsConfigured(true);
      setInvoiceUrl("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handleConfirm() {
    if (!termsAccepted) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }

    setLoading(true);
    setError("");
    setProcessingPayment(true);

    try {
      if (!billing.nit || !billing.razonSocial || !billing.direccionFiscal || !billing.emailFactura) {
        throw new Error("Completa todos los datos de facturación.");
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: match.listing.id,
          companyName: match.listing.companyName,
          title: match.listing.title,
          price: subtotal,
          priceUnit: match.listing.priceUnit,
          comision,
          total,
          paymentMethod,
          billing,
          score: match.score.total,
          termsAccepted: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al procesar el contrato");

      window.dispatchEvent(new Event("recursolink:notifications-refresh"));
      setEmailsSent(data.emailsSent ?? []);
      setEmailsConfigured(data.emailsConfigured !== false);
      setInvoiceUrl(data.invoiceUrl ?? `/factura/${data.contract?.id ?? ""}`);
      if (data.contract) saveContractLocal(data.contract);
      markListingContractedLocal(match.listing.id);
      onContracted?.(match.listing.id);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setProcessingPayment(false);
      setLoading(false);
    }
  }

  return (
    <>
      {processingPayment && (
        <PaymentProcessing total={total} paymentMethod={paymentMethod} />
      )}

      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar"
      />

      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 rounded-t-2xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-action">
              Contratar recurso
            </p>
            <h2 className="text-lg font-bold text-slate-900">{match.listing.companyName}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-light">
              <CheckCircle2 className="h-8 w-8 text-brand-action" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-900">¡Contrato confirmado!</h3>
            <p className="mt-2 text-sm text-slate-600">
              Tu solicitud fue enviada a <strong>{match.listing.companyName}</strong>.
              Tu factura ya está disponible en la plataforma.
              {emailsSent.length > 0 && (
                <>
                  {" "}
                  También enviamos copia a <strong>{emailsSent.join(", ")}</strong>.
                </>
              )}
            </p>
            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-left text-sm space-y-1">
              <p>
                <span className="text-slate-500">Recurso:</span> {match.listing.title}
              </p>
              <p>
                <span className="text-slate-500">Total pagado:</span> Bs. {total}{" "}
                <span className="text-slate-400">(incl. comisión {PLATFORM_FEE_LABEL})</span>
              </p>
              <p>
                <span className="text-slate-500">Calificación IA:</span> {match.score.total}/100
              </p>
              <p>
                <span className="text-slate-500">Método:</span>{" "}
                {paymentMethod === "qr"
                  ? "QR Simple/Tigo"
                  : paymentMethod === "transferencia"
                    ? "Transferencia bancaria"
                    : "Tarjeta"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl border border-slate-200 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cerrar
            </button>
            {invoiceUrl && (
              <Link
                href={invoiceUrl}
                onClick={onClose}
                className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-brand-action py-3 font-bold text-white hover:bg-brand-secondary"
              >
                <FileText className="h-5 w-5" />
                Ver factura
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Steps indicator */}
            <div className="flex gap-2 px-5 pt-4">
              {[
                { n: 1, label: "Resumen" },
                { n: 2, label: "Pago" },
                { n: 3, label: "Facturación" },
              ].map(({ n, label }) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStep(n as 1 | 2 | 3)}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
                    step === n
                      ? "bg-brand-action text-white"
                      : step > n
                        ? "bg-brand-light text-brand-secondary"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {n}. {label}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4">
              {step === 1 && (
                <>
                  <div className="rounded-xl border border-brand-light bg-brand-light p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-brand-secondary">Calificación IA</span>
                      <span className="text-2xl font-black text-brand-secondary">
                        {match.score.total}/100
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-brand-primary">{match.aiExplanation}</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4 space-y-2 text-sm">
                    <p className="font-bold text-slate-900">{match.listing.title}</p>
                    <p className="text-slate-600">{match.listing.description}</p>
                    <div className="flex justify-between pt-2 border-t border-slate-100">
                      <span className="text-slate-500">Precio recurso</span>
                      <span className="font-semibold">
                        Bs. {subtotal}/{match.listing.priceUnit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Comisión {BRAND_NAME} ({PLATFORM_FEE_LABEL})</span>
                      <span>Bs. {comision}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total a pagar</span>
                      <span className="text-brand-secondary">Bs. {total}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full rounded-xl bg-brand-action py-3 font-bold text-white hover:bg-brand-secondary"
                  >
                    Continuar al pago
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <p className="text-sm font-semibold text-slate-700">Método de pago</p>
                  <div className="grid gap-2">
                    {(
                      [
                        { id: "qr" as const, icon: QrCode, label: "QR Simple / Tigo Money" },
                        {
                          id: "transferencia" as const,
                          icon: Building2,
                          label: "Transferencia bancaria",
                        },
                        { id: "tarjeta" as const, icon: CreditCard, label: "Tarjeta débito/crédito" },
                      ] as const
                    ).map(({ id, icon: Icon, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id)}
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                          paymentMethod === id
                            ? "border-brand-action bg-brand-light ring-2 ring-brand-light"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${paymentMethod === id ? "text-brand-action" : "text-slate-400"}`}
                        />
                        <span className="font-medium text-slate-800">{label}</span>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === "qr" && (
                    <div className="rounded-xl border border-slate-200 p-4 text-center">
                      <div className="mx-auto h-36 w-36 rounded-xl bg-slate-900 flex items-center justify-center">
                        <QrCode className="h-20 w-20 text-white opacity-90" />
                      </div>
                      <p className="mt-3 text-sm text-slate-600">
                        Escanea con Simple, Tigo Money o Yape
                      </p>
                      <p className="text-lg font-black text-slate-900 mt-1">Bs. {total}</p>
                    </div>
                  )}

                  {paymentMethod === "transferencia" && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm space-y-1">
                      <p>
                        <span className="text-slate-500">Banco:</span> BNB / BCP
                      </p>
                      <p>
                        <span className="text-slate-500">Cuenta:</span> 1234567890
                      </p>
                      <p>
                        <span className="text-slate-500">Titular:</span> NexSync S.R.L.
                      </p>
                      <p>
                        <span className="text-slate-500">Monto:</span> Bs. {total}
                      </p>
                    </div>
                  )}

                  {paymentMethod === "tarjeta" && (
                    <div className="space-y-3">
                      <input
                        className={inputClass}
                        placeholder="Número de tarjeta"
                        defaultValue="4242 4242 4242 4242"
                        maxLength={19}
                        readOnly
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input className={inputClass} placeholder="MM/AA" defaultValue="12/28" readOnly />
                        <input className={inputClass} placeholder="CVV" defaultValue="123" readOnly />
                      </div>
                      <p className="text-xs text-slate-500">Los datos se procesan al confirmar el contrato</p>
                    </div>
                  )}

                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900">
                      <ScrollText className="h-4 w-4 shrink-0" />
                      <p className="text-sm font-bold">Términos y condiciones</p>
                    </div>
                    <div className="max-h-36 overflow-y-auto rounded-lg border border-amber-100 bg-white p-3 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {TERMS_AND_CONDITIONS}
                    </div>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-action focus:ring-brand-action"
                      />
                      <span className="text-xs text-slate-700 leading-relaxed">
                        He leído y acepto los términos. Entiendo que {BRAND_NAME} no se
                        responsabiliza por acuerdos entre empresas ni por la calidad de los
                        recursos publicados.
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 rounded-xl border border-slate-200 py-3 font-semibold text-slate-700"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!termsAccepted) {
                          setError("Debes aceptar los términos y condiciones para continuar.");
                          return;
                        }
                        setError("");
                        setStep(3);
                      }}
                      disabled={!termsAccepted}
                      className="flex-1 rounded-xl bg-brand-action py-3 font-bold text-white hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continuar
                    </button>
                  </div>
                  {error && step === 2 && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                  )}
                </>
              )}

              {step === 3 && (
                <>
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Datos de facturación
                  </p>

                  <div className="flex gap-2">
                    {(["factura", "recibo"] as const).map((tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => setBilling((b) => ({ ...b, tipoDocumento: tipo }))}
                        className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize ${
                          billing.tipoDocumento === tipo
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {tipo === "factura" ? "Factura" : "Recibo"}
                      </button>
                    ))}
                  </div>

                  <Field label="NIT / CI">
                    <input
                      value={billing.nit}
                      onChange={(e) => setBilling((b) => ({ ...b, nit: e.target.value }))}
                      className={inputClass}
                      placeholder="Ej: 1020304050"
                      required
                    />
                  </Field>
                  <Field label="Razón social / Nombre">
                    <input
                      value={billing.razonSocial}
                      onChange={(e) => setBilling((b) => ({ ...b, razonSocial: e.target.value }))}
                      className={inputClass}
                      placeholder="Nombre legal de la empresa"
                      required
                    />
                  </Field>
                  <Field label="Dirección fiscal">
                    <input
                      value={billing.direccionFiscal}
                      onChange={(e) =>
                        setBilling((b) => ({ ...b, direccionFiscal: e.target.value }))
                      }
                      className={inputClass}
                      placeholder="Av. Cristo Redentor, Santa Cruz"
                      required
                    />
                  </Field>
                  <Field label="Correo para factura electrónica">
                    <input
                      type="email"
                      value={billing.emailFactura}
                      onChange={(e) => setBilling((b) => ({ ...b, emailFactura: e.target.value }))}
                      className={inputClass}
                      placeholder="cualquier@correo.com"
                      required
                    />
                    <p className="mt-1.5 text-xs text-slate-500">
                      Puedes usar un correo temporal o de prueba. La factura se ve en la plataforma
                      al confirmar (botón &quot;Ver factura&quot;).
                    </p>
                  </Field>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                  )}

                  {!termsAccepted && (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                      Acepta los términos en el paso de pago para confirmar el contrato.
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 rounded-xl border border-slate-200 py-3 font-semibold text-slate-700"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={loading || !termsAccepted}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-action py-3 font-bold text-white hover:bg-brand-secondary disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        `Confirmar · Bs. ${total}`
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-action focus:ring-2 focus:ring-brand-light outline-none";

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
