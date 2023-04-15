const express = require('express')
const router = express.Router()

const menuController = require('../controllers/menu')
const repasController = require('../controllers/repas')
const recetteController = require('../controllers/recette')
const ingredientController = require('../controllers/ingredient')

/**
 * Routes des menus
 */
// prettier-ignore
router.route('/menus/:date')
    .get(menuController.getAllMenusByDate)

// prettier-ignore
router.route('/menus/:date/ingredients')
    .get(menuController.getAllIngredientsForMonth)

// prettier-ignore
router.route('/menus/:date/recettes')
    .get(menuController.getNumberOfEachRecettes)

// prettier-ignore
router.route('/menus/:date/ingredients/percents')
    .get(menuController.getUsagePercentageOfIngredients)

/**
 * Routes des repas
 */
// prettier-ignore
router.route('/menus/:menuId/repas')
    .post(repasController.create)

// prettier-ignore
router.route('/repas/:id')
    .delete(repasController.destroy)

// prettier-ignore
router.route('/repas/:repasId/recettes/:recetteId')
    .put(repasController.update)
    .delete(repasController.destroyRecette)

/**
 * Routes des recettes
 */
// prettier-ignore
router.route('/recettes')
    .get(recetteController.index)
    .post(recetteController.store)

// prettier-ignore
router.route('/recettes/:id')
    .put(recetteController.update)
    .delete(recetteController.destroy)

// prettier-ignore
router.route('/recettes/:recetteId/ingredients/:ingredientId')
    .delete(recetteController.destroyIngredient)

/**
 * Routes des ingredients
 */
// prettier-ignore
router.route('/ingredients')
    .get(ingredientController.index)
    .post(ingredientController.store)

// prettier-ignore
router.route('/ingredients/:id')
    .put(ingredientController.update)
    .delete(ingredientController.destroy)

module.exports = router
