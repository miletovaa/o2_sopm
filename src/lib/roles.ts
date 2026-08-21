import { Role } from "@/generated/prisma/enums";

// Admins and employees both have full CRUD over SOPs/materials; students are
// read-only. Kept in one place so "can manage content" means the same thing
// everywhere instead of each call site re-deriving it from role === "EMPLOYEE".
export function canManageContent(role: Role | undefined): boolean {
  return role === "ADMIN" || role === "EMPLOYEE";
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  EMPLOYEE: "Employee",
  STUDENT: "Student",
};

// Roles `actorRole` is allowed to hand out when creating or editing a user.
// Admins can create/manage Admins, Employees and Students; Employees can
// only create/manage Students; Students can't reach user management at all.
export function assignableRoles(actorRole: Role | undefined): Role[] {
  if (actorRole === "ADMIN") return [Role.ADMIN, Role.EMPLOYEE, Role.STUDENT];
  if (actorRole === "EMPLOYEE") return [Role.STUDENT];
  return [];
}

// Whether `actorRole` may edit or delete a user currently holding `targetRole`.
export function canManageUserWithRole(
  actorRole: Role | undefined,
  targetRole: Role,
): boolean {
  return assignableRoles(actorRole).includes(targetRole);
}