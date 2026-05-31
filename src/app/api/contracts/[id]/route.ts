import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  findContractById,
  userCanAccessContract,
} from "@/lib/contracts-store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { id } = await params;
  const contract = findContractById(id);

  if (!contract) {
    return NextResponse.json({ error: "Contrato no encontrado." }, { status: 404 });
  }

  if (!userCanAccessContract(contract, session.id)) {
    return NextResponse.json({ error: "No tienes acceso a este contrato." }, { status: 403 });
  }

  const viewerRole =
    contract.userId === session.id
      ? "buyer"
      : contract.sellerUserId === session.id
        ? "seller"
        : "other";

  return NextResponse.json({
    contract,
    buyer: {
      companyName: contract.billing.razonSocial,
      email: contract.billing.emailFactura,
      accountEmail: contract.buyerAccountEmail ?? contract.userEmail ?? "",
      nit: contract.billing.nit,
    },
    seller: {
      companyName: contract.sellerCompanyName ?? contract.companyName,
      email: contract.sellerEmail ?? "",
    },
    viewerRole,
  });
}
