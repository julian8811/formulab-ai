import { eq } from "drizzle-orm";
import { isDatabaseConfigured, getDb } from "@/db";
import { organizations, members } from "@/db/schema";

export interface UserOrganization {
  id: string;
  name: string;
  slug: string;
  role: string;
  createdAt: Date;
}

function slugFromEmail(email: string): string {
  const local = (email.split("@")[0] ?? email)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return local || "org";
}

function orgNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local.charAt(0).toUpperCase() + local.slice(1);
}

async function uniqueSlug(base: string): Promise<string> {
  const db = getDb();
  let slug = base;
  let attempt = 0;

  while (true) {
    const [existing] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    if (!existing) return slug;

    attempt++;
    slug = `${base}-${attempt}`;
  }
}

export async function getUserOrganizations(userId: string): Promise<UserOrganization[]> {
  if (!isDatabaseConfigured()) return [];

  const db = getDb();
  const rows = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      role: members.role,
      createdAt: organizations.createdAt,
    })
    .from(members)
    .innerJoin(organizations, eq(members.organizationId, organizations.id))
    .where(eq(members.userId, userId));

  return rows;
}

export async function ensureUserOrganization(
  userId: string,
  email: string,
): Promise<void> {
  if (!isDatabaseConfigured() || !email) return;

  const existing = await getUserOrganizations(userId);
  if (existing.length > 0) return;

  const db = getDb();
  const baseSlug = slugFromEmail(email);
  const slug = await uniqueSlug(baseSlug);
  const name = orgNameFromEmail(email);

  const [org] = await db.insert(organizations).values({ name, slug }).returning();

  await db.insert(members).values({
    organizationId: org.id,
    userId,
    role: "owner",
  });
}
