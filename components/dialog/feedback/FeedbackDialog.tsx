"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Badge } from "@/components/ui/badge";
import { Feedback, FeedbackCategory, FeedbackStatus } from "@/lib/api/services/fetchFeedback";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { useUpdateFeedbackStatus, useFeedbackById } from "@/hooks/useFeedback";
import { StatusSelect, CATEGORY_MAP } from "@/features/user-feedback/admin-feedback-list";
import { toast } from "sonner";
import { useMobile } from "@/hooks/useMobile";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

// CATEGORY_MAP is now imported from admin-feedback-list.tsx to maintain single source of truth.

interface FeedbackDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    feedback: Feedback | null;
}

export function FeedbackDialog({ open, onOpenChange, feedback: propFeedback }: FeedbackDialogProps) {
    const isMobile = useMobile();
    const { feedback: freshFeedback } = useFeedbackById(propFeedback?.id, open);
    const feedback = freshFeedback || propFeedback;

    const { mutate: updateStatus, isPending: isUpdating } = useUpdateFeedbackStatus();

    if (!feedback) return null;

    const handleStatusChange = (newStatus: string) => {
        updateStatus(
            { id: feedback.id, status: Number(newStatus) as FeedbackStatus },
            {
                onSuccess: () => {
                    toast.success("Cập nhật trạng thái trong chi tiết thành công");
                },
                onError: () => {
                    toast.error("Cập nhật thất bại, vui lòng thử lại");
                },
            }
        );
    };

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <AnimatePresence>
                {open && (
                    <DialogPrimitive.Portal forceMount>
                        <DialogPrimitive.Overlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 bg-black/80"
                            />
                        </DialogPrimitive.Overlay>

                        <DialogPrimitive.Content aria-describedby={undefined} asChild>
                            <motion.div
                                initial={
                                    isMobile
                                        ? { opacity: 0, y: "100%" }
                                        : { opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }
                                }
                                animate={
                                    isMobile
                                        ? { opacity: 1, y: "0%" }
                                        : { opacity: 1, scale: 1, x: "-50%", y: "-50%" }
                                }
                                exit={
                                    isMobile
                                        ? { opacity: 0, y: "100%" }
                                        : { opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }
                                }
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className={cn(
                                    "fixed z-50 grid w-full gap-0 border bg-background shadow-lg overflow-y-auto",
                                    isMobile
                                        ? "inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl rounded-b-none p-0"
                                        : "left-[50%] top-[50%] max-h-[90vh] sm:rounded-lg sm:max-w-3xl p-0"
                                )}
                            >
                                <div className="flex flex-col w-full h-full">
                                    <div className="p-6 pb-5 border-b border-border/40 relative">
                                        <div className="mb-4">
                                            <DialogPrimitive.Title className="text-xl text-foreground font-bold flex items-center gap-2">
                                                Chi tiết phản hồi
                                            </DialogPrimitive.Title>
                                        </div>
                                        <div className="space-y-3 pr-8">
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-semibold rounded-full border border-primary/10 shadow-sm">
                                                    {CATEGORY_MAP[feedback.category as unknown as FeedbackCategory] || feedback.category || "Chưa phân loại"}
                                                </Badge>
                                                <DialogPrimitive.Description className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
                                                    {dayjs(feedback.createdAt).locale("vi").format("HH:mm - DD/MM/YYYY")}
                                                </DialogPrimitive.Description>
                                            </div>
                                            <h3 className="text-xl font-bold leading-tight text-foreground tracking-tight">
                                                {feedback.subject}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-6 relative bg-background">
                                        {/* Content box */}
                                        <div className="space-y-3">
                                            <h4 className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                                                Nội dung chi tiết
                                            </h4>
                                            <div className="text-[14px] leading-relaxed whitespace-pre-wrap text-foreground/90 bg-muted/40 p-4 rounded-xl border border-border/50 shadow-inner">
                                                {feedback.content}
                                            </div>
                                        </div>

                                        {Array.isArray(feedback.imageUrls) && feedback.imageUrls.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                                                    Hình ảnh đính kèm
                                                </h4>
                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                    {feedback.imageUrls.map((url, index) => (
                                                        <a
                                                            key={`${url}-${index}`}
                                                            href={url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="group block overflow-hidden rounded-lg border border-border/60"
                                                        >
                                                            <img
                                                                src={url}
                                                                alt={`Feedback image ${index + 1}`}
                                                                className="h-28 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                            />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Info grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-background p-4 rounded-xl border border-border/50 shadow-sm">
                                            <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-border/50 pb-3 sm:pb-0 sm:pr-4">
                                                <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase block">
                                                    Thông tin người gửi
                                                </span>
                                                <p className="text-sm font-semibold text-foreground truncate" title={feedback.contactEmail || feedback.userId || "Không có"}>
                                                    {feedback.contactEmail || feedback.userId || "Ẩn danh"}
                                                </p>
                                            </div>
                                            <div className="space-y-1.5 sm:pl-2">
                                                <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase block">
                                                    Cấp độ đánh giá
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {feedback.rating ? (
                                                        <>
                                                            <div className="flex text-amber-500 text-lg gap-0.5">
                                                                {Array.from({ length: 5 }).map((_, i) => (
                                                                    <span key={i} className={i < feedback.rating! ? "text-amber-500 drop-shadow-sm" : "text-muted-foreground/30"}>★</span>
                                                                ))}
                                                            </div>
                                                            <span className="text-sm font-extrabold">{feedback.rating}/5</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-muted-foreground font-medium text-xs italic">Chưa có đánh giá</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 px-6 bg-muted/20 border-t border-border/40 mt-auto">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Xử lý:</span>
                                            <StatusSelect
                                                value={feedback.status.toString()}
                                                onChange={handleStatusChange}
                                                disabled={feedback.status === "Resolved" || isUpdating}
                                            />
                                        </div>
                                        {!isMobile && (
                                            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl px-8 font-medium shadow-sm w-full sm:w-auto h-9">
                                                Đóng
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Close</span>
                                </DialogPrimitive.Close>
                            </motion.div>
                        </DialogPrimitive.Content>
                    </DialogPrimitive.Portal>
                )}
            </AnimatePresence>
        </DialogPrimitive.Root>
    );
}
