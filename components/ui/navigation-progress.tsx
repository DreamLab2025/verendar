'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type NavigationProgressProps = {
  isNavigating: boolean;
  progress: number;
  className?: string;
};

export function NavigationProgress({ isNavigating, progress, className }: NavigationProgressProps) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed left-0 top-0 z-[100] h-1 w-full overflow-hidden',
        !isNavigating && 'hidden',
        className
      )}
    >
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 transition-all duration-200"
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      />
    </div>
  );
}

type NavigationProgressAdvancedProps = {
  isNavigating: boolean;
  className?: string;
};

export function NavigationProgressAdvanced({
  isNavigating,
  className,
}: NavigationProgressAdvancedProps) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!isNavigating) {
      setProgress(100);
      const timeoutId = setTimeout(() => setProgress(0), 180);
      return () => clearTimeout(timeoutId);
    }

    setProgress(12);
    const intervalId = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        return prev + Math.max(1, (92 - prev) * 0.08);
      });
    }, 120);

    return () => clearInterval(intervalId);
  }, [isNavigating]);

  return (
    <div
      className={cn(
        'pointer-events-none fixed left-0 top-0 z-[100] h-1 w-full overflow-hidden',
        progress <= 0 && 'hidden',
        className
      )}
    >
      <div
        className="relative h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-200"
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      >
        <div className="absolute inset-0 animate-pulse bg-white/30" />
      </div>
    </div>
  );
}
