"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, X } from "lucide-react";
import { EffectCoverflow, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useTypes } from "@/hooks/useType";
import { useBrands } from "@/hooks/useBrand";
import { useModels } from "@/hooks/useModel";
import { useVariantsByModelId } from "@/hooks/useVariants";
import { useCreateUserVehicle } from "@/hooks/useUserVehice";
import SafeImage from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

const springSoft = { type: "spring" as const, stiffness: 420, damping: 32 };

export function DesktopCreateVehicleFlow() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [vehicleTypeId, setVehicleTypeId] = useState<string | null>(null);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [modelId, setModelId] = useState<string | null>(null);
  const [vehicleVariantId, setVehicleVariantId] = useState<string | null>(null);
  const [modelKeyword, setModelKeyword] = useState("");
  const variantSectionRef = useRef<HTMLDivElement | null>(null);
  const [brandCollapsed, setBrandCollapsed] = useState(false);
  const [modelCollapsed, setModelCollapsed] = useState(false);
  const [form, setForm] = useState({
    licensePlate: "",
    vin: "",
    purchaseDate: "",
    currentOdometer: "",
  });

  const { mutateAsync: createVehicle, isLoading: isCreatingVehicle } = useCreateUserVehicle();
  const { types, isLoading: isLoadingTypes } = useTypes({ PageNumber: 1, PageSize: 10, IsDescending: false }, true);
  const { brands, isLoading: isLoadingBrands } = useBrands(
    { PageNumber: 1, PageSize: 10, IsDescending: false },
    step >= 3,
  );
  const { models, isLoading: isLoadingModels } = useModels(
    {
      PageNumber: 1,
      PageSize: 10,
      BrandId: brandId || undefined,
      TypeId: vehicleTypeId || undefined,
      ModelName: modelKeyword || undefined,
      IsDescending: false,
    },
    step >= 3 && !!brandId,
  );
  const { variants, isLoading: isLoadingVariants } = useVariantsByModelId(modelId || "", step >= 3 && !!modelId);

  const selectedBrand = brands.find((b) => b.id === brandId) || null;
  const selectedModel = models.find((m) => m.id === modelId) || null;
  const selectedVariant = variants.find((v) => v.id === vehicleVariantId) || null;

  const initialVariantSlide = useMemo(() => {
    if (!variants.length) return 0;
    const i = variants.findIndex((v) => v.id === vehicleVariantId);
    return i >= 0 ? i : 0;
  }, [variants, vehicleVariantId]);

  useEffect(() => {
    if (step !== 3 || !modelId) return;
    variantSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step, modelId]);

  const canGoStep4 = !!vehicleTypeId && !!brandId && !!modelId && !!vehicleVariantId;
  const canGoNext = step === 1 ? true : step === 2 ? !!vehicleTypeId : step === 3 ? canGoStep4 : false;
  const isValidForm = useMemo(() => {
    const odo = Number(form.currentOdometer);
    return !!form.licensePlate.trim() && !!form.purchaseDate.trim() && Number.isFinite(odo) && odo >= 0;
  }, [form]);

  const handleSubmitCreateVehicle = async () => {
    if (!vehicleVariantId || !isValidForm) return;
    const loadingToast = toast.loading("Đang đăng ký xe...");
    try {
      await createVehicle({
        vehicleVariantId,
        licensePlate: form.licensePlate.trim(),
        vin: form.vin.trim(),
        purchaseDate: form.purchaseDate.trim(),
        currentOdometer: Number(form.currentOdometer),
      });
      toast.success("Đăng ký xe thành công! Hãy chọn xe vừa tạo ở cột trái.", { id: loadingToast });
      setStep(1);
      setVehicleTypeId(null);
      setBrandId(null);
      setModelId(null);
      setVehicleVariantId(null);
      setModelKeyword("");
      setForm({ licensePlate: "", vin: "", purchaseDate: "", currentOdometer: "" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Đăng ký xe thất bại";
      toast.error(message, { id: loadingToast });
    }
  };

  const handleNext = () => {
    if (!canGoNext) return;
    if (step === 2) {
      setBrandCollapsed(false);
      setModelCollapsed(false);
      setStep(3);
      return;
    }
    if (step < 4) setStep((prev) => (prev + 1) as 2 | 3 | 4);
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as 1 | 2 | 3);
  };

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl bg-background ring-1 ring-border/60">
      <div className="border-b border-border/70 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">Tạo xe mới</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">Hoàn thành 4 bước để thêm xe vào danh sách của bạn</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleBack} disabled={step === 1} className="text-muted-foreground">
              Quay lại
            </Button>
            {step < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!canGoNext}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Tiếp theo
              </Button>
            ) : (
              <Button
                onClick={handleSubmitCreateVehicle}
                disabled={!isValidForm || !vehicleVariantId || isCreatingVehicle}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isCreatingVehicle ? "Đang tạo..." : "Đăng ký xe"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-border/70 px-6 py-3">
        <div className="flex flex-wrap items-center gap-x-1 gap-y-1 font-mono text-[11px] tabular-nums text-muted-foreground">
          {[1, 2, 3, 4].map((s) => (
            <span key={s} className="flex items-center">
              <span
                className={cn(
                  "inline-flex min-w-[1.75rem] items-center justify-center transition-colors",
                  step === s && "font-semibold text-primary",
                  step > s && "text-primary/80",
                )}
              >
                {step > s ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : String(s).padStart(2, "0")}
              </span>
              {s < 4 ? <span className="mx-1.5 text-muted-foreground/35">/</span> : null}
            </span>
          ))}
        </div>
        <div className="mt-3 h-px w-full overflow-hidden bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={false}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={springSoft}
          />
        </div>
      </div>

      <div className="grid h-full min-h-0 flex-1 grid-cols-12 grid-rows-[minmax(0,1fr)] items-stretch gap-4 overflow-y-auto overflow-x-hidden overscroll-contain px-6 py-4">
        <div
          className={cn(
            "col-span-8 min-w-0",
            step === 3 ? "flex min-h-0 h-full flex-col" : "",
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              {...fadeUp}
              className={cn(step === 3 ? "flex min-h-0 flex-1 flex-col gap-3" : "space-y-4")}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 1 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Chọn phương thức nhập dữ liệu xe.</p>
                  <div className="divide-y divide-border/80 rounded-lg bg-muted/25">
                    <motion.button
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex w-full flex-col gap-0.5 px-4 py-3.5 text-left transition-colors hover:bg-primary/5"
                    >
                      <span className="font-semibold text-foreground">Nhập tay</span>
                      <span className="text-[13px] text-muted-foreground">Nhập từng bước theo form</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      onClick={() => toast.info("Tính năng scan đang phát triển")}
                      className="flex w-full flex-col gap-0.5 px-4 py-3.5 text-left text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    >
                      <span className="font-medium">Quét tự động</span>
                      <span className="text-[13px]">Sẽ ra mắt sớm</span>
                    </motion.button>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-3">
                  <p className="text-[13px] text-muted-foreground">Chọn loại xe.</p>
                  {isLoadingTypes ? (
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <Skeleton key={`type-skeleton-${idx}`} className="h-10 rounded-lg" />
                      ))}
                    </div>
                  ) : null}
                  <div className="divide-y divide-border/70 rounded-md border border-border/60">
                    {types.map((t) => (
                      <motion.button
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setVehicleTypeId(t.id);
                          setBrandId(null);
                          setModelId(null);
                          setVehicleVariantId(null);
                          setBrandCollapsed(false);
                          setModelCollapsed(false);
                          setStep(3);
                        }}
                        className="flex w-full px-3 py-2.5 text-left text-[13px] transition-colors hover:bg-muted/50"
                      >
                        <span className="font-medium text-foreground">{t.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="flex min-h-0 flex-1 flex-col gap-3">
                  <div className="shrink-0">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Hãng</p>
                      {!brandCollapsed && brandId ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                          onClick={() => setBrandCollapsed(true)}
                          aria-label="Thu gọn chọn hãng"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                    {isLoadingBrands ? <p className="text-[12px] text-muted-foreground">Đang tải hãng xe...</p> : null}
                    {brandCollapsed && brandId && selectedBrand ? (
                      <button
                        type="button"
                        onClick={() => setBrandCollapsed(false)}
                        className="flex w-full items-center justify-between gap-2 rounded-lg bg-muted/35 px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white dark:bg-neutral-900">
                            {selectedBrand.logoUrl ? (
                              <SafeImage src={selectedBrand.logoUrl} alt={selectedBrand.name} fill className="object-contain p-1" />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">—</span>
                            )}
                          </span>
                          <span className="truncate text-sm font-medium text-foreground">{selectedBrand.name}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      </button>
                    ) : (
                      <>
                        {/* Rail ngang + snap — pattern configurator (Apple / xe máy) */}
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-8 bg-gradient-to-r from-background to-transparent dark:from-background" />
                          <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l from-background to-transparent dark:from-background" />
                          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pl-1 pr-1 pt-0.5 [scrollbar-width:thin]">
                            {brands.map((b) => (
                              <motion.button
                                whileTap={{ scale: 0.97 }}
                                key={b.id}
                                type="button"
                                onClick={() => {
                                  setBrandId(b.id);
                                  setModelId(null);
                                  setVehicleVariantId(null);
                                  setBrandCollapsed(true);
                                  setModelCollapsed(false);
                                }}
                                className={cn(
                                  "flex w-[4.75rem] shrink-0 snap-center flex-col items-center gap-1 rounded-xl px-1 py-2 transition-colors",
                                  brandId === b.id ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50",
                                )}
                              >
                                <div
                                  className={cn(
                                    "relative h-11 w-11 overflow-hidden rounded-full bg-white shadow-sm dark:bg-neutral-900",
                                    brandId === b.id && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background",
                                  )}
                                >
                                  {b.logoUrl ? (
                                    <SafeImage src={b.logoUrl} alt={b.name} fill className="object-contain p-1.5" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">—</div>
                                  )}
                                </div>
                                <span className="line-clamp-2 text-center text-[10px] font-medium leading-tight">{b.name}</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {brandId ? (
                    <div className="shrink-0">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Model</p>
                        <div className="flex shrink-0 items-center gap-1">
                          {!modelCollapsed && modelId ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => setModelCollapsed(true)}
                              aria-label="Thu gọn chọn model"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      {modelCollapsed && modelId && selectedModel ? (
                        <button
                          type="button"
                          onClick={() => setModelCollapsed(false)}
                          className="flex w-full items-center justify-between gap-2 rounded-lg bg-muted/35 px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-foreground">{selectedModel.name}</span>
                            <span className="mt-0.5 block text-[10px] tabular-nums text-muted-foreground">
                              {selectedModel.releaseYear != null ? String(selectedModel.releaseYear) : "—"}
                            </span>
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                        </button>
                      ) : (
                        <>
                          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-end">
                            <Input
                              value={modelKeyword}
                              onChange={(e) => setModelKeyword(e.target.value)}
                              placeholder="Lọc theo tên..."
                              className="h-8 max-w-full sm:max-w-[220px] text-sm"
                            />
                          </div>
                          {isLoadingModels ? (
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                              {Array.from({ length: 6 }).map((_, idx) => (
                                <Skeleton key={`model-sk-${idx}`} className="h-[52px] rounded-lg" />
                              ))}
                            </div>
                          ) : models.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">Không có model phù hợp. Thử đổi từ khóa lọc.</p>
                          ) : (
                            <div className="columns-2 gap-x-10 gap-y-0 [column-fill:_balance] sm:columns-3">
                              {models.map((m) => {
                                const selected = modelId === m.id;
                                return (
                                  <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => {
                                      setModelId(m.id);
                                      setVehicleVariantId(null);
                                      setModelCollapsed(true);
                                    }}
                                    className={cn(
                                      "mb-2.5 break-inside-avoid w-full border-b border-border/50 py-1.5 text-left transition-colors last:mb-0",
                                      selected ? "border-primary text-primary" : "border-border/40 hover:border-border",
                                    )}
                                  >
                                    <span className="block text-[14px] font-medium leading-snug">{m.name}</span>
                                    <span className="mt-0.5 block text-[10px] tabular-nums text-muted-foreground">
                                      {m.releaseYear != null ? String(m.releaseYear) : "—"}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : null}

                  {modelId ? (
                    <div ref={variantSectionRef} className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
                      <p className="shrink-0 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Phiên bản · màu
                      </p>
                      {/* Swiper coverflow — giống demo effect="coverflow" */}
                      <div className="min-h-0 min-w-0 flex-1 py-1">
                        {isLoadingVariants ? (
                          <p className="py-4 text-[12px] text-muted-foreground">Đang tải phiên bản...</p>
                        ) : variants.length === 0 ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">Không có phiên bản màu.</p>
                        ) : (
                          <Swiper
                            key={modelId ?? "variants"}
                            modules={[EffectCoverflow, Pagination]}
                            effect="coverflow"
                            grabCursor
                            centeredSlides
                            slidesPerView="auto"
                            initialSlide={initialVariantSlide}
                            onSwiper={(swiper) => {
                              const v = variants[swiper.activeIndex];
                              if (v) setVehicleVariantId(v.id);
                            }}
                            onSlideChange={(swiper) => {
                              const v = variants[swiper.activeIndex];
                              if (v) setVehicleVariantId(v.id);
                            }}
                            coverflowEffect={{
                              rotate: 50,
                              stretch: 0,
                              depth: 100,
                              modifier: 1,
                              slideShadows: true,
                            }}
                            pagination={{ clickable: true, dynamicBullets: true }}
                            className="variant-coverflow !pb-10 !pt-6 [&_.swiper-pagination-bullet-active]:bg-primary [&_.swiper-pagination-bullet]:bg-muted-foreground/40"
                            aria-label="Danh sách phiên bản màu"
                          >
                            {variants.map((v) => {
                              const active = vehicleVariantId === v.id;
                              return (
                                <SwiperSlide
                                  key={v.id}
                                  className="!w-[260px] max-w-[85vw] overflow-visible"
                                  style={{ width: 260 }}
                                >
                                  <div
                                    className={cn(
                                      "overflow-hidden rounded-xl text-left transition-shadow",
                                      active
                                        ? "shadow-lg shadow-primary/20 ring-2 ring-primary ring-offset-2 ring-offset-background"
                                        : "ring-1 ring-border/50",
                                    )}
                                  >
                                    <div className="relative aspect-[4/3] w-full bg-muted/30">
                                      {v.imageUrl ? (
                                        <SafeImage
                                          src={v.imageUrl}
                                          alt={v.color || "variant"}
                                          fill
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">—</div>
                                      )}
                                    </div>
                                    <div className="space-y-0.5 bg-background/95 px-2 py-1.5 dark:bg-background/90">
                                      <p className={cn("line-clamp-2 text-[11px] font-medium leading-tight", active && "text-primary")}>
                                        {v.color || "Variant"}
                                      </p>
                                      <p className="font-mono text-[9px] text-muted-foreground">{v.hexCode || "—"}</p>
                                      <span
                                        className="mt-1 inline-block h-2.5 w-2.5 rounded-full ring-1 ring-border/60"
                                        style={{ backgroundColor: v.hexCode || "#e5e7eb" }}
                                      />
                                    </div>
                                  </div>
                                </SwiperSlide>
                              );
                            })}
                          </Swiper>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {step === 4 ? (
                <div className="space-y-3">
                  <p className="text-[13px] text-muted-foreground">Nhập thông tin xe để hoàn tất đăng ký.</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-[12px] text-muted-foreground">Biển số xe *</Label>
                      <Input
                        value={form.licensePlate}
                        onChange={(e) => setForm((p) => ({ ...p, licensePlate: e.target.value }))}
                        placeholder="VD: 59X1-123.45"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px] text-muted-foreground">VIN</Label>
                      <Input
                        value={form.vin}
                        onChange={(e) => setForm((p) => ({ ...p, vin: e.target.value }))}
                        placeholder="Nhập VIN"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px] text-muted-foreground">Ngày mua *</Label>
                      <Input
                        type="date"
                        value={form.purchaseDate}
                        onChange={(e) => setForm((p) => ({ ...p, purchaseDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-[12px] text-muted-foreground">Odometer hiện tại *</Label>
                      <Input
                        type="number"
                        min={0}
                        value={form.currentOdometer}
                        onChange={(e) => setForm((p) => ({ ...p, currentOdometer: e.target.value }))}
                        placeholder="VD: 12000"
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="sticky top-0 z-10 col-span-4 flex h-fit min-h-0 w-full max-w-full flex-col self-start border-l border-border/60 pl-6 sm:pl-7">
          <header className="shrink-0 pb-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Đang chọn</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              Bước {step}
              <span className="font-normal text-muted-foreground"> / 4</span>
            </p>
          </header>

          {/* Ảnh xe: crossfade nhẹ khi đổi màu */}
          <div className="relative mt-3 min-h-[min(40vh,360px)] w-full flex-1 overflow-hidden rounded-xl bg-muted/35">
            <AnimatePresence mode="wait">
              {selectedVariant?.imageUrl ? (
                <motion.div
                  key={selectedVariant.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <SafeImage
                    src={selectedVariant.imageUrl}
                    alt={selectedVariant.color || "Xe đã chọn"}
                    fill
                    className="object-contain object-center p-4 sm:p-5"
                    priority={step === 3}
                  />
                </motion.div>
              ) : selectedVariant ? (
                <motion.div
                  key="no-img"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-full min-h-[min(40vh,360px)] flex-col items-center justify-center gap-1 px-4 text-center text-sm text-muted-foreground"
                >
                  <p>Chưa có ảnh cho phiên bản này</p>
                </motion.div>
              ) : (
                <motion.div
                  key="pick"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-full min-h-[min(40vh,360px)] flex-col items-center justify-center gap-2 px-4 text-center"
                >
                  <p className="text-sm text-muted-foreground">Chọn phiên bản / màu</p>
                  <p className="text-xs text-muted-foreground/80">Ảnh hiển thị đầy đủ tại đây</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <footer className="mt-5 shrink-0 space-y-4 pt-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted/50">
                {selectedBrand?.logoUrl ? (
                  <SafeImage
                    src={selectedBrand.logoUrl}
                    alt={selectedBrand.name}
                    fill
                    className="object-contain p-1.5"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                    —
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Hãng</p>
                <p className="truncate font-medium text-foreground">{selectedBrand?.name || "—"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Model</p>
              <p className="font-medium leading-snug text-foreground">
                {selectedModel ? (
                  <>
                    {selectedModel.name}
                    {selectedModel.releaseYear != null ? (
                      <span className="font-normal text-muted-foreground"> · {String(selectedModel.releaseYear)}</span>
                    ) : null}
                  </>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phiên bản / màu</p>
              {selectedVariant ? (
                <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-foreground">
                  <span className="font-medium">{selectedVariant.color || "Phiên bản"}</span>
                  {selectedVariant.hexCode ? (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full ring-1 ring-border/60"
                          style={{ backgroundColor: selectedVariant.hexCode }}
                        />
                        {selectedVariant.hexCode}
                      </span>
                    </>
                  ) : null}
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">—</p>
              )}
            </div>
          </footer>
        </aside>
      </div>
    </section>
  );
}
