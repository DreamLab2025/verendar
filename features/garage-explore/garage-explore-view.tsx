"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { Loader2, MapPinned } from "lucide-react";

import { GarageBranchCard } from "@/features/garage-explore/garage-branch-card";
import { useGarageBranchesMapsInfinite } from "@/hooks/useGarage";
import type { GarageBranchMapItemDto } from "@/lib/api/services/fetchGarage";
import { cn } from "@/lib/utils";

const GarageExploreMap = dynamic(
  () => import("@/components/maps/garage-explore-map").then((m) => m.GarageExploreMap),
  {
    ssr: false,
    loading: () => <div className="size-full min-h-[220px] animate-pulse rounded-2xl bg-muted" />,
  },
);

export function GarageExploreView() {
  const [mapQuery, setMapQuery] = useState(() => ({
    lat: 10.8231,
    lng: 106.6297,
    radiusKm: 12,
  }));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusBranch, setFocusBranch] = useState<GarageBranchMapItemDto | null>(null);

  const filters = useMemo(
    () => ({
      Lat: mapQuery.lat,
      Lng: mapQuery.lng,
      RadiusKm: mapQuery.radiusKm,
      isDescending: true as const,
    }),
    [mapQuery.lat, mapQuery.lng, mapQuery.radiusKm],
  );

  const {
    branches,
    onScrollToLoadMore,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    data,
  } = useGarageBranchesMapsInfinite(filters, { pageSize: 18, enabled: true });

  const totalItems = data?.pages?.[0]?.totalItems ?? branches.length;

  const onViewportChange = useCallback((v: { lat: number; lng: number; radiusKm: number }) => {
    setMapQuery(v);
  }, []);

  const onMarkerClick = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const onFocusConsumed = useCallback(() => setFocusBranch(null), []);

  const initialCenter = useMemo((): [number, number] => [106.6297, 10.8231], []);

  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === selectedId) ?? null,
    [branches, selectedId],
  );

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 md:gap-0">
      <header className="shrink-0 px-0.5 md:px-0">
        <div className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <MapPinned className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground md:text-xl">Khám phá garage</h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              Kéo bản đồ để cập nhật chi nhánh trong vùng nhìn thấy.
            </p>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm",
          "md:flex-row md:rounded-2xl",
        )}
      >
        <div className="h-[min(40vh,300px)] min-h-[200px] shrink-0 border-b border-border/60 md:h-auto md:min-h-0 md:w-[46%] md:border-b-0 md:border-r">
          <GarageExploreMap
            className="rounded-none md:rounded-l-2xl"
            initialCenter={initialCenter}
            initialZoom={11}
            branches={branches}
            selectedBranchId={selectedId}
            onViewportChange={onViewportChange}
            onMarkerClick={onMarkerClick}
            onSelectionClear={() => setSelectedId(null)}
            focusBranch={focusBranch}
            onFocusConsumed={onFocusConsumed}
          />
        </div>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 flex-col gap-1 border-b border-border/50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between md:px-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Garage trong khu vực này
                <span className="ml-1.5 font-normal text-muted-foreground">— {totalItems} chi nhánh</span>
              </p>
              <p className="text-[11px] text-muted-foreground">Bán kính ~{mapQuery.radiusKm} km quanh tâm bản đồ</p>
            </div>
            <p className="text-[11px] text-muted-foreground sm:text-xs">Sắp xếp: mới nhất</p>
          </div>

          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 md:px-4"
            onScroll={onScrollToLoadMore}
          >
            {isLoading && branches.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Đang tải…
              </div>
            ) : null}

            {isError ? (
              <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error instanceof Error ? error.message : "Không tải được danh sách."}
              </p>
            ) : null}

            {!isLoading && !isError && branches.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Không có chi nhánh trong vùng này.</p>
            ) : null}

            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {branches.map((b) => (
                <li key={b.id} className="min-w-0">
                  <GarageBranchCard
                    branch={b}
                    selected={selectedId === b.id}
                    onSelect={() => {
                      setSelectedId(b.id);
                      setFocusBranch(b);
                    }}
                  />
                </li>
              ))}
            </ul>

            {isFetchingNextPage ? (
              <div className="flex justify-center py-4">
                <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
              </div>
            ) : null}

            {selectedBranch && (
              <p className="sr-only" aria-live="polite">
                Đã chọn {selectedBranch.name ?? selectedBranch.garage?.businessName ?? "chi nhánh"}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
