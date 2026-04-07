"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, Star, X } from "lucide-react";
import Image from "next/image";

import { useCreateFeedback } from "@/hooks/useFeedback";
import { FeedbackCategory, type FeedbackCategoryText } from "@/lib/api/services/fetchFeedback";
import { uploadMediaFile } from "@/hooks/useMedia";

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

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function FeedbackForm() {
  const { mutateAsync: createFeedback, isPending } = useCreateFeedback();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imagePreviews = useMemo(
    () => selectedFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    })),
    [selectedFiles],
  );

  useEffect(() => {
    return () => {
      for (const preview of imagePreviews) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [imagePreviews]);

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
      setIsUploadingImages(true);

      const imageUrls = await Promise.all(
        selectedFiles.map(async (file) => {
          const { imageUrl } = await uploadMediaFile(file, "Other");
          return imageUrl;
        }),
      );

      await createFeedback({
        category: FeedbackCategory[data.category] as FeedbackCategoryText,
        subject: data.subject,
        content: data.content,
        imageUrls,
        rating: data.rating,
        contactEmail: data.contactEmail || undefined,
      });
      toast.success("Cảm ơn bạn đã gửi phản hồi!");
      form.reset();
      setSelectedFiles([]);
    } catch {
      toast.error("Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại sau.");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleSelectFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => file.size <= MAX_IMAGE_SIZE_BYTES);
    const invalidCount = files.length - validFiles.length;

    if (invalidCount > 0) {
      toast.warning(`Có ${invalidCount} ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.`);
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }

    event.target.value = "";
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isSubmitting = isPending || isUploadingImages;

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
                  className="min-h-30 resize-none bg-background/60 backdrop-blur-sm"
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

        <div className="space-y-3 rounded-lg border border-border/60 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Hình ảnh đính kèm (Tùy chọn)</p>
            <p className="text-xs text-muted-foreground">
              Tải nhiều ảnh để mô tả rõ hơn vấn đề hoặc góp ý của bạn. Mỗi ảnh tối đa 5MB.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleSelectFiles}
            disabled={isSubmitting}
            className="hidden"
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
            >
              Chọn ảnh
            </Button>
            {selectedFiles.length > 0 && (
              <span className="text-xs text-muted-foreground">
                Đã chọn {selectedFiles.length} ảnh
              </span>
            )}
          </div>

          {selectedFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {imagePreviews.map((preview, index) => (
                <div key={`${preview.file.name}-${index}`} className="relative h-24 overflow-hidden rounded-md border">
                  <Image
                    src={preview.url}
                    alt={preview.file.name}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(index)}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                    aria-label="Xóa ảnh"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button type="submit" className="w-full sm:w-auto mt-4" disabled={isSubmitting}>
            <AnimatePresence mode="wait">
              {isSubmitting ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isUploadingImages ? (
                    <>
                      Đang tải ảnh...
                    </>
                  ) : "Đang gửi..."}
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
