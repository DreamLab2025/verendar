import { GarageServiceListItemDto } from "@/lib/api/services/fetchGarage";
import { CatalogStatusBadge, formatDurationMinutes, formatVnd, ServiceRowActions } from "../page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ServicesTable({
  rows,
  onViewService,
  onEditService,
  onDeleteService,
}: {
  rows: GarageServiceListItemDto[];
  onViewService: (id: string) => void;
  onEditService: (id: string) => void;
  onDeleteService: (id: string, name: string) => void;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Chưa có dịch vụ nào phù hợp bộ lọc.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl border border-border/80 bg-card/50 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug text-foreground">{row.name}</p>
                <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                  {row.description ?? "—"}
                </p>
              </div>
              <ServiceRowActions
                serviceId={row.id}
                serviceName={row.name}
                onView={onViewService}
                onEdit={onEditService}
                onDelete={onDeleteService}
              />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-xs sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Giá NC</dt>
                <dd className="font-medium tabular-nums text-foreground">{formatVnd(row.laborPrice?.amount)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Thời lượng</dt>
                <dd className="tabular-nums">{formatDurationMinutes(row.estimatedDurationMinutes)}</dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-muted-foreground">Trạng thái</dt>
                <dd>
                  <CatalogStatusBadge status={row.status} />
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[220px]">Tên dịch vụ</TableHead>
              <TableHead className="min-w-[200px]">Mô tả</TableHead>
              <TableHead className="text-right">Giá nhân công</TableHead>
              <TableHead className="text-center">Thời lượng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[132px] min-w-[132px] whitespace-nowrap text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="align-top font-medium">{row.name}</TableCell>
                <TableCell className="max-w-xs align-top text-muted-foreground">
                  <span className="line-clamp-2 text-sm">{row.description ?? "—"}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-right tabular-nums">
                  {formatVnd(row.laborPrice?.amount)}
                </TableCell>
                <TableCell className="text-center tabular-nums">
                  {formatDurationMinutes(row.estimatedDurationMinutes)}
                </TableCell>
                <TableCell>
                  <CatalogStatusBadge status={row.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  <ServiceRowActions
                    serviceId={row.id}
                    serviceName={row.name}
                    onView={onViewService}
                    onEdit={onEditService}
                    onDelete={onDeleteService}
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
