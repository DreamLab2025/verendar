"use client";

import Link from "next/link";
import {
  Bookmark,
  Building2,
  Heart,
  MapPin,
  MessageCircle,
  Share2,
  Star,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import SafeImage from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";
import {
  getGarageBranchStatusLabelVi,
  isGarageBranchStatusActive,
  type GarageBranchMapItemDto,
} from "@/lib/api/services/fetchGarage";

export interface GarageMapMarkerPopupProps {
  branch: GarageBranchMapItemDto;
  onClose?: () => void;
}

export function GarageMapMarkerPopup({ branch, onClose }: GarageMapMarkerPopupProps) {
  const garageId = branch.garage?.id;
  const businessName = branch.garage?.businessName?.trim() || null;
  const branchName = branch.name?.trim() || null;
  const headline = businessName || branchName || "Garage";
  const subline = businessName && branchName && branchName !== businessName ? branchName : null;
  const address = typeof branch.address === "string" ? branch.address.trim() : null;
  const href = garageId ? `/user/garage/${garageId}/branch/${branch.id}` : "#";
  const rating = branch.averageRating;
  const reviews = branch.reviewCount;
  const active = isGarageBranchStatusActive(branch.status);

  return (
    <div className="relative w-[min(70vw,200px)] sm:w-[min(78vw,240px)] md:w-[min(92vw,288px)]">
      <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-lg md:rounded-2xl md:border-border/60 md:shadow-xl">
        <div className="relative h-14 w-full bg-muted sm:h-16 md:aspect-5/3 md:h-auto">
          {branch.coverImageUrl ? (
            <SafeImage
              src={branch.coverImageUrl}
              alt={headline}
              fill
              className="object-cover"
            />
          ) : (
            <div className="grid size-full place-items-center bg-linear-to-br from-muted to-muted/60">
              <Building2 className="size-7 text-muted-foreground/45 md:size-10" aria-hidden />
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/45 to-transparent md:h-1/2" />

          <div className="absolute left-1.5 top-1.5 flex flex-wrap gap-0.5 md:left-2 md:top-2 md:gap-1">
            <span
              className={cn(
                "rounded px-1.5 py-px text-[9px] font-semibold text-white shadow-sm backdrop-blur-sm md:rounded-md md:px-2 md:py-0.5 md:text-[10px]",
                active ? "bg-emerald-600/95" : "bg-neutral-800/85",
              )}
            >
              {active ? "Hoạt động" : getGarageBranchStatusLabelVi(branch.status)}
            </span>
            <span className="hidden rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-neutral-900 shadow-sm sm:inline">
              Chi nhánh
            </span>
          </div>

          <div className="absolute bottom-1.5 right-1.5 hidden rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white md:block">
            1/1
          </div>

          {onClose ? (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-1.5 top-1.5 size-6 rounded-full bg-white/90 text-neutral-800 shadow-sm hover:bg-white md:right-2 md:top-2 md:size-7"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Đóng"
            >
              <X className="size-3 md:size-3.5" />
            </Button>
          ) : null}
        </div>

        <div className="space-y-1 p-2 sm:space-y-1.5 sm:p-2.5 md:space-y-2 md:p-3">
          <div className="flex items-start justify-between gap-1 md:gap-2">
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight tracking-tight text-foreground sm:text-[13px] md:text-[15px]">
                {headline}
              </p>
              {subline ? (
                <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground md:text-xs">{subline}</p>
              ) : null}
            </div>
            <div className="hidden shrink-0 gap-0.5 sm:flex" onClick={(e) => e.stopPropagation()}>
              <Button type="button" variant="ghost" size="icon" className="size-6 text-muted-foreground md:size-7" aria-label="Lưu">
                <Bookmark className="size-3 md:size-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="size-6 text-muted-foreground md:size-7" aria-label="Yêu thích">
                <Heart className="size-3 md:size-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="size-6 text-muted-foreground md:size-7" aria-label="Chia sẻ">
                <Share2 className="size-3 md:size-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground md:gap-x-3 md:text-[11px]">
            <span className="inline-flex items-center gap-0.5">
              <Star className="size-3 fill-amber-400 text-amber-500 md:size-3.5" aria-hidden />
              <span className="font-semibold text-foreground">{rating != null ? rating.toFixed(1) : "—"}</span>
            </span>
            <span className="inline-flex items-center gap-0.5">
              <MessageCircle className="size-3 opacity-80 md:size-3.5" aria-hidden />
              {reviews} đánh giá
            </span>
            <span className="hidden items-center gap-1 md:inline-flex">
              <Building2 className="size-3.5 opacity-80" aria-hidden />
              Garage
            </span>
          </div>

          {address ? (
            <p className="flex items-start gap-1 text-[10px] leading-snug text-muted-foreground md:gap-1.5 md:text-[12px]">
              <MapPin className="mt-0.5 size-3 shrink-0 text-primary/85 md:size-3.5" aria-hidden />
              <span className="line-clamp-1 md:line-clamp-2">{address}</span>
            </p>
          ) : null}

          {garageId ? (
            <Button
              variant="default"
              size="sm"
              className="mt-0.5 h-7 w-full rounded-lg text-[11px] font-semibold md:mt-1 md:h-9 md:rounded-xl md:text-xs md:shadow-sm"
              asChild
            >
              <Link href={href} onClick={(e) => e.stopPropagation()}>
                Đặt lịch
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Mũi nhọn — nhỏ hơn trên điện thoại */}
      <div className="pointer-events-none absolute left-1/2 top-full z-0 -translate-x-1/2" aria-hidden>
        <div className="size-0 border-x-[7px] border-t-[9px] border-x-transparent border-t-white drop-shadow-sm sm:border-x-8 sm:border-t-10 md:border-x-10 md:border-t-12 dark:border-t-card" />
      </div>
    </div>
  );
}
