document.addEventListener("DOMContentLoaded", function () {
    const audioPlayer = document.getElementById("audio-player");
    let currentPlaying = null;

    // Gestion des boutons play pour la recherche de musiques
    document.querySelectorAll(".play-button").forEach(button => {
        button.addEventListener("click", function () {
            const previewUrl = this.getAttribute("data-preview");

            if (currentPlaying === previewUrl) {
                audioPlayer.pause();
                currentPlaying = null;
                this.innerText = "▶";  // Réinitialiser le bouton à "play"
                return;
            }

            if (previewUrl) {
                audioPlayer.src = previewUrl;
                audioPlayer.play();
                currentPlaying = previewUrl;

                // Mettre à jour tous les boutons play
                document.querySelectorAll(".play-button").forEach(btn => btn.innerText = "▶");
                this.innerText = "⏸";  // Changer le bouton en "pause"
            } else {
                alert("Aucun aperçu audio disponible !");
            }
        });
    });

    // Gestion de l'événement "ended" pour réinitialiser le bouton après la fin du morceau
    audioPlayer.addEventListener("ended", () => {
        currentPlaying = null;
        document.querySelectorAll(".play-button").forEach(btn => btn.innerText = "▶");
    });


});
