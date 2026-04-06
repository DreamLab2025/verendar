import { Table, TableBody, TableHead, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { GarageProductListItemDto } from "@/lib/api/services/fetchGarage";
import { formatVnd } from "../page";
import { formatDurationMinutes } from "../page";
import { CatalogStatusBadge } from "../page";
import { ProductRowActions } from "../page";

export function ProductsTable({
  rows,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
}: {
  rows: GarageProductListItemDto[];
  onViewProduct: (id: string) => void;
  onEditProduct: (id: string) => void;
  onDeleteProduct: (id: string, name: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Chưa có phụ tùng nào phù hợp bộ lọc.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Tên phụ tùng</TableHead>
            <TableHead className="min-w-[200px]">Mô tả</TableHead>
            <TableHead className="text-right">Giá phụ tùng</TableHead>
            <TableHead className="text-center">Thời lượng</TableHead>
            <TableHead className="text-center">Lắp đặt</TableHead>
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
              <TableCell className="whitespace-nowrap text-right tabular-nums">
                {formatVnd(row.materialPrice?.amount)}
              </TableCell>
              <TableCell className="text-center tabular-nums">
                {formatDurationMinutes(row.estimatedDurationMinutes)}
              </TableCell>
              <TableCell className="text-center text-sm">{row.hasInstallationOption ? "Có" : "Không"}</TableCell>
              <TableCell>
                <CatalogStatusBadge status={row.status} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-right">
                <ProductRowActions
                  productId={row.id}
                  productName={row.name}
                  onView={onViewProduct}
                  onEdit={onEditProduct}
                  onDelete={onDeleteProduct}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
