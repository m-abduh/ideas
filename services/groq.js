const axios = require('axios')

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

async function generateIdeas() {
  const prompt = `Kamu adalah asisten yang menemukan 1 ide SaaS terkuat dan paling spesifik berdasarkan tren teknologi global terkini.

Gunakan pengetahuanmu dari sumber-sumber LUAR NEGERI ini:
- Tech news & startup trends (Product Hunt, TechCrunch, Hacker News)
- GitHub trending repos dan open-source projects
- Reddit discussions (r/SaaS, r/SideProject, r/startups, r/SomebodyMakeThis)
- X/Twitter threads tentang building in public
- IndieHackers stories dan wawancara

Cari inspirasi dari sumber-sumber di ATAS (luar negeri semua), lalu:
1. Ciptakan 1 ide SaaS yang SANGAT SPESIFIK dan KUAT
2. Bukan ide generik — aplikasi konkret yang solve masalah Y dengan cara Z yang unik
3. Pastikan idenya: (a) punya target pasar jelas, (b) monetizable, (c) feasible dibuat 1 developer, (d) beda dari yang sudah ada
4. Prioritaskan tren global terkini: AI utility, workflow automation, creator economy, productivity
5. Gunakan BAHASA INDONESIA untuk judul dan deskripsi
6. Deskripsi 2-3 kalimat

PENTING: Cantumkan 2-3 link refrensi dari sumber LUAR NEGERI (Product Hunt, GitHub, Reddit, X, IndieHackers, TechCrunch, atau artikel teknologi global) yang mendukung ide ini.

Output JSON array dengan 1 objek:
[
  {
    "name": "Judul ide dalam Bahasa Indonesia",
    "description": "Deskripsi dalam Bahasa Indonesia",
    "references": [
      { "title": "Judul refrensi (English)", "url": "https://..." },
      { "title": "Judul refrensi (English)", "url": "https://..." }
    ],
    "sourceUrl": "groq-${Date.now()}-0"
  }
]

Hanya output JSON, tanpa teks lain.`

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
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

    return ideas.map((idea, i) => ({
      name: idea.name,
      description: idea.description,
      sourceUrl: idea.sourceUrl || `groq-${Date.now()}-${i}`,
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
