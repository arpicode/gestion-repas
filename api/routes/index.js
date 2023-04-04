const express = require('express')
const router = express.Router()

const menuController = require('../controllers/menu')

// prettier-ignore
router.route('/menus/:date')
    .get(menuController.getAllMenusByDate)

// prettier-ignore
router.route('/menus/:menuId/repas')
    .post(menuController.repasCreate)

module.exports = router
