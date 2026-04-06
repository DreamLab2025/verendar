"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { MessageSquare, LogOut, ChevronRight, Settings } from "lucide-react";

import { useOwnerSessionLogout } from "@/hooks/useOwnerSessionLogout";
import { readAuthUserFromCookies, type AuthCookieUser } from "@/lib/auth/read-auth-cookie-user";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const SIDEBAR_ACCOUNT_FALLBACK: AuthCookieUser = {
    displayName: "Tài khoản",
    userName: "—",
    email: "—",
    initials: "?",
};

// --- Animations ---
const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const fadeUpVariant: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

const itemHoverParams = {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring" as const, stiffness: 400, damping: 25 },
};

export default function SettingsPage() {
    const logout = useOwnerSessionLogout();
    const [user, setUser] = useState<AuthCookieUser | null>(null);

    useEffect(() => {
        const sync = () => setUser(readAuthUserFromCookies());
        sync();
        const onFocus = () => sync();
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, []);

    const u = user ?? SIDEBAR_ACCOUNT_FALLBACK;

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <div className="pt-6 px-4 md:px-6 max-w-3xl mx-auto flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-xl bg-primary/20 text-primary shrink-0">
                    <Settings className="size-5" />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">Cài đặt</h1>
                    <p className="text-sm text-foreground/70">Quản lý tài khoản và tuỳ chỉnh ứng dụng</p>
                </div>
            </div>

            <motion.main
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto"
            >
                {/* Profile Section */}
                <motion.section
                    variants={fadeUpVariant}
                    className="bg-background/60 backdrop-blur-xl border border-border/40 rounded-2xl p-4 sm:p-6 shadow-xl flex items-center gap-4"
                >
                    <Avatar className="size-16 sm:size-20 shrink-0 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                            {u.initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-1">
                        <h2 className="text-lg sm:text-xl font-bold tracking-tight truncate">{u.displayName}</h2>
                        <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    </div>
                </motion.section>

                {/* App Settings & Menus */}
                <motion.section
                    variants={fadeUpVariant}
                    className="bg-background/60 backdrop-blur-xl border border-border/40 rounded-2xl shadow-xl overflow-hidden"
                >
                    <h3 className="px-5 pt-6 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Hỗ trợ & Quản lý
                    </h3>

                    <div className="flex flex-col p-2 space-y-1">
                        {/* Feedback Link */}
                        <Link href="/feedback" className="block focus:outline-none">
                            <motion.div
                                {...itemHoverParams}
                                className="flex items-center justify-between px-3 py-3 rounded-xl bg-background/0 hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center size-10 bg-primary/10 text-primary rounded-xl shrink-0">
                                        <MessageSquare className="size-5" />
                                    </div>
                                    <span className="font-medium text-foreground">Phản hồi & Góp ý</span>
                                </div>
                                <ChevronRight className="size-5 text-muted-foreground/50" />
                            </motion.div>
                        </Link>

                        <div className="h-px bg-border/40 mx-4 my-1" />

                        {/* Logout Button */}
                        <motion.button
                            type="button"
                            onClick={() => logout()}
                            {...itemHoverParams}
                            className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-background/0 hover:bg-destructive/10 transition-colors group cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center size-10 bg-destructive/10 text-destructive rounded-xl shrink-0 group-hover:bg-destructive group-hover:text-destructive-foreground transition-colors shadow-sm">
                                    <LogOut className="size-5 relative" />
                                </div>
                                <span className="font-medium text-destructive">Đăng xuất</span>
                            </div>
                            <ChevronRight className="size-5 text-muted-foreground/30" />
                        </motion.button>
                    </div>

                </motion.section>
            </motion.main>
        </div>
    );
}
