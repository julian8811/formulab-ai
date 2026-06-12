import { describe, it, expect } from "vitest";
import { canManageCatalog, canManageOrg } from "@/lib/auth/permissions";

describe("permissions", () => {
  it("owner and admin can manage catalog", () => {
    expect(canManageCatalog("owner")).toBe(true);
    expect(canManageCatalog("admin")).toBe(true);
    expect(canManageCatalog("member")).toBe(false);
  });

  it("only owner can manage org", () => {
    expect(canManageOrg("owner")).toBe(true);
    expect(canManageOrg("admin")).toBe(false);
    expect(canManageOrg("member")).toBe(false);
  });
});
