/** Mock garage owner — thay bằng API sau (getMyGarage, branches, …). */

export const MOCK_OWNER_GARAGE_ID = "mock-garage-001";

export interface MockOwnerGarage {
  id: string;
  businessName: string;
  shortName: string;
  status: "Active" | "Pending" | string;
  taxCode: string;
  logoUrl: string | null;
  branchCount: number;
}

/** Khớp response branch API (địa chỉ tách field). */
export interface GarageBranchAddressDto {
  provinceCode: string;
  wardCode: string;
  houseNumber: string;
  streetDetail: string;
}

export interface MockOwnerBranch {
  id: string;
  name: string;
  slug: string;
  address: GarageBranchAddressDto;
  phoneNumber: string;
  latitude: number;
  longitude: number;
  status: string;
}

export function formatGarageBranchAddressLine(address: GarageBranchAddressDto): string {
  const parts = [address.houseNumber, address.streetDetail].filter((s) => s?.trim());
  if (parts.length > 0) return parts.join(" ");
  return `Phường/xã ${address.wardCode} · Mã tỉnh/TP ${address.provinceCode}`;
}

export const mockOwnerGarage: MockOwnerGarage = {
  id: MOCK_OWNER_GARAGE_ID,
  businessName: "Garage Varendar Quận 1",
  shortName: "Varendar Q1",
  status: "Active",
  taxCode: "0123456789",
  logoUrl: null,
  branchCount: 3,
};

export const mockOwnerBranches: MockOwnerBranch[] = [
  {
    id: "22222222-2222-2222-2222-222222222211",
    name: "Chi nhánh Hoàn Kiếm",
    slug: "chi-nhanh-hoan-kiem-demo",
    address: {
      provinceCode: "01",
      wardCode: "00070",
      houseNumber: "36",
      streetDetail: "Phố Hàng Bạc",
    },
    phoneNumber: "0901234567",
    latitude: 21.0285,
    longitude: 105.8542,
    status: "Active",
  },
  {
    id: "33333333-3333-3333-3333-333333333322",
    name: "Chi nhánh Ba Đình",
    slug: "chi-nhanh-ba-dinh-demo",
    address: {
      provinceCode: "01",
      wardCode: "00004",
      houseNumber: "12",
      streetDetail: "Đường Điện Biên Phủ",
    },
    phoneNumber: "0912345678",
    latitude: 21.036,
    longitude: 105.834,
    status: "Active",
  },
  {
    id: "44444444-4444-4444-4444-444444444433",
    name: "Chi nhánh Cầu Giấy",
    slug: "chi-nhanh-cau-giay-demo",
    address: {
      provinceCode: "01",
      wardCode: "00103",
      houseNumber: "88",
      streetDetail: "Phố Trần Thái Tông",
    },
    phoneNumber: "0923456789",
    latitude: 21.028,
    longitude: 105.801,
    status: "Pending",
  },
];

export function getMockOwnerGarageById(id: string): MockOwnerGarage | null {
  if (id === mockOwnerGarage.id) return mockOwnerGarage;
  return {
    id,
    businessName: `Garage (mock) — ${id.slice(0, 8)}…`,
    shortName: "Garage",
    status: "Active",
    taxCode: "—",
    logoUrl: null,
    branchCount: mockOwnerBranches.length,
  };
}
