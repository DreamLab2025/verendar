"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Timeline({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="timeline" className={cn("relative", className)} {...props} />;
}

function TimelineList({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="timeline-list" className={cn("relative m-0 list-none p-0", className)} {...props} />;
}

/** Đường dọc nối các mốc — đặt trong Timeline, canh với TimelineDot */
function TimelineTrack({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-track"
      className={cn(
        "pointer-events-none absolute bottom-4 left-[7px] top-2 w-px bg-[repeating-linear-gradient(to_bottom,_#a3a3a3_0px,_#a3a3a3_4px,_transparent_4px,_transparent_8px)] dark:bg-[repeating-linear-gradient(to_bottom,_#525252_0px,_#525252_4px,_transparent_4px,_transparent_8px)]",
        className,
      )}
      aria-hidden
      {...props}
    />
  );
}

function TimelineItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="timeline-item"
      className={cn("relative flex items-start gap-0 pb-6 last:pb-0", className)}
      {...props}
    />
  );
}

function TimelineDot({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-dot"
      className={cn(
        "relative z-[2] mt-0.5 h-3 w-3 shrink-0 rounded-full border-2 border-white shadow-sm ring-1 ring-neutral-200/80 dark:border-neutral-950 dark:ring-neutral-700/80",
        className,
      )}
      style={style}
      {...props}
    />
  );
}

function TimelineIconRail({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="timeline-icon-rail" className={cn("flex w-4 shrink-0 justify-center", className)} {...props} />
  );
}

function TimelineContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-content"
      className={cn(
        "min-w-0 flex-1 rounded-lg border border-neutral-200/90 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-950",
        className,
      )}
      {...props}
    />
  );
}

function TimelineTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="timeline-title"
      className={cn("text-[13px] font-semibold leading-snug text-neutral-900 dark:text-neutral-100", className)}
      {...props}
    />
  );
}

function TimelineDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="timeline-description"
      className={cn("mt-1 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400", className)}
      {...props}
    />
  );
}

function TimelineMeta({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="timeline-meta"
      className={cn("mt-0.5 text-[10px] text-neutral-400 dark:text-neutral-500", className)}
      {...props}
    />
  );
}

export {
  Timeline,
  TimelineList,
  TimelineTrack,
  TimelineItem,
  TimelineIconRail,
  TimelineDot,
  TimelineContent,
  TimelineTitle,
  TimelineDescription,
  TimelineMeta,
};
