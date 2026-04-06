"use client";

import { ImageIcon, Trash2, Upload } from "lucide-react";
import { useCallback, useId, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
};

export function ImageUrlDropzone({ id, label, value, onChange, disabled, description }: ImageUrlDropzoneProps) {
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
      if (file.size > MAX_BYTES) {
        toast.error("Ảnh tối đa 5MB.");
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
    [disabled, onChange],
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        {preview ? (
          <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30 sm:h-auto sm:min-h-[120px] sm:w-36">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value.trim()} alt="" className="h-full w-full object-contain p-1" />
          </div>
        ) : null}

        <label
          htmlFor={inputId}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={cn(
            "flex min-h-[120px] flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-5 text-center transition-colors",
            dragActive && "border-primary bg-primary/5",
            !dragActive && "border-muted-foreground/25 hover:border-muted-foreground/45 hover:bg-muted/25",
            (disabled || reading) && "pointer-events-none cursor-not-allowed opacity-50",
          )}
        >
          <input
            id={inputId}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            disabled={disabled || reading}
            onChange={onInputChange}
          />
          {reading ? (
            <span className="text-sm text-muted-foreground">Đang xử lý…</span>
          ) : (
            <>
              <div className="flex size-10 items-center justify-center rounded-full bg-muted/80">
                <ImageIcon className="size-5 text-muted-foreground" aria-hidden />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">Kéo thả ảnh vào đây</p>
                <p className="text-xs text-muted-foreground">hoặc bấm để chọn · JPG, PNG, WebP, GIF · tối đa 5MB</p>
              </div>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-border bg-background/80 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm">
                <Upload className="size-3.5 text-muted-foreground" aria-hidden />
                Chọn ảnh từ máy
              </span>
            </>
          )}
        </label>
      </div>
    </div>
  );
}
