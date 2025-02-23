document.addEventListener('DOMContentLoaded', () => {
  class SelectionManager {
    /**
     * @param {HTMLElement} container - L'élément sur lequel appliquer la sélection (ex. #desktop)
     * @param {string} selectableSelector - Le sélecteur des éléments sélectionnables (ex. '.desktop-icon')
     * @param {Function} onSelect - Callback appelée avec la liste des éléments sélectionnés.
     */
    constructor(container, selectableSelector, onSelect = () => {}) {
      this.container = container;
      this.selectableSelector = selectableSelector;
      this.onSelect = onSelect;
      this.isSelecting = false;
      this.startX = 0;
      this.startY = 0;
      this.selectionBox = null;
      this._init();
    }
    
    _init() {
      this.container.addEventListener('mousedown', this._onMouseDown.bind(this));
      this.container.addEventListener('mousemove', this._onMouseMove.bind(this));
      document.addEventListener('mouseup', this._onMouseUp.bind(this));
    }
    
    _onMouseDown(e) {
      // Démarrer la sélection uniquement si clic gauche et sur le fond (pas sur une icône, fenêtre, taskbar ou start menu)
      if (e.button !== 0) return;
      if (
        e.target.closest(this.selectableSelector) ||
        e.target.closest('.app-window') ||
        e.target.closest('#taskbar') ||
        e.target.closest('#start-menu')
      ) return;
      
      this.isSelecting = true;
      this.startX = e.pageX;
      this.startY = e.pageY;
      
      this.selectionBox = document.createElement('div');
      this.selectionBox.className = 'selection-box';
      this.selectionBox.style.left = `${this.startX}px`;
      this.selectionBox.style.top = `${this.startY}px`;
      document.body.appendChild(this.selectionBox);
    }
    
    _onMouseMove(e) {
      if (!this.isSelecting || !this.selectionBox) return;
      const currentX = e.pageX;
      const currentY = e.pageY;
      const x = Math.min(this.startX, currentX);
      const y = Math.min(this.startY, currentY);
      const width = Math.abs(this.startX - currentX);
      const height = Math.abs(this.startY - currentY);
      Object.assign(this.selectionBox.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`
      });
    }
    
    _onMouseUp(e) {
      if (!this.isSelecting) return;
      this.isSelecting = false;
      if (!this.selectionBox) return;
      
      const boxRect = this.selectionBox.getBoundingClientRect();
      const selectedElements = [];
      document.querySelectorAll(this.selectableSelector).forEach(el => {
        const elRect = el.getBoundingClientRect();
        if (!(elRect.left > boxRect.right ||
              elRect.right < boxRect.left ||
              elRect.top > boxRect.bottom ||
              elRect.bottom < boxRect.top)) {
          el.classList.add('selected');
          selectedElements.push(el);
        }
      });
      
      document.body.removeChild(this.selectionBox);
      this.selectionBox = null;
      this.onSelect(selectedElements);
    }
  }
  
  const desktop = document.getElementById('desktop');
  window.selectionManager = new SelectionManager(desktop, '.desktop-icon', selected => {
    console.log('Icônes sélectionnées :', selected);
  });
});
