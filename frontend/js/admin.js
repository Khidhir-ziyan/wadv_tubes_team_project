/**
 * Admin Page - Authentication & Tournament Management
 */

import {
  login,
  getMatches,
  inputMatchResult,
  setupTournament,
  advanceTournament,
  resetTournament,
  isLoggedIn,
  getToken,
} from "./api.js";

// State
let matchesList = [];
let token = getToken();

/**
 * Check login status on load
 */
function checkAuth() {
  const statusBadge = document.getElementById("status-badge");
  const matchSection = document.getElementById("match-section");
  const mgmtSection = document.getElementById("mgmt-section");

  if (isLoggedIn()) {
    statusBadge.innerHTML = '<span class="dot online"></span> Logged In';
    statusBadge.className = "status-badge text-green-400";
    matchSection.classList.remove("disabled-overlay");
    mgmtSection.classList.remove("disabled-overlay");
    loadMatches();
  } else {
    statusBadge.innerHTML = '<span class="dot offline"></span> Logged Out';
    statusBadge.className = "status-badge text-red-400";
    matchSection.classList.add("disabled-overlay");
    mgmtSection.classList.add("disabled-overlay");
  }
}

/**
 * Login handler
 */
async function handleLogin(e) {
  e.preventDefault();

  const password = document.getElementById("admin-password").value;
  const statusBadge = document.getElementById("status-badge");

  try {
    const result = await login(password);

    statusBadge.innerHTML = '<span class="dot online"></span> Logged In';
    statusBadge.className = "status-badge text-green-400";

    document
      .getElementById("match-section")
      .classList.remove("disabled-overlay");
    document
      .getElementById("mgmt-section")
      .classList.remove("disabled-overlay");

    loadMatches();

    alert("✅ Login berhasil! Token tersimpan.");
  } catch (error) {
    console.error("Login error:", error);
    statusBadge.innerHTML = '<span class="dot offline"></span> Login Failed';
    statusBadge.className = "status-badge text-red-400";
    alert("❌ Password salah!");
  }
}

/**
 * Load matches for dropdown
 */
async function loadMatches() {
  try {
    const data = await getMatches();
    matchesList = data;
    populateMatchSelect(data);
  } catch (error) {
    console.error("Error loading matches:", error);
  }
}

/**
 * Populate match select dropdown
 */
function populateMatchSelect(matches) {
  const select = document.getElementById("match-select");
  select.innerHTML = '<option value="">Pilih Pertandingan...</option>';

  matches.forEach((match) => {
    const teamA = match.teamA?.name || "TBD";
    const teamB = match.teamB?.name || "TBD";
    const status = match.status === "finished" ? "✅" : "⏳";
    const option = document.createElement("option");
    option.value = match.id;
    option.textContent = `${teamA} vs ${teamB} (${match.phase}) ${status}`;
    select.appendChild(option);
  });
}

/**
 * Submit match result
 */
async function handleSubmitResult(e) {
  e.preventDefault();

  const matchId = document.getElementById("match-select").value;
  const scoreA = parseInt(document.getElementById("score-a").value);
  const scoreB = parseInt(document.getElementById("score-b").value);

  if (!matchId) {
    alert("❌ Pilih pertandingan terlebih dahulu!");
    return;
  }

  if (isNaN(scoreA) || isNaN(scoreB) || scoreA < 0 || scoreB < 0) {
    alert("❌ Masukkan skor yang valid (minimal 0)!");
    return;
  }

  try {
    const result = await inputMatchResult(matchId, scoreA, scoreB);
    console.log("Result saved:", result);
    alert(
      `✅ Hasil pertandingan berhasil disimpan!\n${result.teamA?.name || "Team A"} ${scoreA} - ${scoreB} ${result.teamB?.name || "Team B"}`,
    );

    // Refresh match list
    loadMatches();

    // Clear form
    document.getElementById("score-a").value = "";
    document.getElementById("score-b").value = "";
    document.getElementById("match-select").value = "";
  } catch (error) {
    console.error("Error saving result:", error);
    alert(`❌ Gagal menyimpan hasil: ${error.message || "Unknown error"}`);
  }
}

/**
 * Setup tournament
 */
async function handleSetupTournament() {
  if (!confirm("⚠️ Generate jadwal fase grup untuk semua tim?")) return;

  try {
    const result = await setupTournament();
    console.log("Tournament setup:", result);
    alert(`✅ ${result.message || "Jadwal fase grup berhasil dibuat!"}`);
    loadMatches();
  } catch (error) {
    console.error("Error setting up tournament:", error);
    alert(`❌ Gagal generate jadwal: ${error.message || "Unknown error"}`);
  }
}

/**
 * Advance to knockout
 */
async function handleAdvanceTournament() {
  if (
    !confirm(
      "⚠️ Lanjutkan ke fase knockout? Pastikan semua pertandingan grup sudah selesai!",
    )
  )
    return;

  try {
    const result = await advanceTournament();
    console.log("Tournament advanced:", result);
    alert(`✅ ${result.message || "Fase knockout berhasil dibuat!"}`);
  } catch (error) {
    console.error("Error advancing tournament:", error);
    alert(`❌ Gagal advance: ${error.message || "Unknown error"}`);
  }
}

/**
 * Reset tournament
 */
async function handleResetTournament() {
  if (
    !confirm("⚠️ PERINGATAN! Ini akan menghapus SEMUA pertandingan. Lanjutkan?")
  )
    return;
  if (!confirm("⚠️ Yakin? Data tidak bisa dikembalikan!")) return;

  try {
    const result = await resetTournament();
    console.log("Tournament reset:", result);
    alert(
      `✅ Turnamen berhasil di-reset! ${result.deletedMatches || 0} pertandingan dihapus.`,
    );
    loadMatches();
  } catch (error) {
    console.error("Error resetting tournament:", error);
    alert(`❌ Gagal reset: ${error.message || "Unknown error"}`);
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();

  document.getElementById("login-form").addEventListener("submit", handleLogin);
  document
    .getElementById("result-form")
    .addEventListener("submit", handleSubmitResult);
  document
    .getElementById("btn-setup")
    .addEventListener("click", handleSetupTournament);
  document
    .getElementById("btn-advance")
    .addEventListener("click", handleAdvanceTournament);
  document
    .getElementById("btn-reset")
    .addEventListener("click", handleResetTournament);
});

// Expose for inline onclick
window.handleLogin = handleLogin;
window.handleSubmitResult = handleSubmitResult;
window.handleSetupTournament = handleSetupTournament;
window.handleAdvanceTournament = handleAdvanceTournament;
window.handleResetTournament = handleResetTournament;
