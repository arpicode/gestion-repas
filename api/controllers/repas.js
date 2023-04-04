const Repas = require('../models/repas')

const repasCreate = async (req, res) => {
    // console.log('REQ.BODY:', req.body)
    // console.log('REQ.PARAMS:', req.params)
    const result = await Repas.inserRepasByMenuId(req.params.menuId, req.body)

    if (!result.error) {
        res.status(201).json(result)
    } else {
        res.status(500).json(result)
    }
}

const repasDestroy = async (req, res) => {
    console.log('pouf')
}

module.exports = {
    repasCreate,
    repasDestroy,
}
