"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import {
  MOROCCO_MAP_CENTER,
  OSM_TILE_ATTRIBUTION,
  OSM_TILE_URL,
} from "@/lib/openstreetmap";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapClickHandler({
  onPick,
  disabled,
}: {
  onPick: (latitude: number, longitude: number) => void;
  disabled?: boolean;
}) {
  useMapEvents({
    click(event) {
      if (disabled) return;
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function MapRecenter({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export interface ProjectLocationMapProps {
  latitude?: number | null;
  longitude?: number | null;
  interactive?: boolean;
  onPick?: (latitude: number, longitude: number) => void;
  className?: string;
  heightClassName?: string;
  pickingDisabled?: boolean;
}

export default function ProjectLocationMap({
  latitude,
  longitude,
  interactive = true,
  onPick,
  className,
  heightClassName = "h-52",
  pickingDisabled = false,
}: ProjectLocationMapProps) {
  const position = useMemo(() => {
    if (
      latitude != null &&
      longitude != null &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      return [latitude, longitude] as [number, number];
    }
    return null;
  }, [latitude, longitude]);

  const center = position ?? MOROCCO_MAP_CENTER;
  const zoom = position ? 16 : 6;

  return (
    <div className={cn("overflow-hidden rounded-lg border border-glass", className)}>
      <MapContainer
        center={center}
        zoom={zoom}
        className={cn("z-0 w-full", heightClassName)}
        scrollWheelZoom={interactive}
      >
        <TileLayer attribution={OSM_TILE_ATTRIBUTION} url={OSM_TILE_URL} />
        {position ? <Marker position={position} icon={markerIcon} /> : null}
        {interactive && onPick ? (
          <MapClickHandler onPick={onPick} disabled={pickingDisabled} />
        ) : null}
        {position ? <MapRecenter center={position} zoom={zoom} /> : null}
      </MapContainer>
      {interactive && onPick ? (
        <p className="border-t border-app bg-[color:var(--glass-bg)] px-2.5 py-1.5 text-[10px] text-glass-muted">
          Cliquez sur la carte pour placer le point · X/Y Merchich calculés automatiquement
        </p>
      ) : null}
    </div>
  );
}
