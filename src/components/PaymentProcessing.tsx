"use client";

import { CreditCard, Loader2, ShieldCheck } from "lucide-react";

interface Props {
  total: number;
  paymentMethod: string;
  cardLast4?: string;
}

export default function PaymentProcessing({ total, paymentMethod, cardLast4 = "4242" }: Props) {
  const methodLabel =
    paymentMethod === "qr"
      ? "QR Simple / Tigo"
      : paymentMethod === "transferencia"
        ? "Transferencia bancaria"
        : "Tarjeta Visa";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm text-center">
        <div className="relative mx-auto w-72 h-44 rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-brand-primary p-5 shadow-2xl text-white text-left overflow-hidden animate-card-pulse">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-action/20 rounded-full blur-2xl" />
          <div className="flex justify-between items-start">
            <div className="h-8 w-11 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-90" />
            <CreditCard className="h-6 w-6 text-white/60" />
          </div>
          <p className="mt-6 font-mono text-lg tracking-[0.2em]">
            •••• •••• •••• {cardLast4}
          </p>
          <div className="mt-4 flex justify-between text-xs text-white/70">
          <span>TITULAR</span>
            <span>12/28</span>
          </div>
          <p className="absolute bottom-4 right-5 text-sm font-bold italic opacity-80">VISA</p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 text-white">
          <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
          <div className="text-left">
            <p className="font-bold text-lg">Procesando pago...</p>
            <p className="text-sm text-slate-300">
              {methodLabel} · Bs. {total}
            </p>
          </div>
        </div>

        <div className="mt-6 mx-auto max-w-xs h-1.5 rounded-full bg-slate-700 overflow-hidden">
          <div className="h-full bg-brand-action rounded-full animate-payment-progress" />
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          Pago seguro procesado por NexSync
        </p>
      </div>
    </div>
  );
}
