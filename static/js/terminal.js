document.addEventListener('DOMContentLoaded', function() {
    const inputField = document.getElementById('terminal-input');
    const outputDiv = document.getElementById('terminal-output');

    // Fonction pour ajouter du texte dans la sortie du terminal
    function appendOutput(text) {
        const pre = document.createElement('pre');
        pre.textContent = text;
        outputDiv.appendChild(pre);
        outputDiv.scrollTop = outputDiv.scrollHeight;
    }

    // Fonction pour envoyer la commande au serveur et traiter la réponse
    function processCommand(command) {
        fetch('/terminal/execute/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ command: command })
        })
        .then(response => response.json())
        .then(data => {
            // Affiche la commande saisie
            appendOutput("user@virtualoffice:~$ " + data.command);
            // Si la réponse est __clear__, vide la sortie
            if(data.output === "__clear__") {
                outputDiv.innerHTML = "";
            } else {
                appendOutput(data.output);
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            appendOutput("Erreur lors de l'exécution de la commande.");
        });
    }

    // Détecte la touche Entrée dans le champ de saisie
    inputField.addEventListener('keypress', function(e) {
        if(e.key === 'Enter') {
            const command = inputField.value;
            processCommand(command);
            inputField.value = "";
        }
    });
});
