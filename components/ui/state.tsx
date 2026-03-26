'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  detail?: string;
  onRetry?: () => void;
}

function ErrorState({ className, message, detail, onRetry, ...props }: ErrorStateProps) {
  return (
    <div
      className={cn('min-h-screen bg-gray-50 flex items-center justify-center', className)}
      {...props}
    >
      <Card className="max-w-md mx-auto text-center shadow-md">
        <CardContent className="p-8">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">{message || 'Có lỗi xảy ra'}</h2>
          {detail && <p className="text-gray-600 mb-2">{detail}</p>}
          <p className="text-gray-600 mb-6">Không thể tải dữ liệu. Vui lòng thử lại.</p>
          <div className="flex gap-3 justify-center">
            {onRetry && <Button onClick={onRetry}>Thử lại</Button>}
            <Button variant="outline" asChild>
              <Link href="/">Về trang chủ</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('min-h-screen bg-gray-50 flex items-center justify-center', className)}
      {...props}
    >
      <Card className="max-w-sm w-full mx-auto text-center shadow-md">
        <CardContent className="p-8">
          <div className="text-gray-400 text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Chua co du lieu xe ca nhan</h2>
          <p className="text-gray-600 mb-6">
            Hay quay ve Verendar de them xe, theo doi lich bao tri va nhac thay phu tung.
          </p>
          <Button asChild className="w-full">
            <Link href="/my-vehicles">Ve Verendar</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSkeleton({
  className,
  propertyCount = 3,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { propertyCount?: number }) {
  return (
    <div className={cn('min-h-screen bg-gray-50', className)} {...props}>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(propertyCount)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-4">
                <Skeleton className="h-40 w-full rounded" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export { ErrorState, EmptyState, LoadingSkeleton };
