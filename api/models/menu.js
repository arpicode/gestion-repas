const pool = require('../db')
const moment = require('moment')

const Menu = {
    async getAllMenusOfWeekByDate(date) {
        let connection
        let result = { message: 'Server Error' }

        try {
            const selectSql = `
                SELECT menus.id AS menu_id, menus.date_menu,
                    repas.id AS repas_id, repas.nb_convives,
                    recettes.id AS recette_id, recettes.nom AS recette_nom, recettes.nb_personnes,
                    ingredients.id AS ingredient_id, ingredients.nom AS ingredient_nom,
                    utiliser.quantite, utiliser.unite
                FROM menus
                LEFT JOIN prevoir ON menus.id = prevoir.menu_id
                LEFT JOIN repas ON prevoir.repas_id = repas.id
                LEFT JOIN composer ON repas.id = composer.repas_id
                LEFT JOIN recettes ON composer.recette_id = recettes.id
                LEFT JOIN utiliser ON recettes.id = utiliser.recette_id
                LEFT JOIN ingredients ON utiliser.ingredient_id = ingredients.id
                WHERE date_menu BETWEEN ? AND DATE_ADD(?, INTERVAL 6 DAY)`

            const insertSql = `INSERT INTO menus (date_menu) VALUES (?)`

            connection = await pool.getConnection()

            console.log('input date', date)
            const monday = getMondayOfCurrentWeek(date)
            console.log('monday of the week', monday)
            const [rows] = await connection.execute(selectSql, [monday, monday])

            // S'il n'y a pas encore de menus pour cette semaine
            if (rows.length === 0) {
                console.log('pas encore de menus pour cette semaine')
                // On crée les menus de la semaine
                console.log('création des menus')
                for (let i = 0; i < 7; i++) {
                    // Add i days to the Monday date to get the date for the current iteration
                    let currentDate = new Date(monday)
                    currentDate = new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000)
                    currentDate = currentDate.toISOString().slice(0, 10)
                    console.log('création du menu pour la date:', currentDate)

                    await connection.execute(insertSql, [currentDate])
                }

                // On retourne les menus de la semaine
                const [rows] = await connection.execute(selectSql, [monday, monday])
                result = menusSemaine(rows)
            } else {
                result = menusSemaine(rows)
            }
        } catch (err) {
            console.log(err)
        } finally {
            if (connection) connection.release()
            return result
        }
    },
}

// const getMondayOfCurrentWeek = (dateString) => {
//     // Create a date object from the given date string
//     const givenDate = new Date(dateString)

//     // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
//     const dayOfWeek = givenDate.getDay()

//     // If the given date is already a Monday, return it
//     if (dayOfWeek === 1) {
//         return givenDate.toISOString().slice(0, 10)
//     }

//     // Calculate the difference in days between the given date and the Monday of its week
//     const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

//     // Create a new date object for the Monday of the week
//     const mondayDate = new Date(givenDate.getFullYear(), givenDate.getMonth(), givenDate.getDate() + daysToMonday)

//     // Output the date of the Monday
//     return mondayDate.toISOString().slice(0, 10)
// }

function getMondayOfCurrentWeek(dateString) {
    const date = new Date(dateString)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    const mondayDate = new Date(date.setDate(diff))
    return mondayDate.toISOString().slice(0, 10)
}

const menusSemaine = (result_rows) => {
    // Initialisation du tableau de menus de la semaine
    const menusSemaine = []
    // Initialisation du menu courant
    let currentMenu = null

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
            test,
        } = row

        // Si c'est un nouveau menu, on l'ajoute au tableau de menus de la semaine
        if (currentMenu === null || currentMenu.id !== menu_id) {
            currentMenu = {
                id: menu_id,
                date: date_menu,
                repas: [],
            }
            menusSemaine.push(currentMenu)
        }

        // Si c'est un nouveau repas, on l'ajoute au menu courant
        if (repas_id) {
            let currentRepas = currentMenu.repas.find((repas) => repas.id === repas_id)
            if (!currentRepas) {
                currentRepas = {
                    id: repas_id,
                    nb_convives: nb_convives,
                    recettes: [],
                }
                currentMenu.repas.push(currentRepas)
            }

            // Si c'est une nouvelle recette, on l'ajoute au repas courant
            if (recette_id) {
                let currentRecette = currentRepas.recettes.find((recette) => recette.id === recette_id)
                if (!currentRecette) {
                    currentRecette = {
                        id: recette_id,
                        nom: recette_nom,
                        nb_personnes: nb_personnes,
                        ingredients: [],
                    }
                    currentRepas.recettes.push(currentRecette)
                }

                // On calcule la quantité nécessaire d'ingrédients pour cette recette,
                // en ajustant en fonction du nombre de convives
                const quantite_necessaire = (quantite * nb_convives) / nb_personnes

                // On ajoute l'ingrédient à la recette courante
                currentRecette.ingredients.push({
                    id: ingredients_id,
                    nom: ingredient_nom,
                    quantite: +quantite,
                    quantite_necessaire: +quantite_necessaire.toFixed(2),
                    unite: unite,
                })
            }
        }
    }

    // On renvoie le tableau de menus de la semaine
    return menusSemaine
}

module.exports = Menu
