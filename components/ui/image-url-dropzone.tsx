"use client";

import { ImageIcon, Trash2, Upload } from "lucide-react";
import { useCallback, useId, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import SafeImage from "./SafeImage";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml";

function canPreview(value: string) {
  const t = value.trim();
  if (!t) return false;
  if (t.startsWith("data:image/")) return true;
  if (t.startsWith("blob:")) return true;
  try {
    const u = new URL(t);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export type ImageUrlDropzoneProps = {
  id?: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  description?: string;
  shape?: "default" | "circle";
  previewMode?: "split" | "inside";
  inputClassName?: string;
  /**
   * Khi có: chọn/kéo file sẽ gọi hàm này (upload S3, v.v.) và gán chuỗi trả về (URL ảnh).
   * Nếu không có: đọc file thành data URL như cũ.
   */
  resolveFileUpload?: (file: File) => Promise<string>;
};

export function ImageUrlDropzone({
  id,
  label,
  value,
  onChange,
  disabled,
  description,
  shape = "default",
  previewMode = "split",
  inputClassName,
  resolveFileUpload,
}: ImageUrlDropzoneProps) {
  const autoId = useId();
  const inputId = id ?? `image-url-drop-${autoId}`;
  const [dragActive, setDragActive] = useState(false);
  const [reading, setReading] = useState(false);

  const applyFile = useCallback(
    (file: File | undefined) => {
      if (!file || disabled) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Chỉ chấp nhận file ảnh.");
        return;
      }
      if (file.size >= MAX_BYTES) {
        toast.error("Ảnh phải nhỏ hơn 5MB.");
        return;
      }
      if (resolveFileUpload) {
        setReading(true);
        void resolveFileUpload(file)
          .then((url) => {
            onChange(url);
          })
          .catch((e: unknown) => {
            toast.error(e instanceof Error ? e.message : "Upload thất bại.");
          })
          .finally(() => {
            setReading(false);
          });
        return;
      }
      setReading(true);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") onChange(result);
        setReading(false);
      };
      reader.onerror = () => {
        toast.error("Không đọc được file.");
        setReading(false);
      };
      reader.readAsDataURL(file);
    },
    [disabled, onChange, resolveFileUpload],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled || reading) return;
    applyFile(e.dataTransfer.files?.[0]);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !reading) setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const preview = value.trim().length > 0 && canPreview(value);
  const circle = shape === "circle";
  const previewInside = circle || previewMode === "inside";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={inputId}>{label}</Label>
        {value.trim() && !disabled ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onChange("")}
          >
            <Trash2 className="mr-1 size-3.5" aria-hidden />
            Gỡ ảnh
          </Button>
        ) : null}
      </div>
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}

      <div
        className={cn(
          "flex flex-col gap-3",
          circle ? "items-center" : "sm:flex-row sm:items-stretch",
        )}
      >
        {preview && !previewInside ? (
          <div
            className={cn(
              "relative shrink-0 overflow-hidden bg-muted/30",
              circle
                ? "size-36 rounded-full border border-border"
                : "h-28 w-full rounded-lg max-md:border-0 md:border md:border-border sm:h-auto sm:min-h-30 sm:w-36",
            )}
          >
            <SafeImage src={value.trim()} alt="" fill className="object-contain p-1" />
          </div>
        ) : null}

        <label
          htmlFor={inputId}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={cn(
            "relative flex min-h-30 flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-5 text-center transition-colors",
            circle && "size-40 min-h-0 flex-none overflow-hidden rounded-full p-3",
            !circle && previewInside && preview && "overflow-hidden",
            dragActive && "border-primary bg-primary/5",
            !dragActive && "border-muted-foreground/25 hover:border-muted-foreground/45 hover:bg-muted/25",
            (disabled || reading) && "pointer-events-none cursor-not-allowed opacity-50",
            inputClassName,
          )}
        >
          {previewInside && preview ? <SafeImage src={value.trim()} alt="" fill className="object-cover" /> : null}
          <input
            id={inputId}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            disabled={disabled || reading}
            onChange={onInputChange}
          />
          {reading ? (
            <span
              className={cn(
                "text-sm text-muted-foreground",
                previewInside && preview && "relative z-10 rounded-full bg-background/80 px-2 py-1 text-foreground",
              )}
            >
              {resolveFileUpload ? "Đang tải ảnh lên…" : "Đang xử lý…"}
            </span>
          ) : (
            <>
              {previewInside && preview ? (
                <span
                  className={cn(
                    "relative z-10 mt-auto mb-1 rounded-full bg-background/80 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm",
                    !circle && "text-xs",
                  )}
                >
                  {circle ? "Bấm để đổi logo" : "Bấm để đổi ảnh"}
                </span>
              ) : (
                <>
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted/80">
                    <ImageIcon className="size-5 text-muted-foreground" aria-hidden />
                  </div>
                </>
              )}
              {circle && !preview ? (
                <div className="space-y-0.5 px-2">
                  <p className="text-sm font-medium text-foreground">Chọn logo</p>
                  <p className="text-[11px] leading-4 text-muted-foreground">JPG, PNG, WebP, GIF</p>
                </div>
              ) : !circle && !(previewInside && preview) ? (
                <>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">Kéo thả ảnh vào đây</p>
                    <p className="text-xs text-muted-foreground">hoặc bấm để chọn · JPG, PNG, WebP, GIF · dưới 5MB</p>
                  </div>
                  <span className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-border bg-background/80 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm">
                    <Upload className="size-3.5 text-muted-foreground" aria-hidden />
                    Chọn ảnh từ máy
                  </span>
                </>
              ) : null}
            </>
          )}
        </label>
      </div>
    </div>
  );
}
