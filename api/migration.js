const pool = require('./db')

async function migrate() {
    let connection
    try {
        connection = await pool.getConnection()
        console.log('Starting migration...')

        await connection.query(`SET FOREIGN_KEY_CHECKS=0;`)
        await connection.query(`SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";`)
        await connection.beginTransaction()

        console.log('Creating table composer...')
        await connection.query(`DROP TABLE IF EXISTS composer;`)
        await connection.query(`
            CREATE TABLE composer (
                repas_id int(11) NOT NULL,
                recette_id int(11) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `)

        console.log('Creating table ingredients...')
        await connection.query(`DROP TABLE IF EXISTS ingredients;`)
        await connection.query(`
            CREATE TABLE ingredients (
                id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                nom varchar(50) DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `)

        console.log('Creating table menus...')
        await connection.query(`DROP TABLE IF EXISTS menus;`)
        await connection.query(`
            CREATE TABLE menus (
                id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                date_menu date DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `)

        console.log('Creating table prevoir...')
        await connection.query(`DROP TABLE IF EXISTS prevoir;`)
        await connection.query(`
            CREATE TABLE prevoir (
                menu_id int(11) NOT NULL,
                repas_id int(11) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `)

        console.log('Creating table recettes...')
        await connection.query(`DROP TABLE IF EXISTS recettes;`)
        await connection.query(`
            CREATE TABLE recettes (
                id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                nom varchar(50) DEFAULT NULL,
                nb_personnes int(11) DEFAULT NULL,
                etapes text DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `)

        console.log('Creating table repas...')
        await connection.query(`DROP TABLE IF EXISTS repas;`)
        await connection.query(`
            CREATE TABLE repas (
                id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
                nb_convives int(11) DEFAULT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `)

        console.log('Creating table utiliser...')
        await connection.query(`DROP TABLE IF EXISTS utiliser;`)
        await connection.query(`
            CREATE TABLE utiliser (
                recette_id int(11) NOT NULL,
                ingredient_id int(11) NOT NULL,
                quantite decimal(6,2) DEFAULT 0,
                unite varchar(50) DEFAULT ''
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

        `)

        await connection.query(`
            ALTER TABLE composer
            ADD PRIMARY KEY (repas_id,recette_id),
            ADD KEY recette_id (recette_id);
        `)

        await connection.query(`
            ALTER TABLE prevoir
            ADD PRIMARY KEY (menu_id,repas_id),
            ADD KEY repas_id (repas_id);
        `)

        await connection.query(`
            ALTER TABLE utiliser
            ADD PRIMARY KEY (recette_id,ingredient_id),
            ADD KEY ingredient_id (ingredient_id);
        `)

        await connection.query(`
            ALTER TABLE composer
            ADD CONSTRAINT composer_ibfk_1 FOREIGN KEY (repas_id) REFERENCES repas (id) ON DELETE CASCADE,
            ADD CONSTRAINT composer_ibfk_2 FOREIGN KEY (recette_id) REFERENCES recettes (id) ON DELETE CASCADE;
        `)

        await connection.query(`
            ALTER TABLE prevoir
            ADD CONSTRAINT prevoir_ibfk_1 FOREIGN KEY (menu_id) REFERENCES menus (id) ON DELETE CASCADE,
            ADD CONSTRAINT prevoir_ibfk_2 FOREIGN KEY (repas_id) REFERENCES repas (id) ON DELETE CASCADE;
        `)

        await connection.query(`
            ALTER TABLE utiliser
            ADD CONSTRAINT utiliser_ibfk_1 FOREIGN KEY (recette_id) REFERENCES recettes (id) ON DELETE CASCADE,
            ADD CONSTRAINT utiliser_ibfk_2 FOREIGN KEY (ingredient_id) REFERENCES ingredients (id) ON DELETE CASCADE;
        `)

        await connection.query(`ALTER TABLE menus ADD INDEX(date_menu);`)

        await connection.query(`SET FOREIGN_KEY_CHECKS=1;`)
        await connection.commit()
        console.log(`Migration completed successfully!`)
    } catch (error) {
        await connection.rollback()
        console.error(`Error running migration: ${error.message}`)
    } finally {
        process.emit('SIGINT')
    }
}

migrate()
