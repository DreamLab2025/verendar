'use client';

import * as React from 'react';
import Link, { type LinkProps } from 'next/link';

type NavigationLinkProps = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    showProgress?: boolean;
    progressDelay?: number;
  };

type ProgressType = 'immediate' | 'delayed' | 'on-hover';

type EnhancedNavigationLinkProps = NavigationLinkProps & {
  onNavigationStart?: () => void;
  onNavigationComplete?: () => void;
  progressType?: ProgressType;
};

function dispatchProgressStart() {
  window.dispatchEvent(new CustomEvent('navigation-progress:start'));
}

function dispatchProgressDone() {
  window.dispatchEvent(new CustomEvent('navigation-progress:done'));
}

export function NavigationLink({
  href,
  showProgress = true,
  progressDelay = 0,
  onClick,
  children,
  ...props
}: NavigationLinkProps) {
  return (
    <Link
      href={href}
      onClick={(event) => {
        if (showProgress) {
          if (progressDelay > 0) {
            window.setTimeout(dispatchProgressStart, progressDelay);
          } else {
            dispatchProgressStart();
          }
        }
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </Link>
  );
}

export function EnhancedNavigationLink({
  href,
  showProgress = true,
  progressDelay = 0,
  progressType = 'immediate',
  onNavigationStart,
  onNavigationComplete,
  onClick,
  onMouseEnter,
  children,
  ...props
}: EnhancedNavigationLinkProps) {
  return (
    <Link
      href={href}
      onMouseEnter={(event) => {
        if (showProgress && progressType === 'on-hover') {
          dispatchProgressStart();
          window.setTimeout(dispatchProgressDone, 180);
        }
        onMouseEnter?.(event);
      }}
      onClick={(event) => {
        if (showProgress) {
          onNavigationStart?.();
          if (progressType === 'delayed' && progressDelay > 0) {
            window.setTimeout(dispatchProgressStart, progressDelay);
          } else {
            dispatchProgressStart();
          }
          window.setTimeout(() => {
            dispatchProgressDone();
            onNavigationComplete?.();
          }, 380);
        }
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
