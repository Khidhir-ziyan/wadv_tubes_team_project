/**
 * Standings Page - Fetch data from API
 */

import { getStandings } from "./api.js";

// State
let standingsData = null;
let refreshInterval = null;

/**
 * Fetch and render standings
 */
async function fetchStandings() {
  const container = document.getElementById("standings-container");

  try {
    container.innerHTML = `
            <div class="loading-text">
                <span class="loading-spinner spinner"></span>
                <p>Memuat data klasemen...</p>
            </div>
        `;

    const data = await getStandings();
    standingsData = data;
    renderStandings(data);
  } catch (error) {
    console.error("Error fetching standings:", error);
    container.innerHTML = `
            <div class="error-box">
                <span class="icon">❌</span>
                <p>Gagal memuat data klasemen</p>
                <p style="font-size:0.8rem;color:rgba(255,255,255,0.3);margin-top:0.5rem;">${error.message || "Unknown error"}</p>
                <button class="btn-retry" onclick="fetchStandings()">Coba Lagi</button>
            </div>
        `;
  }
}

/**
 * Render standings data
 */
function renderStandings(data) {
  const container = document.getElementById("standings-container");

  if (!data || data.length === 0) {
    container.innerHTML = `
            <div class="error-box">
                <span class="icon">📭</span>
                <p>Belum ada data klasemen</p>
                <p style="font-size:0.8rem;color:rgba(255,255,255,0.3);margin-top:0.5rem;">Pastikan admin sudah menginisialisasi turnamen</p>
            </div>
        `;
    return;
  }

  const totalGroups = data.length;
  const totalTeams = data.reduce((sum, g) => sum + g.standings.length, 0);

  let html = `
        <div class="stats-bar">
            <div class="stat-item">
                <div class="label">🏆 Grup</div>
                <div class="value">${totalGroups}</div>
            </div>
            <div class="stat-item">
                <div class="label">⚽ Tim</div>
                <div class="value">${totalTeams}</div>
            </div>
            <div class="stat-item">
                <div class="label">📊 Total Pertandingan</div>
                <div class="value">${(totalTeams * 3) / 2}</div>
            </div>
        </div>
        <div class="standings-grid">
    `;

  data.forEach((group) => {
    html += `
            <div class="group-card">
                <div class="group-header">
                    <span class="name">Grup ${group.group}</span>
                    <span class="badge">${group.standings.length} tim</span>
                </div>
                ${renderTable(group.standings)}
            </div>
        `;
  });

  html += `
        </div>
        <div class="standings-legend">
            <span><span class="dot"></span> ✅ = Lolos ke knockout (Top 2, setelah semua pertandingan selesai)</span>
        </div>
    `;

  container.innerHTML = html;
}

/**
 * Render standings table for one group
 */
function renderTable(standings) {
  // Sort: Points > GD > GF
  const sorted = [...standings].sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.goalDifference !== b.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  // Cek apakah semua tim sudah selesai bermain
  const allPlayed = sorted.every((team) => team.played === 3);

  let html = `
        <table class="standings-table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Tim</th>
                    <th>Main</th>
                    <th>M</th>
                    <th>S</th>
                    <th>K</th>
                    <th>GF</th>
                    <th>GA</th>
                    <th>GD</th>
                    <th>Poin</th>
                </tr>
            </thead>
            <tbody>
    `;

  sorted.forEach((team, index) => {
    const rank = index + 1;

    // ✅ FIX: Tim lolos hanya jika:
    // 1. Peringkat 1 atau 2
    // 2. DAN semua tim di grup sudah memainkan semua pertandingan (played === 3)
    const isQualified = rank <= 2 && allPlayed;

    let rankClass = "rank";
    if (rank === 1) rankClass += " rank-1";
    else if (rank === 2) rankClass += " rank-2";

    let gdClass = "gd";
    if (team.goalDifference > 0) gdClass += " gd-positive";
    else if (team.goalDifference < 0) gdClass += " gd-negative";
    else gdClass += " gd-zero";

    html += `
            <tr class="${isQualified ? "qualified" : ""}">
                <td class="${rankClass}">${rank}</td>
                <td class="team-name">
                    ${team.teamName || team.team}
                    <span class="team-code">${team.teamCode || team.team?.substring(0, 3).toUpperCase() || "???"}</span>
                    ${isQualified ? "" : ""}
                </td>
                <td>${team.played}</td>
                <td>${team.won}</td>
                <td>${team.draw}</td>
                <td>${team.lost}</td>
                <td>${team.goalsFor}</td>
                <td>${team.goalsAgainst}</td>
                <td class="${gdClass}">${team.goalDifference > 0 ? "+" : ""}${team.goalDifference}</td>
                <td class="points">${team.points}</td>
            </tr>
        `;
  });

  html += `
            </tbody>
        </table>
    `;

  return html;
}

// Expose for retry button
window.fetchStandings = fetchStandings;

// Auto-refresh every 30 seconds
function startAutoRefresh() {
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(fetchStandings, 30000);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  fetchStandings();
  startAutoRefresh();
});
