import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash("1010", 10);
  await prisma.user.upsert({
    where: { username: "zwanje" },
    update: {},
    create: {
      name: "관리자",
      username: "zwanje",
      password: hashed,
      email: "admin@jukbang.club",
      phone: "000-0000-0000",
      role: "ADMIN",
    },
  });

  for (let i = 1; i <= 6; i++) {
    await prisma.broadcastTable.upsert({
      where: { tableNumber: i },
      update: {},
      create: { tableNumber: i, status: "WAITING", isActive: false },
    });
  }

  await prisma.board.upsert({
    where: { slug: "competition" },
    update: {},
    create: { slug: "competition", name: "시합문의" },
  });
  await prisma.board.upsert({
    where: { slug: "lesson" },
    update: {},
    create: { slug: "lesson", name: "레슨문의" },
  });

  await prisma.siteSetting.upsert({
    where: { key: "mainBannerUrl" },
    update: {},
    create: { key: "mainBannerUrl", value: "" },
  });
  await prisma.siteSetting.upsert({
    where: { key: "mainBannerTitle" },
    update: {},
    create: { key: "mainBannerTitle", value: "당일 당구 시합 안내" },
  });
  await prisma.siteSetting.upsert({
    where: { key: "bankAccount" },
    update: {},
    create: { key: "bankAccount", value: "" },
  });
  await prisma.siteSetting.upsert({
    where: { key: "venueIntro" },
    update: {},
    create: { key: "venueIntro", value: "" },
  });
  await prisma.siteSetting.upsert({
    where: { key: "venueIntroMapAddress" },
    update: {},
    create: { key: "venueIntroMapAddress", value: "" },
  });

  console.log("Seed done. Admin: zwanje / 1010");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
