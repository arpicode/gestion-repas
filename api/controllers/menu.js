const Menu = require('../models/menu')

const getAllMenusByDate = async (req, res) => {
    let date = req.params.date
    const sqlResult = await Menu.getAllMenusOfWeekByDate(date)

    if (!sqlResult.message) {
        return res.status(200).json(sqlResult)
    }

    return res.status(500).json(sqlResult)
}

const repasCreate = async (req, res) => {
    console.log('REQ.BODY:', req.body)
    const result = await Menu.inserRepasByMenuId(req.params.menuId, req.body)
    if (!result.error) {
        res.status(201).json(result)
    } else {
        res.status(500).json(result)
    }
}

module.exports = {
    getAllMenusByDate,
    repasCreate,
}
