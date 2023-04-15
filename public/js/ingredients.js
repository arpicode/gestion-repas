// @ts-nocheck
const state = {
    ingredients: [],
}

const getAllIngredients = () => {
    $.ajax({
        url: `/api/ingredients`,
        method: 'GET',
        dataType: 'json',
    })
        .done((data) => {
            renderIngredientsList(data)
            return data
        })
        .fail(() => console.error('Error while getting all ingredients.'))
}

const renderIngredientsList = (ingredients) => {
    const tbody = $('.ingredients-list tbody')
    tbody.html('')
    ingredients.forEach((ingredient) => {
        tbody.append(
            `<tr>
                <td class="fw-light text-secondary">#${ingredient.id}</td>
                <td data-ingredient-id="${ingredient.id}">${ingredient.nom}</td>
                <td>
                    <div class="d-flex gap-1 justify-content-end">
                        <button class="edit-ingredient-btn btn btn-primary btn-sm" data-ingredient-id="${ingredient.id}"><i class="bi bi-pencil"></i></button>
                        <button class="remove-ingredient-btn btn btn-danger btn-sm" data-ingredient-id="${ingredient.id}"><i class="bi bi-trash"></i></button>
                    </div>
                </td>
            </tr>`
        )

        $(`.remove-ingredient-btn[data-ingredient-id="${ingredient.id}"]`).on(
            'click',
            debounce(onRemoveIngredient, 200)
        )
        $(`.edit-ingredient-btn[data-ingredient-id="${ingredient.id}"]`).on('click', debounce(onEditIngredient, 200))
    })
}

const onRemoveIngredient = (event) => {
    const ingredientId = event.currentTarget.dataset.ingredientId

    $.ajax({
        url: `/api/ingredients/${ingredientId}`,
        method: 'DELETE',
    })
        .done(() => {
            getAllIngredients()
            resetForm()
        })
        .fail(() => console.error(`Error while removing ingredient: ${ingredientId}.`))
}

const onSaveIngredient = (event) => {
    const payload = {
        id: event.currentTarget.dataset.ingredientId || 0,
        nom: $('#ingredient-input').val().trim(),
    }

    if (payload.nom) {
        $.ajax({
            url: `/api/ingredients`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
        })
            .done((data) => {
                getAllIngredients()
                resetForm()
            })
            .fail(() => console.error(`Error while adding recette.`))
    }
}

const onEditIngredient = (event) => {
    const id = event.currentTarget.dataset.ingredientId
    const name = $(`td[data-ingredient-id="${id}"]`).html()

    // Scroll to top
    window.scrollTo(0, 0)

    $('#new-ingredient-btn').addClass('d-none')
    $('.add-ingredient-form').removeClass('d-none')
    $('#save-ingredient-btn').attr('data-ingredient-id', id)
    $('#ingredient-input').val(name)
    $('#ingredient-input').trigger('focus')
}

$('#new-ingredient-btn').on('click', () => {
    $('#save-ingredient-btn').attr('data-ingredient-id', 0)
    $('.add-ingredient-form').removeClass('d-none')
    $('#ingredient-input').trigger('focus')
})

$('#save-ingredient-btn').on('click', onSaveIngredient)

$('#cancel-ingredient-btn').on('click', () => {
    resetForm()
})

const resetForm = () => {
    $('.add-ingredient-form').addClass('d-none')
    $('#ingredient-input').val('')
    $('#save-ingredient-btn').attr('data-ingredient-id', 0)
    $('#new-ingredient-btn').removeClass('d-none')
}

// --- Init.

getAllIngredients()
