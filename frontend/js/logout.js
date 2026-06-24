/**
 * Logout Page - Session Termination & UX
 */

import { setToken, isLoggedIn } from "./api.js";

/**
 * Format relative time (e.g., "2 jam yang lalu")
 */
function getSessionDuration() {
  const loginTime = localStorage.getItem("loginTime");
  if (!loginTime) return "Sesi aktif";

  const diff = Date.now() - parseInt(loginTime);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `Aktif selama ${hours} jam ${minutes % 60} menit`;
  }
  if (minutes > 0) {
    return `Aktif selama ${minutes} menit`;
  }
  return "Baru saja login";
}

/**
 * Update the UI based on login status
 */
function updateUI() {
  const sessionTimeEl = document.getElementById("session-time");
  const sessionStatusEl = document.getElementById("session-status");
  const logoutBtn = document.getElementById("btn-confirm-logout");

  if (isLoggedIn()) {
    sessionTimeEl.textContent = getSessionDuration();
    sessionStatusEl.innerHTML = '<span class="dot"></span> Aktif';
    sessionStatusEl.style.color = "#4ade80";

    // Animate the ring
    setTimeout(() => {
      document.querySelector(".logout-avatar-ring").classList.add("animate");
    }, 300);
  } else {
    sessionTimeEl.textContent = "Tidak ada sesi aktif";
    sessionStatusEl.innerHTML = '<span class="dot" style="background:#ef4444;animation:none"></span> Offline';
    sessionStatusEl.style.color = "#ef4444";
    logoutBtn.disabled = true;
    logoutBtn.style.opacity = "0.4";
    logoutBtn.style.cursor = "not-allowed";
  }
}

/**
 * Generate floating particles
 */
function createParticles() {
  const container = document.getElementById("logout-particles");
  if (!container) return;

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");

    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const delay = Math.random() * 5;
    const duration = 5 + Math.random() * 10;
    const size = 2 + Math.random() * 3;

    particle.style.left = `${x}%`;
    particle.style.top = `${y}%`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.animation = `particleDrift ${duration}s ${delay}s ease-in-out infinite`;

    container.appendChild(particle);
  }

  // Inject particle keyframes
  if (!document.getElementById("particle-keyframes")) {
    const style = document.createElement("style");
    style.id = "particle-keyframes";
    style.textContent = `
      @keyframes particleDrift {
        0%, 100% { opacity: 0; transform: translate(0, 0); }
        25% { opacity: 0.6; }
        50% { opacity: 0.3; transform: translate(${Math.random() > 0.5 ? "" : "-"}30px, -40px); }
        75% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Handle logout with animation
 */
async function handleLogout() {
  const btn = document.getElementById("btn-confirm-logout");
  const card = document.querySelector(".logout-card");

  // Start loading state
  btn.classList.add("loading");

  // Simulate a brief processing delay for UX
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Clear token
  setToken(null);
  localStorage.removeItem("loginTime");

  // Switch to success state
  btn.classList.remove("loading");
  card.classList.add("success");

  // Update UI elements
  const titleEl = document.querySelector(".logout-title");
  const subtitleEl = document.querySelector(".logout-subtitle");
  const avatarIcon = document.querySelector(".logout-avatar-icon .material-symbols-outlined");
  const sessionStatusEl = document.getElementById("session-status");

  titleEl.textContent = "Sampai Jumpa! 👋";
  subtitleEl.textContent = "Anda telah berhasil keluar dari sesi admin. Semua data sesi telah dihapus dengan aman.";
  avatarIcon.textContent = "check_circle";

  sessionStatusEl.innerHTML = '<span class="dot" style="background:#ef4444;animation:none"></span> Terputus';
  sessionStatusEl.style.color = "#ef4444";
  document.getElementById("session-time").textContent = "Sesi berakhir";

  // Replace buttons
  const actionsEl = document.querySelector(".logout-actions");
  actionsEl.innerHTML = `
    <a href="admin.html" class="btn-logout primary" style="text-decoration:none;background:linear-gradient(135deg,#d4af37 0%,#b8941f 100%);box-shadow:0 4px 20px rgba(212,175,55,0.2);">
      <span class="material-symbols-outlined">login</span>
      <span class="btn-text">Login Kembali</span>
    </a>
    <a href="../index.html" class="btn-logout secondary" style="text-decoration:none;">
      <span class="material-symbols-outlined">home</span>
      <span class="btn-text">Kembali ke Beranda</span>
    </a>
  `;
}

/**
 * Handle cancel – go back
 */
function handleCancel() {
  window.history.back();
}

// ---- Init ----
document.addEventListener("DOMContentLoaded", () => {
  updateUI();
  createParticles();

  document.getElementById("btn-confirm-logout").addEventListener("click", handleLogout);
  document.getElementById("btn-cancel-logout").addEventListener("click", handleCancel);
});
