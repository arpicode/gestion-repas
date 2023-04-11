const path = require('path')
const express = require('express')
const logger = require('morgan')
const favicon = require('serve-favicon')

const apiRouter = require('./api/routes/index')

const PORT = process.env.PORT || 3000
const app = express()

app.use(logger('dev'))
app.use(express.static(path.join('public')))
app.use(express.json())
app.use('/api', apiRouter)
app.use(favicon(path.join('public', 'img', 'favicon.png')))

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
