"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarClock,
  CarFront,
  ClipboardList,
  Compass,
  HomeIcon,
  LayoutDashboard,
  LifeBuoy,
  Settings,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const MAIN_NAV: NavItem[] = [
  { title: "Phương tiện", href: "/", icon: CarFront },
  { title: "Garage", href: "/user/dashboard", icon: HomeIcon },
  { title: "Thông báo", href: "/notifications", icon: CalendarClock },
  { title: "Lịch sử", href: "/logs", icon: ClipboardList },
];

const HELP_NAV: NavItem[] = [
  { title: "Kham pha garage", href: "/garage", icon: Compass },
  { title: "Thong bao", href: "/notifications", icon: Bell },
  { title: "Tro giup", href: "/support", icon: LifeBuoy },
  { title: "Cai dat", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 p-2.5 backdrop-blur-sm">
          <div className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary shadow-sm">
            <CarFront className="size-4" />
          </div>
          <div className="min-w-0 group-data-[state=collapsed]/sidebar:hidden">
            <p className="truncate text-sm font-semibold">Verendar</p>
            <p className="truncate text-xs text-muted-foreground">Quan ly xe thong minh</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="space-y-2.5">
          <SidebarGroupLabel>Điều Hướng Chính</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN_NAV.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.title} className="transition-transform hover:translate-x-0.5">
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon className="size-4 shrink-0" />
                        <span className="flex-1 truncate text-left group-data-[state=collapsed]/sidebar:hidden">
                          {item.title}
                        </span>
                        {item.badge ? (
                          <Badge variant="secondary" className="group-data-[state=collapsed]/sidebar:hidden">
                            {item.badge}
                          </Badge>
                        ) : null}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="space-y-2.5">
          <SidebarGroupLabel>Tien ich</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {HELP_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon className="size-4 shrink-0" />
                        <span className="truncate group-data-[state=collapsed]/sidebar:hidden">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-2 text-left transition-colors hover:bg-accent/70"
        >
          <Avatar className="size-9">
            <AvatarFallback>VH</AvatarFallback>
          </Avatar>
          <div className="min-w-0 group-data-[state=collapsed]/sidebar:hidden">
            <p className="truncate text-sm font-medium">Hau Vu</p>
            <p className="truncate text-xs text-muted-foreground">Free plan</p>
          </div>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
