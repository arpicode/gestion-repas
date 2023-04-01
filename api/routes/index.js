const express = require('express')
const router = express.Router()

const menuController = require('../controllers/menu')

// prettier-ignore
router.route('/menus')
    .get(menuController.getAllMenus)

// prettier-ignore
router.route('/menus/:date')
    .get(menuController.getMenuForCurrentMondayOrNextMonday)

module.exports = router
