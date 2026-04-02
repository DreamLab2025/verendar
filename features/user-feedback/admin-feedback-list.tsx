"use client";

import { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useFeedbacks, useUpdateFeedbackStatus } from "@/hooks/useFeedback";
import { FeedbackCategory, FeedbackStatus } from "@/lib/api/services/fetchFeedback";
import { FeedbackDialog } from "@/components/dialog/feedback/FeedbackDialog";
import { Eye, Filter, RefreshCcw, Search, MessageSquareX } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const CATEGORY_MAP: Record<string, string> = {
  [FeedbackCategory.General]: "Chung",
  "General": "Chung",
  [FeedbackCategory.Bug]: "Lỗi báo cáo",
  "Bug": "Lỗi báo cáo",
  [FeedbackCategory.Feature]: "Góp ý tính năng",
  "Feature": "Góp ý tính năng",
  [FeedbackCategory.UX]: "Trải nghiệm UX",
  "UX": "Trải nghiệm UX",
  [FeedbackCategory.Performance]: "Hiệu suất",
  "Performance": "Hiệu suất",
  [FeedbackCategory.Other]: "Khác",
  "Other": "Khác",
};

export const STATUS_MAP: Record<FeedbackStatus, { label: string; colorClass: string }> = {
  [FeedbackStatus.Pending]: { label: "Chờ xử lý", colorClass: "bg-[#eab308] text-black font-semibold" },
  [FeedbackStatus.Reviewed]: { label: "Đã tiếp nhận", colorClass: "bg-[#2563eb] text-white font-semibold" },
  [FeedbackStatus.Resolved]: { label: "Đã xử lý", colorClass: "bg-[#10b981] text-white font-semibold" },
};

export function AdminFeedbackList() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { feedbacks: rawFeedbacks, isLoading, isError, metadata, refetch, isFetching } = useFeedbacks({
    pageNumber: page,
    pageSize,
  });

  // Client-side filtering logic
  const filteredFeedbacks = (rawFeedbacks || []).filter((fb) => {
    const matchesSearch = fb.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fb.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    // Status filter
    const matchesStatus = statusFilter === "all" || fb.status.toString() === statusFilter;

    // Category filter
    const matchesCategory = categoryFilter === "all" || fb.category.toString() === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const feedbacks = filteredFeedbacks;

  const selectedFeedback = feedbacks.find((f) => f.id === selectedFeedbackId) || null;

  const { mutate: updateStatus, isPending: isUpdating } = useUpdateFeedbackStatus();

  const handleStatusChange = (id: string, newStatus: string) => {
    updateStatus(
      { id, status: Number(newStatus) as FeedbackStatus },
      {
        onSuccess: () => {
          toast.success("Cập nhật trạng thái thành công");
        },
        onError: () => {
          toast.error("Cập nhật thất bại, vui lòng thử lại");
        },
      }
    );
  };

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground">Không thể tải danh sách phản hồi.</p>
        <Button onClick={() => refetch()} variant="outline">Thử lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Quản lý phản hồi</h2>
          <p className="text-sm text-muted-foreground mt-1">Theo dõi và xử lý các ý kiến đóng góp từ người dùng.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 gap-2 rounded-xl border-border/60 hover:bg-muted"
          >
            <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Toolbar / Filters */}
      {/* <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-3 rounded-2xl border border-border/40 shadow-sm">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-xl border border-border/50 shadow-sm min-w-[180px]">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo chủ đề, email..."
            className="text-sm bg-transparent border-0 focus:ring-0 w-full outline-none placeholder:text-muted-foreground/60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-fit min-w-[140px] h-9 rounded-xl border-border/50 bg-background shadow-sm text-sm">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Trạng thái" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {Object.entries(STATUS_MAP).map(([key, info]) => (
              <SelectItem key={key} value={key}>{info.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-fit min-w-[150px] h-9 rounded-xl border-border/50 bg-background shadow-sm text-sm">
            <SelectValue placeholder="Loại phản hồi" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Tất cả loại</SelectItem>
            {Object.entries(CATEGORY_MAP).map(([key, label]) => {
              const numericKey = parseInt(key, 10);
              if (isNaN(numericKey)) return null;
              return (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div> */}

      {/* Filter Results Summary */}
      {/* {(searchTerm || statusFilter !== "all" || categoryFilter !== "all") && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-muted-foreground">
            Tìm thấy <span className="font-semibold text-foreground">{feedbacks.length}</span> kết quả
            {searchTerm && <span> cho &quot;{searchTerm}&quot;</span>}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setCategoryFilter("all");
            }}
            className="h-8 text-xs hover:bg-muted font-medium text-primary"
          >
            Xóa tất cả bộ lọc
          </Button>
        </div>
      )} */}

      {isLoading ? (
        <FeedbackSkeleton />
      ) : !feedbacks || feedbacks.length === 0 ? (
        <div className="flex h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/40 bg-card/40 p-8 text-center shadow-sm">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted/50 mb-4 transition-transform hover:scale-110">
            <MessageSquareX className="size-7 text-muted-foreground/60" />
          </div>
          <div className="max-w-[260px] space-y-2">
            <h3 className="text-lg font-semibold tracking-tight">Chưa có phản hồi nào</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Hệ thống chưa ghi nhận bất kỳ dữ liệu phản hồi nào từ người dùng trong thời điểm này.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden rounded-xl border bg-card shadow-sm md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Thông tin liên hệ</TableHead>
                  <TableHead className="w-[140px]">Đánh giá</TableHead>
                  <TableHead className="w-[150px]">Trạng thái</TableHead>
                  <TableHead className="w-[100px] text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((fb) => (
                  <TableRow
                    key={fb.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedFeedbackId(fb.id)}
                  >
                    <TableCell className="whitespace-nowrap text-sm">
                      {dayjs(fb.createdAt).locale("vi").format("DD/MM/YYYY HH:mm")}
                    </TableCell>
                    <TableCell className="max-w-[250px] font-medium">
                      <p className="truncate" title={fb.subject}>{fb.subject}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-semibold rounded-full border border-primary/10 shadow-sm">
                        {CATEGORY_MAP[fb.category as unknown as FeedbackCategory] || fb.category || "Chưa phân loại"}
                      </Badge>
                    </TableCell>
                    <TableCell className="truncate max-w-[150px]" title={fb.contactEmail || fb.userId}>
                      {fb.contactEmail || "Không có Email"}
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {fb.rating ? (
                        <div className="flex items-center gap-2">
                          <div className="flex text-amber-500 text-xl gap-px">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < fb.rating! ? "text-amber-500 drop-shadow-sm" : "text-muted-foreground/30"}>★</span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <StatusSelect
                        value={fb.status.toString()}
                        onChange={(v) => handleStatusChange(fb.id, v)}
                        disabled={fb.status === "Resolved" || isUpdating}
                      />
                    </TableCell>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-muted"
                        onClick={() => setSelectedFeedbackId(fb.id)}
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="grid gap-4 md:hidden">
            {feedbacks.map((fb) => (
              <Card
                key={fb.id}
                className="overflow-hidden shadow-sm cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedFeedbackId(fb.id)}
              >
                <CardHeader className="p-4 pb-0 items-start">
                  <div className="flex w-full items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-base font-semibold leading-tight">{fb.subject}</CardTitle>
                    <Badge variant="secondary" className="shrink-0 px-2.5 py-0.5 text-xs font-semibold rounded-full border border-primary/10 shadow-sm">
                      {CATEGORY_MAP[fb.category as unknown as FeedbackCategory] || fb.category || "Chưa phân loại"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dayjs(fb.createdAt).locale("vi").format("DD/MM/YYYY HH:mm")}
                  </p>
                </CardHeader>
                <CardContent className="p-4 pt-3 pb-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs block mb-0.5">Liên hệ:</span>
                      <span className="font-medium truncate max-w-[130px] block" title={fb.contactEmail || "Trống"}>
                        {fb.contactEmail || "Ẩn danh"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs block mb-0.5">Rating:</span>
                      <span className="font-medium">{fb.rating ? `${fb.rating}/5 ⭐` : "Không có"}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 p-4 border-t flex flex-col items-start gap-2" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs font-medium text-muted-foreground">Trạng thái xử lý:</span>
                  <div className="w-full relative z-10">
                    <StatusSelect
                      value={fb.status.toString()}
                      onChange={(v) => handleStatusChange(fb.id, v)}
                      disabled={fb.status === "Resolved" || isUpdating}
                    />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {metadata && metadata.totalPages > 1 && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isUpdating}
              >
                Trang trước
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                {metadata.pageNumber} / {metadata.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(metadata.totalPages, p + 1))}
                disabled={page >= metadata.totalPages || isUpdating}
              >
                Trang sau
              </Button>
            </div>
          )}
        </>
      )}

      <FeedbackDialog
        open={!!selectedFeedbackId}
        onOpenChange={(open) => !open && setSelectedFeedbackId(null)}
        feedback={selectedFeedback}
      />
    </div>
  );
}

export function StatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const parsedStatus = isNaN(Number(value))
    ? (FeedbackStatus[value as keyof typeof FeedbackStatus] ?? 0)
    : Number(value);
  const currentInfo = STATUS_MAP[parsedStatus as FeedbackStatus] || { label: String(value) || "Không xác định", colorClass: "bg-muted text-muted-foreground" };

  return (
    <Select value={parsedStatus.toString()} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={`inline-flex h-8 w-fit items-center rounded-full border-0 px-3 py-1 shadow-sm transition-all focus:ring-2 focus:ring-primary/20 ${currentInfo.colorClass}`}>
        <SelectValue>
          <span className="text-[13px] font-medium tracking-wide mr-1.5 drop-shadow-sm">
            {currentInfo.label}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-xl py-1.5 shadow-md">
        {Object.entries(STATUS_MAP).map(([key, info]) => (
          <SelectItem key={key} value={key} className="rounded-lg pl-8 pr-3 text-sm font-medium my-0.5 mx-1 focus:bg-muted focus:text-foreground data-highlighted:bg-muted cursor-pointer">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold drop-shadow-sm ${info.colorClass}`}>
              {info.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function FeedbackSkeleton() {
  return (
    <div className="space-y-4">
      {/* Desktop Skeleton */}
      <div className="hidden rounded-xl border bg-card shadow-sm md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                {[1, 2, 3, 4, 5, 6].map((cell) => (
                  <TableCell key={cell}>
                    <Skeleton className={`h-4 ${cell === 2 ? 'w-3/4' : 'w-full'} max-w-[120px]`} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Skeleton */}
      <div className="grid gap-4 md:hidden">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="p-4 pb-2">
              <Skeleton className="h-5 w-[80%] mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
            <CardFooter className="p-4 border-t gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
