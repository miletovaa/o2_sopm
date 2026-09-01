import { Role } from "@/generated/prisma/enums";

// Two resources: "content" covers SOPs, reference materials and safety materials together
// (one shared set of toggles, not per-type) — viewing is always open to any logged-in user
// and isn't a real permission, only these actions are gated. "users" covers the user
// management page itself.
export const CONTENT_ACTIONS = ["edit", "new_version", "delete"] as const;
export const USERS_ACTIONS = ["view", "edit", "delete"] as const;

export type ContentAction = (typeof CONTENT_ACTIONS)[number];
export type UsersAction = (typeof USERS_ACTIONS)[number];
export type Permission = `content.${ContentAction}` | `users.${UsersAction}`;

export const CONTENT_ACTION_LABELS: Record<ContentAction, string> = {
  edit: "Create / Edit",
  new_version: "New version",
  delete: "Delete",
};

export const USERS_ACTION_LABELS: Record<UsersAction, string> = {
  view: "View",
  edit: "Create / Edit",
  delete: "Delete",
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  USER: "User",
};

// Every valid permission string — used to validate a submitted permissions list before it's
// saved, so an unrecognized/malformed value can never sneak into the database.
export const ALL_PERMISSIONS: Permission[] = [
  ...CONTENT_ACTIONS.map((a) => `content.${a}` as const),
  ...USERS_ACTIONS.map((a) => `users.${a}` as const),
];

export function isValidPermissionList(value: unknown): value is Permission[] {
  return (
    Array.isArray(value) &&
    value.every((v) => typeof v === "string" && (ALL_PERMISSIONS as string[]).includes(v))
  );
}

type PermissionSource = { role: Role; permissions: unknown } | null | undefined;

function permissionList(user: PermissionSource): string[] {
  return Array.isArray(user?.permissions) ? (user.permissions as string[]) : [];
}

// Admins bypass every check below. Everyone else's access is entirely determined by their
// stored `permissions` list — a freshly created account has none.
export function hasPermission(user: PermissionSource, permission: Permission): boolean {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  return permissionList(user).includes(permission);
}

// Only an existing Admin may create or promote another Admin — holding users.edit alone
// only lets you manage USER-role accounts, never grant admin.
export function canAssignRole(actor: PermissionSource, targetRole: Role): boolean {
  if (targetRole === "ADMIN") {
    return actor?.role === "ADMIN";
  }
  return true;
}