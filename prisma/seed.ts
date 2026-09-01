import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function upsertUser(
  username: string,
  password: string,
  role: "ADMIN" | "USER",
  permissions: string[] = [],
) {
  const passwordHash = await hash(password, 12);
  return prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, passwordHash, role, permissions },
  });
}

async function main() {
  // Env var names predate the Admin/User permission-toggle model (they used to seed an
  // Employee/Student pair) but are kept as-is so existing .env files don't need updating.
  const adminPassword = process.env.SEED_EMPLOYEE_PASSWORD ?? "changeme-admin";
  const staffPassword = process.env.SEED_STUDENT_PASSWORD ?? "changeme-staff";

  const admin = await upsertUser("admin", adminPassword, "ADMIN");
  const staff = await upsertUser("student", staffPassword, "USER", [
    "content.edit",
    "content.new_version",
    "content.delete",
  ]);

  const analysisTypes = ["Isotope Analysis", "Fatty Acid Analysis", "Multi-Element Analysis"];
  const foodCategories = ["Meat", "Fish", "Apples", "Honey"];

  for (const name of analysisTypes) {
    const existing = await prisma.analysisType.findFirst({
      where: { name, parentId: null },
    });
    if (!existing) {
      await prisma.analysisType.create({ data: { name, parentId: null } });
    }
  }
  await Promise.all(
    foodCategories.map((name) =>
      prisma.foodCategory.upsert({ where: { name }, update: {}, create: { name } }),
    ),
  );

  console.log("Seeded users:");
  console.log(`  admin: username="${admin.username}" password="${adminPassword}"`);
  console.log(`  staff: username="${staff.username}" password="${staffPassword}" (full content permissions)`);
  console.log("Change these passwords after first login.");
  console.log(`Seeded ${analysisTypes.length} analysis types and ${foodCategories.length} food categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
