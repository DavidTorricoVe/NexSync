import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { addListing, getAllListings, getStats } from "@/lib/store";
import type { Listing } from "@/lib/types";

export async function GET() {
  const listings = getAllListings();
  const stats = getStats();
  return NextResponse.json({ listings, stats });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Omit<Listing, "id" | "createdAt">;
    const required = [
      "kind",
      "companyName",
      "sector",
      "resourceType",
      "title",
      "description",
      "zone",
      "price",
      "priceUnit",
      "availability",
      "conditions",
      "limitations",
    ];

    for (const field of required) {
      if (!(field in body) || body[field as keyof typeof body] === "") {
        return NextResponse.json(
          { error: `Campo requerido: ${field}` },
          { status: 400 }
        );
      }
    }

    if (body.kind && body.kind !== "oferta") {
      return NextResponse.json(
        {
          error:
            "Solo se pueden publicar recursos disponibles (ofertas). Para buscar algo, usa el agente IA en /buscar.",
        },
        { status: 400 }
      );
    }

    const session = await getSession();

    const listing = addListing({
      ...body,
      kind: "oferta",
      companyId: body.companyId ?? session?.id ?? `user-co-${Date.now()}`,
      ownerUserId: session?.id,
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error("Listing error:", error);
    return NextResponse.json({ error: "Error al publicar." }, { status: 500 });
  }
}
