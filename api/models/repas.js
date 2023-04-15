const pool = require('../db')

const Repas = {
    async inserRepasByMenuId(menuId, body) {
        let connection
        let json = { error: 'Server Error' }

        const insertRepasSql = `INSERT INTO repas (repas.nb_convives) VALUES (?)`
        const insertPrevoir = `INSERT INTO prevoir (prevoir.menu_id, prevoir.repas_id) VALUES (?, ?)`

        try {
            connection = await pool.getConnection()
            await connection.beginTransaction()

            const [result] = await connection.execute(insertRepasSql, [body.nb_convives])
            const repasId = result.insertId

            await connection.execute(insertPrevoir, [menuId, repasId])

            await connection.commit()

            json = { id: repasId, nb_convives: body.nb_convives, recettes: [] }
        } catch (err) {
            console.log(err)
            await connection.rollback()
        } finally {
            if (connection) connection.release()
            return json
        }
    },
    async updateOne(repasId, recetteId, body) {
        let connection
        let json = { error: 'Server Error', status: 500 }

        const updateRepasSql = `
            UPDATE repas
            SET nb_convives = ?
            WHERE id = ?`

        const insertComposerSql = `
            INSERT INTO composer (repas_id, recette_id)
            VALUES (?, ?)
            ON DUPLICATE KEY
            UPDATE repas_id = repas_id`

        const updateComposerSql = `
            UPDATE composer
            SET recette_id = ?
            WHERE repas_id = ? AND recette_id = ?`

        const composerExistsSql = `
            SELECT COUNT(*) AS count
            FROM composer
            WHERE repas_id = ? AND recette_id = ?`

        try {
            connection = await pool.getConnection()
            await connection.beginTransaction()

            const [resultRepas] = await connection.execute(updateRepasSql, [body.nb_convives, +repasId])

            let numAffectedRows = 0
            if (body.recettes) {
                for (const recette of body.recettes) {
                    // Chercher si la recette à mettre à jour existe déjà
                    const [oldExists] = await connection.execute(composerExistsSql, [+repasId, +recetteId])

                    if (oldExists[0].count > 0) {
                        // le repas a déjà la recette, cherches si la nouvelle recette existe déjà
                        const [newExists] = await connection.execute(composerExistsSql, [+repasId, recette.id])
                        console.log('newExists', newExists[0].count)
                        if (newExists[0].count === 0) {
                            // Si la nouvelle recette n'existe pas on met à jour l'ancienne
                            const [resultUpdateComposer] = await connection.execute(updateComposerSql, [
                                recette.id,
                                +repasId,
                                +recetteId,
                            ])
                            numAffectedRows += resultUpdateComposer.affectedRows
                        }
                    } else {
                        // La recette à mettre à jour n'existe pas donc c'est une nouvelle recette
                        const [resultInsertComposer] = await connection.execute(insertComposerSql, [
                            +repasId,
                            recette.id,
                        ])
                        numAffectedRows += resultInsertComposer.affectedRows
                    }
                }
            }

            const [repas] = await connection.execute(
                `
                SELECT repas.id AS repas_id, repas.nb_convives,
                    recettes.id AS recette_id, recettes.nom AS recette_nom,
                    recettes.nb_personnes, recettes.etapes,
                    ingredients.id AS ingredient_id, ingredients.nom AS ingredient_nom,
                    utiliser.quantite, utiliser.unite 
                FROM repas
                LEFT JOIN composer ON repas.id = composer.repas_id
                LEFT JOIN recettes ON composer.recette_id = recettes.id
                LEFT JOIN utiliser ON recettes.id = utiliser.recette_id
                LEFT JOIN ingredients ON utiliser.ingredient_id = ingredients.id
                WHERE repas.id = ?
                ORDER BY repas_id, recette_nom`,
                [+repasId]
            )

            await connection.commit()

            if (resultRepas.affectedRows || numAffectedRows) {
                json = rowsToRepas(repas)
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

const rowsToRepas = (rows) => {
    const repas = []
    let currentRepas = null

    for (const row of rows) {
        // Extraction des données de la ligne
        const {
            repas_id,
            nb_convives,
            recette_id,
            recette_nom,
            nb_personnes,
            etapes,
            ingredient_id,
            ingredient_nom,
            quantite,
            unite,
        } = row

        // Si c'est un nouveau repas, on l'ajoute au tableau de repas.
        if (currentRepas === null || currentRepas.id !== repas_id) {
            // Créer un nouveau repas
            currentRepas = {
                id: repas_id,
                nb_convives,
                recettes: [],
            }
            repas.push(currentRepas)
        }
        // Si c'est une nouvelle recette, on l'ajoute au repas courant.
        if (recette_id) {
            let currentRecette = currentRepas.recettes.find((recette) => recette.id === recette_id)
            if (!currentRecette) {
                // Créer une nouvelle recette.
                currentRecette = {
                    id: recette_id,
                    nom: recette_nom,
                    nb_personnes,
                    etapes,
                    ingredients: [],
                }
                currentRepas.recettes.push(currentRecette)
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
    }

    return repas
}

module.exports = Repas
