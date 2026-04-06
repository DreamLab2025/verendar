/**
 * Radix Select portal (listbox/viewport/popper) render ra `document.body` — nằm ngoài
 * `DialogContent`. Cần gọi `preventDefault()` trên `onPointerDownOutside` / `onInteractOutside`
 * của Dialog để không đóng dialog khi bấm vào dropdown.
 */
export function isRadixSelectPortalTarget(node: EventTarget | null): boolean {
  if (!(node instanceof Element)) return false;
  return Boolean(
    node.closest("[data-radix-select-viewport]") ||
      node.closest('[role="listbox"]') ||
      node.closest("[data-radix-popper-content-wrapper]"),
  );
}
