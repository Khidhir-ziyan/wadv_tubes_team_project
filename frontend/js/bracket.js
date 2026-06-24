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

    const teamAName = match.teamA?.name || "TBD";
    const teamBName = match.teamB?.name || "TBD";
    const teamACode = match.teamA?.code || "";
    const teamBCode = match.teamB?.code || "";

    const scoreA = isFinished && match.scoreA !== null ? match.scoreA : "";
    const scoreB = isFinished && match.scoreB !== null ? match.scoreB : "";

    const isAWinner = match.winner && match.winner.id === match.teamA?.id;
    const isBWinner = match.winner && match.winner.id === match.teamB?.id;

    // Cek apakah match sudah bisa diklik (hanya untuk yang ada teamnya, bukan TBD)
    const isClickable =
      match.teamA &&
      match.teamB &&
      match.teamA.name !== "TBD" &&
      match.teamB.name !== "TBD";

    html += `
            <div class="match-card ${statusClass} ${isClickable && !isFinished ? "clickable" : ""}" 
                 ${isClickable && !isFinished ? `onclick="openScoreModal(${match.id}, '${teamAName}', '${teamBName}')"` : ""}
                 style="${isClickable && !isFinished ? "cursor:pointer;" : ""}">
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
                ${isClickable && !isFinished ? '<div style="text-align:center;font-size:0.6rem;color:rgba(255,255,255,0.2);margin-top:0.2rem;">🖱️ Klik untuk input skor</div>' : ""}
                ${isFinished ? '<div style="text-align:center;font-size:0.6rem;color:#4ade80;margin-top:0.2rem;">✅ Selesai</div>' : ""}
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

// ============================================
// MODAL FUNCTIONS - Input Skor di Bracket
// ============================================

/**
 * Open modal for inputting match score
 */
window.openScoreModal = function (matchId, teamAName, teamBName) {
  const modal = document.getElementById("score-modal");
  const matchIdInput = document.getElementById("modal-match-id");
  const teamAEl = document.getElementById("modal-team-a");
  const teamBEl = document.getElementById("modal-team-b");
  const scoreAInput = document.getElementById("modal-score-a");
  const scoreBInput = document.getElementById("modal-score-b");
  const messageEl = document.getElementById("modal-message");

  // Reset form
  matchIdInput.value = matchId;
  teamAEl.textContent = teamAName || "TBD";
  teamBEl.textContent = teamBName || "TBD";
  scoreAInput.value = 0;
  scoreBInput.value = 0;
  messageEl.classList.add("hidden");
  messageEl.textContent = "";

  // Show modal
  modal.classList.remove("hidden");
};

/**
 * Close modal
 */
window.closeModal = function () {
  document.getElementById("score-modal").classList.add("hidden");
};

/**
 * Submit score from modal
 */
async function submitScoreFromModal(e) {
  e.preventDefault();

  const matchId = document.getElementById("modal-match-id").value;
  const scoreA = parseInt(document.getElementById("modal-score-a").value);
  const scoreB = parseInt(document.getElementById("modal-score-b").value);
  const messageEl = document.getElementById("modal-message");

  // Validate
  if (isNaN(scoreA) || isNaN(scoreB) || scoreA < 0 || scoreB < 0) {
    messageEl.textContent = "❌ Masukkan skor yang valid (minimal 0)!";
    messageEl.className = "mt-3 text-sm text-center text-red-400";
    messageEl.classList.remove("hidden");
    return;
  }

  // Check if logged in
  const token = localStorage.getItem("adminToken");
  if (!token) {
    messageEl.textContent =
      "❌ Anda harus login di halaman Admin terlebih dahulu!";
    messageEl.className = "mt-3 text-sm text-center text-red-400";
    messageEl.classList.remove("hidden");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3001/matches/${matchId}/result`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scoreA, scoreB }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Gagal menyimpan skor");
    }

    messageEl.textContent = `✅ Skor berhasil disimpan! ${data.teamA?.name || "Team A"} ${scoreA} - ${scoreB} ${data.teamB?.name || "Team B"}`;
    messageEl.className = "mt-3 text-sm text-center text-green-400";
    messageEl.classList.remove("hidden");

    // Close modal after 1.5s and refresh bracket
    setTimeout(() => {
      closeModal();
      fetchBracket();
    }, 1500);
  } catch (error) {
    console.error("Error saving score:", error);
    messageEl.textContent = `❌ ${error.message || "Gagal menyimpan skor"}`;
    messageEl.className = "mt-3 text-sm text-center text-red-400";
    messageEl.classList.remove("hidden");
  }
}

// Event listener for modal form
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("modal-score-form");
  if (form) {
    form.addEventListener("submit", submitScoreFromModal);
  }
});

// Close modal on escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
  }
});

// Close modal on backdrop click
document.addEventListener("click", (e) => {
  const modal = document.getElementById("score-modal");
  if (e.target === modal) {
    closeModal();
  }
});
