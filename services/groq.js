const axios = require('axios')

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

const DOMAINS = [
  'fintech / keuangan & investasi personal', 'healthtech / kesehatan & mental wellness',
  'edtech / pendidikan & upskilling', 'legaltech / hukum & perizinan',
  'proptech / properti & sewa', 'agritech / pertanian & pangan',
  'logistik & pengiriman', 'foodtech / F&B & restoran',
  'e-commerce & retail', 'travel & hospitality',
  'HR tech & rekrutmen', 'insurtech / asuransi',
  'sustainability / green tech & lingkungan', 'devtools / tools untuk developer',
  'gamedev & interactive media', 'security & privacy',
  'creative tools (desain, video, musik)', 'parenting & keluarga',
  'petcare / hewan peliharaan', 'fitness & olahraga',
  'automotive / kendaraan & bengkel', 'event management & ticketing',
  'real estate & konstruksi', 'UMKM & usaha kecil tradisional',
]

const INSPIRATIONS = [
  'dari masalah sehari-hari yg mengganggu banyak orang',
  'dari industri tradisional yg belum tersentuh teknologi',
  'dari tren global yg baru mulai populer di luar negeri',
  'dari keluhan yg sering muncul di forum dan komunitas online',
  'dari hobi atau kegiatan yg belum punya tools digital yg proper',
  'dari celah di antara dua industri yg belum terhubung',
  'dari proses manual yg masih pake kertas/Excel padahal skalanya besar',
]

async function generateIdeas() {
  const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)]
  const inspiration = INSPIRATIONS[Math.floor(Math.random() * INSPIRATIONS.length)]
  const seed = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

  const prompt = `Kamu adalah asisten yg menemukan 1 ide SaaS paling kuat dan orisinal. Fokus: ${domain}.

Ambil inspirasi ${inspiration}. Jangan cuma ngerepol apa yg sudah banyak di pasaran.

HARI INI topik kamu adalah ${domain}. Gali sedalam mungkin di bidang ini. Temukan masalah spesifik yg bisa dipecahkan dengan pendekatan unik.

RULES KETAT:
- Judul HARUS format: "NamaProject — deskripsi singkat untuk siapa"
  Contoh: "KandangKu — manajemen pakan & kandang untuk peternak ayam skala kecil"
  Contoh: "Resepin — rekomendasi menu dari sisa bahan kulkas untuk ibu rumah tangga"
  Contoh: "SidangIN — scheduling & notifikasi sidang untuk pengacara freelance"
  JANGAN cuma nama project aja, HARUS ada "— untuk siapa"
- Deskripsi 3-4 kalimat: jelaskan masalahnya, solusinya, cara kerjanya, dan kenapa beda
- Ini untuk produk NYATA yg bisa dibangun 1 developer dalam 1-2 minggu
- Wajib punya model bisnis jelas (bisa monthly subscription, pay-per-use, atau marketplace fee)
- HARAM: AI chat wrapper, social media scheduler, content repurposer, blog generator, landing page builder, general productivity app, AI note app, todo list, habit tracker, atau variasi lain yg sudah mati
- Referensi dari sumber nyata: berita tech, riset industri, postingan forum, tweet viral, atau artikel

Output JSON array dengan 1 objek:
[
  {
    "name": "NamaProject — untuk Siapa",
    "description": "Deskripsi 3-4 kalimat dalam Bahasa Indonesia",
    "references": [
      { "title": "Judul referensi", "url": "https://..." },
      { "title": "Judul referensi", "url": "https://..." }
    ],
    "sourceUrl": "groq-${seed}-IDX"
  }
]

Hanya output JSON, tanpa teks lain.`

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 1.0,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const content = response.data.choices[0].message.content.trim()
    const ideas = JSON.parse(content)

    const ts = Date.now()
    return ideas.map((idea, i) => ({
      name: idea.name,
      description: idea.description,
      sourceUrl: `groq-${ts}-${i}-${Math.random().toString(36).slice(2,8)}`,
      references: JSON.stringify(idea.references || []),
    }))
  } catch (err) {
    console.error('Groq API error:', err.response?.data || err.message)
    throw err
  }
}

async function generatePRD(idea) {
  const prompt = `Buatkan Product Requirements Document (PRD) yang best practice untuk ide SaaS berikut. FOKUS pada MVP — apa yang benar-benar perlu dibangun pertama kali.

Judul: ${idea.name}
Deskripsi: ${idea.description}

PRD harus mencakup:
- Ringkasan Eksekutif
- Masalah yang Dipecahkan & Validasi
- Target Pasar & Persona
- **MVP Scope** — fitur WAJIB untuk launch (minimal, hanya esensial)
- **Post-MVP** — fitur untuk rilis selanjutnya
- Alur Pengguna (user flow) versi MVP
- Model Pendapatan
- Tech Stack Saran (pilih yang cepat dan murah)
- Metrik Kesuksesan (hanya 3-5 metrik paling penting)
- Roadmap: MVP (minggu 1-2) → V2 (minggu 3-4) → V3 (bulan 2-3)

Gunakan BAHASA INDONESIA.
Output langsung PRD dalam format markdown, tanpa embel-embel lain.`

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data.choices[0].message.content.trim()
  } catch (err) {
    console.error('Groq PRD error:', err.response?.data || err.message)
    throw err
  }
}

module.exports = { generateIdeas, generatePRD }
