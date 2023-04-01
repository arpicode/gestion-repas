const db = require('mysql2/promise')

const pool = db.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dateStrings: true,
})

// Tester la création de la pool de connexions
pool.getConnection()
    .then((connection) => {
        console.log('Connection pool successfully created.')
        connection.release()
    })
    .catch((err) => console.error(err))

const gracefulShutdown = async (msg, cb) => {
    try {
        await pool.end()
        console.log(`Closing connection pool through ${msg}`)
        cb()
    } catch (err) {
        console.log(err)
    }
}

process.once('SIGUSER2', async () => {
    // Ne fonctionne toujours pas pas sous windows :'(
    await gracefulShutdown('nodemon restart.', () => {
        process.kill(process.pid, 'SIGUSER2')
    })
})

process.on('SIGINT', async () => {
    await gracefulShutdown('app shutdown.', () => {
        process.exit(0)
    })
})

module.exports = pool
