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

export interface MockOwnerBranch {
  id: string;
  name: string;
  address: string;
  status: string;
  phoneNumber: string;
  averageRating: number;
  reviewCount: number;
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
    id: "mock-branch-001",
    name: "Chi nhánh Lê Lợi",
    address: "123 Lê Lợi, Phường Bến Nghé, TP.HCM",
    status: "Active",
    phoneNumber: "0283 900 0001",
    averageRating: 4.7,
    reviewCount: 128,
  },
  {
    id: "mock-branch-002",
    name: "Chi nhánh Nguyễn Huệ",
    address: "45 Nguyễn Huệ, Quận 1, TP.HCM",
    status: "Active",
    phoneNumber: "0283 900 0002",
    averageRating: 4.5,
    reviewCount: 86,
  },
  {
    id: "mock-branch-003",
    name: "Chi nhánh Thủ Đức",
    address: "78 Võ Văn Ngân, TP. Thủ Đức",
    status: "Pending",
    phoneNumber: "0283 900 0003",
    averageRating: 0,
    reviewCount: 0,
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
