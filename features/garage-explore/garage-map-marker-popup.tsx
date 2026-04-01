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
    <div className="relative w-[min(92vw,288px)]">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl">
        <div className="relative aspect-5/3 w-full bg-muted">
          {branch.coverImageUrl ? (
            <SafeImage
              src={branch.coverImageUrl}
              alt={headline}
              fill
              className="object-cover"
            />
          ) : (
            <div className="grid size-full place-items-center bg-linear-to-br from-muted to-muted/60">
              <Building2 className="size-10 text-muted-foreground/45" aria-hidden />
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/40 to-transparent" />

          <div className="absolute left-2 top-2 flex flex-wrap gap-1">
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm",
                active ? "bg-emerald-600/95" : "bg-neutral-800/85",
              )}
            >
              {active ? "Hoạt động" : getGarageBranchStatusLabelVi(branch.status)}
            </span>
            <span className="rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-neutral-900 shadow-sm">
              Chi nhánh
            </span>
          </div>

          <div className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white">
            1/1
          </div>

          {onClose ? (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-2 top-2 size-7 rounded-full bg-white/90 text-neutral-800 shadow-sm hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Đóng"
            >
              <X className="size-3.5" />
            </Button>
          ) : null}
        </div>

        <div className="space-y-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[15px] font-bold leading-tight tracking-tight text-foreground">{headline}</p>
              {subline ? <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{subline}</p> : null}
            </div>
            <div className="flex shrink-0 gap-0.5" onClick={(e) => e.stopPropagation()}>
              <Button type="button" variant="ghost" size="icon" className="size-7 text-muted-foreground" aria-label="Lưu">
                <Bookmark className="size-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="size-7 text-muted-foreground" aria-label="Yêu thích">
                <Heart className="size-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="size-7 text-muted-foreground" aria-label="Chia sẻ">
                <Share2 className="size-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-amber-400 text-amber-500" aria-hidden />
              <span className="font-semibold text-foreground">{rating != null ? rating.toFixed(1) : "—"}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="size-3.5 opacity-80" aria-hidden />
              {reviews} đánh giá
            </span>
            <span className="inline-flex items-center gap-1">
              <Building2 className="size-3.5 opacity-80" aria-hidden />
              Garage
            </span>
          </div>

          {address ? (
            <p className="flex items-start gap-1.5 text-[12px] leading-snug text-muted-foreground">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary/85" aria-hidden />
              <span className="line-clamp-2">{address}</span>
            </p>
          ) : null}

          {garageId ? (
            <Button variant="default" size="sm" className="mt-1 w-full rounded-xl text-xs font-semibold shadow-sm" asChild>
              <Link href={href} onClick={(e) => e.stopPropagation()}>
                Đặt lịch
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Mũi nhọn chỉ xuống marker */}
      <div
        className="pointer-events-none absolute left-1/2 top-full z-0 -translate-x-1/2"
        aria-hidden
      >
        <div className="size-0 border-x-10 border-t-12 border-x-transparent border-t-white drop-shadow-sm dark:border-t-card" />
      </div>
    </div>
  );
}
