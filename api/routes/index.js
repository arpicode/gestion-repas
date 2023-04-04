const express = require('express')
const router = express.Router()

const menuController = require('../controllers/menu')
const repasController = require('../controllers/repas')
// const recetteController = require('../controllers/recette')

// prettier-ignore
router.route('/menus/:date')
    .get(menuController.getAllMenusByDate)

// prettier-ignore
router.route('/menus/:menuId/repas')
    .post(repasController.repasCreate)

// prettier-ignore
router.route('/menus/:menuId/repas/:repasId')
    .delete(repasController.repasDestroy)

module.exports = router
