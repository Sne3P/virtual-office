document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.search-form');
    const input = document.querySelector('.input-group input');
    const chartContainer = document.querySelector('.stock-chart');
    const errorMessage = document.querySelector('.no-results');

    if (errorMessage && errorMessage.textContent.trim() !== "") {
        errorMessage.style.display = 'block';
        if (chartContainer) {
            chartContainer.style.display = 'none';
        }
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const symbol = input.value.trim();

        if (symbol) {
            fetchStockData(symbol);
        } else {
            displayError("Veuillez entrer un symbole boursier.");
        }
    });

    function fetchStockData(symbol) {
        const url = `/stocks/api/stock_data/?symbol=${symbol}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    displayError(data.error);
                } else {
                    displayChart(data.chart);
                    errorMessage.style.display = 'none';
                }
            })
            .catch(error => {
                displayError("Erreur lors de la récupération des données.");
            });
    }

    function displayChart(chartHTML) {
        if (chartContainer) {
            chartContainer.innerHTML = chartHTML;
            chartContainer.style.display = 'block';
        }
    }

    function displayError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
        if (chartContainer) {
            chartContainer.style.display = 'none';
        }
    }
});
