import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/auth/users";
import { getSession } from "@/lib/auth/session";
import {
  addContract,
  getContracts,
  type Contract,
} from "@/lib/contracts-store";
import { sendContractEmails } from "@/lib/email/send-contract-emails";
import { createNotification } from "@/lib/notifications";
import {
  getListingById,
  isListingContracted,
  markListingContracted,
} from "@/lib/store";

export type { Contract };

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();

    const {
      listingId,
      companyName,
      title,
      price,
      priceUnit,
      comision,
      total,
      paymentMethod,
      billing,
      score,
      termsAccepted,
    } = body;

    if (!termsAccepted) {
      return NextResponse.json(
        { error: "Debes aceptar los términos y condiciones." },
        { status: 400 }
      );
    }

    if (!listingId || !billing?.nit || !billing?.razonSocial) {
      return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
    }

    if (isListingContracted(listingId)) {
      return NextResponse.json(
        { error: "Este recurso ya fue contratado y ya no está disponible." },
        { status: 409 }
      );
    }

    const listing = getListingById(listingId);
    const sellerUser = listing?.ownerUserId ? getUserById(listing.ownerUserId) : null;

    const contract: Contract = {
      id: `ctr-${Date.now()}`,
      listingId,
      companyName,
      title,
      price,
      priceUnit,
      comision,
      total,
      paymentMethod,
      billing,
      score,
      termsAccepted: true,
      userId: session?.id,
      userEmail: session?.email,
      buyerCompany: billing.razonSocial,
      buyerAccountEmail: session?.email,
      sellerUserId: listing?.ownerUserId,
      sellerEmail: sellerUser?.email,
      sellerCompanyName: sellerUser?.companyName ?? companyName,
      createdAt: new Date().toISOString(),
    };

    addContract(contract);
    markListingContracted(listingId);

    if (listing?.ownerUserId) {
      createNotification({
        userId: listing.ownerUserId,
        type: "contract_received",
        title: "¡Te contrataron!",
        message: `${billing.razonSocial} contrató tu recurso "${title}" por Bs. ${total} (calificación IA: ${score}/100).`,
        listingId,
        contractId: contract.id,
        contractSnapshot: contract,
      });
    }

    if (session?.id) {
      createNotification({
        userId: session.id,
        type: "contract_sent",
        title: "Contrato enviado",
        message: `Tu solicitud a ${companyName} por "${title}" fue registrada exitosamente.`,
        listingId,
        contractId: contract.id,
        contractSnapshot: contract,
      });
    }

    const emailResult = await sendContractEmails({
      contract,
      buyer: {
        companyName: billing.razonSocial,
        email: billing.emailFactura,
        accountEmail: session?.email,
        nit: billing.nit,
      },
      seller: sellerUser
        ? {
            companyName: sellerUser.companyName,
            email: sellerUser.email,
          }
        : null,
    }).catch((err) => {
      console.error("[contracts] Error enviando correos:", err);
      return { sent: [] as string[], skipped: true };
    });

    return NextResponse.json({
      contract,
      message: "Contrato registrado exitosamente.",
      emailsSent: emailResult.sent,
      emailsConfigured: !emailResult.skipped,
      invoiceUrl: `/factura/${contract.id}`,
    });
  } catch {
    return NextResponse.json({ error: "Error al registrar contrato." }, { status: 500 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const contracts = getContracts().filter(
    (c) => c.userId === session.id || c.sellerUserId === session.id
  );

  return NextResponse.json({
    total: contracts.length,
    contracts: contracts.slice(0, 20),
  });
}
