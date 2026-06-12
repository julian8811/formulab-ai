"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrgMember } from "@/lib/auth/organizations";
import type { OrgRole } from "@/lib/auth/permissions";
import {
  inviteMemberAction,
  updateMemberRoleAction,
  removeMemberAction,
} from "@/lib/auth/org-actions";
import { Trash2 } from "lucide-react";

interface MembersPanelProps {
  members: OrgMember[];
  currentUserId: string;
}

export function MembersPanel({ members, currentUserId }: MembersPanelProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [pending, startTransition] = useTransition();

  function handleInvite() {
    startTransition(async () => {
      const result = await inviteMemberAction(email, role);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Invitación enviada");
      setEmail("");
    });
  }

  function handleRoleChange(memberId: string, newRole: OrgRole) {
    startTransition(async () => {
      const result = await updateMemberRoleAction(memberId, newRole);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Rol actualizado");
    });
  }

  function handleRemove(memberId: string) {
    startTransition(async () => {
      const result = await removeMemberAction(memberId);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Miembro eliminado");
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1">
          <Label htmlFor="invite-email">Invitar por correo</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="colega@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Select value={role} onValueChange={(v) => v && setRole(v as "admin" | "member")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="member">Miembro</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleInvite} disabled={pending || !email.trim()}>
          Invitar
        </Button>
      </div>

      <ul className="space-y-2">
        {members.map((m) => (
          <li
            key={m.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
          >
            <div>
              <p className="font-mono text-xs">{m.userId.slice(0, 8)}…</p>
              {m.userId === currentUserId && (
                <span className="text-xs text-muted-foreground">(tú)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {m.role === "owner" ? (
                <span className="capitalize text-muted-foreground">{m.role}</span>
              ) : (
                <Select
                  value={m.role}
                  onValueChange={(v) => v && handleRoleChange(m.id, v as OrgRole)}
                >
                  <SelectTrigger className="h-8 w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Miembro</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {m.role !== "owner" && m.userId !== currentUserId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(m.id)}
                  disabled={pending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
