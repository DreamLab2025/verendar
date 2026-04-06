import type { Map as MaplibreMap } from "maplibre-gl";

export function attachMapLibreStyleImageMissingFallback(map: MaplibreMap): () => void {
  const onStyleImageMissing = (e: { id: string }) => {
    if (map.hasImage(e.id)) return;
    try {
      map.addImage(e.id, {
        width: 1,
        height: 1,
        data: new Uint8Array(4),
      });
    } catch {
      /* tránh crash nếu style reload giữa chừng */
    }
  };

  map.on("styleimagemissing", onStyleImageMissing);
  return () => {
    map.off("styleimagemissing", onStyleImageMissing);
  };
}
