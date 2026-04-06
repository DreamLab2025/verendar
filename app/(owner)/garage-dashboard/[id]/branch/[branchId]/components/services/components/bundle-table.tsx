import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GarageBundleListItemDto } from "@/lib/api/services/fetchGarage";
import { BundleRowActions, CatalogStatusBadge, formatVnd } from "../page";

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
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Chưa có combo nào phù hợp bộ lọc.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
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
  );
}
