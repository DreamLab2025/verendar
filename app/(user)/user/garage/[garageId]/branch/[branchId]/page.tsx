"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, Loader2, MapPin, Phone } from "lucide-react";

import { AwsBranchMiniMap } from "@/components/maps/aws-branch-mini-map";
import { Button } from "@/components/ui/button";
import SafeImage from "@/components/ui/SafeImage";
import { GarageBranchCatalog } from "@/features/garage-explore/garage-branch-catalog";
import { useGarageBranchByIdQuery } from "@/hooks/useGarage";
import { formatGarageBranchAddress, getGarageBranchStatusLabelVi } from "@/lib/api/services/fetchGarage";
import { cn } from "@/lib/utils";

export default function UserGarageBranchDetailPage() {
  const params = useParams<{ garageId: string; branchId: string }>();
  const garageId = params.garageId;
  const branchId = params.branchId;

  const { data, isLoading, isError, error } = useGarageBranchByIdQuery(garageId, branchId);

  const branch = data?.data;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" aria-hidden />
        Đang tải chi nhánh…
      </div>
    );
  }

  if (isError || !branch?.id) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error instanceof Error ? error.message : "Không tìm thấy chi nhánh."}
      </div>
    );
  }

  const addressLine = formatGarageBranchAddress(branch.address);

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="ghost" size="sm" className="shrink-0 gap-1 px-2" asChild>
          <Link href="/user/garage">
            <ArrowLeft className="size-4" aria-hidden />
            Bản đồ
          </Link>
        </Button>
      </div>

      {/* Cùng pattern chiều cao / tỉ lệ với trang "Khám phá garage": map ~46% trái, cột phải cùng chiều cao và cuộn */}
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm",
          "lg:flex-row",
        )}
      >
        <div className="h-[min(40vh,300px)] min-h-[200px] shrink-0 border-b border-border/60 lg:h-auto lg:min-h-0 lg:w-[46%] lg:border-b-0 lg:border-r">
          <div className="relative h-full min-h-[200px] w-full">
            <AwsBranchMiniMap
              className="rounded-none lg:rounded-l-2xl"
              latitude={branch.latitude}
              longitude={branch.longitude}
              name={branch.name ?? ""}
              statusLabel={getGarageBranchStatusLabelVi(branch.status)}
            />
          </div>
        </div>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 md:px-4 lg:py-4">
            <div className="flex flex-row items-start justify-between gap-3 sm:gap-5">
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Chi nhánh</p>
                  <h1 className="text-xl font-semibold tracking-tight">{branch.name ?? "—"}</h1>
                </div>

                <p className="inline-flex w-fit rounded-full border border-border/80 bg-muted/40 px-2.5 py-0.5 text-xs font-medium">
                  {getGarageBranchStatusLabelVi(branch.status)}
                </p>

                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span>{addressLine}</span>
                </div>

                {branch.phoneNumber ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <a href={`tel:${branch.phoneNumber}`} className="font-medium text-primary hover:underline">
                      {branch.phoneNumber}
                    </a>
                  </div>
                ) : null}

                <p className="text-sm text-muted-foreground">
                  Có thể thêm nhiều mục vào một lịch: chọn từng dịch vụ / phụ tùng / combo, «Thêm vào đặt lịch», rồi «Tiếp tục đặt lịch» để chọn xe và giờ hẹn.
                </p>
              </div>

              <div
                className={cn(
                  "relative aspect-square w-28 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/40 shadow-inner",
                  "sm:w-44 md:w-52 lg:w-56",
                )}
              >
                {branch.coverImageUrl ? (
                  <SafeImage
                    src={branch.coverImageUrl}
                    alt={branch.name ? `Ảnh ${branch.name}` : "Ảnh chi nhánh"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center bg-linear-to-br from-muted to-muted/60">
                    <Building2 className="size-10 text-muted-foreground/40 sm:size-12" aria-hidden />
                  </div>
                )}
              </div>
            </div>

            <GarageBranchCatalog branchId={branch.id} className="mt-6 border-t border-border/60 pt-6" />
          </div>
        </section>
      </div>
    </div>
  );
}
