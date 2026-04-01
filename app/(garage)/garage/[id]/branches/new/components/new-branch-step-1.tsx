"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MapPin } from "lucide-react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";

import { SearchCombobox, type SearchComboboxItem } from "@/components/ui/search-combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LocationProvince, LocationWard } from "@/lib/api/services/fetchLocation";
import { useProvinces, useReverseGeocodeMutation, useWardBoundary, useWards } from "@/hooks/useLocation";
import { getAmazonLocationStyleDescriptorUrl } from "@/lib/maps/aws-location-style";
import { attachMapLibreStyleImageMissingFallback } from "@/lib/maps/maplibre-style-image-fallback";

export type NewBranchAddressDraft = {
  provinceCode: string;
  wardCode: string;
  streetDetail: string;
};

/** Địa chỉ chi tiết phải chứa ít nhất một chữ số (số nhà, kiệt, hẻm, tổ…). */
export function hasStreetDetailHouseNumber(streetDetail: string): boolean {
  return /[0-9]/.test(streetDetail.trim());
}

export function isStep1AddressComplete(a: NewBranchAddressDraft): boolean {
  const t = a.streetDetail.trim();
  return Boolean(a.provinceCode && a.wardCode && t && hasStreetDetailHouseNumber(a.streetDetail));
}

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

function normalizeShardValue(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function valuesMatchShard(expected: string, actual: unknown): boolean {
  const lhs = normalizeShardValue(expected);
  const rhs = normalizeShardValue(actual);
  if (!lhs || !rhs) return false;
  if (lhs === rhs) return true;

  // Cho case mã dạng số nhưng khác format (vd "00025" vs "25")
  const lhsDigits = lhs.replace(/\D/g, "");
  const rhsDigits = rhs.replace(/\D/g, "");
  if (lhsDigits && rhsDigits) {
    const l = Number(lhsDigits);
    const r = Number(rhsDigits);
    if (Number.isFinite(l) && Number.isFinite(r) && l === r) return true;
  }
  return false;
}

function filterGeoJsonByShard(
  data: unknown,
  shardProp?: string | null,
  shardValue?: string | null,
): unknown {
  const key = shardProp?.trim();
  const expected = shardValue?.trim();
  if (!key || !expected || !isRecord(data)) return data;

  const type = typeof data.type === "string" ? data.type : "";
  if (type !== "FeatureCollection") return data;

  const features = Array.isArray(data.features) ? data.features : [];
  const matched = features.filter((f) => {
    if (!isRecord(f)) return false;
    const props = isRecord(f.properties) ? f.properties : null;
    if (!props) return false;
    return valuesMatchShard(expected, props[key]);
  });

  if (matched.length === 0) return data;
  return { ...data, features: matched };
}

function WardBoundaryMap({
  boundaryUrl,
  shardMatchProperty,
  shardMatchValue,
  show,
  onGhimLocation,
  geocodePending,
}: {
  boundaryUrl: string;
  shardMatchProperty?: string | null;
  shardMatchValue?: string | null;
  show: boolean;
  /** Lấy tọa độ tâm bản đồ (điểm ping giữa màn hình) khi user nhấn “Ghim vị trí”. */
  onGhimLocation?: (lat: number, lng: number) => void;
  geocodePending?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
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

    const detachStyleImageFallback = attachMapLibreStyleImageMissingFallback(map);
    mapRef.current = map;

    const nav = new maplibregl.NavigationControl();
    map.addControl(nav, "top-left");

    const sourceId = "ward-boundary-src";
    const fillId = "ward-boundary-fill";
    const lineId = "ward-boundary-line";

    const drawBoundary = async () => {
      if (!boundaryUrl?.trim()) return;
      try {
        const res = await fetch(boundaryUrl);
        if (!res.ok) return;
        const raw = (await res.json()) as unknown;
        const data = filterGeoJsonByShard(raw, shardMatchProperty, shardMatchValue);

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
      mapRef.current = null;
      detachStyleImageFallback();
      ro.disconnect();
      if (map.getLayer(fillId)) map.removeLayer(fillId);
      if (map.getLayer(lineId)) map.removeLayer(lineId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
      map.remove();
    };
  }, [show, apiKey, region, mapName, boundaryUrl, shardMatchProperty, shardMatchValue]);

  if (!show) return null;

  if (!apiKey) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        Thiếu cấu hình API key cho bản đồ.
      </div>
    );
  }

  const handleGhimClick = () => {
    const m = mapRef.current;
    if (!m || !onGhimLocation) return;
    const c = m.getCenter();
    onGhimLocation(c.lat, c.lng);
  };

  return (
    <div className="relative h-128 w-full overflow-hidden rounded-xl border border-border/60">
      <div ref={containerRef} className="size-full" />
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="-translate-y-3">
          <div className="absolute left-1/2 top-[70%] size-7 -translate-x-1/2 rounded-full bg-red-400/35 blur-[1px]" />
          <MapPin className="size-12 fill-red-500 text-red-500 drop-shadow-sm" strokeWidth={1.5} />
        </div>
      </div>
      <div className="pointer-events-auto absolute bottom-3 left-1/2 z-10 flex w-[min(100%-1.5rem,20rem)] -translate-x-1/2 justify-center px-1">
        <Button
          type="button"
          size="sm"
          className="w-full gap-2 shadow-md sm:w-auto"
          disabled={!onGhimLocation || geocodePending}
          onClick={handleGhimClick}
        >
          {geocodePending ? <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden /> : null}
          <MapPin className="size-4 shrink-0" aria-hidden />
          Ghim vị trí &amp; lấy địa chỉ
        </Button>
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
  const { boundary, isLoading: boundaryLoading } = useWardBoundary(
    address.wardCode?.trim() || undefined,
    Boolean(address.wardCode?.trim()),
  );

  const showWard = Boolean(address.provinceCode);
  const showMap = Boolean(address.provinceCode && address.wardCode);

  const { mutateGhim, isPending: geocodePending } = useReverseGeocodeMutation(
    useCallback((streetDetail: string) => onAddressChange({ streetDetail }), [onAddressChange]),
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

  const showAddressInputs = showMap;
  const streetDetailMissingHouseNumber =
    showAddressInputs &&
    Boolean(address.streetDetail.trim()) &&
    !hasStreetDetailHouseNumber(address.streetDetail);

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
              onAddressChange({
                provinceCode: api,
                wardCode: "",
                streetDetail: "",
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
                    onAddressChange({
                      wardCode: api,
                      streetDetail: "",
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
                  <p className="text-xl font-semibold">Bản đồ ranh giới phường/xã</p>
                  <div className="flex shrink-0 flex-col items-end gap-0.5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
                    {boundaryLoading ? <span>Đang tải ranh giới…</span> : null}
                    {geocodePending ? <span>Đang lấy địa chỉ…</span> : null}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Kéo bản đồ để đưa điểm ping tới đúng vị trí, rồi nhấn <span className="font-medium text-foreground">Ghim vị trí &amp; lấy địa chỉ</span>
                </p>
                <WardBoundaryMap
                  show={showMap}
                  boundaryUrl={boundary?.boundaryUrl?.trim() || ""}
                  shardMatchProperty={boundary?.boundaryShardMatchProperty}
                  shardMatchValue={boundary?.boundaryShardMatchValue}
                  onGhimLocation={mutateGhim}
                  geocodePending={geocodePending}
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
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <label htmlFor="address-street-detail" className="text-sm font-medium text-muted-foreground">
                    Địa chỉ chi tiết
                  </label>
                  {geocodePending ? (
                    <span className="text-xs text-muted-foreground">Đang lấy địa chỉ theo ghim…</span>
                  ) : null}
                </div>
                <Input
                  id="address-street-detail"
                  value={address.streetDetail}
                  onChange={(e) => onAddressChange({ streetDetail: e.target.value })}
                  placeholder="Ví dụ: 12 Nguyễn Văn A, hoặc 45/2 đường…"
                  aria-invalid={streetDetailMissingHouseNumber}
                  className={cn(
                    "h-11 rounded-lg border-border/70 bg-muted/20",
                    streetDetailMissingHouseNumber && "border-destructive focus-visible:ring-destructive/40",
                  )}
                />           
                {streetDetailMissingHouseNumber ? (
                  <p className="text-xs text-destructive" role="alert">
                    Vui lòng bổ sung số nhà.
                  </p>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}


