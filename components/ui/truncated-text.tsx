'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TruncatedTextProps {
  text: string;
  maxWords?: number;
  className?: string;
  showButton?: boolean;
  buttonText?: {
    show: string;
    hide: string;
  };
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
}

export function TruncatedText({
  text,
  maxWords = 50,
  className,
  showButton = true,
  buttonText = {
    show: 'Xem thêm',
    hide: 'Thu gọn',
  },
  as = 'span',
}: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Split text into words
  const words = text.trim().split(/\s+/);
  const shouldTruncate = words.length > maxWords;
  const displayWords = isExpanded ? words : words.slice(0, maxWords);
  const displayText = displayWords.join(' ');

  const Element = as;

  if (!shouldTruncate) {
    return <Element className={className}>{text}</Element>;
  }

  return (
    <Element className={cn('transition-all duration-300', className)}>
      <span className="inline-flex items-start gap-1">
        <span
          className={cn(
            'transition-all duration-300',
            !isExpanded && 'line-clamp-1 overflow-hidden',
            isExpanded && 'whitespace-normal'
          )}
        >
          {displayText}
        </span>
        {showButton && shouldTruncate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center h-auto p-0 text-xs text-muted-foreground hover:text-foreground font-normal flex-shrink-0 leading-none"
          >
            {isExpanded ? (
              <>
                {buttonText.hide}
                <ChevronUp className="ml-1 h-3 w-3" />
              </>
            ) : (
              <>
                {buttonText.show}
                <ChevronDown className="ml-1 h-3 w-3" />
              </>
            )}
          </Button>
        )}
      </span>
    </Element>
  );
}
