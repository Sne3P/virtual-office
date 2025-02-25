document.addEventListener('DOMContentLoaded', function() {
    function updateClock() {
        fetch('/clock/time/')
            .then(response => response.json())
            .then(data => {
                document.getElementById('clock-display').textContent = data.time;
            })
            .catch(error => console.error('Erreur récupération heure:', error));
    }

    updateClock(); // Mise à jour immédiate
    setInterval(updateClock, 1000); // Rafraîchissement chaque seconde
});
