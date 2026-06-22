/**
 * Bracket Page - Fetch data from API
 */

import { getBracket } from "./api.js";

// State
let bracketData = null;
let refreshInterval = null;

const ROUND_NAMES = {
  round_of_16: "Babak 16 Besar",
  quarterfinal: "Perempat Final",
  semifinal: "Semi Final",
  final: "Final",
};

const ROUND_ORDER = ["round_of_16", "quarterfinal", "semifinal", "final"];

/**
 * Fetch and render bracket
 */
async function fetchBracket() {
  const container = document.getElementById("bracket-container");

  try {
    container.innerHTML = `
            <div class="loading-text">
                <span class="loading-spinner spinner"></span>
                <p>Memuat data bracket...</p>
            </div>
        `;

    const data = await getBracket();
    bracketData = data;
    renderBracket(data);
  } catch (error) {
    console.error("Error fetching bracket:", error);
    container.innerHTML = `
            <div class="error-box">
                <span class="icon">❌</span>
                <p>Gagal memuat data bracket</p>
                <p style="font-size:0.8rem;color:rgba(255,255,255,0.3);margin-top:0.5rem;">${error.message || "Unknown error"}</p>
                <button class="btn-retry" onclick="fetchBracket()">Coba Lagi</button>
            </div>
        `;
  }
}

/**
 * Render bracket data
 */
function renderBracket(data) {
  const container = document.getElementById("bracket-container");

  // Check if bracket exists
  if (
    !data ||
    (!data.round_of_16 && !data.quarterfinal && !data.semifinal && !data.final)
  ) {
    container.innerHTML = `
            <div class="no-bracket">
                <span class="icon">🏆</span>
                <h3>Belum Ada Bracket</h3>
                <p>Fase knockout belum dimulai.</p>
                <p style="font-size:0.8rem;color:rgba(255,255,255,0.2);margin-top:0.5rem;">
                    Pastikan semua pertandingan grup sudah selesai dan admin sudah melakukan advance.
                </p>
            </div>
        `;
    return;
  }

  let html = '<div class="bracket-wrapper"><div class="bracket">';

  // Build rounds in order
  const rounds = ROUND_ORDER.filter(
    (key) => data[key] && data[key].length > 0,
  ).map((key) => ({
    key: key,
    name: ROUND_NAMES[key] || key,
    matches: data[key],
  }));

  if (rounds.length === 0) {
    container.innerHTML = `
            <div class="no-bracket">
                <span class="icon">🏆</span>
                <h3>Belum Ada Bracket</h3>
                <p>Fase knockout belum dimulai.</p>
            </div>
        `;
    return;
  }

  rounds.forEach((round) => {
    html += `
            <div class="round-column">
                <div class="round-title">${round.name}</div>
                ${renderMatches(round.matches)}
            </div>
        `;
  });

  html += "</div></div>";

  // Add champion if exists
  if (data.champion) {
    html += `
            <div class="champion-section">
                <span class="trophy">🏆</span>
                <div class="title">JUARA DUNIA</div>
                <div class="name">${data.champion.name || data.champion}</div>
                <div class="sub">Selamat kepada tim ${data.champion.name || data.champion}!</div>
            </div>
        `;
  }

  container.innerHTML = html;
}

/**
 * Render matches for a round
 */
function renderMatches(matches) {
  if (!matches || matches.length === 0) {
    return `
            <div class="match-card scheduled">
                <div class="match-teams">
                    <div class="team-slot">
                        <span class="tbd">TBD</span>
                    </div>
                    <div class="match-vs">vs</div>
                    <div class="team-slot">
                        <span class="tbd">TBD</span>
                    </div>
                </div>
            </div>
        `;
  }

  let html = "";

  matches.forEach((match) => {
    const isFinished = match.status === "finished";
    const statusClass = isFinished ? "finished" : "scheduled";
    const winner =
      match.winner ||
      (isFinished && match.scoreA > match.scoreB
        ? match.teamA?.name
        : match.teamB?.name);

    const teamAName = match.teamA?.name || "TBD";
    const teamBName = match.teamB?.name || "TBD";
    const teamACode = match.teamA?.code || "";
    const teamBCode = match.teamB?.code || "";

    const scoreA = isFinished && match.scoreA !== null ? match.scoreA : "";
    const scoreB = isFinished && match.scoreB !== null ? match.scoreB : "";

    const isAWinner = winner === match.teamA?.name;
    const isBWinner = winner === match.teamB?.name;

    html += `
            <div class="match-card ${statusClass}">
                <div class="match-teams">
                    <div class="team-slot ${isAWinner ? "winner" : ""}">
                        <span class="name">${teamAName}${teamACode ? " (" + teamACode + ")" : ""}</span>
                        <span class="score">${scoreA}</span>
                    </div>
                    <div class="match-vs">vs</div>
                    <div class="team-slot ${isBWinner ? "winner" : ""}">
                        <span class="name">${teamBName}${teamBCode ? " (" + teamBCode + ")" : ""}</span>
                        <span class="score">${scoreB}</span>
                    </div>
                </div>
            </div>
        `;
  });

  return html;
}

// Expose for retry button
window.fetchBracket = fetchBracket;

// Auto-refresh every 30 seconds
function startAutoRefresh() {
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(fetchBracket, 30000);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  fetchBracket();
  startAutoRefresh();
});
