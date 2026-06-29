# World Cup Simulator

Simulasi turnamen Piala Dunia — dari babak grup hingga final.

## Struktur Proyek

```
wadv_tubes_team_project/
├── backend/          # Express.js API (Node.js + Prisma + SQLite)
│   ├── prisma/       # Schema & database
│   ├── src/          # Source code
│   └── package.json
└── frontend/         # HTML/CSS/JS static
    ├── css/
    ├── js/
    └── pages/
```

## Menjalankan Backend

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup .env

Buat file `backend/.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="rahasia-kamu"
JWT_EXPIRES_IN=24h
ADMIN_PASSWORD="admin123"
PORT=3001
```

### 3. Generate Prisma Client & Migrate

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Jalankan Server

```bash
cd backend
npm start
```

Server berjalan di `http://localhost:3001`.

### 5. (Opsional) Seeder Data Tim

```bash
cd backend
node seed.js
```

## Menjalankan Frontend

Buka `frontend/index.html` langsung di browser, atau serve pakai live-server:

```bash
cd frontend
npx live-server
```

## API Docs

Lihat [API_DOCS.md](backend/API_DOCS.md) atau impor [Postman Collection](backend/WorldCupSimulator.postman_collection.json) ke Postman.

## Alur Turnamen

1. **Add Teams** — Tambah tim via Admin atau seeder
2. **Generate Jadwal Grup** — Klik `Generate Jadwal` di Admin
3. **Input Skor Grup** — Klik pertandingan di halaman Schedule/Bracket
4. **Advance Knockout** — Klik `Advance Knockout` → generate Round of 16
5. **Input Skor Knockout** — Klik pertandingan di Bracket
6. **Advance ke Babak Berikutnya** — Klik `Advance ke Babak Berikutnya` (QF → SF → Final)
7. **Input Skor Final** → 🏆 Juara Dunia!
