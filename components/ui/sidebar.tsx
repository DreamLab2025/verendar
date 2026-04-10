"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { LogOut, MoreVertical, PanelLeft } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOwnerSessionLogout } from "@/hooks/useOwnerSessionLogout";
import { readAuthUserFromCookies, type AuthCookieUser } from "@/lib/auth/read-auth-cookie-user";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_ICON = "4.5rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  state: "expanded" | "collapsed";
  toggleSidebar: () => void;
  /** Khớp với `<Sidebar collapsible />` — chỉ `icon` mới thu gọn footer tài khoản theo `open`. */
  collapsible: "offcanvas" | "icon" | "none";
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used inside SidebarProvider");
  }
  return context;
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
}

type SidebarProviderProps = React.HTMLAttributes<HTMLDivElement> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Phải trùng `collapsible` trên `<Sidebar />` (vd. garage owner dùng `offcanvas`). */
  collapsible?: "offcanvas" | "icon" | "none";
};

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  collapsible = "icon",
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const isMobile = useIsMobile();
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);

  const open = openProp ?? internalOpen;
  const setOpen = React.useCallback(
    (value: boolean) => {
      if (openProp === undefined) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [onOpenChange, openProp]
  );

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((prev) => !prev);
      return;
    }
    setOpen(!open);
  }, [isMobile, open, setOpen]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      if (key == null || key === "") return;
      const isShortcut = key.toLowerCase() === SIDEBAR_KEYBOARD_SHORTCUT;
      if (!isShortcut || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      toggleSidebar();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleSidebar]);

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        state: open ? "expanded" : "collapsed",
        toggleSidebar,
        collapsible,
      }}
    >
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
            ...style,
          } as React.CSSProperties
        }
        className={cn("group/sidebar-wrapper flex min-h-screen w-full bg-muted/30", className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

type SidebarProps = React.HTMLAttributes<HTMLDivElement> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
};

export function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "icon",
  className,
  children,
  ...props
}: SidebarProps) {
  const { open, openMobile, setOpenMobile } = useSidebar();
  const desktopWidth = collapsible === "icon" && !open ? "var(--sidebar-width-icon)" : "var(--sidebar-width)";
  const sidePosition = side === "left" ? "left-0" : "right-0";

  return (
    <>
      <aside
        data-slot="sidebar"
        data-state={open ? "expanded" : "collapsed"}
        data-variant={variant}
        data-collapsible={collapsible}
        data-side={side}
        style={{ width: desktopWidth }}
        className={cn(
          "group/sidebar hidden h-screen shrink-0 border-r border-border/60 bg-background/80 backdrop-blur-xl md:flex",
          "transition-[width] duration-300 ease-out",
          "shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-border)_70%,transparent),0_20px_40px_-30px_color-mix(in_oklab,var(--color-foreground)_25%,transparent)]",
          variant === "floating" && "m-3 h-[calc(100vh-1.5rem)] rounded-2xl border",
          sidePosition,
          className
        )}
        {...props}
      >
        <div className="flex h-full w-full flex-col">{children}</div>
      </aside>

      {openMobile && (
        <div className="md:hidden">
          <button
            aria-label="Close sidebar overlay"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setOpenMobile(false)}
          />
          <aside
            data-slot="sidebar-mobile"
            className={cn(
              "fixed inset-y-0 z-50 flex w-(--sidebar-width-mobile) flex-col border-r border-border/60 bg-background/95 shadow-2xl backdrop-blur-xl",
              sidePosition
            )}
          >
            {children}
          </aside>
        </div>
      )}
    </>
  );
}

export function SidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("h-9 w-9", className)}
      onClick={toggleSidebar}
      {...props}
    >
      <PanelLeft className="rtl:rotate-180" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

export function SidebarInset({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="sidebar-inset"
      className={cn("relative flex min-w-0 flex-1 flex-col bg-linear-to-b from-background to-muted/35", className)}
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-border/60 p-3 group-data-[state=collapsed]/sidebar:px-2", className)} {...props} />;
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 space-y-4 overflow-y-auto p-3", className)} {...props} />;
}

const SIDEBAR_ACCOUNT_FALLBACK: AuthCookieUser = {
  displayName: "Tài khoản",
  userName: "—",
  email: "—",
  initials: "?",
};

type SidebarAccountFooterProps = {
  className?: string;
  /** Chỉ avatar + menu: ẩn tên/email (sidebar thu gọn). */
  compact?: boolean;
};

/** Dùng trong sidebar shadcn hoặc sidebar tùy biến (garage dashboard, menu mobile). */
export function SidebarAccountFooter({ className, compact }: SidebarAccountFooterProps) {
  const logout = useOwnerSessionLogout();
  const [user, setUser] = React.useState<AuthCookieUser | null>(null);

  React.useEffect(() => {
    const sync = () => setUser(readAuthUserFromCookies());
    sync();
    const onFocus = () => sync();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const u = user ?? SIDEBAR_ACCOUNT_FALLBACK;

  const menu = (
    <DropdownMenuContent side="top" align="end" className="w-44">
      <DropdownMenuItem
        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        onSelect={() => logout()}
      >
        <LogOut className="size-4" />
        Đăng xuất
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  if (compact) {
    return (
      <div className={cn("flex justify-center p-1", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Tài khoản"
              title={u.displayName}
            >
              <Avatar className="size-9">
                <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">{u.initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          {menu}
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-2 p-2 pr-1", className)}>
      <Avatar className="size-9 shrink-0">
        <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">{u.initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-medium text-foreground" title={u.displayName}>
          {u.displayName}
        </p>
        <p className="truncate text-xs text-muted-foreground" title={u.email}>
          {u.email}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Tài khoản"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        {menu}
      </DropdownMenu>
    </div>
  );
}

export function SidebarFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const sidebarCtx = React.useContext(SidebarContext);
  const accountCompact = Boolean(
    sidebarCtx && sidebarCtx.collapsible === "icon" && !sidebarCtx.open,
  );

  return (
    <div className={cn("border-t border-border/60 p-3 group-data-[state=collapsed]/sidebar:px-2", className)} {...props}>
      {children}
      <SidebarAccountFooter compact={accountCompact} className="border-0 bg-transparent p-0" />
    </div>
  );
}

export function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-opacity",
        "group-data-[state=collapsed]/sidebar:pointer-events-none group-data-[state=collapsed]/sidebar:opacity-0",
        className
      )}
      {...props}
    />
  );
}

export function SidebarGroupContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("space-y-1", className)} {...props} />;
}

export function SidebarMenuItem({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn("group/menu-item", className)} {...props} />;
}

type SidebarMenuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isActive?: boolean;
  asChild?: boolean;
};

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, isActive, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        data-active={isActive}
        className={cn(
          "flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-muted-foreground transition-all duration-200",
          "hover:bg-accent/80 hover:text-accent-foreground",
          "data-[active=true]:bg-primary/12 data-[active=true]:text-primary",
          "group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:px-2",
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";
