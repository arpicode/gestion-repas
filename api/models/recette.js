const pool = require('../db')

const Recette = {
    async getAll() {
        let connection
        let json = { error: 'Server Error', status: 500 }

        const sql = `SELECT * FROM recettes`

        try {
            connection = await pool.getConnection()

            const [rows] = await connection.execute(sql)
            json = JSON.parse(JSON.stringify(rows))
        } catch (err) {
            console.error(err)
        } finally {
            if (connection) connection.release()
            return json
        }
    },
    async insertOne(body) {
        let connection
        let json = { error: 'Server Error', status: 500 }

        const sql = `
            INSERT INTO recettes (nom, nb_personnes, etapes)
            VALUES (?, ?, ?)`

        try {
            connection = await pool.getConnection()
            await connection.beginTransaction()

            const [result] = await connection.execute(sql, [body.nom, body.nb_personnes, body.etapes])

            await connection.commit()

            json = { id: result.insertId, nom: body.nom, nb_personnes: body.nb_personnes, etapes: body.etapes }
        } catch (err) {
            console.error(err)
            await connection.rollback()
        } finally {
            if (connection) connection.release()
            return json
        }
    },
    async updateOne(recetteId, body) {
        let connection
        let json = { error: 'Server Error', status: 500 }

        const sql = `
            UPDATE recettes
            SET nom = ?, nb_personnes = ?, etapes = ?
            WHERE id = ?`

        try {
            connection = await pool.getConnection()
            await connection.beginTransaction()

            const [result] = await connection.execute(sql, [body.nom, body.nb_personnes, body.etapes, recetteId])

            await connection.commit()

            if (result.affectedRows) {
                json = { id: recetteId, nom: body.nom, nb_personnes: body.nb_personnes, etapes: body.etapes }
            } else {
                json = { error: 'Bad Request', status: 400 }
            }
        } catch (err) {
            console.error(err)
            // json.message = err.message
            await connection.rollback()
        } finally {
            if (connection) connection.release()
            return json
        }
    },
    async deleteOne(recetteId) {
        let connection
        let json = { error: 'Server Error', status: 500 }

        const sql = `DELETE FROM recettes WHERE id = ?`

        try {
            connection = await pool.getConnection()
            await connection.beginTransaction()

            const [result] = await connection.execute(sql, [recetteId])

            await connection.commit()
            console.log('AFFECTED ROW:', result.affectedRows)
            if (result.affectedRows) {
                console.log('SETTING JSON TO NULL')
                json = null
            } else {
                json = { error: 'Bad Request', status: 400 }
            }
        } catch (err) {
            console.error(err)
            await connection.rollback()
        } finally {
            if (connection) connection.release()
            return json
        }
    },
}

module.exports = Recette
