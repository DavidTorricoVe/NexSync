"use client";

import { useEffect, useRef, useState } from "react";
import { getZoneCoords } from "@/lib/zones";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

interface LocationPickerMapProps {
  zone: string;
  lat: number | null;
  lng: number | null;
  label?: string;
  onLocationChange: (lat: number, lng: number) => void;
  heightClass?: string;
  className?: string;
}

export default function LocationPickerMap({
  zone,
  lat,
  lng,
  label,
  onLocationChange,
  heightClass = "h-64",
  className = "",
}: LocationPickerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const onChangeRef = useRef(onLocationChange);
  const mapReadyRef = useRef(false);
  const skipZoneEffectRef = useRef(false);
  const [coordsText, setCoordsText] = useState("");

  onChangeRef.current = onLocationChange;

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    const init = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current) return;

      const start = getZoneCoords(zone);

      const map = L.map(containerRef.current, {
        scrollWheelZoom: true,
        touchZoom: true,
        doubleClickZoom: true,
        zoomControl: true,
      }).setView([start.lat, start.lng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      const icon = L.divIcon({
        className: "custom-map-marker",
        html: `<div style="
          width:20px;height:20px;
          background:#059669;
          border:3px solid white;
          border-radius:50%;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
          cursor:grab;
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const setMarker = (latitude: number, longitude: number) => {
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        } else {
          markerRef.current = L.marker([latitude, longitude], {
            icon,
            draggable: true,
          }).addTo(map);

          markerRef.current.on("dragend", () => {
            const pos = markerRef.current!.getLatLng();
            setCoordsText(`${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`);
            onChangeRef.current(pos.lat, pos.lng);
          });
        }

        markerRef.current.bindPopup(
          `<strong>${label ?? "Tu recurso"}</strong><br/>${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
        );
      };

      map.on("click", (e) => {
        setMarker(e.latlng.lat, e.latlng.lng);
        setCoordsText(`${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`);
        onChangeRef.current(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      mapReadyRef.current = true;

      const initialLat = lat ?? start.lat;
      const initialLng = lng ?? start.lng;
      skipZoneEffectRef.current = true;
      setMarker(initialLat, initialLng);
      setCoordsText(`${initialLat.toFixed(5)}, ${initialLng.toFixed(5)}`);
      onChangeRef.current(initialLat, initialLng);

      requestAnimationFrame(() => {
        map.invalidateSize();
        setTimeout(() => map.invalidateSize(), 200);
      });
    };

    init();

    return () => {
      cancelled = true;
      mapReadyRef.current = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapReadyRef.current || !mapRef.current) return;
    if (skipZoneEffectRef.current) {
      skipZoneEffectRef.current = false;
      return;
    }

    const coords = getZoneCoords(zone);
    mapRef.current.setView([coords.lat, coords.lng], 13, { animate: true });

    if (markerRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng]);
      markerRef.current.bindPopup(
        `<strong>${label ?? "Tu recurso"}</strong><br/>${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
      );
    }

    setCoordsText(`${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
    onChangeRef.current(coords.lat, coords.lng);

    setTimeout(() => mapRef.current?.invalidateSize(), 100);
  }, [zone, label]);

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className={`${heightClass} w-full rounded-lg overflow-hidden border-2 border-brand-light bg-slate-100 relative z-0`}
        style={{ minHeight: "256px" }}
      />
      <p className="text-xs text-brand-secondary mt-2 font-medium">
        Haz clic en el mapa o arrastra el pin verde para marcar tu ubicación exacta
      </p>
      {coordsText && (
        <p className="text-[10px] text-slate-500 mt-1">Coordenadas: {coordsText}</p>
      )}
    </div>
  );
}
