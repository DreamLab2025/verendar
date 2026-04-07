"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useUsers } from "@/hooks/useUsers";
import { UserDetailDialog } from "@/components/dialog/users/UserDetailDialog";
import {
  Eye,
  RefreshCcw,
  Search,
  Users as UsersIcon,
  CheckCircle2,
  XCircle,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { UserFormDialog } from "@/components/dialog/users/UserFormDialog";
import { DeleteUserDialog } from "@/components/dialog/users/DeleteUserDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";

export const ROLE_MAP: Record<string, string> = {
  Admin: "Quản trị viên",
  User: "Người dùng",
  GarageOwner: "Chủ gara",
  Mechanic: "Thợ sửa chữa",
  GarageManager: "Quản lý gara",
};

export const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export function AdminUsersList() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [targetUserName, setTargetUserName] = useState<string>("");

  const handleCreate = () => {
    setFormMode("create");
    setTargetUserId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (id: string) => {
    setFormMode("edit");
    setTargetUserId(id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    setTargetUserId(id);
    setTargetUserName(name);
    setIsDeleteOpen(true);
  };

  const { users, isLoading, isError, metadata, refetch, isFetching } = useUsers({
    PageNumber: page,
    PageSize: pageSize,
    IsDescending: true,
    Name: debouncedSearchTerm || undefined,
    Role: selectedRole !== "all" ? [selectedRole] : undefined,
  });

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground">Không thể tải danh sách người dùng.</p>
        <Button onClick={() => refetch()} variant="outline" className="rounded-xl">Thử lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Quản lý người dùng
        </h2>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-3 rounded-2xl border border-border/40 shadow-sm">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-xl border border-border/50 shadow-sm min-w-[320px] md:min-w-[450px] flex-1 sm:flex-initial">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo tên..."
            className="text-sm bg-transparent border-0 focus:ring-0 w-full outline-none placeholder:text-muted-foreground/60"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={selectedRole}
            onValueChange={(value) => {
              setSelectedRole(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px] h-9 rounded-xl border-border/50 bg-background">
              <SelectValue placeholder="Tất cả vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              {Object.entries(ROLE_MAP).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {(searchTerm || selectedRole !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedRole("all");
                setPage(1);
              }}
              className="text-xs text-muted-foreground hover:text-foreground h-9 px-2"
            >
              Xóa bộ lọc
            </Button>
          )}
          
          <div className="h-6 w-px bg-border/40 mx-1 hidden sm:block" />

          <Button
            onClick={handleCreate}
            className="h-9 px-4 gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={mounted && isFetching}
            className="h-9 px-3 gap-2 rounded-xl border-border/60 hover:bg-muted shadow-sm"
          >
            <RefreshCcw className={`h-4 w-4 ${mounted && isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-xs font-medium">Làm mới</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <UsersSkeleton />
      ) : users.length === 0 ? (
        <div className="flex h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/40 bg-card/40 p-8 text-center shadow-sm">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted/50 mb-4 transition-transform hover:scale-110">
            <UsersIcon className="size-7 text-muted-foreground/60" />
          </div>
          <div className="max-w-[260px] space-y-2">
            <h3 className="text-lg font-semibold tracking-tight">Không tìm thấy người dùng</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {searchTerm ? `Không có kết quả khớp với "${searchTerm}"` : "Hệ thống chưa có dữ liệu người dùng."}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden rounded-xl border bg-card shadow-sm md:block overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
                  <TableHead className="w-[180px]">Người dùng</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Xác thực Email</TableHead>
                  <TableHead>Xác thực SĐT</TableHead>
                  <TableHead>Ngày tham gia</TableHead>
                  <TableHead className="w-[100px] text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="group cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shadow-inner">
                          {getInitials(user.userName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{user.userName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium leading-none">{user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.phoneNumber || "Chưa cập nhật sđt"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map(role => (
                          <Badge key={role} variant="outline" className="text-[10px] font-bold tracking-tight bg-primary/5 text-primary border-primary/20 rounded-md">
                            {ROLE_MAP[role] || role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <CheckCircle2 className="size-4" />
                          <span className="text-xs font-semibold">Đã xác thực</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground/60">
                          <XCircle className="size-4" />
                          <span className="text-xs font-medium">Chưa</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.phoneNumberVerified ? (
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <CheckCircle2 className="size-4" />
                          <span className="text-xs font-semibold">Đã xác thực</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground/60">
                          <XCircle className="size-4" />
                          <span className="text-xs font-medium">Chưa</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {dayjs(user.createdAt).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-xl transition-colors"
                          onClick={() => setSelectedUserId(user.id)}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-amber-500/10 hover:text-amber-600 rounded-xl transition-colors"
                          onClick={() => handleEdit(user.id)}
                          title="Chỉnh sửa"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors"
                          onClick={() => handleDelete(user.id, user.userName)}
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View */}
          <div className="grid gap-4 md:hidden">
            {users.map((user) => (
              <Card
                key={user.id}
                className="overflow-hidden shadow-sm border-border/60 hover:border-primary/40 transition-all cursor-pointer active:scale-[0.98]"
                onClick={() => setSelectedUserId(user.id)}
              >
                <CardHeader className="p-4 pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-inner shrink-0">
                        {getInitials(user.userName)}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base font-bold truncate">{user.userName}</CardTitle>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-amber-500/10 hover:text-amber-600 transition-colors"
                        onClick={() => handleEdit(user.id)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => handleDelete(user.id, user.userName)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 pb-3 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {user.roles.map(role => (
                      <Badge key={role} variant="secondary" className="text-[10px] font-extrabold bg-muted/60 rounded-md">
                        {ROLE_MAP[role] || role}
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border/40">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">Xác thực</span>
                      <div className="flex gap-2">
                        <div title="Email" className={user.emailVerified ? "text-emerald-500" : "text-muted-foreground/30"}>
                          <CheckCircle2 className="size-4" />
                        </div>
                        <div title="Số điện thoại" className={user.phoneNumberVerified ? "text-emerald-500" : "text-muted-foreground/30"}>
                          <PhoneIcon className="size-4" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Tham gia</span>
                      <span className="text-xs font-semibold">{dayjs(user.createdAt).format("DD/MM/YYYY")}</span>
                    </div>
                  </div>
                </CardContent>
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
                disabled={page <= 1}
                className="rounded-xl border-border/60"
              >
                Trước
              </Button>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/50 rounded-full border border-border/40">
                <span className="text-sm font-bold text-foreground">{metadata.pageNumber}</span>
                <span className="text-xs text-muted-foreground">/</span>
                <span className="text-sm font-medium text-muted-foreground">{metadata.totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(metadata.totalPages, p + 1))}
                disabled={page >= metadata.totalPages}
                className="rounded-xl border-border/60"
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}

      <UserDetailDialog
        open={!!selectedUserId}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
        userId={selectedUserId}
      />

      <UserFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        mode={formMode}
        userId={targetUserId}
      />

      <DeleteUserDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        userId={targetUserId}
        userName={targetUserName}
      />
    </div>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function UsersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <TableHead key={i}><Skeleton className="h-4 w-16" /></TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                {[1, 2, 3, 4, 5, 6, 7].map((cell) => (
                  <TableCell key={cell}><Skeleton className={`h-8 ${cell === 1 ? 'w-32' : 'w-24'}`} /></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-4 md:hidden">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
