const pool = require('../db')

const Recette = {
    async getAll() {
        let connection
        let json = { error: 'Server Error', status: 500 }

        const sql = `
            SELECT recettes.id AS recette_id, recettes.nom AS recette_nom, recettes.nb_personnes, recettes.etapes,
                   ingredients.id AS ingredient_id, ingredients.nom AS ingredient_nom,
                   utiliser.quantite, utiliser.unite 
            FROM recettes
            LEFT JOIN utiliser ON recettes.id = utiliser.recette_id
            LEFT JOIN ingredients ON utiliser.ingredient_id = ingredients.id
            ORDER BY recettes.nom, ingredients.nom`

        try {
            connection = await pool.getConnection()

            const [rows] = await connection.execute(sql)
            json = rowsToRecettes(rows)
        } catch (err) {
            console.error(err)
        } finally {
            if (connection) connection.release()
            return json
        }
    },
    async insertOne(body) {
        let connection
        let json = { error: 'Bad Request', status: 400 }

        const insertRecetteSql = `
            INSERT INTO recettes (nom, nb_personnes, etapes)
            VALUES (?, ?, ?)`

        const insertUtiliserSql = `
            INSERT INTO utiliser (recette_id, ingredient_id, quantite, unite)
            VALUES (?, ?, ?, ?)`

        try {
            connection = await pool.getConnection()
            await connection.beginTransaction()

            const [resultRecette] = await connection.execute(insertRecetteSql, [
                body.nom,
                body.nb_personnes,
                body.etapes,
            ])

            if (body.ingredients) {
                for (ingredient of body.ingredients) {
                    await connection.execute(insertUtiliserSql, [
                        resultRecette.insertId,
                        ingredient.id,
                        ingredient.utiliser.quantite,
                        ingredient.utiliser.unite,
                    ])
                }
            }

            const [insertedRecette] = await connection.execute(
                `
                SELECT recettes.id AS recette_id, recettes.nom AS recette_nom, recettes.nb_personnes, recettes.etapes,
                       ingredients.id AS ingredient_id, ingredients.nom AS ingredient_nom,
                       utiliser.quantite, utiliser.unite 
                       FROM recettes
                LEFT JOIN utiliser ON recettes.id = utiliser.recette_id
                LEFT JOIN ingredients ON utiliser.ingredient_id = ingredients.id
                WHERE recettes.id = ?`,
                [resultRecette.insertId]
            )

            await connection.commit()

            json = rowsToRecettes(insertedRecette)
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

        const updateRecetteSql = `
            UPDATE recettes
            SET nom = ?, nb_personnes = ?, etapes = ?
            WHERE id = ?`

        const insertUtiliserSql = `
            INSERT INTO utiliser (recette_id, ingredient_id, quantite, unite)
            VALUES (?, ?, ?, ?)`

        const deleteUtiliserSql = `
            DELETE FROM utiliser
            WHERE recette_id = ?`

        try {
            connection = await pool.getConnection()
            await connection.beginTransaction()

            const [resultRecette] = await connection.execute(updateRecetteSql, [
                body.nom,
                body.nb_personnes,
                body.etapes,
                +recetteId,
            ])

            await connection.execute(deleteUtiliserSql, [+recetteId])

            let numAffectedRows = 0
            if (body.ingredients) {
                for (const ingredient of body.ingredients) {
                    const [resultUtiliserInsert] = await connection.execute(insertUtiliserSql, [
                        +recetteId,
                        ingredient.id,
                        ingredient.utiliser.quantite,
                        ingredient.utiliser.unite,
                    ])
                    numAffectedRows++
                }
            }

            const [recette] = await connection.execute(
                `
                SELECT recettes.id AS recette_id, recettes.nom AS recette_nom, recettes.nb_personnes, recettes.etapes,
                       ingredients.id AS ingredient_id, ingredients.nom AS ingredient_nom,
                       utiliser.quantite, utiliser.unite 
                FROM recettes
                LEFT JOIN utiliser ON recettes.id = utiliser.recette_id
                LEFT JOIN ingredients ON utiliser.ingredient_id = ingredients.id
                WHERE recettes.id = ?`,
                [+recetteId]
            )

            await connection.commit()

            if (resultRecette.affectedRows || numAffectedRows) {
                json = rowsToRecettes(recette)
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
    async deleteOneIngredient(recetteId, ingredientId) {
        let connection
        let json = { error: 'Server Error', status: 500 }

        const sql = `DELETE FROM utiliser WHERE recette_id = ? AND ingredient_id = ?`

        try {
            connection = await pool.getConnection()
            await connection.beginTransaction()

            const [result] = await connection.execute(sql, [recetteId, ingredientId])

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

/**
 * Transform sql result to JS object.
 *
 * @param {array} rows
 * @returns array with recette objects
 */
const rowsToRecettes = (rows) => {
    const recettes = []
    let currentRecette = null

    for (const row of rows) {
        // Extraction des données de la ligne
        const { recette_id, recette_nom, nb_personnes, etapes, ingredient_id, ingredient_nom, quantite, unite } = row

        // Si c'est une nouvelle recette, on l'ajoute au tableau de recettes.
        if (currentRecette === null || currentRecette.id !== recette_id) {
            // Créer une nouvelle recette.
            currentRecette = {
                id: recette_id,
                nom: recette_nom,
                nb_personnes,
                etapes,
                ingredients: [],
            }
            recettes.push(currentRecette)
        }

        // Si c'est un nouvel ingrédient, on l'ajoute à la recette courante.
        if (ingredient_id) {
            let currentIngredient = currentRecette.ingredients.find((ingredient) => ingredient.id === ingredient_id)
            if (!currentIngredient) {
                // Créer un nouvel ingrédient.
                currentIngredient = {
                    id: ingredient_id,
                    nom: ingredient_nom,
                    utiliser: {
                        quantite,
                        unite,
                    },
                }
                currentRecette.ingredients.push(currentIngredient)
            }
        }
    }

    return recettes
}

module.exports = Recette
