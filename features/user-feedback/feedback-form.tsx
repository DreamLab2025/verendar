"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, Star } from "lucide-react";

import { useCreateFeedback } from "@/hooks/useFeedback";
import { FeedbackCategory } from "@/lib/api/services/fetchFeedback";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ===== Types =====
export interface FeedbackFormValues {
  category: FeedbackCategory;
  subject: string;
  content: string;
  rating?: number;
  contactEmail?: string;
}

// ===== Component =====
const categories = [
  { value: FeedbackCategory.General.toString(), label: "Chung" },
  { value: FeedbackCategory.Bug.toString(), label: "Báo lỗi" },
  { value: FeedbackCategory.Feature.toString(), label: "Đề xuất tính năng" },
  { value: FeedbackCategory.UX.toString(), label: "Trải nghiệm người dùng" },
  { value: FeedbackCategory.Performance.toString(), label: "Hiệu suất" },
  { value: FeedbackCategory.Other.toString(), label: "Khác" },
];

export function FeedbackForm() {
  const { mutateAsync: createFeedback, isPending } = useCreateFeedback();

  const form = useForm<FeedbackFormValues>({
    defaultValues: {
      category: FeedbackCategory.General,
      subject: "",
      content: "",
      rating: undefined,
      contactEmail: "",
    },
  });

  const onSubmit = async (data: FeedbackFormValues) => {
    try {
      await createFeedback({
        category: data.category,
        subject: data.subject,
        content: data.content,
        rating: data.rating,
        contactEmail: data.contactEmail || undefined,
      });
      toast.success("Cảm ơn bạn đã gửi phản hồi!");
      form.reset();
    } catch {
      toast.error("Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại sau.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            rules={{ required: "Vui lòng chọn loại phản hồi" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại phản hồi</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background/60 backdrop-blur-sm">
                      <SelectValue placeholder="Chọn loại phản hồi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Email */}
          <FormField
            control={form.control}
            name="contactEmail"
            rules={{
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Email không hợp lệ",
              },
              maxLength: { value: 256, message: "Email tối đa 256 ký tự" },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email liên hệ (Tùy chọn)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="user@example.com"
                    className="bg-background/60 backdrop-blur-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Subject */}
        <FormField
          control={form.control}
          name="subject"
          rules={{
            required: "Vui lòng nhập tiêu đề",
            minLength: { value: 3, message: "Tiêu đề phải có ít nhất 3 ký tự" },
            maxLength: { value: 200, message: "Tiêu đề tối đa 200 ký tự" },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ví dụ: Góp ý về giao diện mới"
                  className="bg-background/60 backdrop-blur-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content */}
        <FormField
          control={form.control}
          name="content"
          rules={{
            required: "Vui lòng nhập nội dung",
            minLength: { value: 10, message: "Nội dung phải có ít nhất 10 ký tự" },
            maxLength: { value: 5000, message: "Nội dung tối đa 5000 ký tự" },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nội dung</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mô tả chi tiết ý kiến hoặc lỗi bạn gặp phải..."
                  className="min-h-[120px] resize-none bg-background/60 backdrop-blur-sm"
                  {...field}
                />
              </FormControl>
              <FormDescription>Tối thiểu 10 ký tự, tối đa 5000 ký tự.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Rating */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Đánh giá chung (Tùy chọn)</FormLabel>
              <FormControl>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      type="button"
                      key={star}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => field.onChange(star)}
                      className={`p-1 rounded-full transition-colors ${
                        (field.value || 0) >= star
                          ? "text-yellow-500"
                          : "text-muted-foreground hover:text-yellow-500/50"
                      }`}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          (field.value || 0) >= star ? "fill-current" : ""
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button type="submit" className="w-full sm:w-auto mt-4" disabled={isPending}>
            <AnimatePresence mode="wait">
              {isPending ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang gửi...
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  Gửi phản hồi
                  <Send className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
