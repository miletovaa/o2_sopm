import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assignableRoles, canManageUserWithRole } from "@/lib/roles";
import type { Role } from "@/generated/prisma/enums";

// Updates a user's username / role / (optionally) password. Only touches
// what an Admin/Employee is actually allowed to hand out — see
// assignableRoles in @/lib/roles.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canManageUserWithRole(session.user.role, target.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const username = body?.username;
  const role = body?.role;
  const password = body?.password;

  if (typeof username !== "string" || !username.trim()) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }
  if (typeof role !== "string" || !assignableRoles(session.user.role).includes(role as Role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (target.id === session.user.id && target.role === "ADMIN" && role !== "ADMIN") {
    return NextResponse.json(
      { error: "You cannot remove your own admin role" },
      { status: 400 },
    );
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
  if (!session) {
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
  if (!canManageUserWithRole(session.user.role, target.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}