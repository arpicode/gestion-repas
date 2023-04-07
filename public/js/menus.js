const state = {
    currentDate: new Date().toISOString().slice(0, 10),
    menus: null,

    addRepas(repas, menuId) {
        const menu = this.menus.find((menu) => menu.id === menuId)
        menu.repas.push(repas)
    },

    removeRepas(repasId) {
        if (!this.menus) return null

        for (let i = 0; i < this.menus.length; i++) {
            const menu = this.menus[i]
            console.log('going through menu:', menu.id)
            const repasIndex = menu.repas.findIndex((repas) => repas.id === repasId)
            if (repasIndex !== -1) {
                menu.repas.splice(repasIndex, 1)
                console.log('found')
                return menu.id
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
            // updateWeekDates(state.menus[0].date_menu, state.menus[6].date_menu)
            renderMenus(state.menus)
            $('.debug').text(JSON.stringify(state.menus, null, 2))

            // if (next) next(data)
        })
        .fail(() => console.error('Error while getting menus of the week.'))
}

const updateWeekDates = (monday, sunday) => {
    $('#date-monday').text(new Date(monday).toLocaleDateString())
    $('#date-sunday').text(new Date(sunday).toLocaleDateString())
}

const renderMenus = () => {
    const menusContainer = $('.menus-container')
    menusContainer.html('')
    updateWeekDates(state.menus[0].date_menu, state.menus[6].date_menu)

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
    repasContainer.html('')

    menu.repas.forEach((r) => {
        const template = $('#repas-template')
        const currentRepas = template.clone(true).contents()

        // Set id of current repas
        currentRepas.attr('id', `repas-${r.id}`)
        currentRepas.find('.nb-convives').val(r.nb_convives)

        const removeRepasBtn = currentRepas.find('.remove-repas-btn')
        removeRepasBtn.attr('data-repas-id', r.id)
        removeRepasBtn.on('click', debounce(onRemoveRepas))

        currentRepas.appendTo(repasContainer)
    })
}

// --- Utils

const debounce = (fn, delay = 200) => {
    let timeoutId

    return function (...args) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            fn.apply(this, args)
        }, delay)
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

    $.ajax({
        url: `/api/repas/${repasId}`,
        method: 'DELETE',
    })
        .done(() => {
            // Update state
            const menuId = state.removeRepas(repasId)

            // Update UI
            renderRepas(menuId)

            console.dir(`Remove repas with id: ${repasId} from menu with id:${menuId}`)
        })
        .fail(() => console.error(`Error while removing repas for menuId ${repasId}.`))
}

// --- Init

getMenusOfWeekByDate()
