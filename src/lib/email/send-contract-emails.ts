import type { Contract } from "@/lib/contracts-store";
import { getFromAddress, getPlatformEmail, getResendClient } from "./client";
import { buildContractEmailHtml } from "./templates";

interface SendContractEmailsInput {
  contract: Contract;
  buyer: {
    companyName: string;
    email: string;
    accountEmail?: string;
    nit: string;
  };
  seller: {
    companyName: string;
    email: string;
  } | null;
}

export async function sendContractEmails({
  contract,
  buyer,
  seller,
}: SendContractEmailsInput): Promise<{ sent: string[]; skipped: boolean }> {
  const resend = getResendClient();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY no configurada — correos omitidos.");
    return { sent: [], skipped: true };
  }

  const from = getFromAddress();
  const platformEmail = getPlatformEmail();
  const sent: string[] = [];

  const buyerHtml = buildContractEmailHtml({
    preheader: `Contrato confirmado por Bs. ${contract.total}. Coordina la logística con ${seller?.companyName ?? contract.companyName}.`,
    headline: "¡Felicitaciones por usar NexSync!",
    intro:
      "Tu contrato fue registrado exitosamente. Te adjuntamos el resumen y los datos de contacto de la empresa ofertante para que coordinen entrega, plazos y condiciones operativas directamente.",
    contract,
    contactBlock: seller
      ? {
          title: "Contacto del vendedor",
          contact: seller,
          note: "Escríbeles para acordar fechas, acceso al recurso, documentación y cualquier detalle logístico.",
        }
      : undefined,
    footerNote:
      "Este correo confirma tu solicitud en la plataforma. La factura fiscal definitiva debe gestionarse entre las empresas según sus procesos internos.",
  });

  const sellerHtml = buildContractEmailHtml({
    preheader: `${buyer.companyName} contrató tu recurso "${contract.title}".`,
    headline: "¡Te contrataron en NexSync!",
    intro:
      "Una empresa acaba de contratar tu recurso publicado. Te compartimos sus datos de contacto para que coordinen la operación comercial y la logística entre ustedes.",
    contract,
    contactBlock: {
      title: "Contacto del comprador",
      contact: {
        companyName: buyer.companyName,
        email: buyer.email,
        nit: buyer.nit,
      },
      note: "Contáctalos para confirmar disponibilidad, condiciones de uso del recurso y entrega del servicio acordado.",
    },
    footerNote:
      "Revisa tu campana de notificaciones en NexSync para ver el detalle completo del contrato.",
  });

  const platformHtml = buildContractEmailHtml({
    preheader: `Nuevo contrato ${contract.id} · Comisión Bs. ${contract.comision}.`,
    headline: "Nuevo contrato en la plataforma",
    intro:
      "Se registró un nuevo acuerdo comercial entre empresas usuarias de NexSync. Copia interna para seguimiento de comisión e intermediación.",
    contract,
    footerNote: `Comprador: ${buyer.companyName} (${buyer.email}) · Vendedor: ${seller?.companyName ?? contract.companyName} (${seller?.email ?? "sin correo"})`,
  });

  const messages = [
    {
      to: buyer.email,
      subject: `NexSync · Contrato confirmado — ${contract.title}`,
      html: buyerHtml,
    },
  ];

  if (seller?.email) {
    messages.push({
      to: seller.email,
      subject: `NexSync · ¡Te contrataron! — ${contract.title}`,
      html: sellerHtml,
    });
  }

  messages.push({
    to: platformEmail,
    subject: `NexSync · Nuevo contrato ${contract.id}`,
    html: platformHtml,
  });

  for (const message of messages) {
    const { error } = await resend.emails.send({
      from,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });

    if (error) {
      console.error(`[email] Error enviando a ${message.to}:`, error);
      continue;
    }

    sent.push(message.to);
  }

  if (buyer.accountEmail && buyer.accountEmail !== buyer.email) {
    const { error } = await resend.emails.send({
      from,
      to: buyer.accountEmail,
      subject: `NexSync · Copia de contrato — ${contract.title}`,
      html: buyerHtml,
    });

    if (!error) sent.push(buyer.accountEmail);
  }

  return { sent, skipped: false };
}
