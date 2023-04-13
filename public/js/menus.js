// Le state managment du pauvre
const state = {
    currentDate: new Date().toISOString().slice(0, 10),
    menus: null,
    recettes: null,

    addRepas(repas, menuId) {
        const menu = this.menus.find((menu) => menu.id === menuId)

        menu.repas.push(repas)
    },

    removeRepas(repasId) {
        if (!this.menus) return null

        for (let i = 0; i < this.menus.length; i++) {
            const menu = this.menus[i]
            const repasIndex = menu.repas.findIndex((repas) => repas.id === repasId)

            if (repasIndex !== -1) {
                menu.repas.splice(repasIndex, 1)
                return menu.id
            }
        }

        return null
    },
    removeRecette(repasId, recetteId) {
        for (const menu of state.menus) {
            // Get the repas repasId
            const repas = menu.repas.find((repas) => repas.id === repasId)
            if (repas) {
                const recetteIndex = repas.recettes.findIndex((recette) => recette.id === recetteId)

                if (recetteIndex !== -1) {
                    repas.recettes.splice(recetteIndex, 1)
                    return repas.id
                }
            }
        }

        return null
    },
    updateRepas(repas) {
        for (const menu of this.menus) {
            // Get the index of the repas beeing updated.
            const currentRepasIndex = menu.repas.findIndex((r) => r.id === repas.id)

            if (currentRepasIndex !== -1) {
                menu.repas[currentRepasIndex] = repas
                return repas.id
            }
        }

        return null
    },
}

const getMenusOfWeekByDate = () => {
    $.ajax({
        url: `/api/menus/${state.currentDate}`,
        method: 'GET',
        dataType: 'json',
    })
        .done((data) => {
            state.menus = data
            renderMenus(state.menus)
        })
        .fail(() => console.error('Error while getting menus of the week.'))
}

const getAllRecettes = () => {
    $.ajax({
        url: `/api/recettes`,
        method: 'GET',
        dataType: 'json',
    })
        .done((data) => {
            state.recettes = data
            getMenusOfWeekByDate()
        })
        .fail(() => console.error('Error while getting all recettes.'))
}

const updateWeekDates = (monday, sunday) => {
    $('#date-monday').text(new Date(monday).toLocaleDateString())
    $('#date-sunday').text(new Date(sunday).toLocaleDateString())
}

const renderMenus = () => {
    const menusContainer = $('.menus-container')

    // Set dates of the weeks navigation buttons
    updateWeekDates(state.menus[0].date_menu, state.menus[6].date_menu)

    // Clear all menus
    menusContainer.html('')

    state.menus.forEach((m) => {
        // Get menu template
        const template = $('#menu-template')
        const currentMenu = template.clone(true).contents()

        // Set id of current menu
        currentMenu.attr('id', `menu-${m.id}`)

        // Set day of current menu
        let dayName = new Date(m.date_menu).toLocaleDateString(navigator.language, { weekday: 'long' })
        dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1)
        currentMenu.find('.day-name').text(dayName)

        // Set date of current menu
        currentMenu.find('.day-date').text(new Date(m.date_menu).toLocaleDateString())
        const addRepasBtn = currentMenu.find('.add-repas-btn')
        addRepasBtn.attr('data-menu-id', m.id)
        addRepasBtn.on('click', debounce(onAddRepas))

        currentMenu.appendTo(menusContainer)

        renderRepas(m.id)
    })
}

const renderRepas = (menuId) => {
    const repasContainer = $(`#menu-${menuId} .repas-container`)
    const menu = state.menus.find((menu) => menu.id == menuId)

    // Clear all repas
    repasContainer.html('')

    menu.repas.forEach((r) => {
        const template = $('#repas-template')
        const currentRepas = template.clone(true).contents()

        // Set id of current repas
        currentRepas.attr('id', `repas-${r.id}`)
        const convivesInput = currentRepas.find('.nb-convives')
        convivesInput.val(r.nb_convives)
        convivesInput.on('change', debounce(onUpdateRepas))
        convivesInput.attr('data-convives-repas-id', r.id)

        const removeRepasBtn = currentRepas.find('.remove-repas-btn')
        removeRepasBtn.attr('data-repas-id', r.id)
        removeRepasBtn.on('click', debounce(onRemoveRepas))

        const addRecetteBtn = currentRepas.find('.add-recette-btn')
        addRecetteBtn.attr('data-repas-id', r.id)
        addRecetteBtn.on('click', onAddRecette) // Not sending to DB so no need to debounce

        currentRepas.appendTo(repasContainer)

        renderRecettes(r.id)
    })
}

const renderRecettes = (repasId) => {
    const recetteContainer = $(`#repas-${repasId} .recettes-container`)

    // Clear all recettes.
    recetteContainer.html('')

    for (const menu of state.menus) {
        // Get the repas repasId.
        const repas = menu.repas.find((repas) => repas.id === repasId)
        if (repas) {
            repas.recettes.forEach((recette) => {
                // Get the template for recette.
                const template = $('#recette-template')
                const currentRecette = template.clone(true).contents()
                currentRecette.attr('id', `recette-${recette.id}`)

                const removeRecetteBtn = currentRecette.find('.remove-recette-btn')
                removeRecetteBtn.attr('data-repas-id', repasId)
                removeRecetteBtn.attr('data-recette-id', recette.id)
                removeRecetteBtn.on('click', debounce(onRemoveRecette))

                const recettesSelect = currentRecette.find('.recettes-select')
                recettesSelect.attr('data-repas-id', repasId)
                recettesSelect.attr('data-recette-id', recette.id)
                recettesSelect.on('change', debounce(onUpdateRepas))

                // build select
                state.recettes.forEach((r) => {
                    const selected = r.id === recette.id ? 'selected' : ''
                    recettesSelect.append(`<option value="${r.id}" ${selected}>${r.nom}</option>`)
                })

                currentRecette.appendTo(recetteContainer)
            })
        }
    }
}

// --- Event listeners

$('#btn-previous').on('click', () => {
    const d = new Date(state.currentDate)
    d.setDate(d.getDate() - 7)
    state.currentDate = d.toISOString().slice(0, 10)
    getMenusOfWeekByDate(state.currentDate)
})

$('#btn-next').on('click', () => {
    const d = new Date(state.currentDate)
    d.setDate(d.getDate() + 7)
    state.currentDate = d.toISOString().slice(0, 10)
    getMenusOfWeekByDate(state.currentDate)
})

// --- Event Handlers

const onAddRepas = (event) => {
    const menuId = +event.currentTarget.dataset.menuId

    $.ajax({
        url: `/api/menus/${menuId}/repas`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            nb_convives: 1,
        }),
    })
        .done((data) => {
            // Update state
            state.addRepas(data, menuId)
            // Update UI
            renderRepas(menuId)

            console.dir(`Created repas ${JSON.stringify(data)} for menuId: ${menuId}.`)
        })
        .fail(() => console.error(`Error while adding repas for menuId ${menuId}.`))
}

const onRemoveRepas = (event) => {
    const repasId = +event.currentTarget.dataset.repasId
    let menuId

    $.ajax({
        url: `/api/repas/${repasId}`,
        method: 'DELETE',
    })
        .done(() => {
            // Update state
            menuId = state.removeRepas(repasId)
            // Update UI
            renderRepas(menuId)

            console.dir(`Remove repas with id: ${repasId} from menu with id:${menuId}`)
        })
        .fail(() => console.error(`Error while removing repas for menuId: ${menuId}.`))
}

const onAddRecette = (event) => {
    const repasId = +event.currentTarget.dataset.repasId
    const recetteContainer = $(`#repas-${repasId} .recettes-container`)

    // get the template for recette
    const template = $('#recette-template')
    const currentRecette = template.clone(true).contents()

    const removeRecetteBtn = currentRecette.find('.remove-recette-btn')
    removeRecetteBtn.attr('data-repas-id', repasId)
    removeRecetteBtn.on('click', onRemoveRecette)

    const recettesSelect = currentRecette.find('.recettes-select')
    recettesSelect.attr('data-repas-id', repasId)
    recettesSelect.on('change', debounce(onUpdateRepas))

    // build select for new recette (UX wise we should filter out already selected recettes)
    recettesSelect.append(`<option value="">-- recettes --</option>`)
    state.recettes.forEach((r) => {
        recettesSelect.append(`<option value="${r.id}">${r.nom}</option>`)
    })
    currentRecette.appendTo(recetteContainer)
}

const onUpdateRepas = (event) => {
    let repasId = +event.currentTarget.dataset.repasId
    const recetteId = event.currentTarget.dataset.recetteId || 0
    const convivesRepasId = +event.currentTarget.dataset.convivesRepasId

    if (isNaN(repasId)) {
        repasId = convivesRepasId
    }
    if (isNaN(+event.currentTarget.value) || +event.currentTarget.value === 0) {
        return
    }

    // Get the repas beeing updated.
    const repas = $(`#repas-${repasId}`)

    // Remove all new recettes selects that haven't been changed yet.
    // console.log(repas.find('select[value=""]')) //.remove()
    repas.find('option[value=""]:selected').parent().remove() //.remove()

    // Set the payload to be sent.
    const payload = {
        nb_convives: $(`#repas-${repasId}`).find('.nb-convives').val(),
        recettes: [],
    }
    // No need to add the recettes to the payload if we are just changing nb_convives.
    if (isNaN(convivesRepasId)) {
        const recettes = repas.find('.recettes-select')
        recettes.each((i, recette) => {
            payload.recettes.push({ id: +recette.value })
        })
    }

    $.ajax({
        url: `/api/repas/${repasId}/recettes/${+recetteId}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(payload),
    })
        .done((data) => {
            // Update state
            state.updateRepas(data[0])
            // Update UI
            renderRecettes(repasId)
        })
        .fail(() => console.error(`Error while updating repas ${repasId}.`))
}

const onRemoveRecette = (event) => {
    const repasId = +event.currentTarget.dataset.repasId
    const recetteId = +event.currentTarget.dataset.recetteId

    // If we are removing an unset recette
    if (isNaN(recetteId) || recetteId === 0) {
        event.currentTarget.parentElement.remove()
        return
    }

    $.ajax({
        url: `/api/repas/${repasId}/recettes/${recetteId}`,
        method: 'DELETE',
    })
        .done(() => {
            // Update state
            state.removeRecette(repasId, recetteId)
            // Update UI
            renderRecettes(repasId)
        })
        .fail(() => console.error(`Error while removing recette for repasId ${repasId}.`))
}

// --- Init

getAllRecettes()
