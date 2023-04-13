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
            .fail(() => console.error('Error while getting ingredients of the month.'))
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
            .fail(() => console.error('Error while getting ingredients percentages.'))
    }

    const renderIngredientsOfMonth = (data) => {
        const tbody = $('#month-ingredients tbody')
        data.forEach((ingredient) => {
            tbody.append(
                `<tr>
                 <td>${ingredient.ingredient}</td>
                 <td class="text-end" style="width: 1%;">${(+ingredient.quantite_totale).toFixed(2)}</td>
                 <td class="ps-2">${ingredient.unite}</td>
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
                labels: data.map((e) => e.ingredient),
                datasets: [
                    {
                        label: 'Utilisation des Ingrédients dans le Mois',
                        data: data.map((e) => e.pourcentage_utilisation),
                    },
                ],
            },
        })
    }

    getIngretientsOfMonth()
    getUsagePercentageOfIngredients()
})()
