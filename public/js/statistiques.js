;(() => {
    const getIngretientsOfMonth = () => {
        const date = new Date().toISOString().slice(0, 10)

        $.ajax({
            url: `/api/menus/${date}/ingredients`,
            method: 'GET',
            dataType: 'json',
        })
            .done((data) => {
                console.log(data)
                renderIngredientsOfMonth(JSON.parse(data))
            })
            .fail(() => console.error('Error while getting menus of the week.'))
    }

    const renderIngredientsOfMonth = (data) => {
        const tbody = $('#month-ingredients tbody')
        data.forEach((ingredient) => {
            tbody.append(
                `<tr>
                 <td>${ingredient.ingredient}</td>
                 <td class="text-end" style="width: 1%;">${(+ingredient.quantite_totale).toFixed(2)}</td>
                 <td>${ingredient.unite}</td>
                 </tr>`
            )
        })
    }

    getIngretientsOfMonth()
})()
