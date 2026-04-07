"use client";

import { motion } from "framer-motion";
import { FeedbackForm } from "@/features/user-feedback/feedback-form";

// export const metadata: Metadata = {
//   title: "Gửi phản hồi | Verendar",
//   description: "Gửi phản hồi, báo lỗi hoặc góp ý tính năng cho ứng dụng Verendar",
// };

export default function FeedbackPage() {
  return (
    <div className="flex min-h-0 w-full flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto w-full max-w-3xl px-0 pt-6 pb-24 sm:px-6 sm:py-12">
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full p-1"
        >
          <div className="rounded-2xl border border-border/40 bg-background/80 p-4 shadow-xl backdrop-blur-xl sm:bg-background/60 sm:p-6 md:p-8">

            <div className="mb-6 space-y-1 text-center sm:mb-8 sm:space-y-2">
              <h1 className="bg-linear-to-r from-foreground to-foreground/50 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
                Góp ý & Phản hồi
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Chúng tôi luôn lắng nghe để cải thiện trải nghiệm của bạn. Vui lòng cho
                chúng tôi biết vấn đề bạn gặp phải hoặc gợi ý tính năng mới.
              </p>
            </div>

            <FeedbackForm />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
