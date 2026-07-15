# PRD — SaaS Idea Finder

## 1. Ringkasan
Web app yang mencari & menggabungkan ide project bisnis SaaS dari berbagai sumber (sosial media, GitHub, dll) lalu diringkas AI (Groq) menjadi judul spesifik + deskripsi 1 paragraf. User bisa generate otomatis (cron) atau manual, serta input ide sendiri.

## 2. Stack
- **Runtime:** Node.js
- **Framework:** Express
- **ORM:** Prisma
- **Database:** better-sqlite3 (SQLite)
- **View Engine:** EJS
- **Scheduler:** node-cron
- **AI:** Groq API (meringkas & mengkombinasikan ide)

## 3. Fitur

### 3.1 Halaman Web

**`/` — List Ide (Paginasi Per Hari)**
- List ide per hari, 1 halaman = ide dari 1 hari
- Navigasi prev/next day (← Hari Sebelumnya | Hari Berikutnya →)
- Setiap ide: judul spesifik + deskripsi 1 paragraf + sumber + timestamp
- Tombol **"Generate Ideas Now"** — trigger scraping + AI langsung
- Form **"Submit Your Idea"** — input manual nama ide + deskripsi
- Tombol **"Save"** tiap ide — simpan ke halaman tersimpan

**`/saved` — Ide Tersimpan**
- List ide yang sudah di-save user
- Tombol **"Unsave"** untuk hapus dari daftar saved

### 3.2 Cron Job (Auto Generate)
- Hardcode di `scheduler.js` — `'0 0 * * *'` (setiap hari jam 00:00)
- Scrape dari sumber:
  - **Reddit:** r/SomebodyMakeThis, r/SideProject, r/startup_ideas, r/SaaS
  - **IndieHackers:** forum thread & product launches
  - **X.com:** search "saas idea", "building in public", "side project"
  - **GitHub:** trending repos, topics "saas" "startup" "side-project"
- Tiap raw post dirangkum Groq: kombinasi dari berbagai sumber → ide baru yang spesifik
- Output: `name` (judul spesifik) + `description` (1 paragraf)
- Hindari duplikat (by sourceUrl hash)

### 3.3 AI Processing (Groq)
- Input: raw posts dari berbagai sumber
- Prompt: gabungkan/contohkan inovasi dari aplikasi besar yang sudah ada → ciptakan ide SaaS baru yang spesifik
- Output: judul sangat spesifik (bukan generic) + deskripsi 1 paragraf jelas

### 3.4 User Input
- Form tambah ide manual: nama + deskripsi + sumber (diisi "manual")
- Langsung simpan ke DB, muncul di list

## 4. Database Schema (Prisma)

```prisma
model Idea {
  id          Int      @id @default(autoincrement())
  name        String
  description String
  source      String   // reddit / indiehackers / x / github / manual
  sourceUrl   String   @unique
  saved       Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

## 5. Arsitektur

```
cron/
  - scheduler.js    (node-cron, cron expression hardcode)
  - scraper.js      (orchestrator panggil semua source)
scrapers/
  - reddit.js
  - indiehackers.js
  - x.js
  - github.js
prisma/
  - schema.prisma
views/
  - index.ejs       (list ide + form + button generate)
routes/
  - ideas.js        (GET /, GET /saved, POST /generate, POST /submit, POST /save/:id, POST /unsave/:id)
services/
  - groq.js         (summarizer & idea combiner)
app.js
```

## 6. Alur Generate Ide
1. **Trigger:** cron auto (`0 0 * * *`) / tombol manual
2. Scraper ambil post dari Reddit, IndieHackers, X, GitHub
3. Raw posts → Groq API → dirangkum & dikombinasikan jadi ide baru
4. Output `{ name, description }` → simpan ke DB (upsert)
5. Halaman `/` refresh → muncul di list

## 7. Deliverable
- `npm run dev` — langsung jalan + DB terisi
- Halaman `/` — list ide per hari + form input + tombol generate + tombol save tiap ide
- Navigasi paginasi prev/next day
- Halaman `/saved` — list ide yang di-save
- Cron jalan otomatis tiap hari jam 00:00
- Tidak ada duplikat ide
