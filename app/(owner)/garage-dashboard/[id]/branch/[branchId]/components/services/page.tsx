"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Eye, Layers, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGarageBundlesByBranchQuery,
  useGarageProductsByBranchQuery,
  useGarageServicesByBranchQuery,
  useServiceCategoriesQuery,
} from "@/hooks/useGarage";
import { cn } from "@/lib/utils";
import type {
  GarageBundleListItemDto,
  GarageProductListItemDto,
  GarageServiceListItemDto,
  ServiceCategoryDto,
} from "@/lib/api/services/fetchGarage";

import { CreateGarageBundleDialog } from "../../../../../../../../components/dialog/garage/create-garage-bundle-dialog";
import { CreateGarageProductDialog } from "../../../../../../../../components/dialog/garage/create-garage-product-dialog";
import { CreateGarageServiceDialog } from "../../../../../../../../components/dialog/garage/create-garage-service-dialog";
import { EditGarageProductDialog } from "../../../../../../../../components/dialog/garage/edit-garage-product-dialog";
import { DeleteGarageBundleAlert } from "../../../../../../../../components/dialog/garage/delete-garage-bundle-alert";
import { DeleteGarageServiceAlert } from "../../../../../../../../components/dialog/garage/delete-garage-service-alert";
import { EditGarageBundleDialog } from "../../../../../../../../components/dialog/garage/edit-garage-bundle-dialog";
import { EditGarageServiceDialog } from "../../../../../../../../components/dialog/garage/edit-garage-service-dialog";
import { DeleteGarageProductAlert } from "../../../../../../../../components/dialog/garage/delete-garage-product-alert";
import { GarageBundleDetailDialog } from "../../../../../../../../components/dialog/garage/garage-bundle-detail-dialog";
import { GarageProductDetailDialog } from "../../../../../../../../components/dialog/garage/garage-product-detail-dialog";
import { GarageServiceDetailDialog } from "../../../../../../../../components/dialog/garage/garage-service-detail-dialog";
import { BundlesTable } from "./components/bundle-table";
import { ProductsTable } from "./components/product-table";
import { ServicesTable } from "./components/service-table";

export function formatVnd(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDurationMinutes(m: number | null | undefined): string {
  if (m == null) return "—";
  return `${m} phút`;
}

/** Lọc phụ/combo khi BE đã trả về `serviceCategoryId`; nếu chưa có field nào → giữ nguyên danh sách. */
function filterByServiceCategoryId<T extends { serviceCategoryId?: string | null }>(
  rows: T[],
  categoryId: string | null,
): T[] {
  if (categoryId == null) return rows;
  const anyTagged = rows.some((r) => r.serviceCategoryId != null && r.serviceCategoryId !== "");
  if (!anyTagged) return rows;
  return rows.filter((r) => r.serviceCategoryId === categoryId);
}

function filterServicesByCategory(
  rows: GarageServiceListItemDto[],
  categoryId: string | null,
): GarageServiceListItemDto[] {
  if (categoryId == null) return rows;
  return rows.filter((r) => r.serviceCategoryId === categoryId);
}

export function CatalogStatusBadge({ status }: { status: string }) {
  const active = status === "Active";
  return (
    <Badge variant={active ? "secondary" : "outline"} className="font-normal">
      {active ? "Đang hoạt động" : status}
    </Badge>
  );
}

export function ServiceRowActions({
  serviceId,
  serviceName,
  onView,
  onEdit,
  onDelete,
}: {
  serviceId: string;
  serviceName: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <div className="flex shrink-0 flex-nowrap items-center justify-end gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 shrink-0 touch-manipulation text-muted-foreground hover:text-foreground"
        aria-label="Xem chi tiết"
        onClick={() => onView(serviceId)}
      >
        <Eye className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 shrink-0 touch-manipulation text-muted-foreground hover:text-foreground"
        aria-label="Chỉnh sửa"
        onClick={() => onEdit(serviceId)}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 shrink-0 touch-manipulation text-destructive hover:bg-destructive/10 hover:text-destructive"
        aria-label="Xóa"
        onClick={() => onDelete(serviceId, serviceName)}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function ProductRowActions({
  productId,
  productName,
  onView,
  onEdit,
  onDelete,
}: {
  productId: string;
  productName: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <div className="flex shrink-0 flex-nowrap items-center justify-end gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 shrink-0 touch-manipulation text-muted-foreground hover:text-foreground"
        aria-label="Xem chi tiết"
        onClick={() => onView(productId)}
      >
        <Eye className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 shrink-0 touch-manipulation text-muted-foreground hover:text-foreground"
        aria-label="Chỉnh sửa"
        onClick={() => onEdit(productId)}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 shrink-0 touch-manipulation text-destructive hover:bg-destructive/10 hover:text-destructive"
        aria-label="Xóa"
        onClick={() => onDelete(productId, productName)}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function BundleRowActions({
  bundleId,
  bundleName,
  onView,
  onEdit,
  onDelete,
}: {
  bundleId: string;
  bundleName: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <div className="flex shrink-0 flex-nowrap items-center justify-end gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 shrink-0 touch-manipulation text-muted-foreground hover:text-foreground"
        aria-label="Xem chi tiết"
        onClick={() => onView(bundleId)}
      >
        <Eye className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 shrink-0 touch-manipulation text-muted-foreground hover:text-foreground"
        aria-label="Chỉnh sửa"
        onClick={() => onEdit(bundleId)}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9 shrink-0 touch-manipulation text-destructive hover:bg-destructive/10 hover:text-destructive"
        aria-label="Xóa"
        onClick={() => onDelete(bundleId, bundleName)}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function CatalogCreateToolbar({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-end">
      <Button type="button" size="default" className="shrink-0 gap-2 px-4" onClick={onClick} disabled={disabled}>
        <Plus className="size-4 shrink-0" aria-hidden />
        {label}
      </Button>
    </div>
  );
}

export function CatalogTableSkeleton({ cols, rows = 6 }: { cols: number; rows?: number }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: cols }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, r) => (
            <TableRow key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <TableCell key={c}>
                  <Skeleton className="h-4 w-full max-w-48" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ServiceCategoriesRailSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden pb-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex min-w-[240px] max-w-[320px] shrink-0 items-start gap-3 rounded-xl border border-border/80 bg-card/50 p-3.5"
        >
          <Skeleton className="size-11 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2 pt-0.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CatalogError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <p className="text-destructive">{message}</p>
      <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => void onRetry()}>
        Thử lại
      </Button>
    </div>
  );
}

export function categoryCardClass(selected: boolean) {
  return cn(
    "group flex min-w-[240px] max-w-[320px] shrink-0 items-start gap-3 rounded-xl border p-3.5 text-left transition-all",
    "hover:border-primary/40 hover:bg-muted/40",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    selected ? "border-primary/60 bg-primary/5 shadow-sm ring-1 ring-primary/25" : "border-border/80 bg-card/60",
  );
}

export default function BranchServicesPage() {
  const params = useParams();
  const branchId = typeof params?.branchId === "string" ? params.branchId : "";

  const [selectedServiceCategoryId, setSelectedServiceCategoryId] = useState<string | null>(null);
  const [createServiceOpen, setCreateServiceOpen] = useState(false);
  const [detailServiceId, setDetailServiceId] = useState<string | null>(null);
  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [deleteServiceTarget, setDeleteServiceTarget] = useState<{ id: string; name: string } | null>(null);
  const [detailBundleId, setDetailBundleId] = useState<string | null>(null);
  const [editBundleId, setEditBundleId] = useState<string | null>(null);
  const [deleteBundleTarget, setDeleteBundleTarget] = useState<{ id: string; name: string } | null>(null);
  const [createBundleOpen, setCreateBundleOpen] = useState(false);
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState<{ id: string; name: string } | null>(null);

  const categoriesQ = useServiceCategoriesQuery(Boolean(branchId));

  const categories = useMemo(() => {
    const raw = categoriesQ.data?.data ?? [];
    return [...raw].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [categoriesQ.data?.data]);

  const listOpts = {
    enabled: Boolean(branchId),
    serviceCategoryId: selectedServiceCategoryId,
  } as const;

  const bundlesQ = useGarageBundlesByBranchQuery(branchId || undefined, listOpts);
  const productsQ = useGarageProductsByBranchQuery(branchId || undefined, listOpts);
  const servicesQ = useGarageServicesByBranchQuery(branchId || undefined, listOpts);

  const bundleRows = useMemo(
    () => filterByServiceCategoryId(bundlesQ.data?.data ?? [], selectedServiceCategoryId),
    [bundlesQ.data?.data, selectedServiceCategoryId],
  );
  const productRows = useMemo(
    () => filterByServiceCategoryId(productsQ.data?.data ?? [], selectedServiceCategoryId),
    [productsQ.data?.data, selectedServiceCategoryId],
  );
  const serviceRows = useMemo(
    () => filterServicesByCategory(servicesQ.data?.data ?? [], selectedServiceCategoryId),
    [servicesQ.data?.data, selectedServiceCategoryId],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Dịch vụ</h2>
        <p className="text-sm text-muted-foreground md:text-base">
          Chọn danh mục dịch vụ phía dưới để lọc combo, phụ tùng và dịch vụ theo{" "}
          <span className="font-medium text-foreground">serviceCategoryId</span>.
        </p>
      </div>

      {!branchId ? (
        <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Thiếu mã chi nhánh.</p>
      ) : (
        <>
          <section className="space-y-3">
            <Tabs defaultValue="bundles" className="w-full">
              <TabsList
                variant="line"
                className="w-full justify-start gap-0 overflow-x-auto rounded-none border-b border-neutral-200 bg-transparent p-0 dark:border-neutral-800"
              >
                <TabsTrigger variant="line" value="bundles" className="shrink-0">
                  Combo
                </TabsTrigger>
                <TabsTrigger variant="line" value="products" className="shrink-0">
                  Phụ tùng
                </TabsTrigger>
                <TabsTrigger variant="line" value="services" className="shrink-0">
                  Dịch vụ
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bundles" className="mt-6">
                <div className="space-y-4">
                  <CatalogCreateToolbar label="Tạo combo" onClick={() => setCreateBundleOpen(true)} />
                  {bundlesQ.isPending ? (
                    <CatalogTableSkeleton cols={8} />
                  ) : bundlesQ.isError ? (
                    <CatalogError
                      message={bundlesQ.error?.message ?? "Không tải được danh sách combo."}
                      onRetry={() => void bundlesQ.refetch()}
                    />
                  ) : (
                    <BundlesTable
                      rows={bundleRows}
                      onViewBundle={(id) => setDetailBundleId(id)}
                      onEditBundle={(id) => setEditBundleId(id)}
                      onDeleteBundle={(id, name) => setDeleteBundleTarget({ id, name })}
                    />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="products" className="mt-6">
                <div className="space-y-4">
                  <CatalogCreateToolbar label="Tạo phụ tùng" onClick={() => setCreateProductOpen(true)} />
                  {productsQ.isPending ? (
                    <CatalogTableSkeleton cols={7} />
                  ) : productsQ.isError ? (
                    <CatalogError
                      message={productsQ.error?.message ?? "Không tải được danh sách phụ tùng."}
                      onRetry={() => void productsQ.refetch()}
                    />
                  ) : (
                    <ProductsTable
                      rows={productRows}
                      onViewProduct={(id) => setDetailProductId(id)}
                      onEditProduct={(id) => setEditProductId(id)}
                      onDeleteProduct={(id, name) => setDeleteProductTarget({ id, name })}
                    />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="services" className="mt-6">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="default"
                      className="shrink-0 gap-2 px-4"
                      onClick={() => setCreateServiceOpen(true)}
                      disabled={categoriesQ.isPending || categories.length === 0}
                      title={
                        categories.length === 0 && !categoriesQ.isPending
                          ? "Cần có danh mục dịch vụ trước khi tạo"
                          : undefined
                      }
                    >
                      <Plus className="size-4 shrink-0" aria-hidden />
                      Tạo dịch vụ
                    </Button>
                  </div>
                  {servicesQ.isPending ? (
                    <CatalogTableSkeleton cols={6} />
                  ) : servicesQ.isError ? (
                    <CatalogError
                      message={servicesQ.error?.message ?? "Không tải được danh sách dịch vụ."}
                      onRetry={() => void servicesQ.refetch()}
                    />
                  ) : (
                    <ServicesTable
                      rows={serviceRows}
                      onViewService={(id) => setDetailServiceId(id)}
                      onEditService={(id) => setEditServiceId(id)}
                      onDeleteService={(id, name) => setDeleteServiceTarget({ id, name })}
                    />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </section>

          <CreateGarageBundleDialog open={createBundleOpen} onOpenChange={setCreateBundleOpen} branchId={branchId} />

          <CreateGarageProductDialog open={createProductOpen} onOpenChange={setCreateProductOpen} branchId={branchId} />

          <EditGarageProductDialog
            open={Boolean(editProductId)}
            onOpenChange={(o) => {
              if (!o) setEditProductId(null);
            }}
            branchId={branchId}
            productId={editProductId}
          />

          <CreateGarageServiceDialog
            open={createServiceOpen}
            onOpenChange={setCreateServiceOpen}
            branchId={branchId}
            categories={categories}
            defaultCategoryId={selectedServiceCategoryId}
          />

          <GarageProductDetailDialog
            open={Boolean(detailProductId)}
            onOpenChange={(o) => {
              if (!o) setDetailProductId(null);
            }}
            productId={detailProductId}
          />

          <DeleteGarageProductAlert
            open={Boolean(deleteProductTarget)}
            onOpenChange={(o) => {
              if (!o) setDeleteProductTarget(null);
            }}
            branchId={branchId}
            target={deleteProductTarget}
          />

          <GarageServiceDetailDialog
            open={Boolean(detailServiceId)}
            onOpenChange={(o) => {
              if (!o) setDetailServiceId(null);
            }}
            serviceId={detailServiceId}
          />

          <EditGarageServiceDialog
            open={Boolean(editServiceId)}
            onOpenChange={(o) => {
              if (!o) setEditServiceId(null);
            }}
            branchId={branchId}
            serviceId={editServiceId}
            categories={categories}
          />

          <DeleteGarageServiceAlert
            open={Boolean(deleteServiceTarget)}
            onOpenChange={(o) => {
              if (!o) setDeleteServiceTarget(null);
            }}
            branchId={branchId}
            target={deleteServiceTarget}
          />

          <GarageBundleDetailDialog
            open={Boolean(detailBundleId)}
            onOpenChange={(o) => {
              if (!o) setDetailBundleId(null);
            }}
            bundleId={detailBundleId}
          />

          <EditGarageBundleDialog
            open={Boolean(editBundleId)}
            onOpenChange={(o) => {
              if (!o) setEditBundleId(null);
            }}
            branchId={branchId}
            bundleId={editBundleId}
          />

          <DeleteGarageBundleAlert
            open={Boolean(deleteBundleTarget)}
            onOpenChange={(o) => {
              if (!o) setDeleteBundleTarget(null);
            }}
            branchId={branchId}
            target={deleteBundleTarget}
          />
        </>
      )}
    </div>
  );
}
