import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CatalogBookingLine, CatalogDetailKind } from "@/lib/types/garage-catalog-booking";

/** Dòng trong giỏ — gắn chi nhánh (một booking chỉ một GarageBranchId). */
export type BookingCartLine = CatalogBookingLine & { branchId: string };

export function bookingCartLineKey(l: Pick<BookingCartLine, "branchId" | "kind" | "catalogItemId">): string {
  return `${l.branchId}:${l.kind}:${l.catalogItemId}`;
}

export type AddLineResult = "added" | "duplicate" | "replaced-branch";

type BookingCartState = {
  lines: BookingCartLine[];
  /** Khóa `bookingCartLineKey` — mục được tick để «Tiếp tục đặt lịch». */
  selectedLineKeys: string[];
  addLine: (line: BookingCartLine) => AddLineResult;
  removeLine: (branchId: string, kind: CatalogDetailKind, catalogItemId: string) => void;
  clearBranch: (branchId: string) => void;
  clear: () => void;
  toggleLineKey: (key: string) => void;
  selectAllLineKeys: () => void;
  deselectAllLineKeys: () => void;
  /** Chỉ các dòng đang được chọn (để gửi API booking). */
  getSelectedLines: () => BookingCartLine[];
};

function syncKeysAfterLines(lines: BookingCartLine[], prevKeys: string[]): string[] {
  const valid = new Set(lines.map((l) => bookingCartLineKey(l)));
  return prevKeys.filter((k) => valid.has(k));
}

export const useBookingCartStore = create<BookingCartState>()(
  persist(
    (set, get) => ({
      lines: [],
      selectedLineKeys: [],
      addLine: (line) => {
        const { lines, selectedLineKeys } = get();
        const k = bookingCartLineKey(line);
        if (lines.some((x) => bookingCartLineKey(x) === k)) {
          return "duplicate";
        }
        if (lines.length > 0 && lines[0].branchId !== line.branchId) {
          set({
            lines: [line],
            selectedLineKeys: [k],
          });
          return "replaced-branch";
        }
        set({
          lines: [...lines, line],
          selectedLineKeys: selectedLineKeys.includes(k) ? selectedLineKeys : [...selectedLineKeys, k],
        });
        return "added";
      },
      removeLine: (branchId, kind, catalogItemId) =>
        set((s) => {
          const lines = s.lines.filter(
            (x) => !(x.branchId === branchId && x.kind === kind && x.catalogItemId === catalogItemId),
          );
          const k = bookingCartLineKey({ branchId, kind, catalogItemId });
          return {
            lines,
            selectedLineKeys: s.selectedLineKeys.filter((x) => x !== k),
          };
        }),
      clearBranch: (branchId) =>
        set((s) => {
          const lines = s.lines.filter((x) => x.branchId !== branchId);
          return {
            lines,
            selectedLineKeys: syncKeysAfterLines(lines, s.selectedLineKeys),
          };
        }),
      clear: () => set({ lines: [], selectedLineKeys: [] }),
      toggleLineKey: (key) =>
        set((s) => ({
          selectedLineKeys: s.selectedLineKeys.includes(key)
            ? s.selectedLineKeys.filter((x) => x !== key)
            : [...s.selectedLineKeys, key],
        })),
      selectAllLineKeys: () =>
        set((s) => ({
          selectedLineKeys: s.lines.map((l) => bookingCartLineKey(l)),
        })),
      deselectAllLineKeys: () => set({ selectedLineKeys: [] }),
      getSelectedLines: () => {
        const { lines, selectedLineKeys } = get();
        const setKeys = new Set(selectedLineKeys);
        return lines.filter((l) => setKeys.has(bookingCartLineKey(l)));
      },
    }),
    {
      name: "verendar-booking-cart",
      partialize: (s) => ({ lines: s.lines, selectedLineKeys: s.selectedLineKeys }),
      onRehydrateStorage: () => (state) => {
        if (!state?.lines) return;
        if (!Array.isArray(state.selectedLineKeys)) {
          state.selectedLineKeys = state.lines.map((l) => bookingCartLineKey(l));
        } else {
          state.selectedLineKeys = syncKeysAfterLines(state.lines, state.selectedLineKeys);
        }
      },
    },
  ),
);
