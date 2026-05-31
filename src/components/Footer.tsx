import { Heart } from "lucide-react";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-brand-light bg-brand-bg">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="font-bold text-brand-text">{BRAND_NAME}</p>
            <p className="text-sm text-brand-muted mt-1">
              {BRAND_TAGLINE} — Santa Cruz, Bolivia
            </p>
          </div>
          <div className="text-sm text-brand-muted">
            <p>Comisión plataforma: 10%</p>
            <p className="flex items-center gap-1 mt-1">
              Hecho con <Heart className="h-3 w-3 text-red-500 fill-red-500" /> para Santa Cruz
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
