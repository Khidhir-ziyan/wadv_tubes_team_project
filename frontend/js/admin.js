/**
 * Admin Page - Authentication & Tournament Management
 */

import {
  login as apiLogin, // <-- UBAH NAMA IMPORT
  getMatches,
  inputMatchResult,
  setupTournament,
  advanceTournament,
  resetTournament,
  autoGenerateAllResults,
  isLoggedIn,
  getToken,
} from "./api.js";

// State
let matchesList = [];
let token = getToken();

/**
 * Show logout button in the auth card
 */
function showLogoutButton() {
  const existing = document.getElementById("logout-link");
  if (existing) return;

  const statusBadge = document.getElementById("status-badge");
  if (!statusBadge) return;

  const logoutLink = document.createElement("a");
  logoutLink.id = "logout-link";
  logoutLink.href = "logout.html";
  logoutLink.className = "btn-admin danger w-full";
  logoutLink.style.cssText = "margin-top:0.75rem;text-decoration:none;justify-content:center;";
  logoutLink.innerHTML = '<span class="material-symbols-outlined">logout</span> Logout';

  statusBadge.parentElement.appendChild(logoutLink);
}

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
    showLogoutButton();
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
    const result = await apiLogin(password); // <-- PAKAI NAMA BARU

    statusBadge.innerHTML = '<span class="dot online"></span> Logged In';
    statusBadge.className = "status-badge text-green-400";

    // Save login timestamp for session tracking
    localStorage.setItem("loginTime", Date.now().toString());

    document
      .getElementById("match-section")
      .classList.remove("disabled-overlay");
    document
      .getElementById("mgmt-section")
      .classList.remove("disabled-overlay");

    // Show logout button
    showLogoutButton();

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

    loadMatches();

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

/**
 * Auto generate all match results
 */
async function handleAutoGenerateResults() {
  const totalMatches = matchesList.filter(
    (m) => m.status === "scheduled",
  ).length;

  if (totalMatches === 0) {
    alert(
      "⚠️ Tidak ada pertandingan yang tersisa untuk di-generate.\n\nSemua pertandingan sudah memiliki hasil atau belum ada jadwal.",
    );
    return;
  }

  if (
    !confirm(
      `⚠️ Generate skor random untuk ${totalMatches} pertandingan?\n\nIni akan mengisi SEMUA pertandingan yang masih "scheduled" dengan skor acak (0-4).`,
    )
  ) {
    return;
  }

  try {
    const btn = document.getElementById("btn-auto-results");
    btn.disabled = true;
    btn.textContent = "⏳ Generating...";

    const result = await autoGenerateAllResults();
    console.log("Auto generate results:", result);

    alert(
      `✅ ${result.message}\n\nSemua pertandingan sekarang sudah memiliki hasil!`,
    );

    await loadMatches();

    btn.disabled = false;
    btn.innerHTML =
      '<span class="material-symbols-outlined">shuffle</span> 🎲 Auto Generate All Results (Dummy)';
  } catch (error) {
    console.error("Error auto generating results:", error);
    alert(`❌ Gagal generate hasil: ${error.message || "Unknown error"}`);

    const btn = document.getElementById("btn-auto-results");
    btn.disabled = false;
    btn.innerHTML =
      '<span class="material-symbols-outlined">shuffle</span> 🎲 Auto Generate All Results (Dummy)';
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
  document
    .getElementById("btn-auto-results")
    .addEventListener("click", handleAutoGenerateResults);
});

// Expose for inline onclick
window.handleLogin = handleLogin;
window.handleSubmitResult = handleSubmitResult;
window.handleSetupTournament = handleSetupTournament;
window.handleAdvanceTournament = handleAdvanceTournament;
window.handleResetTournament = handleResetTournament;
window.handleAutoGenerateResults = handleAutoGenerateResults;
