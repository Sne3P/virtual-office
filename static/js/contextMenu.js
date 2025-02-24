class ContextMenu {
  /**
   * @param {Array} items - Tableau d'objets {label: string, action: function}
   * @param {Object} options - Options de configuration, ex: { animate: true }
   */
  constructor(items = [], options = {}) {
    this.items = items;
    this.options = options;
    this.menuElement = null;
    this._boundDocumentClick = this._handleDocumentClick.bind(this);
    this._createMenu();
  }
  
  _createMenu() {
    // Supprime tout menu existant
    const existing = document.querySelector('.context-menu');
    if (existing) existing.remove();
    
    this.menuElement = document.createElement('div');
    this.menuElement.className = 'context-menu glassmorphic';
    
    this.items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'context-menu-item';
      el.textContent = item.label;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hide();
        item.action();
      });
      this.menuElement.appendChild(el);
    });
    
    document.body.appendChild(this.menuElement);
    // Ajoute un écouteur global pour fermer le menu dès qu'on clique en dehors
    document.addEventListener('click', this._boundDocumentClick);
  }
  
  _handleDocumentClick(e) {
    if (!e.target.closest('.context-menu')) {
      this.hide();
    }
  }
  
  show(x, y) {
    if (!this.menuElement) return;
    
    // Affiche temporairement le menu pour récupérer ses dimensions
    this.menuElement.style.display = 'block';
    const menuRect = this.menuElement.getBoundingClientRect();
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    
    if (x + menuRect.width > winWidth) { x = winWidth - menuRect.width - 10; }
    if (y + menuRect.height > winHeight) { y = winHeight - menuRect.height - 10; }
    if (x < 10) { x = 10; }
    if (y < 10) { y = 10; }
    
    this.menuElement.style.left = `${x}px`;
    this.menuElement.style.top = `${y}px`;
    
    if (this.options.animate) {
      this.menuElement.classList.remove('menu-exit');
      this.menuElement.classList.add('menu-animate');
    }
  }
  
  hide() {
    if (this.menuElement && this.menuElement.style.display !== 'none') {
      if (this.options.animate) {
        this.menuElement.classList.remove('menu-animate');
        this.menuElement.classList.add('menu-exit');
        this.menuElement.addEventListener('animationend', () => {
          this.menuElement.style.display = 'none';
          this.menuElement.classList.remove('menu-exit');
        }, { once: true });
      } else {
        this.menuElement.style.display = 'none';
      }
      document.removeEventListener('click', this._boundDocumentClick);
    }
  }
}

window.ContextMenu = ContextMenu;
