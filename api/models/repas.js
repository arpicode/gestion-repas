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
}

module.exports = Repas
