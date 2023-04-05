const pool = require('../db')

const Menu = {
    async getAllMenusOfWeekByDate(date) {
        let connection
        let json = { message: 'Server Error' }

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

        const monday = getMondayOfCurrentWeek(date)

        try {
            connection = await pool.getConnection()
            await connection.beginTransaction()

            const [rows] = await connection.execute(selectSql, [monday, monday])

            // S'il n'y a pas encore de menus pour cette semaine
            if (rows.length === 0) {
                // On crée les menus de la semaine
                for (let i = 0; i < 7; i++) {
                    let currentDate = new Date(monday)
                    currentDate = new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

                    await connection.execute(insertSql, [currentDate])
                }

                // On retourne les menus de la semaine
                const [rows] = await connection.execute(selectSql, [monday, monday])
                json = menusSemaine(rows)
            } else {
                json = menusSemaine(rows)
            }
            await connection.commit()
        } catch (err) {
            console.log(err)
            await connection.rollback()
        } finally {
            if (connection) connection.release()
            return json
        }
    },
}

function getMondayOfCurrentWeek(dateString) {
    const date = new Date(dateString)
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)

    return new Date(date.setDate(diff)).toISOString().slice(0, 10)
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
                date_menu: date_menu,
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
