document.addEventListener('DOMContentLoaded', function() {
    function updateWeather(city) {
        fetch(`/weather/get_weather/?city=${city}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    document.getElementById('weather-temp').textContent = '--';
                    document.getElementById('weather-desc').textContent = 'Erreur météo';
                } else {
                    document.getElementById('weather-temp').textContent = `${data.temp} °C`;
                    document.getElementById('weather-desc').textContent = data.description;
                    document.getElementById('weather-city').textContent = data.city;
                }
            })
            .catch(error => console.error('Erreur récupération météo:', error));
    }

    const searchForm = document.getElementById('city-search-form');
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();  // Empêche le rechargement de la page
        const city = document.getElementById('city-input').value;
        updateWeather(city);  // Met à jour la météo avec la ville saisie
    });

    updateWeather('Lille');  // Ville par défaut au chargement de la page
});