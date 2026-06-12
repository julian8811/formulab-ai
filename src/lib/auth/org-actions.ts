"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/guard";
import { requireOrgOwner, canManageCatalog } from "@/lib/auth/permissions";
import {
  listOrgMembers,
  listOrgProjects,
  createOrgProject,
  updateMemberRole,
  removeOrgMember,
  inviteOrgMember,
  claimLegacyFormulas,
  getUserOrganizations,
} from "@/lib/auth/organizations";
import type { OrgRole } from "@/lib/auth/permissions";

export async function getSettingsData() {
  const user = await requireAuth();
  const orgs = await getUserOrganizations(user.id);
  const org = orgs[0];

  if (!org) {
    return {
      user,
      org: null,
      members: [],
      projects: [],
      canManage: false,
      isOwner: false,
    };
  }

  const [members, projects] = await Promise.all([
    listOrgMembers(org.id),
    listOrgProjects(org.id),
  ]);

  return {
    user,
    org,
    members,
    projects,
    canManage: canManageCatalog(org.role as OrgRole),
    isOwner: org.role === "owner",
  };
}

export async function createProjectAction(name: string, description?: string) {
  const user = await requireAuth();
  const ctx = await requireOrgOwner(user.id);
  if (!ctx) return { error: "Solo el owner puede crear proyectos" };

  if (name.trim().length < 2) return { error: "Nombre muy corto" };

  await createOrgProject(ctx.organizationId, name.trim(), description?.trim());
  revalidatePath("/settings");
  revalidatePath("/formulas");
  return { ok: true as const };
}

export async function inviteMemberAction(email: string, role: "admin" | "member") {
  const user = await requireAuth();
  const ctx = await requireOrgOwner(user.id);
  if (!ctx) return { error: "Solo el owner puede invitar" };

  const result = await inviteOrgMember(ctx.organizationId, email.trim(), role);
  if ("error" in result) return result;

  revalidatePath("/settings");
  return { ok: true as const };
}

export async function updateMemberRoleAction(memberId: string, role: OrgRole) {
  const user = await requireAuth();
  const ctx = await requireOrgOwner(user.id);
  if (!ctx) return { error: "Solo el owner puede cambiar roles" };

  if (role === "owner") return { error: "No se puede asignar owner vía UI" };

  const ok = await updateMemberRole(memberId, ctx.organizationId, role);
  if (!ok) return { error: "No se pudo actualizar" };

  revalidatePath("/settings");
  return { ok: true as const };
}

export async function removeMemberAction(memberId: string) {
  const user = await requireAuth();
  const ctx = await requireOrgOwner(user.id);
  if (!ctx) return { error: "Solo el owner puede eliminar miembros" };

  const ok = await removeOrgMember(memberId, ctx.organizationId);
  if (!ok) return { error: "No se pudo eliminar (¿último owner?)" };

  revalidatePath("/settings");
  return { ok: true as const };
}

export async function claimLegacyFormulasAction() {
  const user = await requireAuth();
  const count = await claimLegacyFormulas(user.id);
  revalidatePath("/formulas");
  revalidatePath("/dashboard");
  return { count };
}
