import { ServiceCategoryDto } from "@/lib/api/services/fetchGarage";
import { Layers } from "lucide-react";
import { categoryCardClass } from "../page";
export function ServiceCategoriesRail({
  categories,
  selectedId,
  onSelect,
}: {
  categories: ServiceCategoryDto[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="relative -mx-1" role="listbox" aria-label="Danh mục dịch vụ — cuộn ngang để xem thêm">
      <div className="flex gap-3 overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
        <button
          type="button"
          role="option"
          aria-selected={selectedId === null}
          onClick={() => onSelect(null)}
          className={categoryCardClass(selectedId === null)}
        >
          <div className="grid size-11 shrink-0 place-items-center rounded-lg border border-dashed border-primary/45 bg-primary/8 text-primary">
            <Layers className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-semibold leading-tight text-foreground">Tất cả</p>
            <p className="line-clamp-3 text-xs leading-snug text-muted-foreground">
              Không lọc theo danh mục — hiển thị toàn bộ combo, phụ tùng và dịch vụ.
            </p>
          </div>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="option"
            aria-selected={selectedId === cat.id}
            onClick={() => onSelect(cat.id)}
            className={categoryCardClass(selectedId === cat.id)}
          >
            {cat.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cat.iconUrl}
                alt=""
                className="size-11 shrink-0 rounded-lg border border-border/60 object-cover"
              />
            ) : (
              <div className="size-11 shrink-0 rounded-lg border border-dashed border-border/80 bg-muted/40" />
            )}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 font-semibold leading-tight text-foreground">{cat.name}</p>
                <span className="shrink-0 rounded-md bg-muted/80 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                  #{cat.displayOrder}
                </span>
              </div>
              <p className="line-clamp-2 text-left text-xs leading-snug text-muted-foreground">
                {cat.description?.trim() ? cat.description : "—"}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
