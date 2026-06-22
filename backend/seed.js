// seed.js - Tambahkan tim contoh ke database
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding teams...\n");

  const teams = [
    // Group A
    { name: "Brazil", code: "BRA", group: "A" },
    { name: "Argentina", code: "ARG", group: "A" },
    { name: "France", code: "FRA", group: "A" },
    // Group B
    { name: "Spain", code: "ESP", group: "B" },
    { name: "Portugal", code: "POR", group: "B" },
    { name: "Germany", code: "GER", group: "B" },
    // Group C (opsional)
    { name: "England", code: "ENG", group: "C" },
    { name: "Netherlands", code: "NED", group: "C" },
    { name: "Italy", code: "ITA", group: "C" },
    // Group D (opsional)
    { name: "Belgium", code: "BEL", group: "D" },
    { name: "Croatia", code: "CRO", group: "D" },
    { name: "Denmark", code: "DEN", group: "D" },
  ];

  let added = 0;
  let skipped = 0;

  for (const team of teams) {
    try {
      await prisma.team.create({ data: team });
      console.log(
        `✅ Added ${team.name} (${team.code}) to Group ${team.group}`,
      );
      added++;
    } catch (e) {
      console.log(`⚠️ Skipped ${team.name} (already exists)`);
      skipped++;
    }
  }

  console.log("\n📊 Summary:");
  console.log(`   ✅ ${added} teams added`);
  console.log(`   ⏭️ ${skipped} teams skipped`);

  // Tampilkan semua tim yang sudah ada
  const allTeams = await prisma.team.findMany({
    orderBy: [{ group: "asc" }, { name: "asc" }],
  });

  console.log("\n📋 Teams in database:");
  allTeams.forEach((t) => {
    console.log(`   Group ${t.group}: ${t.name} (${t.code})`);
  });

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
