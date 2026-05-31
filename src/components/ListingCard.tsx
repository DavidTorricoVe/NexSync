import type { Listing } from "@/lib/types";
import LocationMap from "@/components/LocationMap";
import { MapPin, Tag } from "lucide-react";

const RESOURCE_LABELS: Record<string, string> = {
  bodega: "Bodega",
  maquinaria: "Maquinaria",
  transporte: "Transporte",
  personal: "Personal",
  servicio_tecnico: "Servicio técnico",
  infraestructura: "Infraestructura",
  herramientas: "Herramientas",
  capacidad_operativa: "Capacidad operativa",
};

const SECTOR_LABELS: Record<string, string> = {
  agro: "Agro",
  industria: "Industria",
  logistica: "Logística",
  energia: "Energía",
  agua: "Agua",
};

interface Props {
  listing: Listing;
}

export default function ListingCard({ listing }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand-secondary">
            Oferta
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {SECTOR_LABELS[listing.sector]}
          </span>
        </div>
        <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
          Bs. {listing.price}
          <span className="text-xs font-normal text-slate-500">/{listing.priceUnit}</span>
        </span>
      </div>

      <h3 className="mt-3 font-bold text-slate-900">{listing.title}</h3>
      <p className="text-sm font-medium text-brand-secondary">{listing.companyName}</p>
      <p className="mt-2 text-sm text-slate-600 line-clamp-2">{listing.description}</p>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Tag className="h-3 w-3" />
          {RESOURCE_LABELS[listing.resourceType]}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {listing.zone}
        </span>
      </div>

      <div className="mt-4">
        <LocationMap
          zone={listing.zone}
          lat={listing.lat}
          lng={listing.lng}
          label={listing.companyName}
          heightClass="h-40"
        />
      </div>
    </div>
  );
}
