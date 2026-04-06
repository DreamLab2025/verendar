"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { getAmazonLocationStyleDescriptorUrl } from "@/lib/maps/aws-location-style";
import { attachMapLibreStyleImageMissingFallback } from "@/lib/maps/maplibre-style-image-fallback";
import { cn } from "@/lib/utils";

export interface AwsGrabMapProps {
  className?: string;
  /** [kinh độ, vĩ độ] — MapLibre dùng lng trước. */
  center?: [number, number];
  zoom?: number;
  /** Tên map resource trên Amazon Location (mặc định từ env hoặc VerendarMap). */
  mapName?: string;
  region?: string;
}

export function AwsGrabMap({
  className,
  center = [103.951494, 1.378692],
  zoom = 11,
  mapName: mapNameProp,
  region: regionProp,
}: AwsGrabMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  /* Trình duyệt chỉ thấy biến NEXT_PUBLIC_* — đặt trong .env.local:
   * NEXT_PUBLIC_AWS_REGION, NEXT_PUBLIC_AWS_LOCATION_MAP_NAME, NEXT_PUBLIC_AWS_LOCATION_API_KEY */
  const apiKey = process.env.NEXT_PUBLIC_AWS_LOCATION_API_KEY ?? "";
  const mapName =
    mapNameProp ?? process.env.NEXT_PUBLIC_AWS_LOCATION_MAP_NAME ?? "VerendarMap";
  const region =
    regionProp ??
    process.env.NEXT_PUBLIC_AWS_REGION ??
    process.env.NEXT_PUBLIC_AWS_LOCATION_REGION ??
    "ap-southeast-1";

  const [lng, lat] = center;

  useEffect(() => {
    if (!containerRef.current || !apiKey) return;

    const style = getAmazonLocationStyleDescriptorUrl(region, mapName, apiKey);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: [lng, lat],
      zoom,
      attributionControl: false,
    });

    const detachStyleImageFallback = attachMapLibreStyleImageMissingFallback(map);

    map.addControl(new maplibregl.NavigationControl(), "top-left");
    map.once("load", () => {
      map.resize();
    });

    mapRef.current = map;

    const ro = new ResizeObserver(() => {
      map.resize();
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      detachStyleImageFallback();
      map.remove();
      mapRef.current = null;
    };
  }, [apiKey, region, mapName, lng, lat, zoom]);

  if (!apiKey) {
    return (
      <div
        className={cn(
          "flex min-h-70 items-center justify-center rounded-xl border border-dashed bg-muted/40 p-6 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        Thiếu <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_AWS_LOCATION_API_KEY</code> trong
        .env.local (map chạy trên client nên bắt buộc tiền tố{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_</code>). Tuỳ chọn:{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_AWS_REGION</code>,{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_AWS_LOCATION_MAP_NAME</code>.
      </div>
    );
  }

  return <div ref={containerRef} className={cn("min-h-70 w-full overflow-hidden rounded-xl", className)} />;
}
