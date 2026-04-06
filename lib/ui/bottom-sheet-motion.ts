import type { Transition } from "framer-motion";

/** Đồng bộ với `components/ui/dialog.tsx` — đóng sheet có animation (mobile) */
export const BOTTOM_SHEET_REQUEST_CLOSE_EVENT = "ver-dialog-sheet-request-close";

export function requestCloseBottomSheet(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BOTTOM_SHEET_REQUEST_CLOSE_EVENT));
}

/**
 * Gắn vào `DialogContent` (variant bottomSheet) — tắt CSS animation vì dùng Framer Motion.
 * `AlertDialogContent` vẫn có thể dùng {@link BOTTOM_SHEET_CONTENT_CLASS} + keyframes CSS.
 */
export const IOS_SHEET_ROOT_CLASS = "ver-ios-sheet-root";

/** Bottom sheet (mobile) khi dùng CSS keyframes thay vì Framer — vd. AlertDialog. */
export const BOTTOM_SHEET_CONTENT_CLASS = "ver-bottom-sheet";

export const bottomSheetMotion = {
  durationMs: { open: 450, close: 320 },
  easing: {
    open: "cubic-bezier(0.22, 1, 0.36, 1)",
    close: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

/** Mở sheet — tween, ít nảy hơn spring */
export const SHEET_OPEN: Transition = {
  type: "tween",
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1],
};

export const SHEET_CLOSE: Transition = {
  type: "tween",
  duration: 0.32,
  ease: [0.4, 0, 0.2, 1],
};

export const SHEET_SNAP_BACK: Transition = {
  type: "tween",
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
};
