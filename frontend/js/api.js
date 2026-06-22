/**
 * API Configuration - World Cup Simulator
 * Base URL: http://localhost:3001
 */

const API_BASE_URL = "http://localhost:3001";

// Token management
let authToken = localStorage.getItem("adminToken") || null;

export function setToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem("adminToken", token);
  } else {
    localStorage.removeItem("adminToken");
  }
}

export function getToken() {
  return authToken;
}

export function isLoggedIn() {
  return !!authToken;
}

/**
 * Generic fetch function with error handling
 */
export async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const finalOptions = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, finalOptions);

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw {
        status: response.status,
        message: data?.error || data || `HTTP ${response.status}`,
        data: data,
      };
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// ============ AUTH ============

export async function login(password) {
  const result = await fetchAPI("/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });

  if (result.token) {
    setToken(result.token);
  }

  return result;
}

// ============ TEAMS ============

export function getTeams() {
  return fetchAPI("/teams");
}

export function addTeam(name, code, group) {
  return fetchAPI("/teams", {
    method: "POST",
    body: JSON.stringify({ name, code, group }),
  });
}

// ============ GROUPS & STANDINGS ============

export function getGroups() {
  return fetchAPI("/groups");
}

export function getGroupStandings(groupId) {
  return fetchAPI(`/groups/${groupId}/standings`);
}

export function getStandings() {
  return fetchAPI("/standings");
}

// ============ MATCHES ============

export function getMatches() {
  return fetchAPI("/matches");
}

export function inputMatchResult(matchId, scoreA, scoreB) {
  return fetchAPI(`/matches/${matchId}/result`, {
    method: "PUT",
    body: JSON.stringify({ scoreA, scoreB }),
  });
}

// ============ TOURNAMENT ============

export function setupTournament() {
  return fetchAPI("/tournament/setup", {
    method: "POST",
  });
}

export function advanceTournament() {
  return fetchAPI("/tournament/advance", {
    method: "POST",
  });
}

export function resetTournament() {
  return fetchAPI("/tournament/reset", {
    method: "DELETE",
  });
}

// ============ BRACKET ============

export function getBracket() {
  return fetchAPI("/bracket");
}
