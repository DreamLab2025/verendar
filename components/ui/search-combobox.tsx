'use client';

import { Check, ChevronDown, Loader2 } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface SearchComboboxItem {
  value: string;
  label: string;
}

function normalizeSearch(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

export interface SearchComboboxProps {
  id?: string;
  items: SearchComboboxItem[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}

const DROPDOWN_GAP = 6;
const DROPDOWN_Z = 200;

export function SearchCombobox({
  id,
  items,
  value,
  onValueChange,
  placeholder = 'Chọn…',
  searchPlaceholder = 'Tìm kiếm…',
  emptyText = 'Không có kết quả',
  isLoading = false,
  disabled = false,
  className,
  triggerClassName,
}: SearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = useMemo(() => items.find((i) => i.value === value)?.label, [items, value]);

  const filtered = useMemo(() => {
    const q = normalizeSearch(query);
    if (!q) return items;
    return items.filter((i) => normalizeSearch(i.label).includes(q));
  }, [items, query]);

  const updatePanelPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPanelPos({
      top: r.bottom + DROPDOWN_GAP,
      left: r.left,
      width: r.width,
    });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePanelPosition();
    const onScrollOrResize = () => updatePanelPosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const handleSelect = useCallback(
    (v: string) => {
      onValueChange(v);
      setOpen(false);
      setQuery('');
    },
    [onValueChange],
  );

  const panel =
    open && mounted ? (
      <div
        ref={panelRef}
        role="listbox"
        className="overflow-hidden rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-lg"
        style={{
          position: 'fixed',
          top: panelPos.top,
          left: panelPos.left,
          width: panelPos.width,
          zIndex: DROPDOWN_Z,
        }}
      >
        <div className="border-b border-border/60 p-2">
          <Input
            ref={searchInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 rounded-lg border-input bg-background text-base text-foreground"
          />
        </div>
        <ul className="max-h-52 overflow-y-auto overscroll-contain py-1">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyText}</li>
          ) : (
            filtered.map((item) => (
              <li key={item.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === item.value}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2.5 text-left text-base transition-colors hover:bg-muted/70 hover:text-foreground',
                    value === item.value && 'bg-muted/50 text-foreground',
                  )}
                  onClick={() => handleSelect(item.value)}
                >
                  <Check
                    className={cn('size-4 shrink-0', value === item.value ? 'opacity-100' : 'opacity-0')}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    ) : null;

  return (
    <div className={cn('w-full', className)}>
      <Button
        ref={triggerRef}
        id={id}
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled || isLoading}
        className={cn(
          'h-11 w-full justify-between rounded-xl border border-input bg-background px-3 text-base font-normal text-foreground shadow-none',
          'hover:bg-muted/50! hover:text-foreground!',
          triggerClassName,
        )}
        onClick={() => !disabled && !isLoading && setOpen((o) => !o)}
      >
        <span
          className={cn(
            'min-w-0 truncate text-base text-foreground',
            !selectedLabel && 'text-muted-foreground',
          )}
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Đang tải…
            </span>
          ) : (
            (selectedLabel ?? placeholder)
          )}
        </span>
        <ChevronDown className="ml-2 size-4.5 shrink-0 text-foreground/60" aria-hidden />
      </Button>
      {mounted && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
