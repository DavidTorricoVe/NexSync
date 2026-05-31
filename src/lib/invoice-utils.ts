import type { Contract } from "@/lib/contracts-store";

export function paymentLabel(method: string) {
  if (method === "qr") return "QR Simple / Tigo Money";
  if (method === "transferencia") return "Transferencia bancaria";
  if (method === "tarjeta") return "Tarjeta débito/crédito";
  return method;
}

export function formatContractDate(iso: string) {
  return new Date(iso).toLocaleString("es-BO", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

export function documentTypeLabel(contract: Contract) {
  return contract.billing.tipoDocumento === "factura" ? "Factura" : "Recibo";
}
