'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { animate, motion, useDragControls, useMotionValue } from 'framer-motion';
import { X } from 'lucide-react';

import {
  BOTTOM_SHEET_REQUEST_CLOSE_EVENT,
  IOS_SHEET_ROOT_CLASS,
  requestCloseBottomSheet,
  SHEET_CLOSE,
  SHEET_OPEN,
  SHEET_SNAP_BACK,
} from '@/lib/ui/bottom-sheet-motion';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const SHEET_MQ = '(max-width: 767px)';

function subscribeSheetMq(onChange: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia(SHEET_MQ);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function getSheetMqSnapshot() {
  return typeof window !== 'undefined' && window.matchMedia(SHEET_MQ).matches;
}

function useIsMobileSheet() {
  return React.useSyncExternalStore(subscribeSheetMq, getSheetMqSnapshot, () => false);
}

type BottomSheetChrome = {
  requestClose: () => void;
  startDrag: (e: React.PointerEvent) => void;
};

const BottomSheetChromeContext = React.createContext<BottomSheetChrome | null>(null);

/** Chỉ trong `DialogContent` variant `bottomSheet` */
export function useBottomSheetChrome(): BottomSheetChrome {
  const ctx = React.useContext(BottomSheetChromeContext);
  if (!ctx) {
    throw new Error('useBottomSheetChrome chỉ dùng bên trong DialogContent variant="bottomSheet".');
  }
  return ctx;
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

type BaseDialogContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
  'open' | 'onOpenChange'
> & {
  showCloseButton?: boolean;
};

type DefaultDialogContentProps = BaseDialogContentProps & {
  variant?: 'default' | undefined;
};

type BottomSheetDialogContentProps = BaseDialogContentProps & {
  variant: 'bottomSheet';
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export type DialogContentProps = DefaultDialogContentProps | BottomSheetDialogContentProps;

const dialogContentDefault =
  'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg';

/** Desktop: vỏ Radix trong suốt — một khối trắng duy nhất ở BottomSheetSurface (tránh lồng bg/p-6). */
const dialogContentBottomSheetShell = cn(
  IOS_SHEET_ROOT_CLASS,
  'fixed z-50 flex w-full flex-col gap-0 bg-transparent p-0 shadow-none duration-200',
  'max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0 max-md:overflow-visible max-md:border-0',
  'md:data-[state=open]:animate-in md:data-[state=closed]:animate-out md:data-[state=closed]:fade-out-0 md:data-[state=open]:fade-in-0',
  'md:left-[50%] md:top-[50%] md:max-h-[min(92dvh,920px)] md:max-w-lg md:translate-x-[-50%] md:translate-y-[-50%] md:overflow-visible md:gap-0 md:border-0 md:bg-transparent md:p-0 md:shadow-none',
  'md:data-[state=open]:zoom-in-95 md:data-[state=closed]:zoom-out-95',
  'md:data-[state=open]:slide-in-from-left-1/2 md:data-[state=open]:slide-in-from-top-[48%]',
  'md:data-[state=closed]:slide-out-to-left-1/2 md:data-[state=closed]:slide-out-to-top-[48%]'
);

function BottomSheetSurface({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const isMobile = useIsMobileSheet();
  const sheetY = useMotionValue(0);
  const dragControls = useDragControls();
  const closingRef = React.useRef(false);
  const onOpenChangeRef = React.useRef(onOpenChange);
  React.useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  const closeWithAnimation = React.useCallback(() => {
    if (closingRef.current) return;
    if (!isMobile) {
      onOpenChangeRef.current(false);
      return;
    }
    if (typeof window === 'undefined') return;
    closingRef.current = true;
    const el = document.activeElement;
    if (el instanceof HTMLElement) el.blur();
    const targetY = window.innerHeight;
    requestAnimationFrame(() => {
      animate(sheetY, targetY, {
        ...SHEET_CLOSE,
        onComplete: () => {
          onOpenChangeRef.current(false);
          closingRef.current = false;
        },
      });
    });
  }, [isMobile, sheetY]);

  const requestClose = React.useCallback(() => {
    closeWithAnimation();
  }, [closeWithAnimation]);

  const startDrag = React.useCallback(
    (e: React.PointerEvent) => {
      dragControls.start(e);
    },
    [dragControls]
  );

  React.useLayoutEffect(() => {
    if (!open || !isMobile) return;
    closingRef.current = false;
    const h = window.innerHeight;
    sheetY.set(h);
    const raf = requestAnimationFrame(() => {
      animate(sheetY, 0, SHEET_OPEN);
    });
    return () => cancelAnimationFrame(raf);
  }, [open, isMobile, sheetY]);

  React.useEffect(() => {
    if (!open) {
      sheetY.set(0);
      closingRef.current = false;
    }
  }, [open, sheetY]);

  const onDragEnd = React.useCallback(
    (_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
      if (!isMobile) return;
      const dismiss = info.offset.y > 72 || info.velocity.y > 520;
      if (dismiss) {
        closeWithAnimation();
      } else {
        animate(sheetY, 0, SHEET_SNAP_BACK);
      }
    },
    [isMobile, sheetY, closeWithAnimation]
  );

  const chrome = React.useMemo(
    () => ({
      requestClose,
      startDrag,
    }),
    [requestClose, startDrag]
  );

  if (!isMobile) {
    return (
      <BottomSheetChromeContext.Provider value={chrome}>
        <div className="relative flex max-h-[min(92dvh,920px)] w-full flex-col overflow-hidden rounded-lg border bg-background p-0 shadow-lg">
          {children}
        </div>
      </BottomSheetChromeContext.Provider>
    );
  }

  return (
    <BottomSheetChromeContext.Provider value={chrome}>
      <motion.div
        className={cn(
          'flex max-h-[min(92dvh,920px)] w-full flex-col overflow-hidden rounded-t-[1.25rem] border-0 bg-background shadow-xl',
          'transform-gpu will-change-transform backface-hidden'
        )}
        style={{ y: sheetY }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.2 }}
        dragTransition={{ bounceStiffness: 520, bounceDamping: 38 }}
        onDragEnd={onDragEnd}
      >
        {children}
      </motion.div>
    </BottomSheetChromeContext.Provider>
  );
}

function BottomSheetSurfaceWithCloseBridge({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const closeFnRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    const onReq = () => {
      closeFnRef.current?.();
    };
    window.addEventListener(BOTTOM_SHEET_REQUEST_CLOSE_EVENT, onReq);
    return () => window.removeEventListener(BOTTOM_SHEET_REQUEST_CLOSE_EVENT, onReq);
  }, []);

  return (
    <BottomSheetSurface open={open} onOpenChange={onOpenChange}>
      <RegisterCloseFn closeFnRef={closeFnRef} />
      {children}
    </BottomSheetSurface>
  );
}

function RegisterCloseFn({ closeFnRef }: { closeFnRef: React.MutableRefObject<(() => void) | null> }) {
  const ctx = React.useContext(BottomSheetChromeContext);
  React.useEffect(() => {
    if (!ctx) return;
    closeFnRef.current = ctx.requestClose;
    return () => {
      closeFnRef.current = null;
    };
  }, [ctx, closeFnRef]);
  return null;
}

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
  (props, ref) => {
    const isMobileSheet = useIsMobileSheet();
    const {
      className,
      children,
      showCloseButton = true,
      variant = 'default',
      ...rest
    } = props;

    const showBuiltInClose = variant !== 'bottomSheet' && showCloseButton;

    if (variant === 'bottomSheet') {
      const { open: sheetOpen, onOpenChange: sheetOnOpenChange, ...contentProps } = rest as unknown as Omit<
        BottomSheetDialogContentProps,
        'variant' | 'className' | 'children' | 'showCloseButton'
      >;

      const onPointerDownOutside: React.ComponentPropsWithoutRef<
        typeof DialogPrimitive.Content
      >['onPointerDownOutside'] = (e) => {
        contentProps.onPointerDownOutside?.(e);
        if (e.defaultPrevented) return;
        if (isMobileSheet && sheetOpen) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent(BOTTOM_SHEET_REQUEST_CLOSE_EVENT));
        }
      };

      const onEscapeKeyDown: React.ComponentPropsWithoutRef<
        typeof DialogPrimitive.Content
      >['onEscapeKeyDown'] = (e) => {
        contentProps.onEscapeKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (isMobileSheet && sheetOpen) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent(BOTTOM_SHEET_REQUEST_CLOSE_EVENT));
        }
      };

      return (
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            ref={ref}
            className={cn(dialogContentBottomSheetShell, className)}
            onPointerDownOutside={onPointerDownOutside}
            onEscapeKeyDown={onEscapeKeyDown}
            {...contentProps}
          >
            <BottomSheetSurfaceWithCloseBridge open={sheetOpen} onOpenChange={sheetOnOpenChange}>
              {children}
            </BottomSheetSurfaceWithCloseBridge>
          </DialogPrimitive.Content>
        </DialogPortal>
      );
    }

    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content ref={ref} className={cn(dialogContentDefault, className)} {...rest}>
          {children}
          {showBuiltInClose ? (
            <DialogPrimitive.Close className="absolute right-2 top-2 inline-flex size-11 items-center justify-center rounded-xl opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none active:bg-accent/80 data-[state=open]:bg-accent data-[state=open]:text-muted-foreground sm:right-4 sm:top-4 sm:size-9 sm:rounded-sm">
              <X className="size-5 sm:size-4" />
              <span className="sr-only">Đóng</span>
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  }
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogSheetHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const ctx = React.useContext(BottomSheetChromeContext);
  const startDrag = ctx?.startDrag ?? (() => {});

  return (
    <div className={cn('flex shrink-0 flex-col border-b border-border/60 bg-background', className)} {...props}>
      <div
        className="flex min-h-11 shrink-0 cursor-grab touch-none flex-col items-center justify-center active:cursor-grabbing md:hidden"
        onPointerDown={(e) => {
          e.preventDefault();
          startDrag(e);
        }}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Kéo xuống để đóng"
      >
        <span className="pointer-events-none h-[5px] w-[36px] rounded-full bg-black/45 dark:bg-white/40" />
      </div>
      <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-1 sm:px-6 md:min-h-0 md:pt-4">
        <div className="min-w-0 flex-1 space-y-1.5 text-left">{children}</div>
        <button
          type="button"
          onClick={() => requestCloseBottomSheet()}
          className="inline-flex shrink-0 size-11 items-center justify-center rounded-xl opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none active:bg-accent/80 sm:size-9 sm:rounded-sm"
          aria-label="Đóng"
        >
          <X className="size-5 sm:size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
};
DialogSheetHeader.displayName = 'DialogSheetHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogSheetHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
