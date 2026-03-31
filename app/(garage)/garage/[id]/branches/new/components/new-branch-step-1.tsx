"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPin } from "lucide-react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, type ReactNode } from "react";

import { SearchCombobox, type SearchComboboxItem } from "@/components/ui/search-combobox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LocationProvince, LocationWard } from "@/lib/api/services/fetchLocation";
import { useProvinceBoundary, useProvinces, useWards } from "@/hooks/useLocation";
import { getAmazonLocationStyleDescriptorUrl } from "@/lib/maps/aws-location-style";

export type NewBranchAddressDraft = {
  provinceCode: string;
  wardCode: string;
  streetDetail: string;
};

const COMBO_TRIGGER =
  "h-11 rounded-lg border-border/70 bg-background text-base font-normal text-foreground hover:bg-muted/50! hover:text-foreground!";

function provinceValue(p: LocationProvince): string {
  const c = p.code?.trim();
  if (c) return c;
  return `__region_${p.administrativeRegionId}`;
}

function provinceLabel(p: LocationProvince): string {
  return (
    p.name?.trim() ||
    p.administrativeRegionName?.trim() ||
    p.code?.trim() ||
    `Khu vực ${p.administrativeRegionId}`
  );
}

function wardValue(w: LocationWard): string {
  const c = w.code?.trim();
  if (c) return c;
  return `__unit_${w.administrativeUnitId}`;
}

function wardLabel(w: LocationWard): string {
  return w.name?.trim() || w.code?.trim() || `Đơn vị ${w.administrativeUnitId}`;
}

function provinceApiCode(p: LocationProvince): string {
  return p.code?.trim() || String(p.administrativeRegionId);
}

function wardApiCode(w: LocationWard): string {
  return w.code?.trim() || String(w.administrativeUnitId);
}

export interface NewBranchStep1Props {
  address: NewBranchAddressDraft;
  onAddressChange: (next: Partial<NewBranchAddressDraft>) => void;
}

function FormRow({
  label,
  labelId,
  children,
  largeLabel,
}: {
  label: string;
  labelId?: string;
  children: ReactNode;
  /** Tỉnh/TP, Phường/Xã — chữ lớn hơn */
  largeLabel?: boolean;
}) {
  return (
    <div className="border-b border-border/50 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
        <span
          id={labelId}
          className={cn(
            "shrink-0 font-semibold text-foreground",
            largeLabel ? "text-base sm:text-lg" : "text-sm font-medium",
          )}
        >
          {label}
        </span>
        <div className="min-w-0 w-full sm:max-w-xs sm:flex-none md:max-w-sm">{children}</div>
      </div>
    </div>
  );
}

const motionFade = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const },
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function collectCoordsFromCoordinates(value: unknown, acc: [number, number][]) {
  if (!Array.isArray(value)) return;
  if (value.length >= 2 && typeof value[0] === "number" && typeof value[1] === "number") {
    const a = value[0];
    const b = value[1];
    // Boundary có thể trả [lng, lat] hoặc [lat, lng] => chuẩn hóa về [lng, lat].
    const looksLikeLatLng = Math.abs(a) <= 90 && Math.abs(b) <= 180 && Math.abs(b) > 90;
    acc.push(looksLikeLatLng ? [b, a] : [a, b]);
    return;
  }
  for (const child of value) collectCoordsFromCoordinates(child, acc);
}

function extractGeoJsonCoordinates(data: unknown): [number, number][] {
  const acc: [number, number][] = [];
  if (!isRecord(data)) return acc;

  const type = typeof data.type === "string" ? data.type : "";
  if (type === "FeatureCollection") {
    const features = Array.isArray(data.features) ? data.features : [];
    for (const f of features) {
      if (!isRecord(f) || !isRecord(f.geometry)) continue;
      collectCoordsFromCoordinates(f.geometry.coordinates, acc);
    }
    return acc;
  }

  if (type === "Feature") {
    const geometry = isRecord(data.geometry) ? data.geometry : null;
    if (geometry) collectCoordsFromCoordinates(geometry.coordinates, acc);
    return acc;
  }

  // Trường hợp object geojson chỉ có geometry trực tiếp
  if ("coordinates" in data) {
    collectCoordsFromCoordinates(data.coordinates, acc);
  }
  return acc;
}

function ProvinceBoundaryMap({
  boundaryUrl,
  show,
}: {
  boundaryUrl: string;
  show: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_AWS_LOCATION_API_KEY ?? "";
  const mapName = process.env.NEXT_PUBLIC_AWS_LOCATION_MAP_NAME ?? "VerendarMap";
  const region =
    process.env.NEXT_PUBLIC_AWS_REGION ??
    process.env.NEXT_PUBLIC_AWS_LOCATION_REGION ??
    "ap-southeast-1";

  useEffect(() => {
    if (!show || !containerRef.current || !apiKey) return;
    const style = getAmazonLocationStyleDescriptorUrl(region, mapName, apiKey);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center: [105.83416, 21.027764],
      zoom: 9,
      attributionControl: false,
      scrollZoom: false,
    });

    const nav = new maplibregl.NavigationControl();
    map.addControl(nav, "top-left");

    const sourceId = "province-boundary-src";
    const fillId = "province-boundary-fill";
    const lineId = "province-boundary-line";

    const drawBoundary = async () => {
      if (!boundaryUrl?.trim()) return;
      try {
        const res = await fetch(boundaryUrl);
        if (!res.ok) return;
        const data = (await res.json()) as unknown;

        if (!map.getSource(sourceId)) {
          map.addSource(sourceId, { type: "geojson", data: data as maplibregl.GeoJSONSourceSpecification["data"] });
          map.addLayer({
            id: fillId,
            type: "fill",
            source: sourceId,
            paint: {
              "fill-color": "#cd2626",
              "fill-opacity": 0.16,
            },
          });
          map.addLayer({
            id: lineId,
            type: "line",
            source: sourceId,
            paint: {
              "line-color": "#cd2626",
              "line-width": 2,
            },
          });
        } else {
          const src = map.getSource(sourceId) as maplibregl.GeoJSONSource;
          src.setData(data as GeoJSON.FeatureCollection | GeoJSON.Feature);
        }

        const coords = extractGeoJsonCoordinates(data);
        if (coords.length === 0) return;

        let minLng = Infinity;
        let minLat = Infinity;
        let maxLng = -Infinity;
        let maxLat = -Infinity;

        for (const [lng, lat] of coords) {
          minLng = Math.min(minLng, lng);
          minLat = Math.min(minLat, lat);
          maxLng = Math.max(maxLng, lng);
          maxLat = Math.max(maxLat, lat);
        }

        map.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          { padding: 36, duration: 500, maxZoom: 13 },
        );

        const center: [number, number] = [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
        map.easeTo({ center, duration: 300 });
      } catch {
        // ignore boundary draw errors (S3/CORS/network)
      }
    };

    map.once("load", () => {
      void drawBoundary();
      map.resize();
    });
    if (map.loaded()) void drawBoundary();

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      if (map.getLayer(fillId)) map.removeLayer(fillId);
      if (map.getLayer(lineId)) map.removeLayer(lineId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
      map.remove();
    };
  }, [show, apiKey, region, mapName, boundaryUrl]);

  if (!show) return null;

  if (!apiKey) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        Thiếu cấu hình API key cho bản đồ.
      </div>
    );
  }

  return (
    <div className="relative h-128 w-full overflow-hidden rounded-xl border border-border/60">
      <div ref={containerRef} className="size-full" />
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="-translate-y-3">
          <div className="absolute left-1/2 top-[70%] size-7 -translate-x-1/2 rounded-full bg-red-400/35 blur-[1px]" />
          <MapPin className="size-12 fill-red-500 text-red-500 drop-shadow-sm" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}

export function NewBranchStep1({ address, onAddressChange }: NewBranchStep1Props) {
  const { provinces, isLoading: provincesLoading } = useProvinces();
  const { wards, isLoading: wardsLoading } = useWards(
    address.provinceCode || undefined,
    Boolean(address.provinceCode),
  );
  const { boundary, isLoading: boundaryLoading } = useProvinceBoundary(
    address.provinceCode || undefined,
    undefined,
    Boolean(address.provinceCode),
  );

  const provinceItems: SearchComboboxItem[] = useMemo(() => {
    return provinces.map((p) => ({
      value: provinceValue(p),
      label: provinceLabel(p),
    }));
  }, [provinces]);

  const wardItems: SearchComboboxItem[] = useMemo(() => {
    return wards.map((w) => ({
      value: wardValue(w),
      label: wardLabel(w),
    }));
  }, [wards]);

  const selectedProvinceComboValue = useMemo(() => {
    const p = provinces.find((x) => provinceApiCode(x) === address.provinceCode);
    return p ? provinceValue(p) : "";
  }, [provinces, address.provinceCode]);

  const selectedWardComboValue = useMemo(() => {
    const w = wards.find((x) => wardApiCode(x) === address.wardCode);
    return w ? wardValue(w) : "";
  }, [wards, address.wardCode]);

  const showWard = Boolean(address.provinceCode);
  const showMap = Boolean(address.provinceCode && address.wardCode);
  const showAddressInputs = showMap;
  const selectedProvinceLabel = useMemo(() => {
    return provinceItems.find((x) => x.value === selectedProvinceComboValue)?.label ?? "";
  }, [provinceItems, selectedProvinceComboValue]);

  return (
    <section className="text-foreground" aria-labelledby="new-branch-step1-title">
      <header className="pb-6">
        <h2 id="new-branch-step1-title" className="mt-1 text-3xl font-semibold tracking-tight">
          Thông tin địa chỉ
        </h2>
        <span className="text-sm text-muted-foreground">Nhập địa chỉ chi nhánh của bạn để được hỗ trợ tốt nhất.</span>
      </header>

      <div className="border-t border-border/50">
        <FormRow label="Tỉnh/Thành phố" labelId="branch-province-label" largeLabel>
          <SearchCombobox
            id="branch-province"
            items={provinceItems}
            value={selectedProvinceComboValue}
            onValueChange={(v) => {
              const p = provinces.find((x) => provinceValue(x) === v);
              const api = p ? provinceApiCode(p) : v;
              const provinceText = p ? provinceLabel(p) : "";
              onAddressChange({
                provinceCode: api,
                wardCode: "",
                streetDetail: provinceText,
              });
            }}
            placeholder="Chọn tỉnh / thành phố"
            searchPlaceholder="Tìm tỉnh, thành phố…"
            emptyText="Không tìm thấy tỉnh thành"
            isLoading={provincesLoading}
            triggerClassName={COMBO_TRIGGER}
          />
        </FormRow>

        <AnimatePresence initial={false}>
          {showWard ? (
            <motion.div key="ward-block" {...motionFade}>
              <FormRow label="Phường/Xã" labelId="branch-ward-label" largeLabel>
                <SearchCombobox
                  id="branch-ward"
                  items={wardItems}
                  value={selectedWardComboValue}
                  onValueChange={(v) => {
                    const w = wards.find((x) => wardValue(x) === v);
                    const api = w ? wardApiCode(w) : v;
                    const wardText = w ? wardLabel(w) : "";
                    onAddressChange({
                      wardCode: api,
                      streetDetail: wardText && selectedProvinceLabel ? `${selectedProvinceLabel}, ${wardText}` : wardText,
                    });
                  }}
                  placeholder="Chọn phường / xã"
                  searchPlaceholder="Tìm phường, xã…"
                  emptyText="Không tìm thấy phường xã"
                  isLoading={wardsLoading}
                  disabled={!address.provinceCode}
                  triggerClassName={COMBO_TRIGGER}
                />
              </FormRow>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {showMap ? (
            <motion.div
              key="map-block"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ ...motionFade.transition, delay: 0.02 }}
              className="border-b border-border/50 py-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold">Bản đồ ranh giới</p>
                  {boundaryLoading ? (
                    <span className="text-sm text-muted-foreground">Đang tải ranh giới…</span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  Ping cố định ở giữa, bạn di chuyển bản đồ để chọn vị trí chính xác.
                </p>
                <ProvinceBoundaryMap
                  show={showMap}
                  boundaryUrl={boundary?.boundaryUrl?.trim() || ""}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {showAddressInputs ? (
            <motion.div
              key="address-inputs"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ ...motionFade.transition, delay: 0.03 }}
              className="space-y-4 pt-5"
            >
              <div className="space-y-1.5">
                <label htmlFor="address-street-detail" className="text-sm font-medium text-muted-foreground">
                  Địa chỉ
                </label>
                <Input
                  id="address-street-detail"
                  value={address.streetDetail}
                  onChange={(e) => onAddressChange({ streetDetail: e.target.value })}
                  className="h-11 rounded-lg border-border/70 bg-muted/20"
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
