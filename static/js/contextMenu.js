class ContextMenu {
  /**
   * @param {Array} items - Array of objects { label: string, action: function }
   * @param {Object} options - Options, e.g. { animate: true }
   */
  constructor(items = [], options = {}) {
    // Ferme le contexte menu déjà ouvert, s'il existe
    if (window.currentContextMenu) {
      window.currentContextMenu.hide();
    }
    window.currentContextMenu = this;
    this.items = items;
    this.options = options;
    this.menuEl = document.createElement('div');
    this.menuEl.className = 'context-menu';
    this.renderItems();
    document.body.appendChild(this.menuEl);
    
    // Ferme le menu si on clique en dehors
    this._onDocumentClick = (e) => {
      if (!this.menuEl.contains(e.target)) {
        this.hide();
      }
    };
    document.addEventListener('click', this._onDocumentClick);
  }
  
  renderItems() {
    this.menuEl.innerHTML = '';
    this.items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'context-menu-item';
      el.textContent = item.label;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hide();
        if (typeof item.action === 'function') {
          item.action();
        }
      });
      this.menuEl.appendChild(el);
    });
  }
  
  show(x, y) {
    // Position initiale
    this.menuEl.style.left = x + 'px';
    this.menuEl.style.top = y + 'px';
    // Ajuste la position pour rester dans l'écran
    const menuRect = this.menuEl.getBoundingClientRect();
    let adjustedX = x;
    let adjustedY = y;
    const margin = 10;
    if (menuRect.right > window.innerWidth) {
      adjustedX = window.innerWidth - menuRect.width - margin;
    }
    if (menuRect.bottom > window.innerHeight) {
      adjustedY = window.innerHeight - menuRect.height - margin;
    }
    this.menuEl.style.left = adjustedX + 'px';
    this.menuEl.style.top = adjustedY + 'px';
    // Animation d'apparition
    setTimeout(() => {
      this.menuEl.classList.add('active');
    }, 10);
  }
  
  hide() {
    this.menuEl.classList.remove('active');
    setTimeout(() => {
      if (this.menuEl.parentNode) {
        this.menuEl.parentNode.removeChild(this.menuEl);
      }
      document.removeEventListener('click', this._onDocumentClick);
      if (window.currentContextMenu === this) {
        window.currentContextMenu = null;
      }
    }, 300);
  }
}

window.ContextMenu = ContextMenu;
