import { eq, and, isNull } from "drizzle-orm";
import { isDatabaseConfigured, getDb } from "@/db";
import { organizations, members, projects, formulas } from "@/db/schema";
import { createServiceClient } from "@/lib/supabase/admin";
import type { OrgRole } from "@/lib/auth/permissions";
import { getUserOrgContext } from "@/lib/auth/permissions";

export interface UserOrganization {
  id: string;
  name: string;
  slug: string;
  role: string;
  createdAt: Date;
}

export interface UserProject {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
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

export async function ensureDefaultProject(organizationId: string): Promise<string> {
  const db = getDb();
  const [existing] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.organizationId, organizationId))
    .limit(1);

  if (existing) return existing.id;

  const [project] = await db
    .insert(projects)
    .values({
      organizationId,
      name: "Proyecto principal",
      description: "Proyecto por defecto de formulación",
    })
    .returning();

  return project.id;
}

export async function getUserDefaultProject(
  userId: string,
): Promise<UserProject | undefined> {
  if (!isDatabaseConfigured()) return undefined;

  const orgs = await getUserOrganizations(userId);
  const org = orgs[0];
  if (!org) return undefined;

  const db = getDb();
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.organizationId, org.id))
    .limit(1);

  if (!project) return undefined;

  return {
    id: project.id,
    organizationId: project.organizationId,
    name: project.name,
    description: project.description,
  };
}

export async function getUserDefaultProjectId(
  userId: string,
): Promise<string | undefined> {
  const project = await getUserDefaultProject(userId);
  return project?.id;
}

export interface OrgMember {
  id: string;
  userId: string;
  role: OrgRole;
  createdAt: Date;
}

export async function listOrgMembers(organizationId: string): Promise<OrgMember[]> {
  if (!isDatabaseConfigured()) return [];

  const db = getDb();
  const rows = await db
    .select()
    .from(members)
    .where(eq(members.organizationId, organizationId));

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    role: r.role as OrgRole,
    createdAt: r.createdAt,
  }));
}

export async function listOrgProjects(organizationId: string): Promise<UserProject[]> {
  if (!isDatabaseConfigured()) return [];

  const db = getDb();
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.organizationId, organizationId));

  return rows.map((p) => ({
    id: p.id,
    organizationId: p.organizationId,
    name: p.name,
    description: p.description,
  }));
}

export async function resolveProjectFilter(
  userId: string,
  projectParam?: string,
): Promise<string | undefined> {
  if (!projectParam) return undefined;
  const ctx = await getUserOrgContext(userId);
  if (!ctx) return undefined;
  const orgProjects = await listOrgProjects(ctx.organizationId);
  return orgProjects.some((p) => p.id === projectParam) ? projectParam : undefined;
}

export async function createOrgProject(
  organizationId: string,
  name: string,
  description?: string,
): Promise<UserProject> {
  const db = getDb();
  const [project] = await db
    .insert(projects)
    .values({ organizationId, name, description })
    .returning();

  return {
    id: project.id,
    organizationId: project.organizationId,
    name: project.name,
    description: project.description,
  };
}

export async function updateMemberRole(
  memberId: string,
  organizationId: string,
  role: OrgRole,
): Promise<boolean> {
  const db = getDb();
  const [updated] = await db
    .update(members)
    .set({ role })
    .where(and(eq(members.id, memberId), eq(members.organizationId, organizationId)))
    .returning({ id: members.id });

  return Boolean(updated);
}

export async function removeOrgMember(
  memberId: string,
  organizationId: string,
): Promise<boolean> {
  const db = getDb();
  const [target] = await db
    .select({ id: members.id, role: members.role })
    .from(members)
    .where(and(eq(members.id, memberId), eq(members.organizationId, organizationId)))
    .limit(1);

  if (!target) return false;
  if (target.role === "owner") {
    const owners = await db
      .select({ id: members.id })
      .from(members)
      .where(and(eq(members.organizationId, organizationId), eq(members.role, "owner")));
    if (owners.length <= 1) return false;
  }

  await db.delete(members).where(eq(members.id, memberId));
  return true;
}

export async function inviteOrgMember(
  organizationId: string,
  email: string,
  role: Exclude<OrgRole, "owner"> = "member",
): Promise<{ ok: true } | { error: string }> {
  if (!isDatabaseConfigured()) {
    return { error: "Base de datos no configurada" };
  }

  try {
    const admin = createServiceClient();
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${origin}/auth/callback`,
    });

    if (error || !data.user) {
      return { error: error?.message ?? "No se pudo invitar al usuario" };
    }

    const db = getDb();
    const [existing] = await db
      .select({ id: members.id })
      .from(members)
      .where(eq(members.userId, data.user.id))
      .limit(1);

    if (existing) {
      return { error: "El usuario ya pertenece a una organización" };
    }

    await db.insert(members).values({
      organizationId,
      userId: data.user.id,
      role,
    });

    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al invitar" };
  }
}

export async function claimLegacyFormulas(userId: string): Promise<number> {
  if (!isDatabaseConfigured()) return 0;

  const db = getDb();
  const updated = await db
    .update(formulas)
    .set({ userId })
    .where(isNull(formulas.userId))
    .returning({ id: formulas.id });

  return updated.length;
}

export async function getProjectById(
  projectId: string,
  organizationId: string,
): Promise<UserProject | undefined> {
  const db = getDb();
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.organizationId, organizationId)))
    .limit(1);

  if (!project) return undefined;

  return {
    id: project.id,
    organizationId: project.organizationId,
    name: project.name,
    description: project.description,
  };
}

export async function ensureUserOrganization(
  userId: string,
  email: string,
): Promise<void> {
  if (!isDatabaseConfigured() || !email) return;

  const db = getDb();
  const [existingMember] = await db
    .select({ organizationId: members.organizationId })
    .from(members)
    .where(eq(members.userId, userId))
    .limit(1);

  if (existingMember) {
    await ensureDefaultProject(existingMember.organizationId);
    return;
  }

  const existing = await getUserOrganizations(userId);
  if (existing.length > 0) {
    await ensureDefaultProject(existing[0].id);
    return;
  }

  const baseSlug = slugFromEmail(email);
  const slug = await uniqueSlug(baseSlug);
  const name = orgNameFromEmail(email);

  const [org] = await db.insert(organizations).values({ name, slug }).returning();

  await db.insert(members).values({
    organizationId: org.id,
    userId,
    role: "owner",
  });

  await ensureDefaultProject(org.id);
}
