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
                    document.getElementById('weather-feels-like').textContent = `Ressenti : ${data.feels_like} °C`;
                    document.getElementById('weather-min-max').textContent = `Min : ${data.temp_min} °C | Max : ${data.temp_max} °C`;
                    document.getElementById('weather-pressure').textContent = `Pression : ${data.pressure} hPa`;
                    document.getElementById('weather-humidity').textContent = `Humidité : ${data.humidity}%`;
                    document.getElementById('weather-wind').textContent = `Vent : ${data.wind_speed} m/s`;
                    document.getElementById('weather-visibility').textContent = `Visibilité : ${data.visibility} m`;
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