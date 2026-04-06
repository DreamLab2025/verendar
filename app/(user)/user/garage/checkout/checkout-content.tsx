"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Car, Check, ChevronRight, Package, Trash2 } from "lucide-react";
import { toast } from "sonner";

import SafeImage from "@/components/ui/SafeImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBooking } from "@/hooks/useCreateBooking";
import { useUserVehicles } from "@/hooks/useUserVehice";
import type { ApiError } from "@/lib/api/apiService";
import { mapCartLinesToBookingItems } from "@/lib/api/services/fetchBooking";
import { GarageBookingDateField } from "@/components/garage/garage-booking-date-field";
import { enrichCreatedBookingPayload } from "@/lib/booking/enrich-created-booking-payload";
import { persistCreatedBookingResponse } from "@/lib/booking/booking-success-storage";
import { bookingCartLineKey, useBookingCartStore } from "@/lib/stores/booking-cart-store";
import { cn } from "@/lib/utils";

dayjs.locale("vi");

const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: easeOut } },
};

const staggerWrap = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.36, ease: easeOut } },
};

const asideIn = {
  hidden: { opacity: 0, x: 18 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: easeOut } },
};

function formatVnd(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function kindShortLabel(kind: string) {
  if (kind === "product") return "Phụ tùng";
  if (kind === "service") return "Dịch vụ";
  return "Combo";
}

function kindBadgeClass(kind: string) {
  if (kind === "product") {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100";
  }
  if (kind === "service") {
    return "border-sky-500/25 bg-sky-500/10 text-sky-900 dark:text-sky-100";
  }
  return "border-violet-500/25 bg-violet-500/10 text-violet-900 dark:text-violet-100";
}

const CHECKOUT_STEPS = [
  { id: 1 as const, label: "Dịch vụ" },
  { id: 2 as const, label: "Xe" },
  { id: 3 as const, label: "Lịch & ghi chú" },
];

type CheckoutStepId = (typeof CHECKOUT_STEPS)[number]["id"];

export function GarageCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchIdParam = searchParams.get("branchId");

  const [bookingDate, setBookingDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [bookingTime, setBookingTime] = useState<string | null>(null);
  const [userVehicleId, setUserVehicleId] = useState<string>("");
  const [bookingNote, setBookingNote] = useState("");
  const [step, setStep] = useState<CheckoutStepId>(1);

  const { vehicles, isLoading: vehiclesLoading } = useUserVehicles({ PageNumber: 1, PageSize: 50 }, true);
  const { mutateAsync: createBookingAsync, isPending: isSubmittingBooking } = useCreateBooking();

  const lines = useBookingCartStore((s) => s.lines);
  const selectedLineKeys = useBookingCartStore((s) => s.selectedLineKeys);
  const toggleLineKey = useBookingCartStore((s) => s.toggleLineKey);
  const selectAllLineKeys = useBookingCartStore((s) => s.selectAllLineKeys);
  const deselectAllLineKeys = useBookingCartStore((s) => s.deselectAllLineKeys);
  const removeLine = useBookingCartStore((s) => s.removeLine);

  const branchId = useMemo(() => {
    if (branchIdParam) return branchIdParam;
    const sel = lines.filter((l) => selectedLineKeys.includes(bookingCartLineKey(l)));
    const branches = new Set(sel.map((l) => l.branchId));
    if (branches.size === 1) return sel[0]?.branchId ?? null;
    return null;
  }, [branchIdParam, lines, selectedLineKeys]);

  useEffect(() => {
    if (branchIdParam || !branchId) return;
    router.replace(`/user/garage/checkout?branchId=${encodeURIComponent(branchId)}`);
  }, [branchId, branchIdParam, router]);

  useEffect(() => {
    if (userVehicleId || vehicles.length === 0) return;
    if (vehicles.length === 1) {
      setTimeout(() => {
        setUserVehicleId(vehicles[0].id);
      }, 0);
    }
  }, [vehicles, userVehicleId]);

  const branchLines = useMemo(
    () => (branchId ? lines.filter((l) => l.branchId === branchId) : []),
    [lines, branchId],
  );

  const selectedInBranch = useMemo(() => {
    const setK = new Set(selectedLineKeys);
    return branchLines.filter((l) => setK.has(bookingCartLineKey(l)));
  }, [branchLines, selectedLineKeys]);

  const allBranchSelected =
    branchLines.length > 0 && branchLines.every((l) => selectedLineKeys.includes(bookingCartLineKey(l)));
  const selectedCount = selectedInBranch.length;

  const subtotal = useMemo(() => {
    let sum = 0;
    let count = 0;
    for (const l of selectedInBranch) {
      if (l.unitPriceVnd != null && !Number.isNaN(l.unitPriceVnd)) {
        sum += l.unitPriceVnd;
        count += 1;
      }
    }
    return { sum, pricedLines: count, totalLines: selectedInBranch.length };
  }, [selectedInBranch]);

  const minDate = dayjs().format("YYYY-MM-DD");

  /** Preview cột phải: có ngày nhưng chưa giờ vẫn hiện ngày + gợi ý. */
  const schedulePreview = useMemo(() => {
    if (!bookingDate || !dayjs(bookingDate).isValid()) {
      return { title: "Chưa chọn ngày giờ", hint: null as string | null, tone: "empty" as const };
    }
    const d = dayjs(bookingDate);
    const dateStr = d.format("dddd, D MMMM YYYY");
    if (!bookingTime) {
      return { title: dateStr, hint: "Chọn khung giờ bên trái", tone: "partial" as const };
    }
    return {
      title: dayjs(`${bookingDate}T${bookingTime}`).format("dddd, D MMMM YYYY · HH:mm"),
      hint: null,
      tone: "full" as const,
    };
  }, [bookingDate, bookingTime]);

  const hasVehicleChoice = Boolean(userVehicleId);
  const vehiclesReady = !vehiclesLoading;
  const hasCartSelection = selectedInBranch.length > 0;
  const canLeaveStep1 = hasCartSelection;
  const canLeaveStep2 = vehiclesReady && vehicles.length > 0 && hasVehicleChoice;
  const canSubmitBooking =
    Boolean(branchId) &&
    Boolean(bookingDate) &&
    bookingTime != null &&
    bookingTime !== "" &&
    hasCartSelection &&
    canLeaveStep2;

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === userVehicleId),
    [vehicles, userVehicleId],
  );

  const handleSubmitBooking = async () => {
    if (!canSubmitBooking || !branchId) return;
    const scheduled = dayjs(`${bookingDate}T${bookingTime}:00`);
    if (!scheduled.isValid()) {
      toast.error("Ngày giờ không hợp lệ.");
      return;
    }
    const items = mapCartLinesToBookingItems(selectedInBranch);
    try {
      const res = await createBookingAsync({
        garageBranchId: branchId,
        userVehicleId,
        scheduledAt: scheduled.toISOString(),
        note: bookingNote.trim(),
        items,
      });
      if (!res.isSuccess || !res.data?.id) {
        toast.error(res.message?.trim() || "Đặt lịch thất bại.");
        return;
      }
      const payloadToStore = enrichCreatedBookingPayload(res, { vehicle: selectedVehicle ?? null });
      persistCreatedBookingResponse(res.data.id, payloadToStore);
      for (const line of selectedInBranch) {
        removeLine(line.branchId, line.kind, line.catalogItemId);
      }
      router.push(`/user/garage/booking/success?bookingId=${encodeURIComponent(res.data.id)}`);
    } catch (e) {
      const msg = (e as ApiError)?.message ?? "Đặt lịch thất bại.";
      toast.error(msg);
    }
  };

  const handlePreviewPrimary = () => {
    if (step === 1) {
      if (!canLeaveStep1) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!canLeaveStep2) return;
      setStep(3);
      return;
    }
    void handleSubmitBooking();
  };

  const previewPrimaryDisabled =
    step === 1
      ? !canLeaveStep1
      : step === 2
        ? !canLeaveStep2
        : !canSubmitBooking || isSubmittingBooking;

  const previewPrimaryLabel =
    step === 3 ? (isSubmittingBooking ? "Đang gửi…" : "Đặt lịch") : "Tiếp tục";

  const stepHint =
    step === 1
      ? !selectedInBranch.length
        ? "Chọn ít nhất một dịch vụ / sản phẩm trong giỏ."
        : null
      : step === 2
        ? vehiclesLoading
          ? "Đang tải danh sách xe…"
          : vehicles.length === 0
            ? "Cần có ít nhất một xe để đặt lịch."
            : !userVehicleId
              ? "Chọn xe mang vào garage."
              : null
        : !canSubmitBooking && !isSubmittingBooking
          ? "Chọn ngày và khung giờ để gửi yêu cầu."
          : null;

  if (!branchId && lines.length === 0) {
    return (
      <motion.div
        className="flex min-h-0 flex-1 flex-col gap-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easeOut }}
      >
        <Button variant="ghost" size="sm" className="w-fit shrink-0 gap-1 px-2" asChild>
          <Link href="/user/garage">
            <ArrowLeft className="size-4" aria-hidden />
            Garage
          </Link>
        </Button>
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/25 px-4 py-12 text-center text-sm text-muted-foreground dark:bg-muted/15">
          Giỏ trống hoặc chưa chọn chi nhánh. Thêm mục từ trang chi nhánh rồi mở giỏ và bấm «Tiếp tục đặt lịch».
        </div>
      </motion.div>
    );
  }

  if (branchId && branchLines.length === 0) {
    return (
      <motion.div
        className="flex min-h-0 flex-1 flex-col gap-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easeOut }}
      >
        <Button variant="ghost" size="sm" className="w-fit shrink-0 gap-1 px-2" asChild>
          <Link href="/user/garage">
            <ArrowLeft className="size-4" aria-hidden />
            Garage
          </Link>
        </Button>
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
          Không có mục nào trong giỏ cho chi nhánh này.{" "}
          <Link href="/user/garage/cart" className="font-medium text-primary underline-offset-4 hover:underline">
            Mở giỏ
          </Link>
        </div>
      </motion.div>
    );
  }

  const stepSubtitle =
    step === 1
      ? "Chọn dịch vụ / phụ tùng trong giỏ. Tóm tắt bên phải cập nhật theo từng bước."
      : step === 2
        ? "Chọn xe mang đến garage cho lịch hẹn này."
        : "Chọn ngày, khung giờ và ghi chú. Bấm «Đặt lịch» để gửi yêu cầu.";

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain pb-4 pt-0 [scrollbar-width:thin] lg:gap-4 lg:pb-5">
      <motion.header
        className="shrink-0 flex flex-wrap items-end justify-between gap-2 border-b border-border/80 pb-2 dark:border-border/60 lg:gap-3 lg:pb-2.5"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <div>
          <Button variant="ghost" size="sm" className="-ml-2 mb-1 h-8 gap-1 px-2 text-muted-foreground" asChild>
            <Link href="/user/garage">
              <ArrowLeft className="size-4" aria-hidden />
              Garage
            </Link>
          </Button>
          <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl lg:text-2xl">Đặt lịch</h1>
          <p className="mt-0.5 max-w-xl text-xs text-muted-foreground sm:text-sm">{stepSubtitle}</p>
        </div>
        <Button variant="outline" size="sm" className="h-9 rounded-lg text-xs shadow-sm" asChild>
          <Link href="/user/garage/cart">Sửa giỏ</Link>
        </Button>
      </motion.header>

      <div className="grid min-h-0 flex-1 items-start gap-4 lg:grid-cols-[minmax(0,1.9fr)_minmax(280px,1fr)] lg:gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,360px)]">
        <motion.div
          className="order-1 flex min-w-0 flex-col gap-3"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <nav
            aria-label="Tiến trình đặt lịch"
            className="flex flex-wrap items-center gap-0.5 rounded-lg border border-border/60 bg-muted/25 px-2 py-1.5 text-[10px] sm:px-2.5 sm:text-[11px] dark:bg-muted/15"
          >
            {CHECKOUT_STEPS.map((s, i) => (
              <span key={s.id} className="flex items-center">
                {i > 0 ? <ChevronRight className="mx-0.5 size-3 shrink-0 text-muted-foreground/50" aria-hidden /> : null}
                <button
                  type="button"
                  disabled={s.id > step}
                  onClick={() => {
                    if (s.id < step) setStep(s.id);
                  }}
                  className={cn(
                    "rounded-lg px-2 py-1.5 transition-colors",
                    step === s.id &&
                      "bg-background font-semibold text-foreground shadow-sm ring-1 ring-border/70 dark:bg-card",
                    s.id < step && "text-muted-foreground hover:bg-background/60 hover:text-foreground dark:hover:bg-card/50",
                    s.id > step && "cursor-not-allowed opacity-40",
                  )}
                >
                  <span className="tabular-nums">{i + 1}</span>. {s.label}
                </button>
              </span>
            ))}
          </nav>

          <motion.section
            key={step}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: easeOut }}
            className="min-w-0 overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm ring-1 ring-black/5 dark:border-border/50 dark:bg-card/80 dark:ring-white/10"
          >
            {step === 1 ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-4 py-3.5 dark:bg-muted/20">
                  <div>
                    <h2 className="text-base font-semibold tracking-tight text-foreground">Giỏ đặt lịch</h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedCount}/{branchLines.length} mục · một chi nhánh
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 rounded-lg px-3 text-xs font-medium shadow-sm"
                    variant={allBranchSelected ? "outline" : "default"}
                    onClick={allBranchSelected ? deselectAllLineKeys : selectAllLineKeys}
                  >
                    {allBranchSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                  </Button>
                </div>
                <motion.ul className="divide-y divide-border/60" variants={staggerWrap} initial="hidden" animate="visible">
                  {branchLines.map((line) => {
                    const key = bookingCartLineKey(line);
                    const checked = selectedLineKeys.includes(key);
                    return (
                      <motion.li key={key} variants={staggerItem} className="p-3 sm:p-4">
                        <div
                          className={cn(
                            "flex gap-3 rounded-lg p-2 transition-colors sm:gap-4 sm:p-3",
                            checked
                              ? "bg-primary/5 ring-1 ring-primary/15 dark:bg-primary/10 dark:ring-primary/20"
                              : "hover:bg-muted/40 dark:hover:bg-muted/25",
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleLineKey(key)}
                            className="mt-2.5 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                            aria-label={`Chọn ${line.name}`}
                          />
                          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/60 shadow-inner sm:size-18 dark:ring-border/40">
                            {line.imageUrl ? (
                              <SafeImage src={line.imageUrl} alt={line.name} fill className="object-cover" />
                            ) : (
                              <div className="grid size-full place-items-center text-muted-foreground/80">
                                <Package className="size-6" aria-hidden />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <p className="text-sm font-medium leading-snug text-foreground sm:text-[15px]">{line.name}</p>
                            <Badge
                              variant="outline"
                              className={cn(
                                "mt-1.5 h-5 border px-2 text-[10px] font-semibold uppercase tracking-wide",
                                kindBadgeClass(line.kind),
                              )}
                            >
                              {kindShortLabel(line.kind)}
                            </Badge>
                            <p className="mt-2 text-sm font-semibold tabular-nums text-foreground sm:text-base">
                              {formatVnd(line.unitPriceVnd ?? null)}
                            </p>
                          </div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-9 shrink-0 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              aria-label={`Xóa ${line.name}`}
                              onClick={() => removeLine(line.branchId, line.kind, line.catalogItemId)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <div className="border-b border-border/60 bg-muted/30 px-4 py-3.5 dark:bg-muted/20">
                  <h2 className="text-base font-semibold tracking-tight text-foreground">Chọn xe</h2>
                  <p className="text-xs text-muted-foreground">Xe được gắn với lịch hẹn tại chi nhánh này.</p>
                </div>
                <div className="space-y-4 p-4 sm:p-5">
                  {vehiclesLoading ? (
                    <p className="text-sm text-muted-foreground">Đang tải danh sách xe…</p>
                  ) : vehicles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Bạn chưa có xe nào. Hãy khai báo xe trước khi đặt lịch.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Xe của bạn</Label>
                      <p className="text-xs text-muted-foreground">
                        Chọn một xe; tóm tắt bên phải cập nhật ngay. Trên màn hình rộng, danh sách xếp 2 cột.
                      </p>

                      <ul
                        className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5"
                        role="radiogroup"
                        aria-label="Chọn xe"
                      >
                        {vehicles.map((v) => {
                          const selected = userVehicleId === v.id;
                          const img = v.variant?.imageUrl;
                          return (
                            <li key={v.id} className="min-w-0">
                              <button
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => setUserVehicleId(v.id)}
                                className={cn(
                                  "flex h-full min-h-18 w-full flex-col gap-0 overflow-hidden rounded-xl border text-left transition-all sm:min-h-29",
                                  "active:scale-[0.99] sm:flex-row sm:items-center sm:gap-3 sm:p-3.5 sm:pt-3.5",
                                  selected
                                    ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/25"
                                    : "border-border/80 bg-background hover:border-primary/35 hover:bg-muted/25 dark:bg-background/60",
                                )}
                              >
                                <div className="relative aspect-5/2 w-full shrink-0 bg-muted ring-1 ring-border/40 sm:aspect-auto sm:size-14 sm:rounded-lg">
                                  {img ? (
                                    <SafeImage src={img} alt="" fill className="object-cover sm:rounded-lg" />
                                  ) : (
                                    <div className="grid size-full place-items-center text-muted-foreground">
                                      <Car className="size-8 sm:size-6" aria-hidden />
                                    </div>
                                  )}
                                </div>
                                <div className="flex min-w-0 flex-1 items-center gap-3 p-3 pt-2 sm:p-0 sm:pt-0">
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold tabular-nums tracking-tight text-foreground">
                                      {v.licensePlate}
                                    </p>
                                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground sm:truncate sm:line-clamp-none">
                                      {v.variant.model.brandName} {v.variant.model.name}
                                    </p>
                                    {v.nickname ? (
                                      <p className="mt-0.5 truncate text-xs text-muted-foreground/90">{v.nickname}</p>
                                    ) : null}
                                  </div>
                                  <span
                                    className={cn(
                                      "flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                      selected
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-muted-foreground/25 bg-transparent",
                                    )}
                                    aria-hidden
                                  >
                                    {selected ? <Check className="size-4 stroke-3" /> : null}
                                  </span>
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <div className="border-b border-border/60 bg-muted/30 px-3 py-2.5 dark:bg-muted/20 sm:px-4 sm:py-3">
                  <h2 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">Lịch & ghi chú</h2>
                  <p className="text-[11px] text-muted-foreground sm:text-xs">Thời điểm đến garage và ghi chú (tuỳ chọn).</p>
                </div>
                <div className="min-w-0 space-y-3 p-3 sm:space-y-4 sm:p-4">
                  <div className="min-w-0 space-y-1.5">
                    <label id="booking-date-label" className="text-xs font-medium text-foreground sm:text-sm">
                      Ngày đến
                    </label>
                    <GarageBookingDateField
                      labelId="booking-date-label"
                      minDate={minDate}
                      value={bookingDate}
                      onChange={setBookingDate}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-foreground sm:text-sm">Khung giờ</p>
                    <div className="grid grid-cols-4 gap-1 sm:grid-cols-6 lg:grid-cols-6">
                      {TIME_SLOTS.map((t) => {
                        const active = bookingTime === t;
                        return (
                          <motion.button
                            key={t}
                            type="button"
                            onClick={() => setBookingTime(t)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 420, damping: 28 }}
                            className={cn(
                              "h-8 rounded-md border text-center font-mono text-[10px] font-semibold tabular-nums sm:h-8 sm:text-[11px]",
                              active
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-border/80 bg-background text-foreground hover:border-primary/35 hover:bg-muted/50 dark:bg-background/60",
                            )}
                          >
                            {t}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="booking-note" className="text-xs font-medium text-foreground sm:text-sm">
                      Ghi chú (tuỳ chọn)
                    </Label>
                    <Textarea
                      id="booking-note"
                      value={bookingNote}
                      onChange={(e) => setBookingNote(e.target.value)}
                      placeholder="Mô tả thêm nhu cầu, tình trạng xe…"
                      className="min-h-18 resize-y rounded-xl text-xs sm:min-h-22 sm:text-sm"
                      maxLength={2000}
                      rows={3}
                    />
                  </div>
                </div>
              </>
            ) : null}

            {step > 1 ? (
              <div className="flex border-t border-border/60 bg-muted/15 px-3 py-2 dark:bg-muted/10 sm:px-4 sm:py-2.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1 rounded-lg text-muted-foreground"
                  onClick={() => setStep((s) => (s <= 1 ? 1 : ((s - 1) as CheckoutStepId)))}
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  Quay lại
                </Button>
              </div>
            ) : null}
          </motion.section>
        </motion.div>

        <motion.aside
          className={cn(
            "order-2 flex min-w-0 w-full flex-col",
            "lg:sticky lg:top-2 lg:max-h-[calc(100dvh-5rem)] lg:overflow-y-auto lg:overscroll-contain lg:self-start lg:pr-0.5 [scrollbar-width:thin]",
          )}
          initial="hidden"
          animate="visible"
          variants={asideIn}
        >
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-md ring-1 ring-black/5 dark:border-border/50 dark:bg-card/90 dark:ring-white/10">
            <div className="border-b border-border/60 bg-muted/30 px-3 py-2.5 dark:bg-muted/20 sm:px-4">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Tóm tắt đặt lịch</h2>
              {branchId ? (
                <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground" title={branchId}>
                  Chi nhánh · {branchId.slice(0, 10)}…
                </p>
              ) : null}
            </div>
            <div className="space-y-3 p-3 sm:p-3.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Xe</p>
                {vehiclesLoading ? (
                  <p className="mt-1 text-xs text-muted-foreground">Đang tải…</p>
                ) : selectedVehicle ? (
                  <div className="mt-1.5 flex gap-2.5 sm:mt-2 sm:gap-3">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-14">
                      {selectedVehicle.variant?.imageUrl ? (
                        <SafeImage
                          src={selectedVehicle.variant.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="grid size-full place-items-center text-muted-foreground">
                          <Car className="size-6" aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        {selectedVehicle.licensePlate}
                      </p>
                      <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                        {selectedVehicle.variant.model.brandName} {selectedVehicle.variant.model.name}
                      </p>
                      {selectedVehicle.nickname ? (
                        <p className="mt-1 text-[11px] text-muted-foreground/90">{selectedVehicle.nickname}</p>
                      ) : null}
                    </div>
                    {step === 2 ? (
                      <div className="flex shrink-0 items-start justify-center pt-1">
                        <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Check className="size-3.5 stroke-3" aria-hidden />
                        </span>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div
                    className={cn(
                      "mt-2 rounded-lg border border-dashed px-3 py-3 text-xs",
                      step === 2
                        ? "border-primary/30 bg-primary/4 text-muted-foreground dark:bg-primary/10"
                        : "border-border/60 bg-muted/10 text-muted-foreground",
                    )}
                  >
                    <p className="italic">Chưa chọn xe</p>
                    {step === 2 ? (
                      <p className="mt-1.5 text-[11px] leading-relaxed text-foreground/80">
                        Chọn thẻ xe ở cột trái — tóm tắt cập nhật ngay tại đây.
                      </p>
                    ) : null}
                  </div>
                )}
              </div>

              <Separator className="bg-border/60" />

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Dịch vụ & sản phẩm</p>
                <ul className="mt-1.5 max-h-[min(30vh,220px)] space-y-2 overflow-y-auto pr-0.5 [scrollbar-width:thin] lg:max-h-[min(28vh,200px)]">
                  {selectedInBranch.length === 0 ? (
                    <li className="rounded-lg border border-dashed border-border/60 bg-muted/15 px-3 py-4 text-center text-xs text-muted-foreground dark:bg-muted/10">
                      Chưa chọn mục nào trong giỏ.
                    </li>
                  ) : (
                    selectedInBranch.map((line) => (
                      <li key={bookingCartLineKey(line)} className="flex gap-3">
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
                          {line.imageUrl ? (
                            <SafeImage src={line.imageUrl} alt="" fill className="object-cover" />
                          ) : (
                            <div className="grid size-full place-items-center text-muted-foreground/70">
                              <Package className="size-5" aria-hidden />
                            </div>
                          )}
                          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background shadow">
                            1
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-snug text-foreground">{line.name}</p>
                          <p className="text-[11px] text-muted-foreground">{kindShortLabel(line.kind)}</p>
                          <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                            {formatVnd(line.unitPriceVnd ?? null)}
                          </p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <Separator className="bg-border/60" />

              <div
                className={cn(
                  "rounded-lg border px-2.5 py-2 text-xs transition-colors sm:text-sm",
                  schedulePreview.tone === "full" &&
                    "border-primary/25 bg-primary/5 dark:border-primary/30 dark:bg-primary/10",
                  schedulePreview.tone === "partial" && "border-border/55 bg-muted/20 dark:border-border/50 dark:bg-muted/15",
                  schedulePreview.tone === "empty" &&
                    "border-dashed border-border/70 bg-muted/10 text-muted-foreground dark:bg-muted/10",
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Lịch hẹn</p>
                <p className="mt-0.5 font-medium capitalize leading-snug text-foreground">{schedulePreview.title}</p>
                {schedulePreview.hint ? (
                  <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
                    {schedulePreview.hint}
                  </p>
                ) : null}
              </div>

              {bookingNote.trim() ? (
                <div className="rounded-lg border border-border/50 bg-muted/15 px-3 py-2 text-xs dark:bg-muted/10">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Ghi chú</p>
                  <p className="mt-1 line-clamp-4 text-foreground">{bookingNote.trim()}</p>
                </div>
              ) : null}

              <Separator className="bg-border/60" />

              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Tạm tính</p>
                  {subtotal.pricedLines < subtotal.totalLines && subtotal.totalLines > 0 ? (
                    <p className="text-[10px] text-muted-foreground">
                      {subtotal.pricedLines}/{subtotal.totalLines} mục có giá
                    </p>
                  ) : null}
                </div>
                <span className="text-base font-bold tabular-nums text-foreground sm:text-lg">{formatVnd(subtotal.sum)}</span>
              </div>

              <motion.div
                className="pt-1"
                whileHover={{ scale: previewPrimaryDisabled ? 1 : 1.01 }}
                whileTap={{ scale: previewPrimaryDisabled ? 1 : 0.99 }}
              >
                <Button
                  type="button"
                  size="lg"
                  className="h-10 w-full rounded-xl text-sm font-semibold shadow-md sm:h-11"
                  disabled={previewPrimaryDisabled}
                  onClick={() => void handlePreviewPrimary()}
                >
                  {step === 3 ? (
                    <CalendarDays className="mr-2 size-4" aria-hidden />
                  ) : (
                    <ChevronRight className="mr-2 size-4" aria-hidden />
                  )}
                  {previewPrimaryLabel}
                </Button>
              </motion.div>
              {stepHint ? (
                <p className="text-center text-[10px] leading-relaxed text-muted-foreground">{stepHint}</p>
              ) : null}
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
