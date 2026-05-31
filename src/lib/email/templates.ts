import type { Contract } from "@/lib/contracts-store";
import {
  documentTypeLabel,
  formatContractDate,
  paymentLabel,
} from "@/lib/invoice-utils";

interface ContactInfo {
  companyName: string;
  email: string;
  nit?: string;
}

interface EmailLayoutOptions {
  preheader: string;
  headline: string;
  intro: string;
  contract: Contract;
  contactBlock?: {
    title: string;
    contact: ContactInfo;
    note: string;
  };
  footerNote?: string;
}

export function buildContractEmailHtml({
  preheader,
  headline,
  intro,
  contract,
  contactBlock,
  footerNote,
}: EmailLayoutOptions): string {
  const rows = [
    ["ID contrato", contract.id],
    ["Recurso", contract.title],
    ["Empresa ofertante", contract.companyName],
    ["Precio recurso", `Bs. ${contract.price} / ${contract.priceUnit}`],
    ["Comisión plataforma (10%)", `Bs. ${contract.comision}`],
    ["Total", `Bs. ${contract.total}`],
    ["Calificación IA", `${contract.score}/100`],
    ["Método de pago", paymentLabel(contract.paymentMethod)],
    ["Documento", documentTypeLabel(contract)],
    ["NIT / CI", contract.billing.nit],
    ["Razón social", contract.billing.razonSocial],
    ["Dirección fiscal", contract.billing.direccionFiscal],
    ["Fecha", formatContractDate(contract.createdAt)],
  ];

  const tableRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;width:38%;">${label}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:13px;font-weight:600;">${value}</td>
        </tr>`
    )
    .join("");

  const contactHtml = contactBlock
    ? `
      <div style="margin-top:24px;padding:20px;border-radius:16px;background:#ecfdf5;border:1px solid #a7f3d0;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#047857;">
          ${contactBlock.title}
        </p>
        <p style="margin:0;font-size:18px;font-weight:800;color:#064e3b;">${contactBlock.contact.companyName}</p>
        <p style="margin:8px 0 0;font-size:14px;color:#065f46;">
          <a href="mailto:${contactBlock.contact.email}" style="color:#059669;text-decoration:none;font-weight:700;">
            ${contactBlock.contact.email}
          </a>
        </p>
        ${
          contactBlock.contact.nit
            ? `<p style="margin:6px 0 0;font-size:13px;color:#047857;">NIT: ${contactBlock.contact.nit}</p>`
            : ""
        }
        <p style="margin:14px 0 0;font-size:13px;line-height:1.6;color:#065f46;">${contactBlock.note}</p>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${headline}</title>
  </head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 20px 45px rgba(15,23,42,0.08);">
            <tr>
              <td style="padding:28px 32px;background:linear-gradient(135deg,#12343b 0%,#4f6f52 55%,#1f2933 100%);color:#ffffff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <div style="display:inline-block;width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,0.15);text-align:center;line-height:42px;font-weight:800;">NS</div>
                    </td>
                    <td align="right" style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#c9a86a;">
                      NexSync
                    </td>
                  </tr>
                </table>
                <h1 style="margin:18px 0 8px;font-size:28px;line-height:1.2;font-weight:900;">${headline}</h1>
                <p style="margin:0;font-size:15px;line-height:1.7;color:#d1fae5;">${intro}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#059669;">
                  Resumen del contrato
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
                  ${tableRows}
                </table>
                ${contactHtml}
                ${
                  footerNote
                    ? `<p style="margin:24px 0 0;font-size:12px;line-height:1.7;color:#64748b;">${footerNote}</p>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                <p style="margin:0;font-size:12px;line-height:1.7;color:#64748b;text-align:center;">
                  NexSync · Marketplace inteligente de recursos empresariales · Santa Cruz, Bolivia<br />
                  NexSync actúa como facilitador digital. La logística, entrega y cumplimiento del acuerdo es responsabilidad directa entre las empresas.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
