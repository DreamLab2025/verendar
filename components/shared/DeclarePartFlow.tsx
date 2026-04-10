"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Check, CheckCircle2, ChevronDown, ClipboardList, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { AIRecommendation } from "@/lib/api/services/fetchAnalyzeQuestionare";
import { analyzeQuestionnaireService } from "@/lib/api/services/fetchAnalyzeQuestionare";
import type { ApplyTrackingRequest } from "@/lib/api/services/fetchTrackingReminder";
import type { UserVehiclePart } from "@/lib/api/services/fetchUserVehicle";
import type { Question } from "@/lib/api/services/fetchPartCategoryQuestionnaire";
import { usePartCategoryQuestionnaire } from "@/hooks/usePartCategoryQuestionnaire";
import { useApplyTracking } from "@/hooks/useTrackingReminder";
import { cn } from "@/lib/utils";

const BRAND = "#E22028";

const easeUi = [0.22, 1, 0.36, 1] as const;

const questionListVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.052, delayChildren: 0.05 },
  },
};

const questionRowVariants = {
  hidden: { opacity: 0, x: -14 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.34, ease: easeUi },
  },
};

type Phase = "form" | "analyzing" | "result" | "applying";

/** Mốc user chọn để gửi apply-tracking — map vào predictedNext* trên payload */
type MilestoneChoice = "earliest" | "predicted" | "latest";

function pickMilestoneOdoDate(r: AIRecommendation, choice: MilestoneChoice): { odometer: number; date: string } {
  const predDate = r.predictedNextDate || "";
  if (choice === "earliest") {
    const odo = typeof r.earliestNextOdometer === "number" ? r.earliestNextOdometer : r.predictedNextOdometer;
    const date = (r.earliestNextDate ?? predDate) || predDate;
    return { odometer: odo, date };
  }
  if (choice === "latest") {
    const odo = typeof r.latestNextOdometer === "number" ? r.latestNextOdometer : r.predictedNextOdometer;
    const date = (r.latestNextDate ?? predDate) || predDate;
    return { odometer: odo, date };
  }
  return { odometer: r.predictedNextOdometer, date: predDate };
}

/** Thang 0..1 theo contract apply-tracking */
function confidenceTierToNormalized(tier: AIRecommendation["confidenceTier"]): number {
  if (tier === "high") return 0.9;
  if (tier === "medium") return 0.6;
  if (tier === "low") return 0.3;
  return 0.5;
}

function normalizeConfidenceScoreForApply(r: AIRecommendation): number {
  if (typeof r.confidenceScore === "number" && Number.isFinite(r.confidenceScore)) {
    const v = r.confidenceScore;
    if (v > 1) return Math.min(1, Math.max(0, v / 100));
    return Math.min(1, Math.max(0, v));
  }
  return confidenceTierToNormalized(r.confidenceTier);
}

function recommendationToApplyPayload(
  r: AIRecommendation,
  milestoneChoice: MilestoneChoice,
  fallbackPartSlug: string,
): ApplyTrackingRequest {
  const slug = (r.partCategorySlug ?? r.partCategoryCode ?? fallbackPartSlug ?? "").trim().toUpperCase();
  const { odometer, date } = pickMilestoneOdoDate(r, milestoneChoice);
  return {
    partCategorySlug: slug,
    lastReplacementOdometer: r.lastReplacementOdometer,
    lastReplacementDate: r.lastReplacementDate,
    predictedNextOdometer: odometer,
    predictedNextDate: date,
    aiReasoning: r.reasoning,
    confidenceScore: normalizeConfidenceScoreForApply(r),
  };
}

function formatKm(n: number | undefined) {
  return typeof n === "number" ? n.toLocaleString("vi-VN") : "—";
}

function formatDateVi(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}

function tierBadge(tier: AIRecommendation["confidenceTier"]) {
  switch (tier) {
    case "high":
      return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200";
    case "medium":
      return "bg-sky-500/15 text-sky-900 dark:text-sky-200";
    case "low":
      return "bg-amber-500/15 text-amber-900 dark:text-amber-200";
    default:
      return "bg-neutral-500/10 text-neutral-700 dark:text-neutral-300";
  }
}

function tierLabelVi(tier: AIRecommendation["confidenceTier"]) {
  switch (tier) {
    case "high":
      return "Độ tin cậy cao";
    case "medium":
      return "Độ tin cậy trung bình";
    case "low":
      return "Độ tin cậy thấp";
    default:
      return "Độ tin cậy";
  }
}

export type DeclarePartFlowProps = {
  userVehicleId: string;
  part: UserVehiclePart;
  /** Đóng / quay lại (panel trống hoặc dialog) */
  onDismiss: () => void;
  onDeclared?: () => void;
  /** Panel nhúng trong tab Tình trạng — bo góc + chiều cao linh hoạt */
  variant?: "embedded" | "plain";
};

export function DeclarePartFlow({
  userVehicleId,
  part,
  onDismiss,
  onDeclared,
  variant = "plain",
}: DeclarePartFlowProps) {
  const [phase, setPhase] = useState<Phase>("form");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  /** undefined = theo câu chưa trả lời đầu tiên (auto); string = user / luồng chọn đang mở câu đó */
  const [expandedOverride, setExpandedOverride] = useState<string | undefined>(undefined);
  /** User chủ động đóng accordion — không auto-mở lại cho đến khi mở câu khác hoặc chọn đáp án */
  const [userDismissedAutoOpen, setUserDismissedAutoOpen] = useState(false);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [milestoneChoice, setMilestoneChoice] = useState<MilestoneChoice>("predicted");

  const { applyAsync, isApplying } = useApplyTracking();

  const {
    config: questionnaireConfig,
    hasQuestions,
    isPending: questionnaireLoading,
    isError: questionnaireError,
    error: questionnaireErrorObj,
    refetch: refetchQuestionnaire,
  } = usePartCategoryQuestionnaire(part.partCategorySlug, true);

  const config = hasQuestions ? questionnaireConfig : undefined;
  const slugForApi = useMemo(() => part.partCategorySlug.trim().toLowerCase(), [part.partCategorySlug]);

  const answeredCount = useMemo(() => {
    if (!config) return 0;
    return config.questions.filter((q) => !!answers[q.id]).length;
  }, [answers, config]);

  const progress = config && config.questions.length ? (answeredCount / config.questions.length) * 100 : 0;
  const formComplete = !!config && config.questions.length > 0 && config.questions.every((q) => !!answers[q.id]);

  const firstUnansweredId = useMemo(() => {
    if (phase !== "form" || !config) return null;
    return config.questions.find((q) => !answers[q.id])?.id ?? null;
  }, [phase, config, answers]);

  const activeExpandedId =
    phase !== "form" || !config
      ? null
      : expandedOverride !== undefined
        ? expandedOverride
        : userDismissedAutoOpen
          ? null
          : firstUnansweredId;

  const toggleQuestionExpanded = useCallback((questionId: string, isOpen: boolean) => {
    if (isOpen) {
      setExpandedOverride(undefined);
      setUserDismissedAutoOpen(true);
    } else {
      setExpandedOverride(questionId);
      setUserDismissedAutoOpen(false);
    }
  }, []);

  const handleSelect = useCallback(
    (q: Question, value: string) => {
      if (!config) return;
      setAnswers((prev) => {
        const updated = { ...prev, [q.id]: value };
        const nextQ = config.questions.find((question) => !updated[question.id]);
        setExpandedOverride(nextQ?.id);
        setUserDismissedAutoOpen(false);
        return updated;
      });
    },
    [config],
  );

  const runAnalyze = async () => {
    if (!config || !formComplete) return;
    const answersPayload = config.questions.map((q) => ({
      question: q.aiQuestion,
      value: answers[q.id] || "",
    }));
    setPhase("analyzing");
    try {
      const response = await analyzeQuestionnaireService.analyzeQuestionnaire({
        userVehicleId,
        partCategorySlug: slugForApi,
        answers: answersPayload,
      });
      if (response.isSuccess && response.data.recommendations.length > 0) {
        const slug = slugForApi;
        const rec =
          response.data.recommendations.find((r) => r.partCategorySlug?.toLowerCase() === slug) ??
          response.data.recommendations[0];
        setRecommendation(rec);
        setMilestoneChoice("predicted");
        setPhase("result");
        toast.success(response.message || "Phân tích xong");
      } else {
        setPhase("form");
        toast.error(response.message || "Không nhận được gợi ý từ hệ thống");
      }
    } catch (e) {
      setPhase("form");
      toast.error(e instanceof Error ? e.message : "Phân tích thất bại");
    }
  };

  const runApply = async () => {
    if (!recommendation) return;
    let choice: MilestoneChoice = milestoneChoice;
    if (choice === "earliest" && typeof recommendation.earliestNextOdometer !== "number") choice = "predicted";
    if (choice === "latest" && typeof recommendation.latestNextOdometer !== "number") choice = "predicted";
    const payload = recommendationToApplyPayload(recommendation, choice, part.partCategorySlug);
    if (!payload.partCategorySlug) {
      toast.error("Thiếu mã loại phụ tùng — không thể áp dụng theo dõi.");
      return;
    }
    setPhase("applying");
    try {
      await applyAsync({
        userVehicleId,
        payload,
      });
      onDeclared?.();
      onDismiss();
    } catch {
      setPhase("result");
    }
  };

  const shellClass =
    variant === "embedded"
      ? cn("flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden")
      : "flex  min-h-0 flex-1 flex-col overflow-hidden";

  /** Trong dialog: lề + chừa chỗ nút đóng (góc phải trên) */
  const embeddedChrome =
    variant === "embedded" ? "px-4 pt-10 pb-0 sm:px-6 sm:pt-11" : "";

  if (questionnaireLoading) {
    return (
      <div className={cn(shellClass, embeddedChrome, variant === "embedded" && "min-h-[280px]")}>
        <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800 sm:px-5">
          <h2 className="text-left text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {part.partCategoryName}
          </h2>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
          <Loader2 className="size-8 animate-spin text-neutral-400" aria-hidden />
          <p>Đang tải bộ câu hỏi…</p>
        </div>
        <div className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-800 sm:px-5">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onDismiss}>
            {variant === "embedded" ? "Quay lại" : "Đóng"}
          </Button>
        </div>
      </div>
    );
  }

  if (questionnaireError) {
    return (
      <div className={cn(shellClass, embeddedChrome, variant === "embedded" && "min-h-[280px]")}>
        <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800 sm:px-5">
          <h2 className="text-left text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {part.partCategoryName}
          </h2>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
          <p>{questionnaireErrorObj?.message ?? "Không tải được bộ câu hỏi."}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetchQuestionnaire()}>
            Thử lại
          </Button>
        </div>
        <div className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-800 sm:px-5">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onDismiss}>
            {variant === "embedded" ? "Quay lại" : "Đóng"}
          </Button>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className={cn(shellClass, embeddedChrome, variant === "embedded" && "min-h-[280px]")}>
        <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800 sm:px-5">
          <h2 className="text-left text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {part.partCategoryName}
          </h2>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Loại phụ tùng này chưa có bộ câu hỏi khai báo trên ứng dụng. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.
        </div>
        <div className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-800 sm:px-5">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onDismiss}>
            {variant === "embedded" ? "Quay lại" : "Đóng"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(shellClass, embeddedChrome)}>
      <div className="shrink-0">
        <div className="flex items-start gap-3">
          {variant === "embedded" ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-0.5 size-9 shrink-0 rounded-full text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              onClick={onDismiss}
              aria-label="Quay lại"
            >
              <ArrowLeft className="size-5" />
            </Button>
          ) : (
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ backgroundColor: BRAND }}
            >
              <ClipboardList className="size-5" aria-hidden />
            </div>
          )}
          <div className="min-w-0 flex-1 text-left">
            <h2 className="text-base font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
              Khai báo · {config.partCategoryName}
            </h2>
            <p className="mt-1 text-[12px] text-neutral-500 dark:text-neutral-400">
              Trả lời các câu hỏi để AI ước lượng mốc bảo dưỡng phù hợp với bạn.
            </p>
          </div>
        </div>
        {phase === "form" ? (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: BRAND, boxShadow: `0 0 12px ${BRAND}55` }}
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 22, mass: 0.8 }}
            />
          </div>
        ) : null}
        {phase === "form" ? (
          <p className="mt-1.5 text-[11px] tabular-nums text-neutral-500 dark:text-neutral-400">
            {answeredCount}/{config.questions.length} câu
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          "scrollbar-hide min-h-0 min-w-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain py-3 [-webkit-overflow-scrolling:touch]",
          variant === "embedded" ? "px-0" : "px-3 sm:px-5",
        )}
      >
        <AnimatePresence mode="wait">
          {phase === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: easeUi }}
              className="relative pb-2"
            >
              <div
                className="pointer-events-none absolute bottom-3 left-[15px] top-3 w-px rounded-full bg-linear-to-b from-neutral-200 via-neutral-200/70 to-neutral-200/30 dark:from-neutral-700 dark:via-neutral-700/60 dark:to-transparent"
                aria-hidden
              />
              <motion.div
                className="relative space-y-0"
                variants={questionListVariants}
                initial="hidden"
                animate="show"
              >
                {config.questions.map((question, index) => {
                  const isOpen = activeExpandedId === question.id;
                  const selected = question.options.find((o) => o.value === answers[question.id]);
                  const answered = !!selected;
                  return (
                    <motion.div
                      key={question.id}
                      variants={questionRowVariants}
                      className="relative flex gap-3 pb-2 last:pb-2 sm:gap-4"
                    >
                      <div className="relative z-1 flex w-8 shrink-0 flex-col items-center pt-0.5 sm:w-9">
                        <motion.button
                          type="button"
                          transition={{ type: "spring", stiffness: 380, damping: 26 }}
                          onClick={() => toggleQuestionExpanded(question.id, isOpen)}
                          className={cn(
                            "flex size-7 items-center justify-center rounded-full text-[11px] font-bold shadow-sm ring-2 ring-white dark:ring-neutral-950",
                            answered
                              ? "text-white"
                              : "bg-neutral-100 text-neutral-500 ring-neutral-200/90 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-700/80",
                          )}
                          style={answered ? { backgroundColor: BRAND, boxShadow: `0 2px 10px ${BRAND}44` } : undefined}
                          aria-expanded={isOpen}
                          aria-label={`Câu ${index + 1}`}
                        >
                          <AnimatePresence mode="wait" initial={false}>
                            {answered ? (
                              <motion.span
                                key="ok"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 520, damping: 24 }}
                                className="flex"
                              >
                                <Check className="size-3.5 stroke-[2.5]" aria-hidden />
                              </motion.span>
                            ) : (
                              <motion.span
                                key="n"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="tabular-nums"
                              >
                                {index + 1}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>

                      <div className="min-w-0 flex-1 border-b border-neutral-200/60  dark:border-neutral-800/80">
                        <button
                          type="button"
                          onClick={() => toggleQuestionExpanded(question.id, isOpen)}
                          className="group flex w-full items-start gap-2 rounded-xl py-1.5 text-left transition-colors hover:bg-neutral-100/70 dark:hover:bg-neutral-800/40 sm:gap-3 sm:py-2"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500">
                              {question.groupName}
                            </p>
                            <p className="mt-1 text-[13px] font-semibold leading-snug text-neutral-900 dark:text-neutral-100">
                              {question.question}
                            </p>
                            {question.hint ? (
                              <p className="mt-1 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                                {question.hint}
                              </p>
                            ) : null}
                            {selected ? (
                              <motion.p
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 text-[12px] font-medium text-neutral-600 dark:text-neutral-300"
                              >
                                <span className="text-neutral-400 dark:text-neutral-500">Đã chọn:</span>{" "}
                                {selected.label}
                              </motion.p>
                            ) : null}
                          </div>
                          <motion.span
                            className="mt-0.5 shrink-0 text-neutral-400 dark:text-neutral-500"
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.22, ease: easeUi }}
                          >
                            <ChevronDown className="size-5" aria-hidden />
                          </motion.span>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen ? (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.28, ease: easeUi }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-col gap-1.5 overflow-x-hidden pt-3 sm:gap-2">
                                {question.options.map((opt, optIdx) => {
                                  const active = answers[question.id] === opt.value;
                                  return (
                                    <motion.button
                                      key={opt.id}
                                      type="button"
                                      initial={{ opacity: 0, y: 8 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: optIdx * 0.035, duration: 0.22, ease: easeUi }}
                                      whileTap={{ scale: 0.985 }}
                                      onClick={() => handleSelect(question, opt.value)}
                                      className={cn(
                                        "rounded-xl px-3.5 py-2.5 text-left text-[12px] font-medium transition-colors",
                                        active
                                          ? "text-white shadow-md"
                                          : "bg-neutral-100/90 text-neutral-800 hover:bg-neutral-200/90 dark:bg-neutral-800/70 dark:text-neutral-100 dark:hover:bg-neutral-800",
                                      )}
                                      style={
                                        active
                                          ? {
                                              backgroundColor: BRAND,
                                              boxShadow: `0 4px 14px -2px ${BRAND}66`,
                                            }
                                          : undefined
                                      }
                                    >
                                      {opt.label}
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          ) : null}

          {phase === "analyzing" || phase === "applying" ? (
            <motion.div
              key="wait"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: easeUi }}
              className="flex min-h-[200px] flex-col items-center justify-center gap-4 py-10 text-center sm:min-h-[240px] sm:py-12"
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full bg-red-500/15"
                  animate={{ scale: [1, 1.35, 1], opacity: [0.45, 0, 0.45] }}
                  transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
                <div
                  className="relative flex size-14 items-center justify-center rounded-2xl text-white shadow-lg sm:size-16"
                  style={{ backgroundColor: BRAND }}
                >
                  <Loader2 className="size-7 animate-spin sm:size-8" aria-hidden />
                </div>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-neutral-900 dark:text-neutral-100">
                  {phase === "analyzing" ? "Đang phân tích với AI…" : "Đang áp dụng theo dõi…"}
                </p>
                <p className="mt-1 text-[12px] text-neutral-500 dark:text-neutral-400">
                  Quá trình có thể mất vài giây.
                </p>
              </div>
            </motion.div>
          ) : null}

          {phase === "result" && recommendation ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: easeUi }}
              className="space-y-8 pb-2"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                    tierBadge(recommendation.confidenceTier),
                  )}
                >
                  {tierLabelVi(recommendation.confidenceTier)}
                </span>
                {recommendation.analysisPhase ? (
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {recommendation.analysisPhase === "personalized" ? "Cá nhân hóa" : "Theo chuẩn NSX"}
                  </span>
                ) : null}
              </div>

              {recommendation.needsImmediateAttention ? (
                <p className="flex gap-2 border-l-[3px] border-amber-500/80 pl-3 text-[13px] leading-snug text-amber-950 dark:border-amber-500/60 dark:text-amber-100/95">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                  <span>Nên xem xét sớm — mốc dự kiến nằm trong bảng bên dưới.</span>
                </p>
              ) : null}

              <section className="space-y-3">
                <div>
                  <h3 className="text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    Mốc theo dõi
                  </h3>
                  <p className="mt-1 max-w-lg text-[12px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                    Chọn một dòng. Odo và ngày lưu vào nhắc nhở đúng với lựa chọn của bạn.
                  </p>
                </div>

                <div className="grid grid-cols-1 divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  {(
                    [
                      {
                        id: "earliest" as const,
                        title: "Sớm nhất",
                        hint: "Dùng xe nhiều, muốn an toàn hơn.",
                        disabled: typeof recommendation.earliestNextOdometer !== "number",
                      },
                      {
                        id: "predicted" as const,
                        title: "Gợi ý cơ bản",
                        hint: "Cân bằng — mốc đề xuất.",
                        disabled: false,
                      },
                      {
                        id: "latest" as const,
                        title: "Muộn nhất",
                        hint: "Dùng xe ít, lùi mốc thay.",
                        disabled: typeof recommendation.latestNextOdometer !== "number",
                      },
                    ] as const
                  ).map((opt) => {
                    const { odometer, date } = pickMilestoneOdoDate(recommendation, opt.id);
                    const selected = milestoneChoice === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={opt.disabled}
                        onClick={() => setMilestoneChoice(opt.id)}
                        className={cn(
                          "relative flex w-full flex-col gap-2 px-1 py-4 text-left transition-colors duration-150 sm:min-h-[112px] sm:px-3 sm:py-5",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950",
                          opt.disabled && "cursor-not-allowed opacity-40",
                          !opt.disabled && selected && "bg-neutral-50 dark:bg-neutral-900/45",
                          !opt.disabled && !selected && "hover:bg-neutral-50/70 dark:hover:bg-neutral-900/25",
                        )}
                        aria-pressed={selected}
                      >
                        {selected && !opt.disabled ? (
                          <span
                            className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full sm:top-4 sm:bottom-4"
                            style={{ backgroundColor: BRAND }}
                            aria-hidden
                          />
                        ) : null}
                        <div className="flex items-start justify-between gap-3 pl-2 sm:pl-3">
                          <div className="min-w-0">
                            <span className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
                              {opt.title}
                            </span>
                            <p className="mt-0.5 text-[11px] leading-snug text-neutral-500 dark:text-neutral-400">
                              {opt.hint}
                            </p>
                          </div>
                          {selected && !opt.disabled ? (
                            <Check
                              className="size-4 shrink-0 text-red-600 dark:text-red-400"
                              strokeWidth={2.5}
                              aria-hidden
                            />
                          ) : null}
                        </div>
                        <div className="pl-2 sm:pl-3">
                          <p
                            className={cn(
                              "text-lg font-semibold tabular-nums tracking-tight sm:text-xl",
                              selected && !opt.disabled
                                ? "text-red-700 dark:text-red-400"
                                : "text-neutral-900 dark:text-neutral-100",
                            )}
                          >
                            {formatKm(odometer)} km
                          </p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{formatDateVi(date)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
                <p className="text-[13px] leading-[1.65] text-neutral-700 dark:text-neutral-300">
                  {recommendation.reasoning}
                </p>
              </div>

              {recommendation.rangeNarrowsWhen && recommendation.rangeNarrowsWhen.length > 0 ? (
                <div className="border-l-2 border-neutral-200 pl-3 dark:border-neutral-700">
                  <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Thu hẹp dự đoán</p>
                  <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {recommendation.rangeNarrowsWhen.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div
        className={cn(
          "shrink-0 border-t border-neutral-200 py-3 dark:border-neutral-800",
          variant === "embedded" ? "px-0" : "px-3 sm:px-5",
        )}
      >
        {phase === "form" ? (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" size="sm" onClick={onDismiss}>
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!formComplete}
              className="font-semibold text-white sm:min-w-36"
              style={{ backgroundColor: BRAND }}
              onClick={runAnalyze}
            >
              Phân tích với AI
            </Button>
          </div>
        ) : null}
        {phase === "result" && recommendation ? (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setMilestoneChoice("predicted");
                setPhase("form");
              }}
            >
              Sửa câu trả lời
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isApplying}
              className="font-semibold text-white sm:min-w-40"
              style={{ backgroundColor: BRAND }}
              onClick={runApply}
            >
              {isApplying ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Đang lưu…
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4" aria-hidden />
                  Áp dụng theo dõi
                </span>
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
