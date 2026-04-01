"use client";

import { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { getAmazonLocationStyleDescriptorUrl } from "@/lib/maps/aws-location-style";
import { attachMapLibreStyleImageMissingFallback } from "@/lib/maps/maplibre-style-image-fallback";
import { cn } from "@/lib/utils";

function BranchMapMarkerPill({ label }: { label: string }) {
  const text = label.trim() || "Chi nhánh";
  return (
    <div className="flex cursor-pointer flex-col items-center">
      <div className="max-w-40 rounded-full bg-foreground px-3 py-1.5 text-center text-xs font-semibold text-background shadow-md">
        <span className="line-clamp-1">{text}</span>
      </div>
      <div
        className="size-0 border-x-[7px] border-t-8 border-x-transparent border-t-foreground"
        aria-hidden
      />
    </div>
  );
}

export interface AwsBranchMiniMapProps {
  className?: string;
  latitude: number;
  longitude: number;
  name: string;
  statusLabel: string;
}

function isValidCoord(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

export function AwsBranchMiniMap({
  className,
  latitude,
  longitude,
  name,
  statusLabel,
}: AwsBranchMiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_AWS_LOCATION_API_KEY ?? "";
  const mapName = process.env.NEXT_PUBLIC_AWS_LOCATION_MAP_NAME ?? "VerendarMap";
  const region =
    process.env.NEXT_PUBLIC_AWS_REGION ??
    process.env.NEXT_PUBLIC_AWS_LOCATION_REGION ??
    "ap-southeast-1";

  const lng = longitude;
  const lat = latitude;
  const coordsOk = isValidCoord(lat, lng);

  useEffect(() => {
    if (!containerRef.current || !apiKey || !coordsOk) return;

    const style = getAmazonLocationStyleDescriptorUrl(region, mapName, apiKey);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: [lng, lat],
      zoom: 15,
      scrollZoom: false,
      attributionControl: false,
    });

    const detachStyleImageFallback = attachMapLibreStyleImageMissingFallback(map);

    const pillHost = document.createElement("div");
    const pillRoot: Root = createRoot(pillHost);
    pillRoot.render(<BranchMapMarkerPill label={name.trim() || statusLabel || "Chi nhánh"} />);

    const marker = new maplibregl.Marker({ element: pillHost, anchor: "bottom" })
      .setLngLat([lng, lat])
      .addTo(map);

    map.once("load", () => {
      map.resize();
    });

    const ro = new ResizeObserver(() => {
      map.resize();
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      marker.remove();
      detachStyleImageFallback();
      map.remove();
      // Tránh unmount đồng bộ trong commit React (Strict Mode / list re-render) → race với renderer.
      queueMicrotask(() => {
        pillRoot.unmount();
      });
    };
  }, [apiKey, region, mapName, lng, lat, coordsOk, name, statusLabel]);

  if (!coordsOk) {
    return (
      <div
        className={cn(
          "flex size-full flex-col items-center justify-center bg-linear-to-b from-muted to-muted/60 text-center",
          className,
        )}
      >
        <span className="sr-only">
          Chưa có tọa độ hợp lệ. Giá trị: {latitude}, {longitude}
        </span>
        <p className="px-3 text-xs text-muted-foreground">Chưa có vị trí bản đồ</p>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div
        className={cn(
          "flex size-full items-center justify-center bg-muted/50 p-2 text-center text-[11px] text-muted-foreground",
          className,
        )}
      >
        Thiếu cấu hình map (API key)
      </div>
    );
  }

  return <div ref={containerRef} className={cn("size-full min-h-0 overflow-hidden", className)} />;
}
