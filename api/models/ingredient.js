const pool = require('../db')

const Ingredient = {
    async getAll() {
        let connection
        let json = { error: 'Server Error', status: 500 }

        const sql = `
            SELECT * FROM ingredients
            ORDER BY nom`

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
            INSERT INTO ingredients (id, nom)
            VALUES (?, ?)
            ON DUPLICATE KEY
            UPDATE id = ?, nom = ?`

        try {
            connection = await pool.getConnection()
            await connection.beginTransaction()

            const [result] = await connection.execute(sql, [+body.id, body.nom, +body.id, body.nom])

            await connection.commit()

            json = { id: result.insertId, nom: body.nom }
        } catch (err) {
            console.error(err)
            await connection.rollback()
        } finally {
            if (connection) connection.release()
            return json
        }
    },
    async updateOne(ingredientId, body) {
        let connection
        let json = { error: 'Server Error', status: 500 }

        const sql = `
            UPDATE ingredients
            SET nom = ?
            WHERE id = ?`

        try {
            connection = await pool.getConnection()
            await connection.beginTransaction()

            const [result] = await connection.execute(sql, [body.nom, ingredientId])

            await connection.commit()

            if (result.affectedRows) {
                json = { id: ingredientId, nom: body.nom }
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
    async deleteOne(ingredientId) {
        let connection
        let json = { error: 'Server Error', status: 500 }

        const sql = `DELETE FROM ingredients WHERE id = ?`

        try {
            connection = await pool.getConnection()
            await connection.beginTransaction()

            const [result] = await connection.execute(sql, [ingredientId])

            await connection.commit()

            if (result.affectedRows) {
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

module.exports = Ingredient
