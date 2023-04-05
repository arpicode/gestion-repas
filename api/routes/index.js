const express = require('express')
const router = express.Router()

const menuController = require('../controllers/menu')
const repasController = require('../controllers/repas')
const recetteController = require('../controllers/recette')

/**
 * Routes des menus
 */
// prettier-ignore
router.route('/menus/:date')
    .get(menuController.getAllMenusByDate)

/**
 * Routes des repas
 */
// prettier-ignore
router.route('/menus/:menuId/repas')
    .post(repasController.create)

// prettier-ignore
router.route('/menus/:menuId/repas/:repasId')
    .delete(repasController.destroy)

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

module.exports = router
