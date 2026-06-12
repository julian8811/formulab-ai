import { eq } from "drizzle-orm";
import { isDatabaseConfigured, getDb } from "@/db";
import { members } from "@/db/schema";

export type OrgRole = "owner" | "admin" | "member";

export interface UserOrgContext {
  organizationId: string;
  role: OrgRole;
}

export function canManageCatalog(role: OrgRole): boolean {
  return role === "owner" || role === "admin";
}

export function canManageOrg(role: OrgRole): boolean {
  return role === "owner";
}

export async function getUserOrgContext(userId: string): Promise<UserOrgContext | null> {
  if (!isDatabaseConfigured()) return null;

  const db = getDb();
  const [row] = await db
    .select({
      organizationId: members.organizationId,
      role: members.role,
    })
    .from(members)
    .where(eq(members.userId, userId))
    .limit(1);

  if (!row) return null;

  return {
    organizationId: row.organizationId,
    role: row.role as OrgRole,
  };
}

export async function requireCatalogAdmin(
  userId: string,
): Promise<UserOrgContext | null> {
  const ctx = await getUserOrgContext(userId);
  if (!ctx || !canManageCatalog(ctx.role)) return null;
  return ctx;
}

export async function requireOrgOwner(userId: string): Promise<UserOrgContext | null> {
  const ctx = await getUserOrgContext(userId);
  if (!ctx || !canManageOrg(ctx.role)) return null;
  return ctx;
}
