document.addEventListener('DOMContentLoaded', function() {
  window.iconManager = {
    cellWidth: 80,
    cellHeight: 100,
    init: function() {
      // Charger la configuration sauvegardée depuis le serveur
      this.loadIconPositions();
      // Attacher les événements aux icônes existantes
      document.querySelectorAll('.desktop-icon').forEach(icon => {
        this.attachIconEvents(icon);
      });
     
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.desktop-icon')) {
          document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
        }
      });
    },
    attachIconEvents: function(icon) {
      icon.style.position = 'absolute';
      icon.addEventListener('click', function(e) {
        e.stopPropagation();
        if (e.ctrlKey) {
          // Si Ctrl est pressé, on bascule la sélection sur cette icône sans toucher aux autres
          this.classList.toggle('selected');
        } else {
          // Désélectionne toutes et sélectionne uniquement cette icône
          document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
          this.classList.add('selected');
        }
      });
      icon.style.cursor = 'move';
      icon.addEventListener('mousedown', window.iconManager.startDrag.bind(window.iconManager, icon));
    },
    startDrag: function(icon, e) {
      e.preventDefault();
      let startX = e.clientX;
      let startY = e.clientY;
      // Si l'icône est déjà sélectionnée, déplacer toutes les icônes sélectionnées ; sinon, déplacer uniquement celle-ci
      let iconsToMove = icon.classList.contains('selected')
        ? Array.from(document.querySelectorAll('.desktop-icon.selected'))
        : [icon];
      const initialPositions = iconsToMove.map(el => ({
        el: el,
        left: parseInt(el.style.left, 10) || 0,
        top: parseInt(el.style.top, 10) || 0
      }));
      const onMouseMove = (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        initialPositions.forEach(pos => {
          pos.el.style.left = (pos.left + dx) + 'px';
          pos.el.style.top = (pos.top + dy) + 'px';
        });
      };
      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        initialPositions.forEach(pos => {
          let left = parseInt(pos.el.style.left, 10);
          let top = parseInt(pos.el.style.top, 10);
          let snapped = this.snapToGrid(left, top);
          if (this.isCellOccupied(snapped.left, snapped.top, pos.el)) {
            const newCell = this.findEmptyCell(snapped.left, snapped.top);
            snapped.left = newCell.left;
            snapped.top = newCell.top;
          }
          pos.el.style.left = snapped.left + 'px';
          pos.el.style.top = snapped.top + 'px';
        });
        this.saveIconPositions();
      };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    snapToGrid: function(left, top) {
      let snappedLeft = Math.round(left / this.cellWidth) * this.cellWidth;
      let snappedTop = Math.round(top / this.cellHeight) * this.cellHeight;
      const desktop = document.getElementById('desktop');
      const desktopWidth = desktop.offsetWidth;
      const desktopHeight = desktop.offsetHeight;
      if (snappedLeft < 0) snappedLeft = 0;
      if (snappedTop < 0) snappedTop = 0;
      if (snappedLeft + this.cellWidth > desktopWidth) snappedLeft = desktopWidth - this.cellWidth;
      if (snappedTop + this.cellHeight > desktopHeight) snappedTop = desktopHeight - this.cellHeight;
      return { left: snappedLeft, top: snappedTop };
    },
    isCellOccupied: function(left, top, ignoreIcon) {
      let occupied = false;
      document.querySelectorAll('.desktop-icon').forEach(icon => {
        if (ignoreIcon && icon === ignoreIcon) return;
        let iconLeft = parseInt(icon.style.left, 10) || 0;
        let iconTop = parseInt(icon.style.top, 10) || 0;
        if (iconLeft === left && iconTop === top) {
          occupied = true;
        }
      });
      return occupied;
    },
    findEmptyCell: function(candidateLeft, candidateTop) {
      const desktop = document.getElementById('desktop');
      const desktopWidth = desktop.offsetWidth;
      const desktopHeight = desktop.offsetHeight;
      const cols = Math.floor(desktopWidth / this.cellWidth);
      const rows = Math.floor(desktopHeight / this.cellHeight);
      let startCol = Math.floor(candidateLeft / this.cellWidth);
      let startRow = Math.floor(candidateTop / this.cellHeight);
      for (let r = startRow; r < rows; r++) {
        for (let c = (r === startRow ? startCol : 0); c < cols; c++) {
          let left = c * this.cellWidth;
          let top = r * this.cellHeight;
          if (!this.isCellOccupied(left, top)) {
            return { left: left, top: top };
          }
        }
      }
      return { left: candidateLeft, top: candidateTop };
    },
    saveIconPositions: function() {
      const positions = {};
      document.querySelectorAll('.desktop-icon').forEach(icon => {
        const app = icon.getAttribute('data-app');
        positions[app] = {
          left: icon.style.left,
          top: icon.style.top,
          pinned: icon.dataset.pinned === "true"
        };
      });
      fetch('/desktop/save/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRFToken': this.getCSRFToken()
        },
        body: JSON.stringify({ icon_positions: positions })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Positions sauvegardées:', data);
      })
      .catch(err => console.error('Erreur de sauvegarde:', err));
    },
    loadIconPositions: function() {
      fetch('/desktop/load/')
      .then(response => response.json())
      .then(data => {
        if (data.icon_positions) {
          const savedApps = Object.keys(data.icon_positions);
          const container = document.querySelector('.desktop-icons');
          // Supprimer les icônes existantes qui ne sont plus sauvegardées
          document.querySelectorAll('.desktop-icon').forEach(icon => {
            const app = icon.getAttribute('data-app');
            if (!savedApps.includes(app)) {
              icon.parentElement.removeChild(icon);
            }
          });
          // Pour chaque application sauvegardée, ajouter ou mettre à jour l'icône
          savedApps.forEach(app => {
            let icon = document.querySelector(`.desktop-icon[data-app="${app}"]`);
            if (!icon) {
              icon = document.createElement('div');
              icon.className = 'desktop-icon';
              icon.setAttribute('data-app', app);
              container.appendChild(icon);
              this.attachIconEvents(icon);
            }
            const pos = data.icon_positions[app];
            icon.style.left = pos.left;
            icon.style.top = pos.top;
            icon.dataset.pinned = pos.pinned ? "true" : "false";
            if (pos.pinned) {
              icon.classList.add('pinned');
            } else {
              icon.classList.remove('pinned');
            }
          });
        }
      })
      .catch(err => console.error('Erreur de chargement des positions:', err));
    },
    getCSRFToken: function() {
      let cookieValue = null;
      if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.substring(0, 10) === 'csrftoken=') {
            cookieValue = decodeURIComponent(cookie.substring(10));
            break;
          }
        }
      }
      return cookieValue;
    }
  };
  
  window.iconManager.init();
});
