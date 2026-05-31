"use client";

import { ResultsMap, type MapPoint } from "@/components/LocationMap";
import type { Listing } from "@/lib/types";

interface Props {
  listings: Listing[];
}

export default function EmpresasMapOverview({ listings }: Props) {
  const points: MapPoint[] = listings.map((l) => ({
    zone: l.zone,
    label: l.companyName,
    type: l.kind === "oferta" ? "offer" : "need",
  }));

  return (
    <ResultsMap
      points={points}
      className="mb-10"
    />
  );
}
