SELECT ingredients.nom AS ingredient,
       COUNT(*) AS total_utilisations,
       COUNT(*) / (SELECT COUNT(*)
                   FROM utiliser 
                   JOIN recettes ON utiliser.recette_id = recettes.id 
                   JOIN composer ON recettes.id = composer.recette_id 
                   JOIN repas ON composer.repas_id = repas.id 
                   JOIN prevoir ON repas.id = prevoir.repas_id 
                   JOIN menus ON prevoir.menu_id = menus.id 
                   WHERE menus.date_menu BETWEEN '2023-04-01' AND '2023-04-30') * 100 AS pourcentage_utilisation
FROM utiliser
JOIN ingredients ON utiliser.ingredient_id = ingredients.id
JOIN recettes ON utiliser.recette_id = recettes.id
JOIN composer ON composer.recette_id = recettes.id
JOIN repas ON composer.repas_id = repas.id
JOIN prevoir ON prevoir.repas_id = repas.id
JOIN menus ON prevoir.menu_id = menus.id
WHERE menus.date_menu BETWEEN '2023-04-01' AND '2023-04-30'
GROUP BY ingredients.id
ORDER BY ingredients.nom;