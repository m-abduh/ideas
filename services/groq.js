const axios = require('axios')

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

async function generateIdeas() {
  const seed = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

  const prompt = `Kamu adalah asisten yg menemukan 1 ide SaaS paling kuat dan orisinal.

Pilih INDUSTRI APA SAJA secara acak — bisa startup trend, industri tradisional, hobi unik, profesi spesifik, bisnis offline, masalah sehari-hari, komunitas, kegiatan rumah tangga, jasa, kerajinan, apapun yg bisa di-solusikan dengan SaaS. Kamu tahu semua industri di dunia — pilih salah satu secara random.

HARI INI kamu harus bener-bener beda dari biasanya. Gali ide yg tidak terpikirkan orang.

TEKNIK UTAMA: KOMBINASIKAN 2-3 HAL YANG SUDAH ADA untuk menciptakan inovasi baru. Pilih acak dari: teknologi (AI, blockchain, QR, IoT, voice, video, geolocation, dll), konsep (subscription, marketplace, on-demand, gamification, crowdsourcing, dll), industri (apa aja), atau masalah sehari-hari. Lalu gabungkan dengan cara yg belum pernah ada. JANGAN ciptakan dari nol — remix apa yg sudah terbukti.

RULES KETAT:
- Judul HARUS format: "[masalah spesifik] → [solusi SaaS nya]"
  Contoh benar: "Bingung mau masak dari sisa bahan kulkas → app rekomendasi resep otomatis"
  Contoh benar: "Dokumen sidang berantakan & sering telat → platform manajemen jadwal & dokumen untuk pengacara"
  Contoh benar: "Lupa bayar pajak freelancer kena denda → tool tracking & notifikasi pajak otomatis"
  JANGAN pake nama brand/project kayak "Resepin", "EcoLife", dll
- Deskripsi 3-4 kalimat: jelaskan masalahnya, solusinya, cara kerjanya, dan kenapa beda
- Ini untuk produk NYATA yg bisa dibangun 1 developer dalam 1-2 minggu
- Wajib punya model bisnis jelas (bisa monthly subscription, pay-per-use, atau marketplace fee)
- HARAM: AI chat wrapper, social media scheduler, content repurposer, blog generator, landing page builder, general productivity app, AI note app, todo list, habit tracker, atau variasi lain yg sudah mati
- Referensi dari sumber nyata: berita tech, riset industri, postingan forum, tweet viral, atau artikel

Output JSON array dengan 1 objek:
[
  {
    "name": "[masalah] → [solusi SaaS]",
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
