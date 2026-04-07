"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import {
  CalendarRange,
  ChevronRight,
  Filter,
  MailCheck,
  MessageSquare,
  RefreshCcw,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

import { useFeedbacks } from "@/hooks/useFeedback";
import { useIdentityOverviewStats, useUserGrowthChart } from "@/hooks/useIdentityStats";
import { useUsers } from "@/hooks/useUsers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

type GroupBy = "day" | "month";

const THEME_PRIMARY = "#cd2626";
const THEME_PRIMARY_FAINT = "rgba(205, 38, 38, 0.16)";
const THEME_GRID = "rgba(205, 38, 38, 0.12)";

const FEEDBACK_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xử lý",
  reviewed: "Đã tiếp nhận",
  resolved: "Đã xử lý",
};

const FEEDBACK_CATEGORY_LABELS: Record<string, string> = {
  general: "Chung",
  bug: "Bug",
  feature: "Tính năng",
  ux: "UX",
  performance: "Hiệu năng",
  other: "Khác",
};

function getDefaultRange() {
  const to = dayjs().format("YYYY-MM-DD");
  const from = dayjs().subtract(30, "day").format("YYYY-MM-DD");
  return { from, to };
}

function StatsCard({
  title,
  value,
  delta,
  hint,
  icon,
  trend,
}: {
  title: string;
  value: string;
  delta: string;
  hint?: string;
  icon: React.ReactNode;
  trend: number[];
}) {
  const trendData = useMemo<ChartData<"line">>(
    () => ({
      labels: trend.map((_, idx) => `p-${idx}`),
      datasets: [
        {
          label: title,
          data: trend,
          borderColor: THEME_PRIMARY,
          backgroundColor: THEME_PRIMARY_FAINT,
          fill: true,
          borderWidth: 2,
          tension: 0.45,
          pointRadius: 0,
        },
      ],
    }),
    [title, trend]
  );

  const trendOptions = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      scales: {
        x: { display: false },
        y: { display: false },
      },
      elements: {
        line: { capBezierPoints: true },
      },
      layout: {
        padding: 0,
      },
    }),
    []
  );

  return (
    <Card className="relative overflow-hidden rounded-2xl border-border/60 bg-card/80 backdrop-blur-xl shadow-sm transition-all hover:shadow-md hover:border-primary/30 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">{title}</CardDescription>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
            <Badge variant="secondary" className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400 border-0">
              {delta}
            </Badge>
          </div>
          {hint ? <p className="text-xs font-medium text-muted-foreground leading-none">{hint}</p> : null}
        </div>
        <div className="h-10 w-full pt-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <Line data={trendData} options={trendOptions} />
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="rounded-2xl border-border/60 bg-card/50 shadow-sm animate-pulse">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-3 w-36 rounded-md" />
              <Skeleton className="mt-2 h-10 w-full rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl xl:col-span-2 border-border/60 bg-card/50 shadow-sm animate-pulse">
          <CardHeader>
            <Skeleton className="h-5 w-48 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[280px] w-full rounded-xl" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60 bg-card/50 shadow-sm animate-pulse">
          <CardHeader>
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[280px] w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AdminDashboardContent() {
  const defaultRange = useMemo(() => getDefaultRange(), []);
  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);
  const [groupBy, setGroupBy] = useState<GroupBy>("day");

  const statsParams = useMemo(
    () => ({ from: fromDate, to: toDate }),
    [fromDate, toDate]
  );

  const chartParams = useMemo(
    () => ({ from: fromDate, to: toDate, groupBy }),
    [fromDate, toDate, groupBy]
  );

  const canLoadOverview = Boolean(fromDate && toDate);

  const {
    stats,
    isLoading: isOverviewLoading,
    isError: isOverviewError,
    error: overviewError,
    isFetching: isOverviewFetching,
    refetch: refetchOverview,
  } = useIdentityOverviewStats(statsParams, canLoadOverview);

  const canLoadChart = canLoadOverview && !isOverviewLoading && !isOverviewFetching;

  const {
    chartData,
    isLoading: isChartLoading,
    isError: isChartError,
    error: chartError,
    isFetching: isChartFetching,
    refetch: refetchChart,
  } = useUserGrowthChart(chartParams, canLoadChart);

  const {
    users,
    isLoading: isUsersLoading,
    isError: isUsersError,
    isFetching: isUsersFetching,
    refetch: refetchUsers,
  } = useUsers({
    PageNumber: 1,
    PageSize: 5,
    IsDescending: true,
  });

  const {
    feedbacks,
    isLoading: isFeedbacksLoading,
    isError: isFeedbacksError,
    isFetching: isFeedbacksFetching,
    refetch: refetchFeedbacks,
  } = useFeedbacks({
    pageNumber: 1,
    pageSize: 5,
  });

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => setIsMounted(true), 0);
  }, []);

  const isAnyFetching =
    isMounted && (isOverviewFetching || isChartFetching || isUsersFetching || isFeedbacksFetching);

  const handleRefresh = async () => {
    await refetchOverview();
    await refetchChart();
    await refetchUsers();
    await refetchFeedbacks();
  };

  const feedbackStatusBarData = useMemo<ChartData<"bar">>(() => {
    const statusData = stats?.feedback.byStatus;
    return {
      labels: ["pending", "reviewed", "resolved"].map(
        (status) => FEEDBACK_STATUS_LABELS[status]
      ),
      datasets: [
        {
          label: "Số lượng",
          data: [
            statusData?.pending ?? 0,
            statusData?.reviewed ?? 0,
            statusData?.resolved ?? 0,
          ],
          backgroundColor: ["#cd2626", "#b42323", "#a81f1f"],
          borderRadius: 8,
        },
      ],
    };
  }, [stats?.feedback.byStatus]);

  const feedbackStatusBarOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#6b7280",
          },
          grid: {
            color: THEME_GRID,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: "#6b7280",
          },
          grid: {
            color: THEME_GRID,
          },
        },
      },
    }),
    []
  );

  const feedbackCategoryBarData = useMemo<ChartData<"bar">>(() => {
    const categoryData = stats?.feedback.byCategory;
    const categoryKeys = ["general", "bug", "feature", "ux", "performance", "other"];

    return {
      labels: categoryKeys.map((key) => FEEDBACK_CATEGORY_LABELS[key]),
      datasets: [
        {
          label: "Phản hồi",
          data: categoryKeys.map((key) => {
            switch (key) {
              case "general":
                return categoryData?.general ?? 0;
              case "bug":
                return categoryData?.bug ?? 0;
              case "feature":
                return categoryData?.feature ?? 0;
              case "ux":
                return categoryData?.ux ?? 0;
              case "performance":
                return categoryData?.performance ?? 0;
              default:
                return categoryData?.other ?? 0;
            }
          }),
          backgroundColor: THEME_PRIMARY,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [stats?.feedback.byCategory]);

  const feedbackCategoryBarOptions = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: "#6b7280",
          },
          grid: {
            color: THEME_GRID,
          },
        },
        y: {
          ticks: {
            color: "#6b7280",
          },
          grid: {
            display: false,
          },
        },
      },
    }),
    []
  );

  const activityAreaData = useMemo<ChartData<"line">>(() => {
    const points = chartData?.points ?? [];
    return {
      labels: points.map((point) => {
        const date = dayjs(point.period);
        return groupBy === "day" ? date.format("DD/MM") : date.format("MM/YYYY");
      }),
      datasets: [
        {
          label: "Người dùng mới",
          data: points.map((point) => point.value),
          borderColor: THEME_PRIMARY,
          backgroundColor: THEME_PRIMARY_FAINT,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    };
  }, [chartData?.points, groupBy]);

  const activityAreaOptions = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#6b7280",
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#6b7280",
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 10,
          },
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: "#6b7280",
          },
          grid: {
            color: THEME_GRID,
          },
        },
      },
    }),
    []
  );

  const sortedRecentFeedbacks = useMemo(() => {
    return [...(feedbacks ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [feedbacks]);

  const hasOverviewData = Boolean(stats);
  const hasChartData = (chartData?.points?.length ?? 0) > 0;

  return (
    <main className="w-full space-y-6 p-6">
      <section className="flex flex-row items-center justify-end gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-fit gap-2"
            >
              <Filter className="h-4 w-4" />
              Lọc dữ liệu
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[320px] p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Bộ lọc dữ liệu</h4>
                <p className="text-sm text-muted-foreground">
                  Thiết lập thời gian và nhóm biểu đồ.
                </p>
              </div>
              <div className="grid gap-3">
                <div className="grid items-center gap-2">
                  <label htmlFor="fromDate" className="text-xs font-medium text-muted-foreground">
                    Từ ngày
                  </label>
                  <input
                    id="fromDate"
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="grid items-center gap-2">
                  <label htmlFor="toDate" className="text-xs font-medium text-muted-foreground">
                    Đến ngày
                  </label>
                  <input
                    id="toDate"
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="grid items-center gap-2">
                  <label className="text-xs font-medium text-muted-foreground">Nhóm dữ liệu</label>
                  <Select value={groupBy} onValueChange={(value: GroupBy) => setGroupBy(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Group by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Theo ngày</SelectItem>
                      <SelectItem value="month">Theo tháng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Badge className="h-10 w-full justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs shadow-none">
                <CalendarRange className="mr-1 h-3.5 w-3.5" />
                Mặc định 30 ngày gần nhất
              </Badge>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          variant="outline"
          size="sm"
          className="w-fit gap-2"
          onClick={() => {
            void handleRefresh();
          }}
          disabled={isAnyFetching}
        >
          <RefreshCcw className={`h-4 w-4 ${isAnyFetching ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </section>

      {(isOverviewLoading || isChartLoading) && !hasOverviewData ? <DashboardLoading /> : null}

      {(isOverviewError || isChartError) && !hasOverviewData ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg">Khong the tai dashboard</CardTitle>
            <CardDescription>
              {overviewError?.message || chartError?.message || "Vui long thu lai."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => void handleRefresh()} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Thu lai
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {hasOverviewData ? (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Người dùng"
              value={new Intl.NumberFormat("vi-VN").format(stats?.users.total ?? 0)}
              delta="+12%"
              hint="Tổng số tài khoản"
              icon={<Users className="h-4 w-4" />}
              trend={[23, 18, 16, 21, 27, 24, 19, 22, 26, 28]}
            />
            <StatsCard
              title="Đã xác thực Email"
              value={new Intl.NumberFormat("vi-VN").format(stats?.users.emailVerified ?? 0)}
              delta="+8.4%"
              hint="Tài khoản hoàn thiện"
              icon={<MailCheck className="h-4 w-4" />}
              trend={[18, 15, 14, 16, 19, 22, 24, 23, 25, 24]}
            />
            <StatsCard
              title="Phản hồi"
              value={new Intl.NumberFormat("vi-VN").format(stats?.feedback.total ?? 0)}
              delta="+5.2%"
              hint="Tổng số phản hồi"
              icon={<MessageSquare className="h-4 w-4" />}
              trend={[13, 11, 9, 12, 16, 14, 12, 15, 17, 16]}
            />
            <StatsCard
              title="Điểm tác động TB"
              value={stats?.feedback.avgRating ? stats.feedback.avgRating.toFixed(1) : "-"}
              delta="+0.3"
              hint="Trên thang điểm 5"
              icon={<Star className="h-4 w-4" />}
              trend={[4.1, 4.0, 3.9, 4.0, 4.2, 4.15, 4.05, 4.18, 4.24, 4.2]}
            />
          </section>

          <section>
            <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold tracking-tight">Tăng trưởng người dùng</CardTitle>
                  <CardDescription className="text-sm font-medium">
                    Tài khoản mới và xu hướng kích hoạt ({groupBy === "day" ? "theo ngày" : "theo tháng"}).
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="w-fit shrink-0 rounded-lg bg-primary/10 px-3 py-1 text-[13px] font-medium text-primary hover:bg-primary/20 border-0">
                  {dayjs(fromDate).format("DD/MM/YYYY")} - {dayjs(toDate).format("DD/MM/YYYY")}
                </Badge>
              </CardHeader>
              <CardContent className="h-[380px] w-full pt-4">
                {hasChartData ? (
                  <Line data={activityAreaData} options={activityAreaOptions} />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/10 text-sm text-muted-foreground">
                    <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
                    <p>Chưa có dữ liệu tăng trưởng trong khoảng thời gian này.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold tracking-tight">Phản hồi theo danh mục</CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground">
                  Phân bổ yêu cầu theo từng nhóm hỗ trợ
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[280px] w-full pt-4">
                <Bar data={feedbackCategoryBarData} options={feedbackCategoryBarOptions} />
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold tracking-tight">Trạng thái xử lý</CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground">
                  Tổng hợp theo tình trạng tiếp nhận
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[280px] w-full pt-4">
                <Bar data={feedbackStatusBarData} options={feedbackStatusBarOptions} />
              </CardContent>
            </Card>
          </section>
        </>
      ) : null}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold tracking-tight">Người dùng gần đây</CardTitle>
              <CardDescription className="text-sm font-medium">Top 5 tài khoản mới</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
              <Link href="/admin/users">
                Xem tất cả
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {isUsersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : isUsersError ? (
              <p className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-4 text-sm font-medium text-muted-foreground text-center">
                Không tải được dữ liệu người dùng.
              </p>
            ) : users.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-4 text-sm font-medium text-muted-foreground text-center">
                Chưa có dữ liệu người dùng.
              </p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3 py-2 transition-colors hover:bg-muted/40">
                  <div>
                    <p className="text-sm font-semibold">{user.userName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      user.emailVerified
                        ? "bg-emerald-500/10 text-emerald-600 border-0 shadow-none dark:text-emerald-400"
                        : "bg-background text-muted-foreground border-border/60 shadow-none"
                    }
                  >
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 bg-card/80 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold tracking-tight">Phản hồi gần đây</CardTitle>
              <CardDescription className="text-sm font-medium">Top 5 phản hồi mới nhất</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
              <Link href="/admin/feedback">
                Xem tất cả
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {isFeedbacksLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : isFeedbacksError ? (
              <p className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-4 text-sm font-medium text-muted-foreground text-center">
                Không tải được dữ liệu feedback.
              </p>
            ) : sortedRecentFeedbacks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-4 text-sm font-medium text-muted-foreground text-center">
                Chưa có phản hồi trong hệ thống.
              </p>
            ) : (
              sortedRecentFeedbacks.map((feedback) => (
                <div key={feedback.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2 transition-colors hover:bg-muted/40">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{feedback.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {dayjs(feedback.createdAt).format("DD/MM/YYYY HH:mm")}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 rounded-md bg-background text-muted-foreground border-border/60 shadow-none capitalize">
                    {feedback.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

    </main>
  );
}
