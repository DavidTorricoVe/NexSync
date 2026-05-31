import ListingCard from "@/components/ListingCard";
import EmpresasMapOverview from "@/components/EmpresasMapOverview";
import { getOffers } from "@/lib/store";
import { Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function EmpresasPage() {
  const offers = getOffers();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Building2 className="h-8 w-8 text-brand-action" />
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Recursos disponibles
          </h1>
          <p className="text-slate-600">
            {offers.length} ofertas activas en Santa Cruz — el agente IA las
            encuentra automáticamente cuando una empresa busca
          </p>
        </div>
      </div>

      <EmpresasMapOverview listings={offers} />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
