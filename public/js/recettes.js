const state = {
    ingredients: [],
    recettes: [],
}

const getAllRecettes = () => {
    $.ajax({
        url: `/api/recettes`,
        method: 'GET',
        dataType: 'json',
    })
        .done((data) => {
            state.recettes = [...data]
            renderRecettesList()
        })
        .fail(() => console.error('Error while getting all recettes.'))
}

const getAllIngredients = () => {
    $.ajax({
        url: `/api/ingredients`,
        method: 'GET',
        dataType: 'json',
    })
        .done((data) => {
            state.ingredients = [...data]
        })
        .fail(() => console.error('Error while getting all ingredients.'))
}

const renderRecettesList = () => {
    const tbody = $('.recettes-list tbody')
    tbody.html('')
    state.recettes.forEach((recette) => {
        tbody.append(`
            <tr>
                <td class="fw-light text-secondary">#${recette.id}</td>
                <td>${recette.nom}</td>
                <td>
                    <div class="d-flex gap-1 justify-content-end">
                        <button class="edit-recette-btn btn btn-primary btn-sm" data-recette-id="${recette.id}"><i class="bi bi-pencil"></i></button>
                        <button class="remove-recette-btn btn btn-danger btn-sm" data-recette-id="${recette.id}"><i class="bi bi-trash"></i></button>
                    </div>
                </td>
            </tr>`)

        $(`.remove-recette-btn[data-recette-id="${recette.id}"]`).on('click', debounce(onRemoveRecette, 200))
        $(`.edit-recette-btn[data-recette-id="${recette.id}"]`).on('click', debounce(onEditRecette, 200))
    })
}

// --- Event Handlers

const onAddIngredient = (event) => {
    const ingredientsContainer = $(`.ingredients-container`)

    // Get the template for recette.
    const template = $('#ingredient-template')
    const currentIngredient = template.clone(true).contents()

    // Add event listener for remove btn.
    const removeIngredientBtn = currentIngredient.find('.remove-ingredient-btn')
    removeIngredientBtn.on('click', onRemoveIngredient)

    // Add event listener for ingredients select.
    const ingredientsSelect = currentIngredient.find('.ingredients-select')
    ingredientsSelect.on('change', debounce(onChangeNewIngredient))

    // Build ingredients select
    ingredientsSelect.append(`<option value="">-- ingredients --</option>`)
    state.ingredients.forEach((ingr) => {
        ingredientsSelect.append(`<option value="${ingr.id}">${ingr.nom}</option>`)
    })
    currentIngredient.appendTo(ingredientsContainer)
}

const onRemoveIngredient = (event) => {
    event.currentTarget.parentElement.remove()
}

const onSaveRecette = (event) => {
    const recetteId = +event.currentTarget.dataset.recetteId || 0
    const nom = $('.nom-recette').val().trim()

    const action = Object.create(null)
    if (recetteId === 0) {
        // insert options
        action.url = `/api/recettes`
        action.method = 'POST'
    } else {
        // update options
        action.url = `/api/recettes/${recetteId}`
        action.method = 'PUT'
    }

    if (nom) {
        // Build payload from form controls
        const payload = Object.create(null)
        payload.id = recetteId
        payload.nom = nom
        payload.nb_personnes = +$('.nb-personnes').val().trim()
        payload.etapes = $('.etapes').val().trim()
        payload.ingredients = []

        $('.ingredient').each((i, ingredient) => {
            const select = ingredient.querySelector('select')
            const qte = ingredient.querySelector('.qte-ingredient')
            const unite = ingredient.querySelector('.unite-ingredient')

            // Check for duplicate
            const hasIngredient = !!payload.ingredients.find((ingredient) => ingredient.id === +select.value)
            if (!hasIngredient) {
                // Set current ingredient values
                const currentIngredient = state.ingredients.find((ingredient) => ingredient.id === +select.value)

                if (currentIngredient) {
                    currentIngredient.utiliser = Object.create(null)
                    currentIngredient.utiliser.quantite = +qte.value
                    currentIngredient.utiliser.unite = unite.value
                    payload.ingredients.push(currentIngredient)
                }
            }
        })

        $.ajax({
            url: action.url,
            method: action.method,
            contentType: 'application/json',
            data: JSON.stringify(payload),
        })
            .done((data) => {
                getAllRecettes()
                resetForm()
            })
            .fail(() => console.error(`Error while adding recette.`))
    }
}

const onEditRecette = (event) => {
    const recetteId = +event.currentTarget.dataset.recetteId
    const currentRecette = state.recettes.find((r) => r.id === recetteId)

    $('.recettes-list').toggleClass('d-none')
    $('.recette').toggleClass('d-none')

    $('#save-btn').attr('data-recette-id', recetteId)
    $('.nom-recette').val(currentRecette.nom)
    $('.nb-personnes').val(currentRecette.nb_personnes)
    $('.etapes').val(currentRecette.etapes)
    const ingredientsContainer = $(`.ingredients-container`)
    currentRecette.ingredients.forEach((i) => {
        // get the template for recette.
        const template = $('#ingredient-template')
        const currentIngredient = template.clone(true).contents()

        // add event listener for remove btn.
        const removeIngredientBtn = currentIngredient.find('.remove-ingredient-btn')
        removeIngredientBtn.on('click', onRemoveIngredient)

        // add event listener for ingredients select.
        const ingredientsSelect = currentIngredient.find('.ingredients-select')
        ingredientsSelect.on('change', debounce(onChangeNewIngredient))

        // set quantité input.
        const qte = currentIngredient.find('.qte-ingredient')
        qte.val(i.utiliser.quantite)
        qte.attr('data-indredient-id', i.id)

        // set unité input.
        const unite = currentIngredient.find('.unite-ingredient')
        unite.val(i.utiliser.unite)
        unite.attr('data-ingredient-id', i.id)

        ingredientsSelect.append(`<option value="">-- ingredients --</option>`)
        state.ingredients.forEach((ingr) => {
            const selected = i.id === ingr.id ? 'selected' : ''
            ingredientsSelect.append(`<option value="${ingr.id}" ${selected}>${ingr.nom}</option>`)
        })
        currentIngredient.appendTo(ingredientsContainer)
    })
}

const onRemoveRecette = (event) => {
    const recetteId = +event.currentTarget.dataset.recetteId

    $.ajax({
        url: `/api/recettes/${recetteId}`,
        method: 'DELETE',
    })
        .done(() => {
            getAllRecettes()
        })
        .fail(() => console.error(`Error while removing recette: ${recetteId}.`))
}

// --- Event Listeners

$('#new-recette-btn').on('click', () => {
    $('.recettes-list').toggleClass('d-none')
    $('.recette').toggleClass('d-none')
    $('#save-btn').attr('data-recette-id', 0)
    $('.nom-recette').trigger('focus')
})

$('#back-btn').on('click', () => {
    resetForm()
})

$('#save-btn').on('click', debounce(onSaveRecette))

$('.add-ingredient-btn').on('click', onAddIngredient)

// --- Utils

const onChangeNewIngredient = (event) => {
    event.currentTarget.parentElement.id = `ingredient-id-${event.currentTarget.value}`
}

const resetForm = () => {
    $('.recettes-list').toggleClass('d-none')
    $('.recette').toggleClass('d-none')

    $('.ingredients-container').html('')
    $('.nom-recette').val('')
    $('.nb-personnes').val('1')
    $('.etapes').val('')
    $('#save-btn').attr('data-recette-id', 0)
}

// --- Init.

getAllIngredients()
getAllRecettes()
