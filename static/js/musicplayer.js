document.addEventListener("DOMContentLoaded", function () {
    const audioPlayer = new Audio();
    let currentTrackIndex = 0;
    let tracks = Array.from(document.querySelectorAll(".track-item"));

    const playPauseButton = document.getElementById("play-pause-button");
    const prevButton = document.getElementById("prev-button");
    const nextButton = document.getElementById("next-button");
    const progressBar = document.querySelector(".progress");
    const progressContainer = document.querySelector(".progress-container");
    const volumeSlider = document.getElementById("volume-slider");

  
    function updatePlayButtons() {
        tracks.forEach((track, index) => {
            const playButton = track.querySelector(".play-button i");
            if (index === currentTrackIndex && !audioPlayer.paused) {
                playButton.classList.remove("fa-play");
                playButton.classList.add("fa-stop");
                track.classList.add("playing"); // Ajoute la classe rouge clair
            } else {
                playButton.classList.remove("fa-stop");
                playButton.classList.add("fa-play");
                track.classList.remove("playing"); // Supprime l'effet visuel
            }
        });

        // Mettre à jour le bouton de la barre du lecteur
        if (audioPlayer.paused) {
            playPauseButton.innerHTML = `<i class="fas fa-play"></i>`;
        } else {
            playPauseButton.innerHTML = `<i class="fas fa-pause"></i>`;
        }
    }

    // Fonction pour jouer un morceau
    function playTrack(index) {
        if (index < 0 || index >= tracks.length) return;

        const track = tracks[index];
        if (!track) return;

        // Vérifie si on clique sur le même morceau pour l'arrêter
        if (currentTrackIndex === index && !audioPlayer.paused) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0; // Remettre à 0 quand on stop
            updatePlayButtons();
            return;
        }

        audioPlayer.src = track.getAttribute("data-preview");
        audioPlayer.play();
        currentTrackIndex = index;

        updatePlayButtons();
    }

  
    playPauseButton.addEventListener("click", function () {
        if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
        updatePlayButtons();
    });

    // Changer de musique avec prev et next
    prevButton.addEventListener("click", () => {
        playTrack(currentTrackIndex - 1);
    });

    nextButton.addEventListener("click", () => {
        playTrack(currentTrackIndex + 1);
    });

    // Mettre à jour la barre de progression
    audioPlayer.addEventListener("timeupdate", () => {
        if (audioPlayer.duration) {
            const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.style.width = percent + "%";
        }
    });

    // Rendre la barre cliquable pour avancer
    progressContainer.addEventListener("click", (event) => {
        const rect = progressContainer.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const width = rect.width;
        const percent = clickX / width;
        audioPlayer.currentTime = percent * audioPlayer.duration;
    });

    // Volume
    volumeSlider.addEventListener("input", function () {
        audioPlayer.volume = this.value;
    });

    // Clic sur un bouton play d'un morceau pour le jouer/stopper
    tracks.forEach((track, index) => {
        const playButton = track.querySelector(".play-button");
        playButton.addEventListener("click", (event) => {
            event.stopPropagation(); // Empêcher le clic sur l'élément parent
            playTrack(index);
        });
    });

    // Quand la musique se termine, passer à la suivante
    audioPlayer.addEventListener("ended", () => {
        playTrack(currentTrackIndex + 1);
    });

    
    const trackListContainer = document.querySelector(".track-list");
    trackListContainer.style.overflowY = "auto";
    trackListContainer.style.maxHeight = "calc(100vh - 200px)"; 
});
