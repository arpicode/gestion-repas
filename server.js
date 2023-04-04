const express = require('express')
const logger = require('morgan')

const apiRouter = require('./api/routes/index')

const PORT = process.env.PORT || 3000
const app = express()

app.use(logger('dev'))
app.use(express.static('public'))
app.use(express.json())
app.use('/api', apiRouter)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
