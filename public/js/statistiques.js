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
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Utilisation des Ingrédients dans le Mois (%)',
                    font: {
                        size: 16,
                        weight: 'bold',
                    },
                },
            },
        },
        data: {
            labels: data.map((e) => e.ingredient),
            datasets: [
                {
                    data: data.map((e) => e.pourcentage_utilisation),
                },
            ],
        },
    })
}

//Graphique des recettes du mois
const getNumberRecettesOfTheMonth = () => {
    const date = new Date().toISOString().slice(0, 10)

    $.ajax({
        url: `/api/menus/${date}/recettes`,
        method: 'GET',
        dataType: 'json',
    })
        .done((data) => {
            renderRecettesBarChart(data)
        })
        .fail(() => console.error('Error while getting recette of the month.'))
}

const renderRecettesBarChart = (data) => {
    const recettePercentCtx = $('#recettes-graph')
    new Chart(recettePercentCtx, {
        type: 'bar',
        options: {
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: 'Utilisation des Recettes dans le Mois',
                    font: {
                        size: 16,
                        weight: 'bold',
                    },
                },
            },
        },
        data: {
            labels: data.map((e) => e.nom),
            datasets: [
                {
                    axis: 'y',
                    label: 'Utilisation des Recettes dans le Mois',
                    data: data.map((e) => e.nb_recettes),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(255, 205, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                    ],
                    borderColor: [
                        'rgb(255, 99, 132)',
                        'rgb(255, 159, 64)',
                        'rgb(255, 205, 86)',
                        'rgb(75, 192, 192)',
                        'rgb(54, 162, 235)',
                        'rgb(153, 102, 255)',
                    ],
                    borderWidth: 1,
                },
            ],
        },
    })
}

const getMonthName = () => {
    const month = [
        'janvier',
        'février',
        'mars',
        'avril',
        'mai',
        'juin',
        'juillet',
        'août',
        'septembre',
        'octobre',
        'novembre',
        'décembre',
    ].at(new Date().getUTCMonth())

    $('#month-name').text(month)
}

// --- Init.

getMonthName()
getIngretientsOfMonth()
getUsagePercentageOfIngredients()
getNumberRecettesOfTheMonth()
