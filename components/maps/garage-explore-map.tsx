"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "@/app/garage-maplibre-popup.css";

import { GarageMapMarkerPopup } from "@/features/garage-explore/garage-map-marker-popup";
import { getAmazonLocationStyleDescriptorUrl } from "@/lib/maps/aws-location-style";
import { radiusKmFromViewportCorners } from "@/lib/maps/map-geo";
import { cn } from "@/lib/utils";
import type { GarageBranchMapItemDto } from "@/lib/api/services/fetchGarage";

export interface GarageExploreMapProps {
  className?: string;
  /** Tâm ban đầu [lng, lat] */
  initialCenter?: [number, number];
  initialZoom?: number;
  branches: GarageBranchMapItemDto[];
  selectedBranchId: string | null;
  onViewportChange: (v: { lat: number; lng: number; radiusKm: number }) => void;
  onMarkerClick: (branchId: string) => void;
  /** Click ra nền map / đóng popup — bỏ chọn */
  onSelectionClear?: () => void;
  /** Khi chọn từ list: bay tới chi nhánh */
  focusBranch: GarageBranchMapItemDto | null;
  onFocusConsumed?: () => void;
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

function applyGarageMarkerButtonClass(el: HTMLButtonElement, selected: boolean) {
  el.className = cn(
    "max-w-44 rounded-full border px-2.5 py-1 text-left text-[11px] font-semibold shadow-md",
    "transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
    selected
      ? "border-neutral-800/80 bg-neutral-900 text-white ring-2 ring-primary"
      : "border-white/90 bg-white text-neutral-900",
  );
}

export function GarageExploreMap({
  className,
  initialCenter = [106.6297, 10.8231],
  initialZoom = 11,
  branches,
  selectedBranchId,
  onViewportChange,
  onMarkerClick,
  onSelectionClear,
  focusBranch,
  onFocusConsumed,
}: GarageExploreMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersByIdRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const popupRootRef = useRef<Root | null>(null);
  const popupOpenedForIdRef = useRef<string | null>(null);
  const onViewportChangeRef = useRef(onViewportChange);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onSelectionClearRef = useRef(onSelectionClear);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mapReady, setMapReady] = useState(false);

  onViewportChangeRef.current = onViewportChange;
  onMarkerClickRef.current = onMarkerClick;
  onSelectionClearRef.current = onSelectionClear;

  const apiKey = process.env.NEXT_PUBLIC_AWS_LOCATION_API_KEY ?? "";
  const mapName = process.env.NEXT_PUBLIC_AWS_LOCATION_MAP_NAME ?? "VerendarMap";
  const region =
    process.env.NEXT_PUBLIC_AWS_REGION ??
    process.env.NEXT_PUBLIC_AWS_LOCATION_REGION ??
    "ap-southeast-1";

  const closePopupImpl = useCallback(() => {
    popupOpenedForIdRef.current = null;
    if (popupRef.current) {
      try {
        popupRef.current.remove();
      } catch {
        /* ignore */
      }
      popupRef.current = null;
    }
    if (popupRootRef.current) {
      const root = popupRootRef.current;
      popupRootRef.current = null;
      queueMicrotask(() => root.unmount());
    }
  }, []);

  const openPopupImpl = useCallback(
    (branch: GarageBranchMapItemDto) => {
      const map = mapRef.current;
      if (!map || !isValidCoord(branch.latitude, branch.longitude)) return;
      closePopupImpl();
      const el = document.createElement("div");
      const root = createRoot(el);
      popupRootRef.current = root;
      root.render(
        <GarageMapMarkerPopup
          branch={branch}
          onClose={() => {
            closePopupImpl();
            onSelectionClearRef.current?.();
          }}
        />,
      );
      const popup = new maplibregl.Popup({
        offset: [0, -10],
        anchor: "bottom",
        closeButton: false,
        closeOnClick: false,
        maxWidth: "none",
        className: "garage-explore-popup",
      })
        .setLngLat([branch.longitude, branch.latitude])
        .setDOMContent(el)
        .addTo(map);
      popupRef.current = popup;
      popup.on("close", () => {
        const r = popupRootRef.current;
        popupRootRef.current = null;
        if (r) queueMicrotask(() => r.unmount());
      });
    },
    [closePopupImpl],
  );

  const emitViewport = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const c = map.getCenter();
    const b = map.getBounds();
    const ne = b.getNorthEast();
    const sw = b.getSouthWest();
    const radiusKm = radiusKmFromViewportCorners(
      c.lat,
      c.lng,
      { lat: ne.lat, lng: ne.lng },
      { lat: sw.lat, lng: sw.lng },
    );
    onViewportChangeRef.current({ lat: c.lat, lng: c.lng, radiusKm });
  }, []);

  const scheduleEmitViewport = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      emitViewport();
    }, 420);
  }, [emitViewport]);

  const [initLng, initLat] = initialCenter;

  useEffect(() => {
    if (!containerRef.current || !apiKey) return;

    const style = getAmazonLocationStyleDescriptorUrl(region, mapName, apiKey);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: [initLng, initLat],
      zoom: initialZoom,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-left");
    mapRef.current = map;

    const onMoveEnd = () => scheduleEmitViewport();
    map.on("moveend", onMoveEnd);

    const onMapClick = (e: maplibregl.MapMouseEvent) => {
      const target = e.originalEvent.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(".maplibregl-marker")) return;
      if (target.closest(".maplibregl-popup")) return;
      closePopupImpl();
      onSelectionClearRef.current?.();
    };
    map.on("click", onMapClick);

    map.once("load", () => {
      map.resize();
      emitViewport();
      setMapReady(true);
    });

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    return () => {
      setMapReady(false);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      ro.disconnect();
      map.off("moveend", onMoveEnd);
      map.off("click", onMapClick);
      closePopupImpl();
      for (const m of markersByIdRef.current.values()) {
        try {
          m.remove();
        } catch {
          /* ignore */
        }
      }
      markersByIdRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, [
    apiKey,
    region,
    mapName,
    initLng,
    initLat,
    initialZoom,
    emitViewport,
    scheduleEmitViewport,
    closePopupImpl,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.loaded() || !mapReady) return;

    const validBranches = branches.filter((b) => isValidCoord(b.latitude, b.longitude));
    const nextIds = new Set(validBranches.map((b) => b.id));

    for (const [id, marker] of Array.from(markersByIdRef.current.entries())) {
      if (!nextIds.has(id)) {
        try {
          marker.remove();
        } catch {
          /* ignore */
        }
        markersByIdRef.current.delete(id);
      }
    }

    for (const b of validBranches) {
      const label = (b.garage?.businessName || b.name || "Chi nhánh").trim();
      const short = label.length > 36 ? `${label.slice(0, 34)}…` : label;
      const selected = selectedBranchId === b.id;

      let marker = markersByIdRef.current.get(b.id);
      if (!marker) {
        const el = document.createElement("button");
        el.type = "button";
        applyGarageMarkerButtonClass(el, selected);
        el.textContent = short;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onMarkerClickRef.current(b.id);
        });
        marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([b.longitude, b.latitude])
          .addTo(map);
        markersByIdRef.current.set(b.id, marker);
      } else {
        marker.setLngLat([b.longitude, b.latitude]);
        const raw = marker.getElement();
        const el = raw instanceof HTMLButtonElement ? raw : raw?.querySelector("button");
        if (el instanceof HTMLButtonElement) {
          applyGarageMarkerButtonClass(el, selected);
          if (el.textContent !== short) el.textContent = short;
        }
      }
    }
  }, [branches, selectedBranchId, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.loaded() || !mapReady) return;

    if (!selectedBranchId) {
      closePopupImpl();
      return;
    }
    const branch = branches.find((x) => x.id === selectedBranchId);
    if (!branch) return;
    if (popupOpenedForIdRef.current === selectedBranchId && popupRef.current) {
      return;
    }
    openPopupImpl(branch);
    popupOpenedForIdRef.current = selectedBranchId;
  }, [selectedBranchId, branches, mapReady, openPopupImpl, closePopupImpl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.loaded() || !focusBranch) return;
    if (!isValidCoord(focusBranch.latitude, focusBranch.longitude)) {
      onFocusConsumed?.();
      return;
    }
    map.easeTo({
      center: [focusBranch.longitude, focusBranch.latitude],
      zoom: Math.max(map.getZoom(), 14),
      duration: 600,
    });
    onFocusConsumed?.();
  }, [focusBranch, onFocusConsumed]);

  if (!apiKey) {
    return (
      <div
        className={cn(
          "flex size-full min-h-[220px] items-center justify-center rounded-2xl border border-dashed bg-muted/40 p-4 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        Thiếu <code className="rounded bg-muted px-1 py-0.5 text-xs">NEXT_PUBLIC_AWS_LOCATION_API_KEY</code> trong
        .env.local.
      </div>
    );
  }

  return <div ref={containerRef} className={cn("size-full min-h-0 overflow-hidden rounded-2xl", className)} />;
}
