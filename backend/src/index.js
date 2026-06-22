// ============================================
// World Cup Simulator - Backend API (Single File)
// ============================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

// ============================================
// Setup
// ============================================
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "default-secret";

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// Helper Functions
// ============================================

/**
 * Middleware to verify JWT token for admin-only endpoints.
 * Expects header: Authorization: Bearer <token>
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

/**
 * Generate round-robin match schedule for a group.
 * Each team plays every other team exactly once.
 */
function generateRoundRobin(teams) {
  const matches = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        teamAId: teams[i].id,
        teamBId: teams[j].id,
      });
    }
  }
  return matches;
}

/**
 * Calculate standings for a group based on finished matches.
 * Win = +3 pts, Draw = +1 pt, Loss = 0 pts
 * Sort by: Points desc -> Goal Difference desc -> Goals For desc
 */
function calculateStandings(teams, matches) {
  // Initialize standings for each team
  const standings = teams.map((team) => ({
    teamId: team.id,
    teamName: team.name,
    teamCode: team.code,
    played: 0,
    won: 0,
    draw: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  }));

  // Create a map for quick lookup
  const standingsMap = {};
  standings.forEach((s) => {
    standingsMap[s.teamId] = s;
  });

  // Process each finished match
  for (const match of matches) {
    if (match.status !== "finished") continue;

    const teamA = standingsMap[match.teamAId];
    const teamB = standingsMap[match.teamBId];

    if (!teamA || !teamB) continue;

    // Update played count
    teamA.played += 1;
    teamB.played += 1;

    // Update goals
    teamA.goalsFor += match.scoreA;
    teamA.goalsAgainst += match.scoreB;
    teamB.goalsFor += match.scoreB;
    teamB.goalsAgainst += match.scoreA;

    // Determine result
    if (match.scoreA > match.scoreB) {
      // Team A wins
      teamA.won += 1;
      teamA.points += 3;
      teamB.lost += 1;
    } else if (match.scoreA < match.scoreB) {
      // Team B wins
      teamB.won += 1;
      teamB.points += 3;
      teamA.lost += 1;
    } else {
      // Draw
      teamA.draw += 1;
      teamA.points += 1;
      teamB.draw += 1;
      teamB.points += 1;
    }
  }

  // Calculate goal difference
  standings.forEach((s) => {
    s.goalDifference = s.goalsFor - s.goalsAgainst;
  });

  // Sort: Points desc -> GD desc -> GF desc
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return standings;
}

// ============================================
// Routes
// ============================================

// Health check
app.get("/", (req, res) => {
  res.json({ message: "World Cup Simulator API is running" });
});

// ----- AUTH -----

/**
 * POST /login
 * Admin login with password from .env
 * Returns JWT token on success
 */
app.post("/login", (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!password) {
    return res.status(400).json({ error: "Password is required." });
  }

  if (password !== adminPassword) {
    return res.status(401).json({ error: "Invalid password." });
  }

  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "24h" });
  res.json({ token });
});

// ----- TEAMS -----

/**
 * GET /teams
 * Public - List all teams
 */
app.get("/teams", async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      orderBy: [{ group: "asc" }, { name: "asc" }],
    });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch teams." });
  }
});

/**
 * POST /teams
 * Admin - Add a new team
 * Body: { name, code, group }
 */
app.post("/teams", requireAuth, async (req, res) => {
  const { name, code, group } = req.body;

  if (!name || !code || !group) {
    return res.status(400).json({ error: "name, code, and group are required." });
  }

  try {
    const existing = await prisma.team.findFirst({
      where: { OR: [{ name }, { code }] },
    });

    if (existing) {
      return res.status(409).json({ error: "Team with this name or code already exists." });
    }

    const team = await prisma.team.create({
      data: { name, code: code.toUpperCase(), group: group.toUpperCase() },
    });

    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ error: "Failed to create team." });
  }
});

// ----- GROUPS -----

/**
 * GET /groups
 * Public - List all groups with their member teams
 */
app.get("/groups", async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      orderBy: [{ group: "asc" }, { name: "asc" }],
    });

    // Group teams by group letter
    const groups = {};
    teams.forEach((team) => {
      if (!groups[team.group]) {
        groups[team.group] = [];
      }
      groups[team.group].push(team);
    });

    // Convert to array format
    const result = Object.entries(groups).map(([name, teams]) => ({
      name,
      teams,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch groups." });
  }
});

/**
 * GET /groups/:id/standings
 * Public - Get standings for a specific group
 * :id is the group letter (A, B, C, etc.)
 */
app.get("/groups/:id/standings", async (req, res) => {
  const groupId = req.params.id.toUpperCase();

  try {
    const teams = await prisma.team.findMany({
      where: { group: groupId },
    });

    if (teams.length === 0) {
      return res.status(404).json({ error: "Group not found." });
    }

    const teamIds = teams.map((t) => t.id);

    const matches = await prisma.match.findMany({
      where: {
        phase: "group",
        teamAId: { in: teamIds },
        teamBId: { in: teamIds },
      },
    });

    const standings = calculateStandings(teams, matches);

    res.json({
      group: groupId,
      standings,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch standings." });
  }
});

/**
 * GET /standings
 * Public - Get standings for all groups
 */
app.get("/standings", async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { group: "asc" },
    });

    // Get all group matches
    const matches = await prisma.match.findMany({
      where: { phase: "group" },
    });

    // Group teams by group
    const groups = {};
    teams.forEach((team) => {
      if (!groups[team.group]) {
        groups[team.group] = [];
      }
      groups[team.group].push(team);
    });

    // Calculate standings for each group
    const allStandings = Object.entries(groups).map(([groupName, groupTeams]) => {
      const teamIds = groupTeams.map((t) => t.id);
      const groupMatches = matches.filter(
        (m) => teamIds.includes(m.teamAId) && teamIds.includes(m.teamBId)
      );
      const standings = calculateStandings(groupTeams, groupMatches);

      return {
        group: groupName,
        standings,
      };
    });

    res.json(allStandings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch standings." });
  }
});

// ----- MATCHES -----

/**
 * GET /matches
 * Public - List all matches with team info
 */
app.get("/matches", async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      include: {
        teamA: true,
        teamB: true,
      },
      orderBy: [{ phase: "asc" }, { round: "asc" }, { id: "asc" }],
    });

    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch matches." });
  }
});

/**
 * PUT /matches/:id/result
 * Admin - Input match result
 * Body: { scoreA, scoreB }
 */
app.put("/matches/:id/result", requireAuth, async (req, res) => {
  const matchId = parseInt(req.params.id);
  const { scoreA, scoreB } = req.body;

  if (scoreA === undefined || scoreB === undefined) {
    return res.status(400).json({ error: "scoreA and scoreB are required." });
  }

  if (scoreA < 0 || scoreB < 0) {
    return res.status(400).json({ error: "Scores cannot be negative." });
  }

  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { teamA: true, teamB: true },
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found." });
    }

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        scoreA: parseInt(scoreA),
        scoreB: parseInt(scoreB),
        status: "finished",
      },
      include: {
        teamA: true,
        teamB: true,
      },
    });

    res.json(updatedMatch);
  } catch (err) {
    res.status(500).json({ error: "Failed to update match result." });
  }
});

// ----- TOURNAMENT -----

/**
 * POST /tournament/setup
 * Admin - Generate group stage schedule (round-robin)
 * Idempotent: won't create duplicate schedules
 */
app.post("/tournament/setup", requireAuth, async (req, res) => {
  try {
    // Check if group matches already exist
    const existingGroupMatches = await prisma.match.count({
      where: { phase: "group" },
    });

    if (existingGroupMatches > 0) {
      return res.status(409).json({
        error: "Group stage schedule already exists. Reset tournament first to regenerate.",
      });
    }

    // Get all teams grouped by group
    const teams = await prisma.team.findMany({
      orderBy: { group: "asc" },
    });

    if (teams.length === 0) {
      return res.status(400).json({ error: "No teams found. Add teams first." });
    }

    // Group teams by group letter
    const groups = {};
    teams.forEach((team) => {
      if (!groups[team.group]) {
        groups[team.group] = [];
      }
      groups[team.group].push(team);
    });

    // Generate round-robin matches for each group
    const allMatches = [];
    for (const [groupName, groupTeams] of Object.entries(groups)) {
      if (groupTeams.length < 2) {
        return res.status(400).json({
          error: `Group ${groupName} must have at least 2 teams.`,
        });
      }

      const pairings = generateRoundRobin(groupTeams);
      pairings.forEach((pair) => {
        allMatches.push({
          teamAId: pair.teamAId,
          teamBId: pair.teamBId,
          phase: "group",
          round: "group",
          status: "scheduled",
        });
      });
    }

    // Create all matches in a transaction
    const createdMatches = await prisma.$transaction(
      allMatches.map((match) => prisma.match.create({ data: match }))
    );

    res.status(201).json({
      message: `Group stage schedule created with ${createdMatches.length} matches.`,
      matches: createdMatches,
    });
  } catch (err) {
    console.error("Setup error:", err);
    res.status(500).json({ error: "Failed to generate group stage schedule." });
  }
});

/**
 * POST /tournament/advance
 * Admin - Advance to knockout phase
 * Requires all group matches to be finished
 * Generates knockout bracket for top 2 from each group
 */
app.post("/tournament/advance", requireAuth, async (req, res) => {
  try {
    // Check all group matches are finished
    const unfinishedGroupMatches = await prisma.match.count({
      where: { phase: "group", status: "scheduled" },
    });

    if (unfinishedGroupMatches > 0) {
      return res.status(400).json({
        error: `${unfinishedGroupMatches} group matches are still scheduled. Finish all group matches first.`,
      });
    }

    // Check if knockout already exists
    const existingKnockout = await prisma.match.count({
      where: { phase: "knockout" },
    });

    if (existingKnockout > 0) {
      return res.status(409).json({
        error: "Knockout phase already exists. Reset tournament first.",
      });
    }

    // Get all teams and group matches
    const teams = await prisma.team.findMany({
      orderBy: { group: "asc" },
    });

    const groupMatches = await prisma.match.findMany({
      where: { phase: "group" },
    });

    // Group teams by group
    const groups = {};
    teams.forEach((team) => {
      if (!groups[team.group]) {
        groups[team.group] = [];
      }
      groups[team.group].push(team);
    });

    // Get top 2 from each group
    const qualifiedTeams = [];
    for (const [groupName, groupTeams] of Object.entries(groups)) {
      const teamIds = groupTeams.map((t) => t.id);
      const groupGroupMatches = groupMatches.filter(
        (m) => teamIds.includes(m.teamAId) && teamIds.includes(m.teamBId)
      );
      const standings = calculateStandings(groupTeams, groupGroupMatches);

      if (standings.length < 2) {
        return res.status(400).json({
          error: `Group ${groupName} must have at least 2 teams to advance.`,
        });
      }

      qualifiedTeams.push({
        group: groupName,
        first: standings[0],
        second: standings[1],
      });
    }

    // Build knockout bracket
    const groupNames = Object.keys(groups).sort();

    if (groupNames.length < 2) {
      return res.status(400).json({ error: "Need at least 2 groups for knockout." });
    }

    const knockoutMatches = [];

    // Generate Round of 16 pairings
    // Standard World Cup format: A1 vs B2, C1 vs D2, E1 vs F2, G1 vs H2
    //                            B1 vs A2, D1 vs C2, F1 vs E2, H1 vs G2
    if (groupNames.length >= 4) {
      // Round of 16
      const r16Pairings = [];
      for (let i = 0; i < groupNames.length; i += 2) {
        const g1 = qualifiedTeams.find((q) => q.group === groupNames[i]);
        const g2 = qualifiedTeams.find((q) => q.group === groupNames[i + 1]);
        if (g1 && g2) {
          r16Pairings.push({ teamAId: g1.first.teamId, teamBId: g2.second.teamId });
          r16Pairings.push({ teamAId: g2.first.teamId, teamBId: g1.second.teamId });
        }
      }

      r16Pairings.forEach((pair) => {
        knockoutMatches.push({
          teamAId: pair.teamAId,
          teamBId: pair.teamBId,
          phase: "knockout",
          round: "round_of_16",
          status: "scheduled",
        });
      });

      // Quarterfinals (4 matches, teams TBD)
      for (let i = 0; i < 4; i++) {
        knockoutMatches.push({
          teamAId: null,
          teamBId: null,
          phase: "knockout",
          round: "quarterfinal",
          status: "scheduled",
        });
      }

      // Semifinals (2 matches, teams TBD)
      for (let i = 0; i < 2; i++) {
        knockoutMatches.push({
          teamAId: null,
          teamBId: null,
          phase: "knockout",
          round: "semifinal",
          status: "scheduled",
        });
      }

      // Final (1 match, teams TBD)
      knockoutMatches.push({
        teamAId: null,
        teamBId: null,
        phase: "knockout",
        round: "final",
        status: "scheduled",
      });
    } else if (groupNames.length === 2) {
      // Simple bracket: just final between group winners
      const g1 = qualifiedTeams.find((q) => q.group === groupNames[0]);
      const g2 = qualifiedTeams.find((q) => q.group === groupNames[1]);

      knockoutMatches.push({
        teamAId: g1.first.teamId,
        teamBId: g2.first.teamId,
        phase: "knockout",
        round: "final",
        status: "scheduled",
      });
    } else if (groupNames.length === 3) {
      // 3 groups: semifinals
      const g1 = qualifiedTeams.find((q) => q.group === groupNames[0]);
      const g2 = qualifiedTeams.find((q) => q.group === groupNames[1]);
      const g3 = qualifiedTeams.find((q) => q.group === groupNames[2]);

      // SF1: G1 winner vs G2 winner
      knockoutMatches.push({
        teamAId: g1.first.teamId,
        teamBId: g2.first.teamId,
        phase: "knockout",
        round: "semifinal",
        status: "scheduled",
      });

      // SF2: G3 winner vs TBD
      knockoutMatches.push({
        teamAId: g3.first.teamId,
        teamBId: null,
        phase: "knockout",
        round: "semifinal",
        status: "scheduled",
      });

      // Final
      knockoutMatches.push({
        teamAId: null,
        teamBId: null,
        phase: "knockout",
        round: "final",
        status: "scheduled",
      });
    }

    // Create knockout matches
    const createdMatches = await prisma.$transaction(
      knockoutMatches.map((match) => prisma.match.create({ data: match }))
    );

    res.status(201).json({
      message: `Knockout phase created with ${createdMatches.length} matches.`,
      matches: createdMatches,
    });
  } catch (err) {
    console.error("Advance error:", err);
    res.status(500).json({ error: "Failed to advance to knockout phase." });
  }
});

/**
 * DELETE /tournament/reset
 * Admin - Reset tournament (delete all matches, keep teams)
 */
app.delete("/tournament/reset", requireAuth, async (req, res) => {
  try {
    const deleted = await prisma.match.deleteMany({});

    res.json({
      message: "Tournament reset successfully.",
      deletedMatches: deleted.count,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset tournament." });
  }
});

// ----- BRACKET -----

/**
 * GET /bracket
 * Public - Get knockout bracket organized by rounds
 * Returns structure: { round_of_16, quarterfinal, semifinal, final, champion }
 */
app.get("/bracket", async (req, res) => {
  try {
    const knockoutMatches = await prisma.match.findMany({
      where: { phase: "knockout" },
      include: {
        teamA: true,
        teamB: true,
      },
      orderBy: [{ id: "asc" }],
    });

    if (knockoutMatches.length === 0) {
      return res.json({
        message: "No knockout matches found. Advance to knockout phase first.",
        bracket: null,
      });
    }

    // Organize matches by round
    const bracket = {
      round_of_16: [],
      quarterfinal: [],
      semifinal: [],
      final: [],
      champion: null,
    };

    knockoutMatches.forEach((match) => {
      const matchData = {
        id: match.id,
        teamA: match.teamA
          ? { id: match.teamA.id, name: match.teamA.name, code: match.teamA.code }
          : { id: null, name: "TBD", code: "TBD" },
        teamB: match.teamB
          ? { id: match.teamB.id, name: match.teamB.name, code: match.teamB.code }
          : { id: null, name: "TBD", code: "TBD" },
        scoreA: match.scoreA,
        scoreB: match.scoreB,
        status: match.status,
        round: match.round,
      };

      if (bracket[match.round]) {
        bracket[match.round].push(matchData);
      }
    });

    // Determine champion if final is finished
    const finalMatch = knockoutMatches.find((m) => m.round === "final");
    if (finalMatch && finalMatch.status === "finished") {
      const winnerId =
        finalMatch.scoreA > finalMatch.scoreB ? finalMatch.teamAId : finalMatch.teamBId;
      const winner = winnerId === finalMatch.teamAId ? finalMatch.teamA : finalMatch.teamB;

      bracket.champion = winner
        ? { id: winner.id, name: winner.name, code: winner.code }
        : null;
    }

    res.json(bracket);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bracket." });
  }
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
