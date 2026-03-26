/**
 * Reminder Level Configuration
 */

import { AlertTriangle, AlertCircle, Clock, CheckCircle2, Zap, type LucideIcon } from "lucide-react";
import { ReminderLevel } from "../api/services/fetchTrackingReminder";

export const REMINDER_LEVEL_CONFIG: Record<ReminderLevel, ReminderLevelConfig> = {
  Warning: {
    label: "Warning",
    labelVi: "Cảnh báo",
    description: "Cần lưu ý và lên kế hoạch bảo dưỡng",
    bgGradient: "from-amber-600 via-orange-500 to-yellow-600",
    bgSolid: "bg-orange-600",
    bgLight: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-300",
    shadowColor: "shadow-orange-600/20",
    hexColor: "#ea580c",
    hexColorLight: "#fff7ed",
    hexBorderColor: "#fdba74",
    badgeBg: "bg-orange-50",
    badgeText: "text-orange-800",
    badgeBorder: "border-orange-300",
    Icon: AlertCircle,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-700",
    importance: "Cảnh báo - Nên xử lý trong thời gian tới",
    importanceColor: "text-orange-700",
    priority: 2,
  },

  Critical: {
    label: "Critical",
    labelVi: "Khẩn cấp",
    description: "Cần xử lý ngay lập tức để tránh hư hỏng nghiêm trọng",
    bgGradient: "from-rose-600 via-red-500 to-orange-600",
    bgSolid: "bg-red-600",
    bgLight: "bg-rose-50",
    textColor: "text-red-700",
    borderColor: "border-red-300",
    shadowColor: "shadow-red-600/20",
    hexColor: "#dc2626",
    hexColorLight: "#fff1f2",
    hexBorderColor: "#fca5a5",
    badgeBg: "bg-red-50",
    badgeText: "text-red-800",
    badgeBorder: "border-red-300",
    Icon: AlertTriangle,
    iconBg: "bg-red-50",
    iconColor: "text-red-700",
    importance: "Rất quan trọng - Không nên trì hoãn",
    importanceColor: "text-red-700",
    priority: 1,
  },

  High: {
    label: "High",
    labelVi: "Cao",
    description: "Cần xử lý sớm để đảm bảo an toàn",
    bgGradient: "from-amber-600 via-orange-500 to-yellow-600",
    bgSolid: "bg-orange-600",
    bgLight: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-300",
    shadowColor: "shadow-orange-600/20",
    hexColor: "#ea580c",
    hexColorLight: "#fff7ed",
    hexBorderColor: "#fdba74",
    badgeBg: "bg-orange-50",
    badgeText: "text-orange-800",
    badgeBorder: "border-orange-300",
    Icon: AlertCircle,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-700",
    importance: "Quan trọng - Nên xử lý sớm",
    importanceColor: "text-orange-700",
    priority: 2,
  },

  Medium: {
    label: "Medium",
    labelVi: "Trung bình",
    description: "Nên xử lý trong thời gian tới",
    bgGradient: "from-yellow-500 via-amber-500 to-yellow-600",
    bgSolid: "bg-yellow-600",
    bgLight: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-300",
    shadowColor: "shadow-yellow-600/20",
    hexColor: "#ca8a04",
    hexColorLight: "#fefce8",
    hexBorderColor: "#fde047",
    badgeBg: "bg-yellow-50",
    badgeText: "text-yellow-800",
    badgeBorder: "border-yellow-300",
    Icon: Clock,
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-700",
    importance: "Trung bình - Lên kế hoạch xử lý",
    importanceColor: "text-yellow-700",
    priority: 3,
  },

  Low: {
    label: "Low",
    labelVi: "Thấp",
    description: "Có thể theo dõi và xử lý khi thuận tiện",
    bgGradient: "from-sky-500 via-blue-500 to-indigo-500",
    bgSolid: "bg-blue-600",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-300",
    shadowColor: "shadow-blue-600/20",
    hexColor: "#2563eb",
    hexColorLight: "#eff6ff",
    hexBorderColor: "#93c5fd",
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-800",
    badgeBorder: "border-blue-300",
    Icon: Zap,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-700",
    importance: "Thấp - Theo dõi định kỳ",
    importanceColor: "text-blue-700",
    priority: 4,
  },

  Normal: {
    label: "Normal",
    labelVi: "Bình thường",
    description: "Hoạt động bình thường, theo dõi định kỳ",
    bgGradient: "from-teal-600 via-emerald-500 to-green-600",
    bgSolid: "bg-emerald-600",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-300",
    shadowColor: "shadow-emerald-600/20",
    hexColor: "#059669",
    hexColorLight: "#ecfdf5",
    hexBorderColor: "#6ee7b7",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-800",
    badgeBorder: "border-emerald-300",
    Icon: CheckCircle2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
    importance: "Bình thường - Theo dõi định kỳ",
    importanceColor: "text-emerald-700",
    priority: 5,
  },
};

export interface ReminderLevelConfig {
  // Display
  label: string;
  labelVi: string;
  description: string;

  // Colors - Tailwind classes
  bgGradient: string;
  bgSolid: string;
  bgLight: string;
  textColor: string;
  borderColor: string;
  shadowColor: string;

  // Hex colors for SVG/Canvas
  hexColor: string;
  hexColorLight: string;
  hexBorderColor: string;

  // Badge
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;

  // Icon
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;

  // Importance
  importance: string;
  importanceColor: string;
  priority: number;
}

// ==================== Helper Functions ====================

export function getReminderLevelConfig(level: string): ReminderLevelConfig {
  return REMINDER_LEVEL_CONFIG[level as ReminderLevel] || REMINDER_LEVEL_CONFIG.Normal;
}

export function getReminderLevelsByPriority(): ReminderLevel[] {
  return (Object.keys(REMINDER_LEVEL_CONFIG) as ReminderLevel[]).sort(
    (a, b) => REMINDER_LEVEL_CONFIG[a].priority - REMINDER_LEVEL_CONFIG[b].priority,
  );
}

export function isUrgentLevel(level: string): boolean {
  return level === "Critical" || level === "High" || level === "Warning";
}

export function getLevelBadgeClasses(level: string): string {
  const config = getReminderLevelConfig(level);
  return `${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`;
}

export function getLevelIcon(level: string): LucideIcon {
  return getReminderLevelConfig(level).Icon;
}

export default REMINDER_LEVEL_CONFIG;

// Re-export types for convenience
