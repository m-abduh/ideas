const cron = require('node-cron')
const prisma = require('../services/prisma')
const { generateIdeas } = require('../services/groq')

async function autoGenerate() {
  console.log('[Cron] Starting auto-generate...')
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

    console.log(`[Cron] Generated ${newIdeas.length} new ideas`)
  } catch (err) {
    console.error('[Cron] Error:', err.message)
  }
}

function startScheduler() {
  cron.schedule('0 0 * * *', () => {
    autoGenerate()
  })
  console.log('[Cron] Scheduler started (0 0 * * *)')
}

module.exports = { startScheduler, autoGenerate }
