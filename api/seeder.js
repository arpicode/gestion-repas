const pool = require('./db')

async function seed() {
    let connection
    try {
        connection = await pool.getConnection()
        await connection.beginTransaction()

        console.log('Seeding database...')
        await connection.query(`
            INSERT INTO ingredients (id, nom) VALUES
                (1, "aubergine"),
                (2, "poivron"),
                (3, "oignon"),
                (4, "courgette"),
                (5, "ail"),
                (6, "tomate"),
                (7, "viande de boeuf"),
                (8, "carotte"),
                (9, "vin rouge"),
                (10, "bouillon de boeuf"),
                (11, "quinoa"),
                (12, "tomate cerise"),
                (13, "épinards frais"),
                (14, "fromage de chèvre"),
                (15, "huile d'olive"),
                (16, "jus de citron"),
                (17, "poulet"),
                (18, "chocolat"),
                (19, "œufs"),
                (20, "sucre");
        `)

        await connection.query(`
            INSERT INTO recettes (id, nom, nb_personnes, etapes) VALUES
                (1, "Ratatouille", 4, "1. Couper les légumes en dés. 2. Faire revenir les légumes dans une poêle avec de l'huile d'olive. 3. Ajouter les herbes de Provence. 4. Laisser mijoter à feu doux pendant 30 minutes."),
                (2, "Boeuf Bourguignon", 6, "1. Couper la viande en morceaux. 2. Faire revenir les morceaux de viande dans une cocotte avec de l'huile. 3. Ajouter les oignons et les carottes. 4. Ajouter le vin rouge et le bouillon de bœuf. 5. Laisser mijoter à feu doux pendant 2 heures."),
                (3, "Salade de quinoa", 2, "1. Cuire le quinoa. 2. Ajouter des tomates cerises et des épinards frais. 3. Ajouter des dés de fromage de chèvre. 4. Préparer une vinaigrette à base d'huile d'olive et de jus de citron. 5. Verser la vinaigrette sur la salade."),
                (4, "Poulet rôti au four", 4, "1. Préchauffer le four à 200°C. 2. Frotter le poulet avec du sel, du poivre et des herbes de Provence. 3. Placer le poulet dans un plat allant au four. 4. Faire cuire pendant 1 heure en arrosant régulièrement le poulet avec le jus de cuisson."),
                (5, "Mousse au chocolat", 6, "1. Faire fondre le chocolat au bain-marie. 2. Séparer les blancs des jaunes d'œufs. 3. Monter les blancs en neige. 4. Ajouter les jaunes d'œufs au chocolat fondu. 5. Incorporer délicatement les blancs en neige au mélange chocolat-œufs. 6. Laisser reposer au réfrigérateur pendant au moins 2 heures.");
        `)

        await connection.query(`
            INSERT INTO utiliser (recette_id, ingredient_id, quantite, unite) VALUES
                (1, 1, "1.00", "unité(s)"),
                (1, 2, "1.00", "unité(s)"),
                (1, 3, "2.00", "unité(s)"),
                (1, 4, "2.00", "unité(s)"),
                (1, 5, "2.00", "gousse(s)"),
                (1, 6, "4.00", "unité(s)"),
                (2, 3, "3.00", "unité(s)"),
                (2, 7, "1.00", "kg"),
                (2, 8, "4.00", "unité(s)"),
                (2, 9, "75.00", "cl"),
                (2, 10, "50.00", "cl"),
                (3, 6, "250.00", "g"),
                (3, 11, "250.00", "g"),
                (3, 12, "100.00", "g"),
                (3, 13, "100.00", "g"),
                (3, 14, "5.00", "cl"),
                (3, 15, "3.00", "cl"),
                (4, 5, "2.00", "gousse(s)"),
                (4, 16, "5.00", "cl"),
                (4, 17, "1.00", "unité(s)"),
                (5, 18, "200.00", "g"),
                (5, 19, "6", "unité(s)"),
                (5, 20, "70", "g");
        `)

        await connection.query(`
            INSERT INTO menus (id, date_menu) VALUES
                (1, "2023-04-17"),
                (2, "2023-04-18"),
                (3, "2023-04-19"),
                (4, "2023-04-20"),
                (5, "2023-04-21"),
                (6, "2023-04-22"),
                (7, "2023-04-23"),
                (8, "2023-04-10"),
                (9, "2023-04-11"),
                (10, "2023-04-12"),
                (11, "2023-04-13"),
                (12, "2023-04-14"),
                (13, "2023-04-15"),
                (14, "2023-04-16");
        `)

        await connection.query(`
            INSERT INTO repas (id, nb_convives) VALUES
                (1, 4),
                (2, 4),
                (3, 4),
                (4, 2),
                (5, 6),
                (6, 1),
                (7, 1),
                (8, 3),
                (9, 3),
                (10, 3),
                (11, 12);
        `)

        await connection.query(`
            INSERT INTO composer (repas_id, recette_id) VALUES
                (1, 3),
                (1, 4),
                (1, 1),
                (1, 5),
                (2, 4),
                (2, 1),
                (3, 3),
                (3, 5),
                (4, 3),
                (4, 5),
                (5, 3),
                (5, 2),
                (5, 1),
                (5, 5),
                (8, 3),
                (8, 5),
                (9, 2),
                (9, 5),
                (10, 3),
                (10, 5),
                (11, 3),
                (11, 1),
                (11, 4),
                (11, 5);
        `)

        await connection.query(`
            INSERT INTO prevoir (menu_id, repas_id) VALUES
                (1, 1),
                (1, 2),
                (1, 3),
                (3, 6),
                (3, 7),
                (5, 4),
                (5, 5),
                (8, 3),
                (10, 9),
                (11, 10),
                (13, 11);
        `)

        await connection.commit()
        console.log(`Seeding completed successfully`)
    } catch (err) {
        console.error(`Error running seeder: ${err.message}`)
        await connection.rollback()
    } finally {
        process.emit('SIGINT')
    }
}

seed()
