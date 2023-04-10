;(() => {
    const getIngretientsOfMonth = () => {
        const date = new Date().toISOString().slice(0, 10)

        $.ajax({
            url: `/api/menus/${date}/ingredients`,
            method: 'GET',
            dataType: 'json',
        })
            .done((data) => {
                renderIngredientsOfMonth(JSON.parse(data))
            })
            .fail(() => console.error('Error while getting menus of the week.'))
    }

    const getUsagePercentageOfIngredients = () => {
        const date = new Date().toISOString().slice(0, 10)

        $.ajax({
            url: `/api/menus/${date}/ingredients/percents`,
            method: 'GET',
            dataType: 'json',
        })
            .done((data) => {
                renderIngredientsPieChart(JSON.parse(data))
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

    const renderIngredientsPieChart = (data) => {
        const ingredientPercentCtx = $('#ingredients-percents')
        console.log(data)
        new Chart(ingredientPercentCtx, {
            type: 'pie',
            data: {
                // labels: data.map((e) => new Date(e.date).toLocaleDateString()),
                labels: data.map((e) => e.ingredient), //['Red', 'Orange', 'Yellow', 'Green'],
                datasets: [
                    {
                        label: 'Utilisation des Ingrédients dans le Mois',
                        data: data.map((e) => e.pourcentage_utilisation), //[12, 3, 56, 29], //data.map((e) => e.duree),
                        borderWidth: 2,
                        lineTension: 0.2,
                        fill: true,
                        // borderColor: 'rgba(75,192,192,1)',
                        // backgroundColor: 'rgba(75,192,192,0.1)',
                    },
                ],
            },
        })
    }

    getIngretientsOfMonth()
    getUsagePercentageOfIngredients()
})()
