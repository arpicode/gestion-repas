const Repas = require('../models/repas')

const create = async (req, res) => {
    // console.log('REQ.BODY:', req.body)
    // console.log('REQ.PARAMS:', req.params)
    const result = await Repas.inserRepasByMenuId(req.params.menuId, req.body)

    if (!result.error) {
        res.status(201).json(result)
    } else {
        res.status(500).json(result)
    }
}

const update = async (req, res) => {
    const result = await Repas.updateOne(req.params.repasId, req.params.recetteId, req.body)

    if (!result.error) {
        res.status(201).json(result)
    } else {
        res.status(500).json(result)
    }
}

const destroy = async (req, res) => {
    // console.log('REQUEST PARAMS:', req.params)
    const result = await Repas.deleteOne(req.params.id)

    if (result?.error) {
        return res.status(result.status).json(result)
    }

    return res.status(204).json(null)
}

const destroyRecette = async (req, res) => {
    // console.log('REQUEST PARAMS:', req.params)
    const result = await Repas.deleteOneRecette(req.params.repasId, req.params.recetteId)

    if (result?.error) {
        return res.status(result.status).json(result)
    }

    return res.status(204).json(null)
}

module.exports = {
    create,
    update,
    destroy,
    destroyRecette,
}
