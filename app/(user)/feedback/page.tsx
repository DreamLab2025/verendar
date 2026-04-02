"use client";

import { motion } from "framer-motion";
import { FeedbackForm } from "@/features/user-feedback/feedback-form";

// export const metadata: Metadata = {
//   title: "Gửi phản hồi | Verendar",
//   description: "Gửi phản hồi, báo lỗi hoặc góp ý tính năng cho ứng dụng Verendar",
// };

export default function FeedbackPage() {
  return (
    <div className="mx-auto w-full max-w-3xl min-h-[calc(100vh-4rem)] flex flex-col justify-center sm:px-6 pt-6 pb-24 sm:py-12">
      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full p-1"
      >
        <div className="rounded-2xl border border-border/40 bg-background/80 sm:bg-background/60 p-4 sm:p-6 md:p-8 shadow-xl backdrop-blur-xl">

          <div className="space-y-1 sm:space-y-2 text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
              Góp ý & Phản hồi
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Chúng tôi luôn lắng nghe để cải thiện trải nghiệm của bạn. Vui lòng cho
              chúng tôi biết vấn đề bạn gặp phải hoặc gợi ý tính năng mới.
            </p>
          </div>

          <FeedbackForm />
        </div>
      </motion.div>
    </div>
  );
}
