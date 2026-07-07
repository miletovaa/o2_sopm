import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function upsertUser(username: string, password: string, role: "EMPLOYEE" | "STUDENT") {
  const passwordHash = await hash(password, 12);
  return prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, passwordHash, role },
  });
}

async function main() {
  const employeePassword = process.env.SEED_EMPLOYEE_PASSWORD ?? "changeme-employee";
  const studentPassword = process.env.SEED_STUDENT_PASSWORD ?? "changeme-student";

  const employee = await upsertUser("admin", employeePassword, "EMPLOYEE");
  const student = await upsertUser("student", studentPassword, "STUDENT");

  console.log("Seeded users:");
  console.log(`  employee: username="${employee.username}" password="${employeePassword}"`);
  console.log(`  student:  username="${student.username}" password="${studentPassword}"`);
  console.log("Change these passwords after first login.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
