const Menu = require('../models/menu')

const getAllMenusByDate = async (req, res) => {
    let date = req.params.date
    const sqlResult = await Menu.getAllMenusOfWeekByDate(date)

    if (!sqlResult.message) {
        return res.status(200).json(sqlResult)
    }

    return res.status(500).json(sqlResult)
}

const getAllIngredientsForMonth = async (req, res) => {
    const date = req.params.date
    const result = await Menu.getAllIngredientsForTheMonth(date)

    if (!result.error) {
        return res.status(200).json(result)
    }

    return res.status(error.status).json(result)
}

const getUsagePercentageOfIngredients = async (req, res) => {
    const date = req.params.date
    const result = await Menu.getUsagePercentageOfIngredients(date)

    if (!result.error) {
        return res.status(200).json(result)
    }

    return res.status(error.status).json(result)
}

const getNumberOfEachRecettes = async (req, res) => {
    const date = req.params.date
    const result = await Menu.countRecettesOfMonth(date)

    if (!result.error) {
        return res.status(200).json(result)
    }

    return res.status(error.status).json(result)
}

module.exports = {
    getAllMenusByDate,
    getAllIngredientsForMonth,
    getUsagePercentageOfIngredients,
    getNumberOfEachRecettes,
}
