"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SidebarAccountFooter } from "@/components/ui/sidebar";
import { useMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";

import { getGarageDashboardNavItems, isGarageDashboardNavActive } from "../garage-nav";

interface NavGarageMenuProps {
  garageId: string;
}

export function NavGarageMenu({ garageId }: NavGarageMenuProps) {
  const isMobile = useMobile();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const items = getGarageDashboardNavItems(garageId);

  if (!isMobile) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon" className="shrink-0 shadow-sm" aria-label="Mở menu garage">
          <Menu className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-0 p-0 sm:max-w-sm">
        <DialogHeader className="border-b border-border/60 p-4 text-left">
          <DialogTitle>Menu garage</DialogTitle>
          <DialogDescription>Chọn mục để điều hướng</DialogDescription>
        </DialogHeader>
        <nav className="flex max-h-[min(50vh,320px)] flex-col overflow-y-auto p-2" aria-label="Garage dashboard mobile">
          {items.map(({ title: label, href, icon: Icon, exact }) => {
            const active = isGarageDashboardNavActive(pathname, href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors",
                  active
                    ? "bg-primary/15 font-medium text-primary"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border/60 p-3">
          <SidebarAccountFooter className="border-0 bg-transparent p-0" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
