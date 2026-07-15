require('dotenv').config()
const express = require('express')
const path = require('path')
const ideasRouter = require('./routes/ideas')
const { startScheduler } = require('./cron/scheduler')

const app = express()
const PORT = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/', ideasRouter)

startScheduler()

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
