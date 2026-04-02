"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Feedback, FeedbackCategory, FeedbackStatus } from "@/lib/api/services/fetchFeedback";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useUpdateFeedbackStatus, useFeedbackById } from "@/hooks/useFeedback";
import { StatusSelect, CATEGORY_MAP } from "@/features/user-feedback/admin-feedback-list";
import { toast } from "sonner";

// CATEGORY_MAP is now imported from admin-feedback-list.tsx to maintain single source of truth.

interface FeedbackDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    feedback: Feedback | null;
}

export function FeedbackDialog({ open, onOpenChange, feedback: propFeedback }: FeedbackDialogProps) {
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md w-full sm:max-w-3xl p-0 overflow-hidden rounded-2xl gap-0">
                <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="flex flex-col w-full h-full"
                >
                    <DialogHeader className="p-6 pb-5 border-b border-border/40 relative">
                        <div className="mb-4">
                            <DialogTitle className="text-xl text-black flex items-center gap-2">
                                Chi tiết phản hồi
                            </DialogTitle>
                        </div>
                        <div className="space-y-3 pr-8">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-semibold rounded-full border border-primary/10 shadow-sm">
                                    {CATEGORY_MAP[feedback.category as unknown as FeedbackCategory] || feedback.category || "Chưa phân loại"}
                                </Badge>
                                <DialogDescription className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40"></span>
                                    {dayjs(feedback.createdAt).locale("vi").format("HH:mm - DD/MM/YYYY")}
                                </DialogDescription>
                            </div>
                            <h3 className="text-xl font-bold leading-tight text-foreground tracking-tight">
                                {feedback.subject}
                            </h3>
                        </div>
                    </DialogHeader>

                    <div className="p-6 space-y-6 relative">
                        {/* Content box */}
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                                Nội dung chi tiết
                            </h4>
                            <div className="text-[14px] leading-relaxed whitespace-pre-wrap text-foreground/90 bg-muted/40 p-4 rounded-xl border border-border/50 shadow-inner">
                                {feedback.content}
                            </div>
                        </div>

                        {/* Info grid */}
                        <div className="grid sm:grid-cols-2 gap-4 bg-background p-4 rounded-xl border border-border/50 shadow-sm">
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

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 px-6 bg-muted/20 border-t border-border/40">
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Xử lý:</span>
                            <StatusSelect
                                value={feedback.status.toString()}
                                onChange={handleStatusChange}
                                disabled={feedback.status === "Resolved" || isUpdating}
                            />
                        </div>
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl px-8 font-medium shadow-sm w-full sm:w-auto h-9">
                            Đóng
                        </Button>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
