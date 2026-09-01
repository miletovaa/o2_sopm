import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAssignRole, hasPermission, isValidPermissionList } from "@/lib/roles";
import type { Role } from "@/generated/prisma/enums";

// Updates a user's username / role / permissions / (optionally) password.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || !hasPermission(session.user, "users.edit")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Holding users.edit alone doesn't let you touch another Admin's account.
  if (target.role === "ADMIN" && session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Only an Admin can manage another Admin's account" },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const username = body?.username;
  const role = body?.role;
  const permissions = body?.permissions ?? [];
  const password = body?.password;

  if (typeof username !== "string" || !username.trim()) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }
  if (role !== "ADMIN" && role !== "USER") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (!canAssignRole(session.user, role as Role)) {
    return NextResponse.json(
      { error: "Only an Admin can promote another account to Admin" },
      { status: 403 },
    );
  }
  if (target.id === session.user.id && target.role === "ADMIN" && role !== "ADMIN") {
    return NextResponse.json(
      { error: "You cannot remove your own admin role" },
      { status: 400 },
    );
  }
  if (!isValidPermissionList(permissions)) {
    return NextResponse.json({ error: "Invalid permissions" }, { status: 400 });
  }
  if (password !== undefined && password !== "" && (typeof password !== "string" || password.length < 8)) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const trimmedUsername = username.trim();
  if (trimmedUsername !== target.username) {
    const existing = await prisma.user.findUnique({
      where: { username: trimmedUsername },
    });
    if (existing) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
    }
  }

  await prisma.user.update({
    where: { id },
    data: {
      username: trimmedUsername,
      role: role as Role,
      permissions,
      ...(password ? { passwordHash: await hash(password, 12) } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || !hasPermission(session.user, "users.delete")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 400 },
    );
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (target.role === "ADMIN" && session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Only an Admin can delete another Admin's account" },
      { status: 403 },
    );
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}