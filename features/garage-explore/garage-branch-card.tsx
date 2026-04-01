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
        "group flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-all",
        selected
          ? "border-primary ring-2 ring-primary/30 shadow-md"
          : "border-border/60 hover:border-border hover:shadow-md",
      )}
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        {branch.coverImageUrl ? (
          <SafeImage
            src={branch.coverImageUrl}
            alt={headline}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="grid size-full place-items-center bg-linear-to-br from-muted to-muted/60">
            <Building2 className="size-12 text-muted-foreground/50" aria-hidden />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent" />

        <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1.5">
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

        <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white backdrop-blur-sm">
          1/1
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-foreground">
              {headline}
            </p>
            {subline ? (
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{subline}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 gap-0.5" onClick={(e) => e.stopPropagation()}>
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

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
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
          <p className="mt-auto flex items-start gap-1.5 border-t border-border/50 pt-2 text-[12px] leading-snug text-muted-foreground">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary/80" aria-hidden />
            <span className="line-clamp-2">{address}</span>
          </p>
        ) : null}

        {garageId ? (
          <Button variant="default" size="sm" className="mt-1 w-full rounded-xl font-semibold shadow-sm" asChild>
            <Link href={href} onClick={(e) => e.stopPropagation()}>
              Đặt lịch
            </Link>
          </Button>
        ) : null}
      </div>
    </article>
  );
}
