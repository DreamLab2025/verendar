import type { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GarageBundleListItemDto } from "@/lib/api/services/fetchGarage";
import { cn } from "@/lib/utils";
import { BundleRowActions, CatalogStatusBadge, formatVnd } from "../page";

function bundleDiscountLabel(row: GarageBundleListItemDto) {
  if (row.discountPercent != null) return `${row.discountPercent}%`;
  if (row.discountAmount != null) return `−${formatVnd(row.discountAmount)}`;
  return "—";
}

function MobileKv({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[13px] leading-tight">
      <span className="min-w-0 shrink text-muted-foreground">{label}</span>
      <span className={cn("max-w-[58%] shrink-0 text-right tabular-nums text-foreground", valueClassName)}>{value}</span>
    </div>
  );
}

export function BundlesTable({
  rows,
  onViewBundle,
  onEditBundle,
  onDeleteBundle,
}: {
  rows: GarageBundleListItemDto[];
  onViewBundle: (id: string) => void;
  onEditBundle: (id: string) => void;
  onDeleteBundle: (id: string, name: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground md:p-8">
        Chưa có combo nào phù hợp bộ lọc.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2.5 md:hidden">
        {rows.map((row) => (
          <article
            key={row.id}
            className="rounded-lg border border-border/50 bg-card p-3 shadow-sm active:bg-muted/15"
          >
            <div className="flex gap-2.5">
              {row.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={row.imageUrl}
                  alt=""
                  className="size-11 shrink-0 rounded-md border border-border/50 object-cover"
                />
              ) : (
                <div className="size-11 shrink-0 rounded-md border border-dashed border-border/60 bg-muted/25" />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-foreground">{row.name}</h3>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                  {row.description?.trim() ? row.description : "—"}
                </p>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-end border-t border-border/40 pt-2">
              <BundleRowActions
                bundleId={row.id}
                bundleName={row.name}
                onView={onViewBundle}
                onEdit={onEditBundle}
                onDelete={onDeleteBundle}
                compact
              />
            </div>

            <div className="mt-2.5 rounded-md border border-border/40 bg-muted/20 px-2.5 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Giá sau giảm</p>
              <p className="mt-1 text-lg font-semibold tabular-nums leading-none tracking-tight text-foreground">
                {formatVnd(row.finalPrice)}
              </p>
            </div>

            <div className="mt-2 space-y-1.5">
              <MobileKv label="Tạm tính" value={formatVnd(row.subTotal)} />
              <MobileKv label="Giảm giá" value={bundleDiscountLabel(row)} />
              <MobileKv label="Số mục" value={row.itemCount} />
            </div>

            <div className="mt-2.5 flex items-center border-t border-border/40 pt-2">
              <CatalogStatusBadge
                status={row.status}
                className="h-6 border-0 bg-primary/10 px-2 text-[10px] font-medium text-primary hover:bg-primary/15"
              />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Tên combo</TableHead>
              <TableHead className="min-w-[200px]">Mô tả</TableHead>
              <TableHead className="text-right">Tạm tính</TableHead>
              <TableHead className="text-right">Giá sau giảm</TableHead>
              <TableHead className="text-right">Giảm giá</TableHead>
              <TableHead className="text-center">Số mục</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[132px] min-w-[132px] whitespace-nowrap text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="align-top font-medium">
                  <div className="flex items-start gap-3">
                    {row.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.imageUrl}
                        alt=""
                        className="size-10 shrink-0 rounded-md border border-border/60 object-cover"
                      />
                    ) : null}
                    <span className="min-w-0 flex-1 leading-snug">{row.name}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs align-top text-muted-foreground">
                  <span className="line-clamp-2 text-sm">{row.description ?? "—"}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-right tabular-nums">{formatVnd(row.subTotal)}</TableCell>
                <TableCell className="whitespace-nowrap text-right font-medium tabular-nums">
                  {formatVnd(row.finalPrice)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right text-muted-foreground tabular-nums">
                  {row.discountPercent != null
                    ? `${row.discountPercent}%`
                    : row.discountAmount != null
                      ? `−${formatVnd(row.discountAmount)}`
                      : "—"}
                </TableCell>
                <TableCell className="text-center tabular-nums">{row.itemCount}</TableCell>
                <TableCell>
                  <CatalogStatusBadge status={row.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  <BundleRowActions
                    bundleId={row.id}
                    bundleName={row.name}
                    onView={onViewBundle}
                    onEdit={onEditBundle}
                    onDelete={onDeleteBundle}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
