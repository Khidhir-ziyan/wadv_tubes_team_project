/**
 * Schedule Page - Fetch data from API
 */

import { getMatches } from "./api.js";

// State
let matchesData = [];
let currentFilter = "all";
let currentStatus = "all";

/**
 * Fetch and render matches
 */
async function fetchMatches() {
  const container = document.getElementById("schedule-container");

  try {
    container.innerHTML = `
            <div class="loading-text">
                <span class="loading-spinner spinner"></span>
                <p>Memuat jadwal pertandingan...</p>
            </div>
        `;

    const data = await getMatches();
    matchesData = data;
    renderMatches(data);
  } catch (error) {
    console.error("Error fetching matches:", error);
    container.innerHTML = `
            <div class="error-box">
                <span class="icon">❌</span>
                <p>Gagal memuat jadwal pertandingan</p>
                <p style="font-size:0.8rem;color:rgba(255,255,255,0.3);margin-top:0.5rem;">${error.message || "Unknown error"}</p>
                <button class="btn-retry" onclick="fetchMatches()">Coba Lagi</button>
            </div>
        `;
  }
}

/**
 * Render matches with filters
 */
function renderMatches(data) {
  const container = document.getElementById("schedule-container");

  if (!data || data.length === 0) {
    container.innerHTML = `
            <div class="error-box">
                <span class="icon">📭</span>
                <p>Belum ada pertandingan</p>
                <p style="font-size:0.8rem;color:rgba(255,255,255,0.3);margin-top:0.5rem;">Admin perlu meng-generate jadwal terlebih dahulu</p>
            </div>
        `;
    return;
  }

  // Filter data
  let filtered = data;

  // Filter by group
  if (currentFilter !== "all") {
    filtered = filtered.filter(
      (match) =>
        match.teamA?.group === currentFilter ||
        match.teamB?.group === currentFilter,
    );
  }

  // Filter by status
  if (currentStatus !== "all") {
    filtered = filtered.filter((match) => match.status === currentStatus);
  }

  // Group by round/date
  const grouped = groupMatchesByRound(filtered);

  let html = "";

  Object.keys(grouped).forEach((round) => {
    const matches = grouped[round];
    html += `
            <div class="match-day">
                <div class="match-day-header">
                    <h3>${round}</h3>
                    <div class="line"></div>
                    <span style="font-size:0.7rem;color:rgba(255,255,255,0.2);">${matches.length} pertandingan</span>
                </div>
                <div class="match-grid">
                    ${matches.map((match) => renderMatchCard(match)).join("")}
                </div>
            </div>
        `;
  });

  if (filtered.length === 0) {
    html = `
            <div class="error-box">
                <span class="icon">🔍</span>
                <p>Tidak ada pertandingan dengan filter ini</p>
            </div>
        `;
  }

  container.innerHTML = html;
}

/**
 * Group matches by round
 */
function groupMatchesByRound(matches) {
  const groups = {};

  matches.forEach((match) => {
    const key =
      match.round === "group"
        ? `Grup ${match.teamA?.group || "?"}`
        : match.round;
    if (!groups[key]) groups[key] = [];
    groups[key].push(match);
  });

  return groups;
}

/**
 * Render single match card
 */
function renderMatchCard(match) {
  const isFinished = match.status === "finished";
  const isLive = match.status === "live";

  let statusText = "Scheduled";
  let statusClass = "scheduled";

  if (isFinished) {
    statusText = "Selesai";
    statusClass = "finished";
  } else if (isLive) {
    statusText = "Live";
    statusClass = "live";
  }

  const teamAName = match.teamA?.name || "TBD";
  const teamBName = match.teamB?.name || "TBD";
  const teamACode = match.teamA?.code || "";
  const teamBCode = match.teamB?.code || "";

  const scoreA = isFinished && match.scoreA !== null ? match.scoreA : "";
  const scoreB = isFinished && match.scoreB !== null ? match.scoreB : "";

  const groupName = match.teamA?.group ? `Grup ${match.teamA.group}` : "Group";

  return `
        <div class="match-card-schedule">
            <div class="match-info">
                <span class="group">${groupName}</span>
                <span class="status ${statusClass}">${statusText}</span>
            </div>
            <div class="teams">
                <div class="team">
                    <div class="flag">${teamACode || "?"}</div>
                    <span class="name">${teamAName}</span>
                </div>
                <div class="score-display">
                    ${isFinished ? `${scoreA} - ${scoreB}` : '<span class="vs">VS</span>'}
                </div>
                <div class="team">
                    <div class="flag">${teamBCode || "?"}</div>
                    <span class="name">${teamBName}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Filter handlers
 */
window.filterByGroup = function (group) {
  currentFilter = group;
  // Update active button
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.group === group);
  });
  renderMatches(matchesData);
};

window.filterByStatus = function (status) {
  currentStatus = status;
  renderMatches(matchesData);
};

// Expose for retry button
window.fetchMatches = fetchMatches;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  fetchMatches();
});
