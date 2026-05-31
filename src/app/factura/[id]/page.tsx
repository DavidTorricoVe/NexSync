"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import InvoiceView from "@/components/InvoiceView";
import type { Contract } from "@/lib/contracts-store";
import { getContractLocal, saveContractLocal } from "@/lib/contracts-client";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function FacturaPage() {
  const params = useParams();
  const id = String(params.id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contract, setContract] = useState<Contract | null>(null);
  const [buyer, setBuyer] = useState({
    companyName: "",
    email: "",
    accountEmail: "",
    nit: "",
  });
  const [seller, setSeller] = useState({ companyName: "", email: "" });
  const [viewerRole, setViewerRole] = useState<"buyer" | "seller" | "other">("buyer");

  useEffect(() => {
    const local = getContractLocal(id);
    if (local) {
      setContract(local);
      setBuyer({
        companyName: local.billing.razonSocial,
        email: local.billing.emailFactura,
        accountEmail: local.buyerAccountEmail ?? local.userEmail ?? "",
        nit: local.billing.nit,
      });
      setSeller({
        companyName: local.sellerCompanyName ?? local.companyName,
        email: local.sellerEmail ?? "",
      });
      fetch("/api/auth/me", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const userId = data?.user?.id as string | undefined;
          if (!userId || !local) return;
          if (local.userId === userId) setViewerRole("buyer");
          else if (local.sellerUserId === userId) setViewerRole("seller");
        });
    }

    fetch(`/api/contracts/${id}`, { credentials: "include" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          if (local) return;
          throw new Error(data.error ?? "No se pudo cargar la factura");
        }
        setContract(data.contract);
        saveContractLocal(data.contract);
        setBuyer(data.buyer);
        setSeller(data.seller);
        setViewerRole(data.viewerRole);
        setError("");
      })
      .catch((err) => {
        if (!local) {
          setError(err instanceof Error ? err.message : "Error");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading && !contract) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand-action" />
      </div>
    );
  }

  if ((error && !contract) || !contract) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-red-600">{error || "Factura no encontrada"}</p>
        <Link href="/buscar" className="mt-4 inline-block text-brand-secondary font-semibold">
          Volver a buscar
        </Link>
      </div>
    );
  }

  const buyerEmail = buyer.email || contract.billing.emailFactura;
  const buyerAccount = buyer.accountEmail || contract.buyerAccountEmail || contract.userEmail;
  const sellerEmail = seller.email || contract.sellerEmail || "";
  const sellerCompany = seller.companyName || contract.sellerCompanyName || contract.companyName;

  return (
    <InvoiceView
      contract={contract}
      viewerRole={viewerRole}
      buyerContact={{
        role: "Comprador",
        companyName: buyer.companyName || contract.billing.razonSocial,
        email: buyerAccount || buyerEmail,
        nit: buyer.nit || contract.billing.nit,
        note: buyerAccount && buyerEmail && buyerAccount !== buyerEmail
          ? `Factura a ${buyerEmail}. Cuenta de plataforma: ${buyerAccount}.`
          : "Empresa que contrató el recurso. Coordina logística con el vendedor.",
      }}
      sellerContact={{
        role: "Vendedor / Ofertante",
        companyName: sellerCompany,
        email: sellerEmail || "Sin correo registrado",
        note: "Empresa que ofrece el recurso. Escríbele para acordar entrega y condiciones.",
      }}
    />
  );
}
