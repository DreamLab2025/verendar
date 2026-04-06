"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CarFront } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import { getGarageDashboardNavItems, isGarageDashboardNavItemActive } from "../garage-nav";
import SafeImage from "@/components/ui/SafeImage";

interface GarageSidebarProps {
  garageId: string;
  businessName: string;
}

export function GarageSidebar({ garageId, businessName }: GarageSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const items = getGarageDashboardNavItems(garageId);

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className={cn(
        "h-full max-h-full min-h-0 shrink-0 self-stretch border-border/60 bg-muted/20 shadow-none",
        "hidden lg:flex",
      )}
    >
      <SidebarHeader className="border-b border-border/60 bg-background/90 p-0 backdrop-blur-md">
        <div className="flex h-14 min-h-14 items-center gap-2 px-3">
        <span className="relative block size-8">
            <SafeImage
              src="/icon.svg"
              alt="Verendar"
              fill
              className="object-cover object-left "
              priority
            />
          </span>
          <span
            className="min-w-0 flex-1 truncate text-sm font-semibold group-data-[state=collapsed]/sidebar:hidden"
            title={businessName}
          >
            {businessName}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="min-h-0 space-y-0">
        <nav className="flex flex-col gap-1" aria-label="Garage dashboard">
          {items.map(({ title: label, href, icon: Icon, tab }) => {
            const active = isGarageDashboardNavItemActive(pathname, garageId, searchParams, tab);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                  "group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:px-2",
                  active
                    ? "bg-primary/15 font-medium text-primary"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="truncate group-data-[state=collapsed]/sidebar:hidden">{label}</span>
              </Link>
            );
          })}
        </nav>
      </SidebarContent>
      <SidebarFooter className="mt-auto border-border/60 bg-background/90 backdrop-blur-md" />
    </Sidebar>
  );
}
