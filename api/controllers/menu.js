const Menu = require('../models/menu')

const getAllMenusByDate = async (req, res) => {
    let date = req.params.date
    const sqlResult = await Menu.getAllMenusOfWeekByDate(date)

    if (!sqlResult.message) {
        return res.status(200).json(sqlResult)
    }

    return res.status(500).json(sqlResult)
}

module.exports = {
    getAllMenusByDate,
}
