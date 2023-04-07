const pool = require('../db')

const Recette = {
    //TODO: créer des propriétés pour les requêtes

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

        const sqlRecettes = `
            INSERT INTO recettes (nom, nb_personnes, etapes)
            VALUES (?, ?, ?)`

        const sqlUtiliser = `
            INSERT INTO utiliser (recette_id, ingredient_id, quantite, unite)
            VALUES (?, ?, ?, ?)`

        try {
            connection = await pool.getConnection()
            await connection.beginTransaction()

            const [resultRecette] = await connection.execute(sqlRecettes, [body.nom, body.nb_personnes, body.etapes])

            if (body.ingredients) {
                for (ingredient of body.ingredients) {
                    await connection.execute(sqlUtiliser, [
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

        const sqlRecettes = `
            UPDATE recettes
            SET nom = ?, nb_personnes = ?, etapes = ?
            WHERE id = ?`

        const sqlIfUtiliserNotExists = `
            INSERT INTO utiliser (recette_id, ingredient_id, quantite, unite)
            VALUES (?, ?, ?, ?)`

        const sqlIfUtiliserExists = `
            UPDATE utiliser
            SET quantite = ?, unite = ?
            WHERE recette_id = ? AND ingredient_id = ?`

        const sqlUtiliserExists = `
            SELECT COUNT(*) AS count
            FROM utiliser
            WHERE recette_id = ? AND ingredient_id = ?`

        try {
            connection = await pool.getConnection()
            await connection.beginTransaction()

            const [resultRecette] = await connection.execute(sqlRecettes, [
                body.nom,
                body.nb_personnes,
                body.etapes,
                +recetteId,
            ])

            let numAffectedRows = 0
            if (body.ingredients) {
                for (ingredient of body.ingredients) {
                    const [resultUtiliserExists] = await connection.execute(sqlUtiliserExists, [
                        +recetteId,
                        ingredient.id,
                    ])

                    console.log(resultUtiliserExists[0].count)

                    if (resultUtiliserExists[0].count > 0) {
                        console.log('EXISTS')

                        const [resultUtiliserUpdate] = await connection.execute(sqlIfUtiliserExists, [
                            ingredient.utiliser.quantite,
                            ingredient.utiliser.unite,
                            +recetteId,
                            ingredient.id,
                        ])
                        console.log('UPDATE quantite, unite:', resultUtiliserUpdate.affectedRows)

                        numAffectedRows += resultUtiliserUpdate.affectedRows
                    } else {
                        console.log("DOESN'T EXISTS")

                        const [resultUtiliserInsert] = await connection.execute(sqlIfUtiliserNotExists, [
                            +recetteId,
                            ingredient.id,
                            ingredient.utiliser.quantite,
                            ingredient.utiliser.unite,
                        ])

                        numAffectedRows += resultUtiliserInsert.affectedRows
                    }
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

const rowsToRecettes = (rows) => {
    const recettes = []
    let currentRecette = null

    for (const row of rows) {
        // Extraction des données de la ligne
        const { recette_id, recette_nom, nb_personnes, etapes, ingredient_id, ingredient_nom, quantite, unite } = row

        // Si c'est une nouvelle recette, on l'ajoute au tableau de recettes.
        if (currentRecette === null || currentRecette.id !== recette_id) {
            // Créer un nouvelle recette.
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
