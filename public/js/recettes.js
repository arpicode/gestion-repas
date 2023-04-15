const state = {
    ingredients: [],
}

const getAllRecettes = () => {
    $.ajax({
        url: `/api/recettes`,
        method: 'GET',
        dataType: 'json',
    })
        .done((data) => {
            renderRecettesList(data)
            return data
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
            data.forEach((i) => state.ingredients.push(i))
        })
        .fail(() => console.error('Error while getting all ingredients.'))
}

const renderRecettesList = (recettes) => {
    const tbody = $('.recettes-list tbody')
    tbody.html('')
    recettes.forEach((recette) => {
        tbody.append(
            `<tr>
                <td class="fw-light text-secondary">#${recette.id}</td>
                <td>${recette.nom}</td>
                <td>
                    <div class="d-flex gap-1 justify-content-end">
                        <button class="btn btn-secondary btn-sm"><i class="bi bi-eye"></i></button>
                        <button class="remove-recette-btn btn btn-danger btn-sm" data-recette-id="${recette.id}"><i class="bi bi-trash"></i></button>
                    </div>
                </td>
            </tr>`
        )

        $(`[data-recette-id="${recette.id}"]`).on('click', debounce(onRemoveRecette, 200))
    })
}

// --- Event Handlers

const onAddIngredient = (event) => {
    // const repasId = +event.currentTarget.dataset.repasId
    const ingredientsContainer = $(`.ingredients-container`)

    // get the template for recette
    const template = $('#ingredient-template')
    const currentIngredient = template.clone(true).contents()

    const removeIngredientBtn = currentIngredient.find('.remove-ingredient-btn')
    // removeIngredientBtn.attr('data-repas-id', repasId)
    removeIngredientBtn.on('click', onRemoveIngredient)

    const ingredientsSelect = currentIngredient.find('.ingredients-select')
    // if (ingredientsSelect.val() !== null)
    // ingredientsSelect.attr('id', `ingredient-id-${ingredientsSelect.val()}`)
    ingredientsSelect.on('change', debounce(onChangeNewIngredient))

    ingredientsSelect.append(`<option value="">-- ingredients --</option>`)
    state.ingredients.forEach((ingr) => {
        ingredientsSelect.append(`<option value="${ingr.id}">${ingr.nom}</option>`)
    })
    currentIngredient.appendTo(ingredientsContainer)
    // update select ids
    // updateIngredientsIds()
}

const onRemoveIngredient = (event) => {
    console.log('remove i')
    event.currentTarget.parentElement.remove()
}

const onSaveRecette = () => {
    const nom = $('.nom-recette').val().trim()
    if (nom) {
        // Build payload
        const payload = Object.create(null)
        payload.nom = nom
        payload.nb_personnes = +$('.nb-personnes').val().trim()
        payload.etapes = $('.etapes').val().trim()
        payload.ingredients = []

        $('.ingredients-select').each((i, select) => {
            const currentIngredient = state.ingredients.find((ingredient) => ingredient.id === +select.value)
            console.log(select)
            if (currentIngredient) {
                currentIngredient.utiliser = Object.create(null)
                currentIngredient.utiliser.quantite = +$(`#ingredient-id-${currentIngredient.id} .qte-ingredient`).val()
                currentIngredient.utiliser.unite = $(`#ingredient-id-${currentIngredient.id} .unite-ingredient`).val() //$(`.unite-ingredient`).val().trim()
                payload.ingredients.push(currentIngredient)
            }
        })

        $.ajax({
            url: `/api/recettes`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
        })
            .done((data) => {
                getAllRecettes()
                console.dir(`Created recette ${JSON.stringify(data)}.`)
                $('.recettes-list').toggleClass('d-none')
                $('.recette').toggleClass('d-none')
                resetForm()
            })
            .fail(() => console.error(`Error while adding recette.`))
    }
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
})

$('#back-btn').on('click', () => {
    $('.recettes-list').toggleClass('d-none')
    $('.recette').toggleClass('d-none')
})

$('#save-btn').on('click', debounce(onSaveRecette))

$('.add-ingredient-btn').on('click', onAddIngredient)

// --- Utils

const onChangeNewIngredient = (event) => {
    event.currentTarget.parentElement.id = `ingredient-id-${event.currentTarget.value}`
}

const resetForm = () => {
    $('.ingredients-container').html('')
    $('.nb-personnes').val('')
    $('.etapes').val('')
}

// --- Init.

getAllIngredients()
getAllRecettes()
