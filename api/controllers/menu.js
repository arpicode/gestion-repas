const pool = require('../db')
const moment = require('moment')

const getAllMenus = async (req, res) => {
    let connection
    try {
        connection = await pool.getConnection()
        const [rows, fields] = await connection.execute(`
            SELECT * FROM menus
        `)

        res.status(200).json(rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server Error' })
    } finally {
        if (connection) connection.release()
    }
}

const getMenuForCurrentMondayOrNextMonday = async (req, res) => {
    let connection

    try {
        connection = await pool.getConnection()

        // Si la date est un lundi
        if (moment(req.params.date).isoWeekday() === 1) {
            // On récupère les menus de toute la semaine
            const [rows] = await connection.execute(
                `
                SELECT menus.id AS menu_id, menus.date_menu,
                       repas.id AS repas_id, repas.nb_convives,
                       recettes.id AS recette_id, recettes.nom AS recette_nom, recettes.nb_personnes,
                       ingredients.id AS ingredients_id, ingredients.nom AS ingredient_nom,
                       utiliser.quantite, utiliser.unite
                FROM menus
                LEFT JOIN prevoir ON menus.id = prevoir.menu_id
                LEFT JOIN repas ON prevoir.repas_id = repas.id
                LEFT JOIN composer ON repas.id = composer.repas_id
                LEFT JOIN recettes ON composer.recette_id = recettes.id
                LEFT JOIN utiliser ON recettes.id = utiliser.recette_id
                LEFT JOIN ingredients ON utiliser.ingredient_id = ingredients.id
                WHERE date_menu BETWEEN ? AND DATE_ADD(?, INTERVAL 7 DAY)
                `,
                [req.params.date, req.params.date]
            )

            // S'il n'y a pas encore de menus pour cette semaine
            if (rows.length === 0) {
                // On crée les menus de la semaine

                let currentDate
                for (let i = 0; i < 7; i++) {
                    currentDate = moment(req.params.date).add(i, 'days').format('YYYY-MM-DD')
                    await connection.execute('INSERT INTO menus (date_menu) VALUES (?)', [currentDate])
                }

                const [rows] = await connection.execute(
                    `
                    SELECT menus.id AS menu_id, menus.date_menu,
                          repas.id AS repas_id, repas.nb_convives,
                          recettes.id AS recette_id, recettes.nom AS recette_nom, recettes.nb_personnes,
                          ingredients.id AS ingredients_id, ingredients.nom AS ingredient_nom,
                          utiliser.quantite, utiliser.unite
                    FROM menus
                    LEFT JOIN prevoir ON menus.id = prevoir.menu_id
                    LEFT JOIN repas ON prevoir.repas_id = repas.id
                    LEFT JOIN composer ON repas.id = composer.repas_id
                    LEFT JOIN recettes ON composer.recette_id = recettes.id
                    LEFT JOIN utiliser ON recettes.id = utiliser.recette_id
                    LEFT JOIN ingredients ON utiliser.ingredient_id = ingredients.id
                    WHERE date_menu BETWEEN ? AND DATE_ADD(?, INTERVAL 7 DAY)
                  `,
                    [req.params.date, req.params.date]
                )

                connection.release()
                return res.status(200).json(rows)
            }

            connection.release()
            return res.status(200).json(rows)
        } else {
            // Si la date n'est pas un lundi trouver la date du prochain lundi
            const nextMonday = moment(req.params.date).startOf('isoWeek').add(1, 'weeks').format('YYYY-MM-DD')
            // On récupère les menus de toute la semaine
            const [rows] = await connection.execute(
                `
                SELECT menus.id AS menu_id, menus.date_menu,
                      repas.id AS repas_id, repas.nb_convives,
                      recettes.id AS recette_id, recettes.nom AS recette_nom, recettes.nb_personnes,
                      ingredients.id AS ingredients_id, ingredients.nom AS ingredient_nom,
                      utiliser.quantite, utiliser.unite
                FROM menus
                LEFT JOIN prevoir ON menus.id = prevoir.menu_id
                LEFT JOIN repas ON prevoir.repas_id = repas.id
                LEFT JOIN composer ON repas.id = composer.repas_id
                LEFT JOIN recettes ON composer.recette_id = recettes.id
                LEFT JOIN utiliser ON recettes.id = utiliser.recette_id
                LEFT JOIN ingredients ON utiliser.ingredient_id = ingredients.id
                WHERE date_menu BETWEEN ? AND DATE_ADD(?, INTERVAL 7 DAY)
                `,
                [nextMonday, nextMonday]
            )

            // S'il n'y a pas encore de menus pour cette semaine
            if (rows.length === 0) {
                // On crée les menus de la semaine
                let currentDate
                for (let i = 0; i < 7; i++) {
                    currentDate = moment(nextMonday).add(i, 'days').format('YYYY-MM-DD')
                    await connection.execute('INSERT INTO menus (date_menu) VALUES (?)', [currentDate])
                }

                // On retourne les menus de la semaine
                const [rows] = await connection.execute(
                    `
                    SELECT *
                    FROM menus
                    WHERE date_menu BETWEEN ? AND DATE_ADD(?, INTERVAL 7 DAY)
                    `,
                    [nextMonday, nextMonday]
                )

                connection.release()
                return res.status(200).json(rows)
            }

            connection.release()
            return res.status(200).json(semaine(rows))
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server Error' })
    } finally {
        if (connection) connection.release()
    }
}

const semaine = (result_rows) => {
    // Initialisation du tableau de menus de la semaine
    const semaine = []
    // Initialisation du menu et repas courants
    let current_menu = null
    let current_repas = null

    // Parcours de chaque ligne de la requête SQL
    for (let row of result_rows) {
        // Extraction des données de la ligne
        const {
            menu_id,
            date_menu,
            repas_id,
            nb_convives,
            recette_id,
            recette_nom,
            nb_personnes,
            ingredients_id,
            ingredient_nom,
            quantite,
            unite,
        } = row

        // Si c'est un nouveau menu, on l'ajoute au tableau de menus de la semaine
        if (current_menu === null || current_menu.id !== menu_id) {
            current_menu = {
                id: menu_id,
                date: date_menu,
                repas: [],
            }
            semaine.push(current_menu)
            current_repas = null
        }

        // Si c'est un nouveau repas, on l'ajoute au menu courant
        if (current_repas === null || current_repas.id !== repas_id) {
            current_repas = {
                id: repas_id,
                nb_convives: nb_convives,
                recettes: [],
                ingredients: {},
            }
            current_menu.repas.push(current_repas)
        }

        // Si c'est une nouvelle recette, on l'ajoute au repas courant
        let current_recette = current_repas.recettes.find((recette) => recette.id === recette_id)
        if (!current_recette) {
            current_recette = {
                id: recette_id,
                nom: recette_nom,
                nb_personnes: nb_personnes,
                ingredients: [],
            }
            current_repas.recettes.push(current_recette)
        }

        // On calcule la quantité nécessaire d'ingrédients pour cette recette, en ajustant en fonction du nombre de convives
        const quantite_necessaire = (quantite * nb_convives) / nb_personnes

        // On ajoute l'ingrédient à la recette courante
        current_recette.ingredients.push({
            id: ingredients_id,
            nom: ingredient_nom,
            quantite: quantite_necessaire,
            unite: unite,
        })

        // On ajoute la quantité nécessaire de cet ingrédient à la liste d'ingrédients pour ce repas
        if (!current_repas.ingredients[ingredients_id]) {
            current_repas.ingredients[ingredients_id] = {
                nom: ingredient_nom,
                quantite: 0,
                unite: unite,
            }
        }
        current_repas.ingredients[ingredients_id].quantite += quantite_necessaire
    }

    // On renvoie le tableau de menus de la semaine
    return semaine
}

module.exports = {
    getAllMenus,
    getMenuForCurrentMondayOrNextMonday,
}
