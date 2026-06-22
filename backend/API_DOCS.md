# World Cup Simulator API Documentation

Base URL: `http://localhost:3001`

---

## Authentication

Admin endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### POST /login
Admin login to get JWT token.

**Auth:** No

**Request Body:**
```json
{
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (401):**
```json
{
  "error": "Invalid password."
}
```

---

### GET /teams
Get all teams.

**Auth:** No

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Brazil",
    "code": "BRA",
    "group": "A"
  }
]
```

---

### POST /teams
Add a new team.

**Auth:** Yes (Admin)

**Request Body:**
```json
{
  "name": "Brazil",
  "code": "BRA",
  "group": "A"
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "Brazil",
  "code": "BRA",
  "group": "A"
}
```

**Errors:**
- 400: Missing required fields
- 409: Team already exists

---

### GET /groups
Get all groups with their teams.

**Auth:** No

**Response (200):**
```json
[
  {
    "name": "A",
    "teams": [
      { "id": 1, "name": "Brazil", "code": "BRA", "group": "A" },
      { "id": 2, "name": "Argentina", "code": "ARG", "group": "A" }
    ]
  }
]
```

---

### GET /groups/:id/standings
Get standings for a specific group.

**Auth:** No

**URL Parameters:**
- `id` - Group letter (A, B, C, etc.)

**Response (200):**
```json
{
  "group": "A",
  "standings": [
    {
      "teamId": 1,
      "teamName": "Brazil",
      "teamCode": "BRA",
      "played": 3,
      "won": 2,
      "draw": 1,
      "lost": 0,
      "goalsFor": 5,
      "goalsAgainst": 2,
      "goalDifference": 3,
      "points": 7
    }
  ]
}
```

---

### GET /standings
Get standings for all groups.

**Auth:** No

**Response (200):**
```json
[
  {
    "group": "A",
    "standings": [...]
  },
  {
    "group": "B",
    "standings": [...]
  }
]
```

---

### GET /matches
Get all matches with team details.

**Auth:** No

**Response (200):**
```json
[
  {
    "id": 7,
    "teamAId": 1,
    "teamBId": 2,
    "scoreA": 2,
    "scoreB": 1,
    "phase": "group",
    "round": "group",
    "status": "finished",
    "teamA": { "id": 1, "name": "Brazil", "code": "BRA", "group": "A" },
    "teamB": { "id": 2, "name": "Argentina", "code": "ARG", "group": "A" }
  }
]
```

---

### PUT /matches/:id/result
Update match result.

**Auth:** Yes (Admin)

**URL Parameters:**
- `id` - Match ID (get from GET /matches)

**Request Body:**
```json
{
  "scoreA": 2,
  "scoreB": 1
}
```

**Response (200):**
```json
{
  "id": 7,
  "teamAId": 1,
  "teamBId": 2,
  "scoreA": 2,
  "scoreB": 1,
  "phase": "group",
  "round": "group",
  "status": "finished",
  "teamA": { ... },
  "teamB": { ... }
}
```

**Errors:**
- 400: Missing scores or negative values
- 404: Match not found

---

### POST /tournament/setup
Generate group stage schedule (round-robin).

**Auth:** Yes (Admin)

**Response (201):**
```json
{
  "message": "Group stage schedule created with 7 matches.",
  "matches": [...]
}
```

**Errors:**
- 400: No teams found
- 409: Schedule already exists

---

### POST /tournament/advance
Advance to knockout phase. Requires all group matches to be finished.

**Auth:** Yes (Admin)

**Knockout Structure by Number of Groups:**

| Groups | Knockout Rounds |
|--------|-----------------|
| 2 | Final only |
| 3 | Semifinal + Final |
| 4+ | Round of 16 → QF → SF → Final |

**Response (201):**
```json
{
  "message": "Knockout phase created with 1 matches.",
  "matches": [...]
}
```

**Errors:**
- 400: Group matches still scheduled or need at least 2 groups
- 409: Knockout already exists

---

### DELETE /tournament/reset
Reset tournament (delete all matches, keep teams).

**Auth:** Yes (Admin)

**Response (200):**
```json
{
  "message": "Tournament reset successfully.",
  "deletedMatches": 14
}
```

---

### GET /bracket
Get knockout bracket.

**Auth:** No

**Response (200):**
```json
{
  "round_of_16": [],
  "quarterfinal": [],
  "semifinal": [],
  "final": [
    {
      "id": 14,
      "teamA": { "id": 1, "name": "Brazil", "code": "BRA" },
      "teamB": { "id": 5, "name": "Spain", "code": "ESP" },
      "scoreA": 3,
      "scoreB": 1,
      "status": "finished",
      "round": "final"
    }
  ],
  "champion": {
    "id": 1,
    "name": "Brazil",
    "code": "BRA"
  }
}
```

---

## Match Status Values
- `scheduled` - Match not yet played
- `finished` - Match completed with result

## Phase Values
- `group` - Group stage
- `knockout` - Knockout stage

## Round Values (Knockout)
- `round_of_16` (4+ groups only)
- `quarterfinal` (4+ groups only)
- `semifinal` (3+ groups only)
- `final` (always present)

## Standings Sorting
1. Points (descending)
2. Goal Difference (descending)
3. Goals For (descending)

## Points System
- Win: 3 points
- Draw: 1 point
- Loss: 0 points

---

## Example Flow (2 Groups)

### 1. Login
```
POST /login → { "password": "admin123" }
```

### 2. Add Teams (3 per group)
```
POST /teams → { "name": "Brazil", "code": "BRA", "group": "A" }
POST /teams → { "name": "Argentina", "code": "ARG", "group": "A" }
POST /teams → { "name": "France", "code": "FRA", "group": "A" }
POST /teams → { "name": "Spain", "code": "ESP", "group": "B" }
POST /teams → { "name": "Portugal", "code": "POR", "group": "B" }
POST /teams → { "name": "Germany", "code": "GER", "group": "B" }
```

### 3. Generate Schedule
```
POST /tournament/setup
```

### 4. Get Match IDs
```
GET /matches
```

### 5. Input Results (use actual IDs from step 4)
```
PUT /matches/7/result → { "scoreA": 2, "scoreB": 1 }
PUT /matches/8/result → { "scoreA": 1, "scoreB": 0 }
... (all group matches)
```

### 6. Check Standings
```
GET /standings
```

### 7. Advance to Knockout
```
POST /tournament/advance
```

### 8. Input Final Result
```
PUT /matches/14/result → { "scoreA": 3, "scoreB": 1 }
```

### 9. View Champion
```
GET /bracket → champion: { "name": "Brazil" }
```
