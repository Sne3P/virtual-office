// static/js/iconManager.js
document.addEventListener('DOMContentLoaded', function() {
    window.iconManager = {
      init: function() {
        document.querySelectorAll('.desktop-icon').forEach(icon => {
          // Sélection au clic
          icon.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
          });
          // Rendre l'icône déplaçable
          icon.style.cursor = 'move';
          icon.addEventListener('mousedown', this.startDrag.bind(this, icon));
        });
        // Réinitialiser la sélection lors d'un clic sur le bureau
        document.getElementById('desktop').addEventListener('click', function() {
          document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
        });
      },
      startDrag: function(icon, e) {
        e.preventDefault();
        let startX = e.clientX;
        let startY = e.clientY;
        const origX = icon.offsetLeft;
        const origY = icon.offsetTop;
        const onMouseMove = (ev) => {
          const deltaX = ev.clientX - startX;
          const deltaY = ev.clientY - startY;
          icon.style.position = 'absolute';
          icon.style.left = (origX + deltaX) + 'px';
          icon.style.top = (origY + deltaY) + 'px';
        };
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          // Sauvegarder la position de l'icône via une API (à adapter)
          window.iconManager.saveIconPosition(icon);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      },
      saveIconPosition: function(icon) {
        // Exemple : envoyer la position via AJAX à /desktop/save/
        const pos = {
          left: icon.style.left,
          top: icon.style.top,
          app: icon.getAttribute('data-app')
        };
        fetch('/desktop/save/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ icon_positions: pos })
        })
        .then(response => response.json())
        .then(data => console.log('Position sauvegardée', data))
        .catch(err => console.error('Erreur de sauvegarde', err));
      }
    };
    window.iconManager.init();
  });
  