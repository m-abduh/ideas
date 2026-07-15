const { Router } = require('express')
const prisma = require('../services/prisma')
const { generateIdeas, generatePRD } = require('../services/groq')

const router = Router()

router.get('/', async (req, res) => {
  const dateParam = req.query.date
  let targetDate = dateParam ? new Date(dateParam + 'T00:00:00.000Z') : new Date()

  targetDate.setUTCHours(0, 0, 0, 0)
  const nextDay = new Date(targetDate)
  nextDay.setUTCDate(nextDay.getUTCDate() + 1)

  const ideas = await prisma.idea.findMany({
    where: {
      createdAt: {
        gte: targetDate,
        lt: nextDay,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const prevDate = new Date(targetDate)
  prevDate.setUTCDate(prevDate.getUTCDate() - 1)
  const nextDate = new Date(targetDate)
  nextDate.setUTCDate(nextDate.getUTCDate() + 1)

  res.render('index', {
    ideas,
    currentDate: targetDate.toISOString().split('T')[0],
    prevDate: prevDate.toISOString().split('T')[0],
    nextDate: nextDate.toISOString().split('T')[0],
    hasPrev: true,
    hasNext: nextDate < new Date(),
  })
})

router.get('/saved', async (req, res) => {
  const ideas = await prisma.idea.findMany({
    where: { saved: true },
    orderBy: { createdAt: 'desc' },
  })
  res.render('saved', { ideas })
})

router.post('/generate', async (req, res) => {
  try {
    const newIdeas = await generateIdeas()

    for (const idea of newIdeas) {
      await prisma.idea.create({
        data: {
          name: idea.name,
          description: idea.description,
          sourceUrl: idea.sourceUrl,
          references: idea.references || '[]',
        },
      })
    }

    res.redirect('/')
  } catch (err) {
    console.error('Generate error:', err)
    res.status(500).send('Gagal generate ide: ' + err.message)
  }
})

router.post('/submit', async (req, res) => {
  const { name, description } = req.body
  const sourceUrl = 'manual-' + Date.now()

  await prisma.idea.create({
    data: {
      name,
      description,
      sourceUrl,
    },
  })

  res.redirect('/')
})

router.post('/prd/:id', async (req, res) => {
  try {
    const idea = await prisma.idea.findUnique({ where: { id: Number(req.params.id) } })
    if (!idea) return res.status(404).send('Idea not found')

    const prd = await generatePRD(idea)
    await prisma.idea.update({
      where: { id: idea.id },
      data: { prd },
    })

    res.redirect(req.headers.referer || '/')
  } catch (err) {
    console.error('PRD error:', err)
    res.status(500).send('Gagal generate PRD: ' + err.message)
  }
})

router.post('/delete/:id', async (req, res) => {
  try {
    await prisma.idea.delete({
      where: { id: Number(req.params.id) },
    })
    res.redirect(req.headers.referer || '/')
  } catch (err) {
    console.error('Delete error:', err)
    res.status(500).send('Gagal hapus: ' + err.message)
  }
})

router.post('/save/:id', async (req, res) => {
  await prisma.idea.update({
    where: { id: Number(req.params.id) },
    data: { saved: true },
  })
  res.redirect(req.headers.referer || '/')
})

router.post('/unsave/:id', async (req, res) => {
  await prisma.idea.update({
    where: { id: Number(req.params.id) },
    data: { saved: false },
  })
  res.redirect(req.headers.referer || '/')
})

module.exports = router
