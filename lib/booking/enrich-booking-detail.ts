import type {
  BookingDetailDto,
  BookingLineItemDto,
  BookingStatusHistoryDto,
  BookingVehicleDto,
} from "@/lib/api/services/fetchBooking";
import BookingsService from "@/lib/api/services/fetchBookings";
import GarageService from "@/lib/api/services/fetchGarage";
import UserService from "@/lib/api/services/fetchUsers";
import UserVehicleService from "@/lib/api/services/fetchUserVehicle";

/** Hiển thị trong dialog — tên + email + SĐT (không dùng UUID làm dòng chính). */
export type CustomerDisplay = {
  name: string;
  email: string;
  phone: string;
};

/** Hãng + model + biển số + ảnh xe (variant) nếu có. */
export type VehicleDisplay = {
  brand: string;
  model: string;
  licensePlate: string;
  /** Ảnh xe từ API (variant / embedded vehicle). */
  imageUrl: string | null;
};

async function fetchUserDisplayName(id: string): Promise<string | null> {
  try {
    const r = await UserService.getUserById(id);
    if (r.isSuccess && r.data) {
      const u = r.data;
      return u.userName?.trim() || u.email?.trim() || id;
    }
  } catch {
    /* 403 / không tìm thấy */
  }
  return null;
}

function customerFromEmbedded(c: NonNullable<BookingDetailDto["customer"]>): CustomerDisplay {
  return {
    name: c.fullName?.trim() || "—",
    email: c.email?.trim() || "—",
    phone: c.phoneNumber?.trim() || "—",
  };
}

async function resolveCustomerDisplay(d: BookingDetailDto): Promise<CustomerDisplay> {
  if (d.customer) {
    return customerFromEmbedded(d.customer);
  }
  try {
    const r = await UserService.getUserById(d.userId);
    if (r.isSuccess && r.data) {
      const u = r.data;
      return {
        name: u.userName?.trim() || "—",
        email: u.email?.trim() || "—",
        phone: u.phoneNumber?.trim() || "—",
      };
    }
  } catch {
    /* ignore */
  }
  return {
    name: "—",
    email: "—",
    phone: "—",
  };
}

function vehicleFromEmbedded(v: BookingVehicleDto): VehicleDisplay {
  const img = v.imageUrl?.trim();
  return {
    brand: v.brandName?.trim() || "—",
    model: v.modelName?.trim() || "—",
    licensePlate: v.licensePlate?.trim() || "",
    imageUrl: img ? img : null,
  };
}

async function resolveVehicleDisplay(d: BookingDetailDto): Promise<VehicleDisplay> {
  if (d.vehicle) {
    return vehicleFromEmbedded(d.vehicle);
  }
  try {
    const r = await UserVehicleService.getUserVehicleById(d.userVehicleId);
    const uv = r.data;
    const m = uv.variant.model;
    const img = uv.variant.imageUrl?.trim();
    return {
      brand: m.brandName?.trim() || "—",
      model: m.name?.trim() || "—",
      licensePlate: uv.licensePlate?.trim() || "",
      imageUrl: img ? img : null,
    };
  } catch {
    /* ignore */
  }
  return {
    brand: "—",
    model: "—",
    licensePlate: "",
    imageUrl: null,
  };
}

function embeddedLineTitle(line: BookingLineItemDto): string | null {
  const t = line.itemName?.trim();
  if (t) return t;
  const p = line.productDetails?.name?.trim();
  if (p) return p;
  const s = line.serviceDetails?.name?.trim();
  if (s) return s;
  const b = line.bundleDetails?.name?.trim();
  if (b) return b;
  return null;
}

async function resolveLineItemTitle(line: BookingLineItemDto): Promise<string> {
  const embedded = embeddedLineTitle(line);
  if (embedded) return embedded;

  try {
    if (line.bundleId) {
      const r = await GarageService.getGarageBundleById(line.bundleId);
      if (r.isSuccess && r.data) return r.data.name;
    } else if (line.productId) {
      const r = await GarageService.getGarageProductById(line.productId);
      if (r.isSuccess && r.data) return r.data.name;
    } else if (line.serviceId) {
      const r = await GarageService.getGarageServiceById(line.serviceId);
      if (r.isSuccess && r.data) return r.data.name;
    }
  } catch {
    /* network / 404 */
  }
  return "—";
}

export type EnrichedBookingDetail = {
  raw: BookingDetailDto;
  customer: CustomerDisplay;
  vehicle: VehicleDisplay;
  mechanicLabel: string;
  lineItems: { line: BookingLineItemDto; title: string }[];
  historyEntries: { entry: BookingStatusHistoryDto; changedByLabel: string }[];
};

export async function fetchAndEnrichBookingDetail(id: string): Promise<EnrichedBookingDetail> {
  const body = await BookingsService.getBookingById(id);
  if (!body.isSuccess || !body.data) {
    throw new Error(body.message || "Không tải được lịch hẹn.");
  }
  const d = body.data;

  const [customer, vehicle] = await Promise.all([resolveCustomerDisplay(d), resolveVehicleDisplay(d)]);

  let mechanicLabel: string;
  if (d.mechanicDisplayName?.trim()) {
    mechanicLabel = d.mechanicDisplayName.trim();
  } else if (d.mechanicId) {
    const m = await fetchUserDisplayName(d.mechanicId);
    mechanicLabel = m ?? d.mechanicId;
  } else {
    mechanicLabel = "—";
  }

  const lineItems = await Promise.all(
    d.lineItems.map(async (line) => ({
      line,
      title: await resolveLineItemTitle(line),
    })),
  );

  const changedIds = [...new Set(d.statusHistory.map((h) => h.changedByUserId).filter(Boolean))] as string[];
  const historyUserMap = new Map<string, string>();
  await Promise.all(
    changedIds.map(async (uid) => {
      const label = await fetchUserDisplayName(uid);
      if (label) historyUserMap.set(uid, label);
    }),
  );

  const historyEntries = d.statusHistory.map((entry) => ({
    entry,
    changedByLabel: entry.changedByUserId
      ? historyUserMap.get(entry.changedByUserId) ?? entry.changedByUserId
      : "—",
  }));

  return {
    raw: d,
    customer,
    vehicle,
    mechanicLabel,
    lineItems,
    historyEntries,
  };
}

/**
 * Khi đã có đủ `BookingDetailDto` (vd. sessionStorage sau POST) — không gọi API enrich.
 * Dùng cho trang success và preview nhanh.
 */
export function minimalEnrichedFromBookingDetailDto(d: BookingDetailDto): EnrichedBookingDetail {
  const customer = d.customer ? customerFromEmbedded(d.customer) : { name: "—", email: "—", phone: "—" };
  const vehicle = d.vehicle ? vehicleFromEmbedded(d.vehicle) : { brand: "—", model: "—", licensePlate: "", imageUrl: null };
  const mechanicLabel = d.mechanicDisplayName?.trim() || (d.mechanicId ?? "—");
  const lineItems = d.lineItems.map((line) => ({
    line,
    title: embeddedLineTitle(line) || "—",
  }));
  const historyEntries = d.statusHistory.map((entry) => ({
    entry,
    changedByLabel: entry.changedByUserId ?? "—",
  }));
  return {
    raw: d,
    customer,
    vehicle,
    mechanicLabel,
    lineItems,
    historyEntries,
  };
}
