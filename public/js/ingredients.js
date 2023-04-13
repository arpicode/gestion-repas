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
                <td>${ingredient.nom}</td>
                <td>
                    <div class="d-flex gap-1 justify-content-end">
                        <button class="btn btn-secondary btn-sm"><i class="bi bi-pen"></i></button>
                        <button class="remove-ingredient-btn btn btn-danger btn-sm" data-ingredient-id="${ingredient.id}"><i class="bi bi-trash"></i></button>
                    </div>
                </td>
            </tr>`
        )

        $(`[data-ingredient-id="${ingredient.id}"]`).on('click', debounce(onRemoveIngredient, 200))
    })
}

const onRemoveIngredient = (event) => {
    console.log('remove i')
    event.currentTarget.parentElement.remove()
}

const onAddIngredient = (event) => {
    
}

$('#new-ingredient-btn').on('click', () => {
    $('.ingredients-list').toggleClass('d-none')
    $('.ingredient').toggleClass('d-none')
})

// --- Init.

getAllIngredients()
