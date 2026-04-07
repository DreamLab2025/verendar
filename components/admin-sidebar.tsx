"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  MessageSquare,
  Users,
} from "lucide-react";

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
import SafeImage from "./ui/SafeImage";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const MAIN_NAV: NavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Quản lí garage", href: "/admin/garages", icon: Building2 },
  { title: "Quản lí người dùng", href: "/admin/users", icon: Users },
  { title: "Quản lí phản hồi", href: "/admin/feedback", icon: MessageSquare },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 p-2.5 backdrop-blur-sm">
          <div className="relative size-8 shrink-0 overflow-hidden rounded-xl">
            <SafeImage src="/icon.svg" alt="Verendar" fill className="object-contain object-left" priority />
          </div>
          <div className="min-w-0 group-data-[state=collapsed]/sidebar:hidden">
            <p className="truncate text-sm font-semibold">Admin Dashboard</p>
            <p className="truncate text-xs text-muted-foreground">Quản lí Verendar</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="space-y-2.5">
          <SidebarGroupLabel>Điều hướng chính</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN_NAV.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.title} className="transition-transform hover:translate-x-0.5">
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon className="size-4 shrink-0" />
                        <span className="flex-1 truncate text-left group-data-[state=collapsed]/sidebar:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
