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

/** Hãng + model (+ biển số nếu có). */
export type VehicleDisplay = {
  brand: string;
  model: string;
  licensePlate: string;
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
  return {
    brand: v.brandName?.trim() || "—",
    model: v.modelName?.trim() || "—",
    licensePlate: v.licensePlate?.trim() || "",
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
    return {
      brand: m.brandName?.trim() || "—",
      model: m.name?.trim() || "—",
      licensePlate: uv.licensePlate?.trim() || "",
    };
  } catch {
    /* ignore */
  }
  return {
    brand: "—",
    model: "—",
    licensePlate: "",
  };
}

async function resolveLineItemTitle(line: BookingLineItemDto): Promise<string> {
  const trimmed = line.itemName?.trim();
  if (trimmed) return trimmed;
  if (line.bundleDetails?.name?.trim()) return line.bundleDetails.name.trim();

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
