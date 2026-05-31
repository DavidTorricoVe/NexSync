"use client";

import { useEffect, useRef, useState } from "react";
import { getZoneCoords } from "@/lib/zones";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

export interface MapPoint {
  zone: string;
  label: string;
  type?: "offer" | "need" | "default";
}

interface LocationMapProps {
  zone: string;
  lat?: number;
  lng?: number;
  label?: string;
  originZone?: string;
  originLabel?: string;
  heightClass?: string;
  className?: string;
}

const MARKER_COLORS = {
  offer: "#059669",
  need: "#2563eb",
  default: "#0f172a",
};

export default function LocationMap({
  zone,
  lat,
  lng,
  label,
  originZone,
  originLabel,
  heightClass = "h-44",
  className = "",
}: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    let map: LeafletMap | null = null;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const dest =
        lat != null && lng != null ? { lat, lng } : getZoneCoords(zone);
      const origin = originZone ? getZoneCoords(originZone) : null;

      const points = origin
        ? [
            { lat: origin.lat, lng: origin.lng },
            { lat: dest.lat, lng: dest.lng },
          ]
        : [{ lat: dest.lat, lng: dest.lng }];

      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));

      map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const createIcon = (color: string) =>
        L.divIcon({
          className: "custom-map-marker",
          html: `<div style="
            width:14px;height:14px;
            background:${color};
            border:2px solid white;
            border-radius:50%;
            box-shadow:0 2px 6px rgba(0,0,0,0.35);
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

      const destMarker = L.marker([dest.lat, dest.lng], {
        icon: createIcon(MARKER_COLORS.offer),
      })
        .addTo(map)
        .bindPopup(
          `<strong>${label ?? "Recurso"}</strong><br/>${zone}<br/><small>Santa Cruz, BO</small>`
        );

      if (origin) {
        L.marker([origin.lat, origin.lng], {
          icon: createIcon(MARKER_COLORS.need),
        })
          .addTo(map)
          .bindPopup(
            `<strong>${originLabel ?? "Tu necesidad"}</strong><br/>${originZone}<br/><small>Punto de origen</small>`
          );

        L.polyline(
          [
            [origin.lat, origin.lng],
            [dest.lat, dest.lng],
          ],
          { color: "#059669", weight: 2, opacity: 0.7, dashArray: "6 6" }
        ).addTo(map);
      }

      map.fitBounds(bounds.pad(0.35));
      mapRef.current = map;
      setLiveTime(
        new Date().toLocaleTimeString("es-BO", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );

      destMarker.openPopup();
    };

    init();

    const tick = setInterval(() => {
      setLiveTime(
        new Date().toLocaleTimeString("es-BO", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);

    return () => {
      cancelled = true;
      clearInterval(tick);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [zone, lat, lng, label, originZone, originLabel]);

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className={`${heightClass} w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100 z-0`}
      />
      <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-action" />
        </span>
        Mapa en vivo · Santa Cruz · {liveTime || "cargando..."}
      </p>
    </div>
  );
}

interface ResultsMapProps {
  points: MapPoint[];
  needZone?: string;
  className?: string;
}

/** Mapa consolidado con todas las ubicaciones de los resultados */
export function ResultsMap({ points, needZone, className = "" }: ResultsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    if (!containerRef.current || points.length === 0) return;

    let cancelled = false;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];

      const map = L.map(containerRef.current, { scrollWheelZoom: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      const allCoords: [number, number][] = [];

      if (needZone) {
        const need = getZoneCoords(needZone);
        allCoords.push([need.lat, need.lng]);
        const m = L.circleMarker([need.lat, need.lng], {
          radius: 10,
          color: "#2563eb",
          fillColor: "#3b82f6",
          fillOpacity: 0.85,
          weight: 2,
        })
          .addTo(map)
          .bindPopup(`<strong>Tu búsqueda</strong><br/>${needZone}`);
        markersRef.current.push(m as unknown as LeafletMarker);
      }

      points.forEach((point, index) => {
        const coords = getZoneCoords(point.zone);
        allCoords.push([coords.lat, coords.lng]);

        const color =
          point.type === "need"
            ? "#d97706"
            : point.type === "offer"
              ? MARKER_COLORS.offer
              : MARKER_COLORS.default;

        const m = L.marker([coords.lat, coords.lng], {
          icon: L.divIcon({
            className: "custom-map-marker",
            html: `<div style="
              width:22px;height:22px;
              background:${color};
              border:2px solid white;
              border-radius:50%;
              box-shadow:0 2px 6px rgba(0,0,0,0.35);
              display:flex;align-items:center;justify-content:center;
              color:white;font-size:10px;font-weight:bold;
            ">${index + 1}</div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          }),
        })
          .addTo(map)
          .bindPopup(`<strong>${point.label}</strong><br/>${point.zone}`);

        markersRef.current.push(m);
      });

      if (allCoords.length > 0) {
        map.fitBounds(L.latLngBounds(allCoords).pad(0.2));
      } else {
        map.setView([-17.7833, -63.1821], 11);
      }

      mapRef.current = map;
      setLiveTime(new Date().toLocaleTimeString("es-BO"));
    };

    init();

    const tick = setInterval(() => {
      setLiveTime(
        new Date().toLocaleTimeString("es-BO", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);

    return () => {
      cancelled = true;
      clearInterval(tick);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [points, needZone]);

  if (points.length === 0) return null;

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>
      <p className="text-sm font-semibold text-slate-800 mb-3">
        Mapa en tiempo real — {points.length} ubicaciones en Santa Cruz
      </p>
      <div
        ref={containerRef}
        className="h-72 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100 z-0"
      />
      <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-brand-action" /> Recursos disponibles
        </span>
        <span className="flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-action" />
          </span>
          Actualizado {liveTime}
        </span>
      </div>
    </div>
  );
}
