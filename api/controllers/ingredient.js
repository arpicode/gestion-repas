const Ingredient = require('../models/ingredient')

const index = async (req, res) => {
    const result = await Ingredient.getAll()

    if (result?.error) {
        return res.status(result.status).json(result)
    }

    return res.status(200).json(result)
}

const store = async (req, res) => {
    const result = await Ingredient.insertOne(req.body)

    if (result?.error) {
        return res.status(result.status).json(result)
    }

    return res.status(201).json(result)
}

const update = async (req, res) => {
    const result = await Ingredient.updateOne(req.params.id, req.body)

    if (result?.error) {
        return res.status(result.status).json(result)
    }
    // Utilisation du code 200 plutôt que 204 vu qu'on retourne la ressource.
    return res.status(200).json(result)
}

const destroy = async (req, res) => {
    const result = await Ingredient.deleteOne(req.params.id)

    if (result?.error) {
        return res.status(result.status).json(result)
    }

    return res.status(204).json(null)
}

module.exports = {
    index,
    store,
    update,
    destroy,
}
