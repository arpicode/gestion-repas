const pool = require('../db')

const Repas = {
    async inserRepasByMenuId(menuId, body) {
        let connection
        let json = { error: 'Server Error' }

        const insertRepasSql = `INSERT INTO repas (repas.nb_convives) VALUES (?)`
        const insertPrevoir = `
            INSERT INTO prevoir (prevoir.menu_id, prevoir.repas_id)
            VALUES (?, ?)`

        try {
            connection = await pool.getConnection()
            await connection.beginTransaction()

            const [result] = await connection.execute(insertRepasSql, [body.nb_convives])
            const repasId = result.insertId

            await connection.execute(insertPrevoir, [menuId, repasId])

            await connection.commit()
            json = { id: repasId, nb_convives: body.nb_convives }
            console.log(`Created repas ${JSON.stringify(json)} for menuId: ${menuId}`)
        } catch (err) {
            console.log(err)
            await connection.rollback()
        } finally {
            if (connection) connection.release()
            return json
        }
    },
    async deleteOne(repasId) {
        let connection
        let json = { error: 'Server Error', status: 500 }

        const sql = `DELETE FROM repas WHERE id = ?`

        try {
            connection = await pool.getConnection()
            await connection.beginTransaction()

            const [result] = await connection.execute(sql, [repasId])

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
    async deleteOneRecette(repasId, recetteId) {
        let connection
        let json = { error: 'Server Error', status: 500 }

        const sql = `DELETE FROM composer WHERE repas_id = ? AND recette_id = ?`

        try {
            connection = await pool.getConnection()
            await connection.beginTransaction()

            const [result] = await connection.execute(sql, [repasId, recetteId])

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

module.exports = Repas
