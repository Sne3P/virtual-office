document.addEventListener('DOMContentLoaded', function() {
    function updateWeather() {
        fetch('/weather/get_weather/')
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    document.getElementById('weather-temp').textContent = '--';
                    document.getElementById('weather-desc').textContent = 'Erreur météo';
                } else {
                    document.getElementById('weather-temp').textContent = `${data.temp} °C`;
                    document.getElementById('weather-desc').textContent = data.description;
                }
            })
            .catch(error => console.error('Erreur récupération météo:', error));
    }

    updateWeather(); // Mise à jour immédiate de la météo
    setInterval(updateWeather, 60000); // Rafraîchissement toutes les minutes
});
