// seed.js - 48 Tim Piala Dunia 2026
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding 48 teams for World Cup 2026...\n");

  const teams = [
    // ===== GRUP A =====
    { name: "Qatar", code: "QAT", group: "A" },
    { name: "Ecuador", code: "ECU", group: "A" },
    { name: "Senegal", code: "SEN", group: "A" },
    { name: "Netherlands", code: "NED", group: "A" },

    // ===== GRUP B =====
    { name: "England", code: "ENG", group: "B" },
    { name: "Iran", code: "IRN", group: "B" },
    { name: "USA", code: "USA", group: "B" },
    { name: "Wales", code: "WAL", group: "B" },

    // ===== GRUP C =====
    { name: "Argentina", code: "ARG", group: "C" },
    { name: "Saudi Arabia", code: "KSA", group: "C" },
    { name: "Mexico", code: "MEX", group: "C" },
    { name: "Poland", code: "POL", group: "C" },

    // ===== GRUP D =====
    { name: "France", code: "FRA", group: "D" },
    { name: "Australia", code: "AUS", group: "D" },
    { name: "Denmark", code: "DEN", group: "D" },
    { name: "Tunisia", code: "TUN", group: "D" },

    // ===== GRUP E =====
    { name: "Spain", code: "ESP", group: "E" },
    { name: "Costa Rica", code: "CRC", group: "E" },
    { name: "Germany", code: "GER", group: "E" },
    { name: "Japan", code: "JPN", group: "E" },

    // ===== GRUP F =====
    { name: "Belgium", code: "BEL", group: "F" },
    { name: "Canada", code: "CAN", group: "F" },
    { name: "Morocco", code: "MAR", group: "F" },
    { name: "Croatia", code: "CRO", group: "F" },

    // ===== GRUP G =====
    { name: "Brazil", code: "BRA", group: "G" },
    { name: "Serbia", code: "SRB", group: "G" },
    { name: "Switzerland", code: "SUI", group: "G" },
    { name: "Cameroon", code: "CMR", group: "G" },

    // ===== GRUP H =====
    { name: "Portugal", code: "POR", group: "H" },
    { name: "Ghana", code: "GHA", group: "H" },
    { name: "Uruguay", code: "URU", group: "H" },
    { name: "South Korea", code: "KOR", group: "H" },

    // ===== GRUP I (2026 Tambahan) =====
    { name: "Italy", code: "ITA", group: "I" },
    { name: "Nigeria", code: "NGA", group: "I" },
    { name: "Chile", code: "CHI", group: "I" },
    { name: "Egypt", code: "EGY", group: "I" },

    // ===== GRUP J (2026 Tambahan) =====
    { name: "Colombia", code: "COL", group: "J" },
    { name: "Sweden", code: "SWE", group: "J" },
    { name: "Algeria", code: "ALG", group: "J" },
    { name: "Scotland", code: "SCO", group: "J" },

    // ===== GRUP K (2026 Tambahan) =====
    { name: "Ukraine", code: "UKR", group: "K" },
    { name: "Peru", code: "PER", group: "K" },
    { name: "Turkey", code: "TUR", group: "K" },
    { name: "South Africa", code: "RSA", group: "K" },

    // ===== GRUP L (2026 Tambahan) =====
    { name: "Austria", code: "AUT", group: "L" },
    { name: "Norway", code: "NOR", group: "L" },
    { name: "Greece", code: "GRE", group: "L" },
    { name: "Ivory Coast", code: "CIV", group: "L" },
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

  const allTeams = await prisma.team.findMany({
    orderBy: [{ group: "asc" }, { name: "asc" }],
  });

  console.log("\n📋 Teams by Group:");
  const groups = {};
  allTeams.forEach((t) => {
    if (!groups[t.group]) groups[t.group] = [];
    groups[t.group].push(t.name);
  });
  Object.keys(groups)
    .sort()
    .forEach((g) => {
      console.log(`   Group ${g}: ${groups[g].join(", ")}`);
    });

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
