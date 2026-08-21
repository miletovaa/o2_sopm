import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { assignableRoles } from "@/lib/roles";
import type { Role } from "@/generated/prisma/enums";

export async function POST(request: Request) {
  const session = await auth();
  const allowedRoles = assignableRoles(session?.user?.role);
  if (allowedRoles.length === 0) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const username = body?.username;
  const password = body?.password;
  const role = body?.role;

  if (typeof username !== "string" || !username.trim()) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }
  if (typeof role !== "string" || !allowedRoles.includes(role as Role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { username: username.trim() },
  });
  if (existing) {
    return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
  }

  const passwordHash = await hash(password, 12);
  const user = await prisma.user.create({
    data: { username: username.trim(), passwordHash, role: role as Role },
  });

  return NextResponse.json({ ok: true, id: user.id });
}