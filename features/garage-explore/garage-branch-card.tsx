"use client";

import Link from "next/link";
import {
  Bookmark,
  Building2,
  ChevronRight,
  Heart,
  MapPin,
  MessageCircle,
  Share2,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import SafeImage from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";
import {
  getGarageBranchStatusLabelVi,
  isGarageBranchStatusActive,
  type GarageBranchMapItemDto,
} from "@/lib/api/services/fetchGarage";

export interface GarageBranchCardProps {
  branch: GarageBranchMapItemDto;
  selected: boolean;
  onSelect: () => void;
}

export function GarageBranchCard({ branch, selected, onSelect }: GarageBranchCardProps) {
  const garageId = branch.garage?.id;
  const garageLogoUrl = branch.garage?.logoUrl?.trim() || null;
  const businessName = branch.garage?.businessName?.trim() || null;
  const branchName = branch.name?.trim() || null;
  const headline = businessName || branchName || "Garage";
  const subline = businessName && branchName && branchName !== businessName ? branchName : null;
  const address = typeof branch.address === "string" ? branch.address.trim() : null;
  const href = garageId ? `/user/garage/${garageId}/branch/${branch.id}` : "#";
  const rating = branch.averageRating;
  const reviews = branch.reviewCount;
  const active = isGarageBranchStatusActive(branch.status);
  const statusShort = active ? "Hoạt động" : getGarageBranchStatusLabelVi(branch.status);

  const reviewLabel = reviews === 0 ? "Chưa có đánh giá" : `${reviews} đánh giá`;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group flex cursor-pointer overflow-hidden text-left transition-[background-color,box-shadow] duration-150",
        "flex-row items-stretch gap-2 rounded-lg px-0 py-1.5 md:flex-col md:gap-0 md:rounded-2xl md:px-0 md:py-0",
        "border-0 bg-transparent shadow-none md:border md:bg-card md:shadow-sm",
        selected
          ? "bg-muted/70 ring-1 ring-primary/25 md:border-primary md:bg-card md:ring-2 md:ring-primary/25 md:shadow-md"
          : "hover:bg-muted/40 md:hover:border-border md:hover:shadow-md",
        "md:border md:border-border/60",
        "active:bg-muted/60 md:active:bg-transparent",
      )}
    >
      {/* Ảnh — mobile nhỏ, tối giản badge */}
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-muted",
          "size-12 rounded-md md:size-auto md:rounded-none md:rounded-t-2xl md:aspect-4/3",
        )}
      >
        {branch.coverImageUrl ? (
          <SafeImage
            src={branch.coverImageUrl}
            alt={headline}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="grid size-full place-items-center bg-linear-to-br from-muted to-muted/60">
            <Building2 className="size-5 text-muted-foreground/45 md:size-12" aria-hidden />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent md:from-black/35" />

        {/* Mobile: chấm trạng thái */}
        <span
          className={cn(
            "absolute bottom-1 right-1 size-2 rounded-full border-2 border-background shadow-sm md:hidden",
            active ? "bg-emerald-500" : "bg-muted-foreground/60",
          )}
          title={statusShort}
          aria-hidden
        />

        <div className="pointer-events-none absolute left-1.5 top-1.5 hidden max-w-[calc(100%-0.75rem)] flex-wrap gap-1 md:flex md:left-2 md:top-2 md:gap-1.5">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm",
              active ? "bg-emerald-600/90 text-white" : "bg-black/50 text-white",
            )}
          >
            {statusShort}
          </span>
          <span className="rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-neutral-800 backdrop-blur-sm">
            Chi nhánh
          </span>
        </div>

        <div className="pointer-events-none absolute bottom-2 right-2 hidden rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white backdrop-blur-sm md:block">
          1/1
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1 md:gap-2 md:p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5 md:gap-2">
              <span className="relative size-4 shrink-0 overflow-hidden rounded-full border border-border/60 bg-muted md:size-5">
                {garageLogoUrl ? (
                  <SafeImage src={garageLogoUrl} alt={headline} fill className="object-cover" />
                ) : (
                  <span className="grid size-full place-items-center text-muted-foreground/70">
                    <Building2 className="size-2.5 md:size-3" aria-hidden />
                  </span>
                )}
              </span>
              <p className="line-clamp-1 min-w-0 text-[13px] font-semibold leading-tight tracking-tight text-foreground md:line-clamp-2 md:text-[15px] md:font-bold">
                {headline}
              </p>
            </div>
            {subline ? (
              <p className="mt-0 line-clamp-1 text-[11px] text-muted-foreground md:mt-0.5 md:text-xs">{subline}</p>
            ) : null}
          </div>
          <div className="hidden shrink-0 gap-0.5 md:flex" onClick={(e) => e.stopPropagation()}>
            <Button type="button" variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Lưu">
              <Bookmark className="size-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Yêu thích">
              <Heart className="size-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Chia sẻ">
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>

        {/* Mobile: nội dung trái + Đặt lịch căn phải cùng hàng */}
        <div className="flex min-h-0 min-w-0 items-center gap-2 md:contents">
          <div className="min-w-0 flex-1 space-y-0.5 md:contents">
            <p className="flex min-w-0 items-center gap-1 text-[10px] tabular-nums text-muted-foreground md:hidden">
              <Star className="size-2.5 shrink-0 fill-amber-400 text-amber-500" aria-hidden />
              <span className="shrink-0 font-medium text-foreground/90">{rating != null ? rating.toFixed(1) : "—"}</span>
              <span className="shrink-0 text-muted-foreground/50" aria-hidden>
                ·
              </span>
              <MessageCircle className="size-2.5 shrink-0 opacity-70" aria-hidden />
              <span className="min-w-0 truncate">{reviewLabel}</span>
            </p>
            {address ? (
              <p className="flex items-center gap-1 text-[10px] leading-snug text-muted-foreground md:hidden">
                <MapPin className="size-2.5 shrink-0 text-primary/70" aria-hidden />
                <span className="min-w-0 truncate">{address}</span>
              </p>
            ) : null}

            <div className="hidden flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground md:flex">
              <span className="inline-flex items-center gap-1">
                <Star className="size-3.5 fill-amber-400 text-amber-500" aria-hidden />
                <span className="font-semibold text-foreground">{rating != null ? rating.toFixed(1) : "—"}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="size-3.5 opacity-80" aria-hidden />
                <span>{reviews} đánh giá</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Building2 className="size-3.5 opacity-80" aria-hidden />
                <span className="truncate">Garage</span>
              </span>
            </div>

            {address ? (
              <p className="hidden items-start gap-1 text-[11px] leading-snug text-muted-foreground md:mt-auto md:flex md:border-t md:border-border/50 md:pt-2 md:text-[12px]">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary/80" aria-hidden />
                <span className="line-clamp-2">{address}</span>
              </p>
            ) : null}
          </div>

          {garageId ? (
            <div className="flex shrink-0 flex-col items-end justify-center self-stretch border-l border-border/40 pl-2 md:hidden">
              <Button variant="link" size="sm" className="h-auto p-0 text-[11px] font-semibold text-primary no-underline hover:text-primary/90" asChild>
                <Link
                  href={href}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-0.5 whitespace-nowrap"
                >
                  Đặt lịch
                  <ChevronRight className="size-3 shrink-0 opacity-80" aria-hidden />
                </Link>
              </Button>
            </div>
          ) : null}
        </div>

        {garageId ? (
          <Button
            variant="default"
            size="sm"
            className="mt-1 hidden h-9 w-full rounded-xl text-sm font-semibold shadow-sm md:flex"
            asChild
          >
            <Link href={href} onClick={(e) => e.stopPropagation()}>
              Đặt lịch
            </Link>
          </Button>
        ) : null}
      </div>
    </article>
  );
}
