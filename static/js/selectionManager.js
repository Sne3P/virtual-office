class SelectionManager {
  /**
   * Crée une instance de SelectionManager.
   * @param {HTMLElement} container - Élément sur lequel appliquer la sélection.
   * @param {string} selectableSelector - Sélecteur des éléments sélectionnables.
   * @param {Function} onSelect - Callback appelée avec la liste des éléments sélectionnés.
   * @param {Object} options - Options additionnelles :
   *        - exclusionSelectors: Array de sélecteurs à exclure du drag (ex. ['.app-window', '#taskbar', '#start-menu']).
   *        - multiSelectModifier: Touche pour la multi-sélection (par défaut 'ctrl').
   */
  constructor(container, selectableSelector, onSelect = () => {}, options = {}) {
    this.container = container;
    this.selectableSelector = selectableSelector;
    this.onSelect = onSelect;
    this.options = Object.assign(
      { exclusionSelectors: [], multiSelectModifier: 'ctrl' },
      options
    );
    this.isSelecting = false;
    this.dragging = false;
    this.startX = 0;
    this.startY = 0;
    this.startCtrl = false;
    this.selectionBox = null;
    this.selectedElements = new Set();
    this.overlay = null;
    this.iframeListeners = [];
    this.selectionBoxTimeout = null;
    this.mouseDownTime = 0;
    this.clickThreshold = 200; // en millisecondes

    // Conserver les références liées pour faciliter la suppression des écouteurs
    this._onMouseDownBound = this._onMouseDown.bind(this);
    this._onMouseMoveBound = this._onMouseMove.bind(this);
    this._onMouseUpBound = this._onMouseUp.bind(this);
    this._onClickBound = this._onClick.bind(this);

    this._init();
  }

  _init() {
    this.container.addEventListener('mousedown', this._onMouseDownBound);
    this.container.addEventListener('mousemove', this._onMouseMoveBound);
    document.addEventListener('mouseup', this._onMouseUpBound);
    this.container.addEventListener('click', this._onClickBound);

    // Attacher les écouteurs aux iframes contenues dans le container
    const iframes = this.container.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.addEventListener('click', this._onClickBound);
        doc.addEventListener('mousemove', this._onMouseMoveBound);
        doc.addEventListener('mouseup', this._onMouseUpBound);
        this.iframeListeners.push({ iframe, doc });
      } catch (e) {
        console.warn('Impossible d’attacher les événements sur l’iframe', e);
      }
    });
  }

  _createOverlay() {
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      Object.assign(this.overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        background: 'transparent',
        zIndex: 9998,
        pointerEvents: 'auto'
      });
      document.body.appendChild(this.overlay);
      // Capturer les mouvements et relâche sur l’overlay pour couvrir le cas des iframes
      this.overlay.addEventListener('mousemove', this._onMouseMoveBound);
      this.overlay.addEventListener('mouseup', this._onMouseUpBound);
    }
  }

  _removeOverlay() {
    if (this.overlay) {
      this.overlay.removeEventListener('mousemove', this._onMouseMoveBound);
      this.overlay.removeEventListener('mouseup', this._onMouseUpBound);
      document.body.removeChild(this.overlay);
      this.overlay = null;
    }
  }

  _createSelectionBox() {
    if (!this.selectionBox) {
      this.selectionBox = document.createElement('div');
      this.selectionBox.className = 'selection-box';
      Object.assign(this.selectionBox.style, {
        position: 'absolute',
        left: `${this.startX}px`,
        top: `${this.startY}px`,
        border: '1px dashed #009ee0',
        backgroundColor: 'rgba(0, 158, 224, 0.1)',
        zIndex: 9999
      });
      document.body.appendChild(this.selectionBox);
      this._createOverlay();
    }
  }

  _onMouseDown(e) {
    if (e.button !== 0) return;
    // Si le clic provient d’un élément sélectionnable ou d’un élément exclu, on laisse la gestion au click.
    if (
      e.target.closest(this.selectableSelector) ||
      this.options.exclusionSelectors.some(sel => e.target.closest(sel))
    ) {
      return;
    }
    this.isSelecting = true;
    this.dragging = false;
    this.startX = e.pageX;
    this.startY = e.pageY;
    this.startCtrl = e[this.options.multiSelectModifier + 'Key'];
    this.mouseDownTime = Date.now();
    // Délai pour différencier clic rapide et clic prolongé
    this.selectionBoxTimeout = setTimeout(() => {
      this._createSelectionBox();
    }, this.clickThreshold);
  }

  _onMouseMove(e) {
    if (!this.isSelecting) return;
    const currentX = e.pageX;
    const currentY = e.pageY;
    // Si le déplacement dépasse le seuil, créer immédiatement la zone de sélection si elle n'existe pas
    if (!this.dragging && (Math.abs(currentX - this.startX) > 5 || Math.abs(currentY - this.startY) > 5)) {
      this.dragging = true;
      if (!this.selectionBox) {
        clearTimeout(this.selectionBoxTimeout);
        this._createSelectionBox();
      }
    }
    if (this.selectionBox) {
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
  }

  _onMouseUp(e) {
    if (!this.isSelecting) return;
    this.isSelecting = false;
    clearTimeout(this.selectionBoxTimeout);
    // Si aucun drag n'a été initié (clic rapide), ne créer ni traiter la zone de sélection
    if (!this.selectionBox) {
      this.dragging = false;
      return;
    }
    const boxRect = this.selectionBox.getBoundingClientRect();
    // Si la touche multi-sélection n'était pas active, effacer la sélection existante.
    if (!this.startCtrl) this._clearSelection();
    // Sélectionner les éléments dont le rectangle intersecte la zone de sélection.
    this.container.querySelectorAll(this.selectableSelector).forEach(el => {
      const elRect = el.getBoundingClientRect();
      if (
        !(elRect.left > boxRect.right ||
          elRect.right < boxRect.left ||
          elRect.top > boxRect.bottom ||
          elRect.bottom < boxRect.top)
      ) {
        el.classList.add('selected');
        this.selectedElements.add(el);
      }
    });
    document.body.removeChild(this.selectionBox);
    this.selectionBox = null;
    this.onSelect(Array.from(this.selectedElements));
    this._removeOverlay();
    this.dragging = false;
  }

  _onClick(e) {
    // Si un drag a été détecté, ignorer le clic ultérieur.
    if (this.dragging) {
      this.dragging = false;
      return;
    }
    const selectableItem = e.target.closest(this.selectableSelector);
    if (selectableItem) {
      if (e[this.options.multiSelectModifier + 'Key']) {
        // Multi-sélection : basculer l'état de l'élément.
        if (this.selectedElements.has(selectableItem)) {
          selectableItem.classList.remove('selected');
          this.selectedElements.delete(selectableItem);
        } else {
          selectableItem.classList.add('selected');
          this.selectedElements.add(selectableItem);
        }
      } else {
        // Sélection unique : désélectionner d'abord tous les autres.
        this._clearSelection();
        selectableItem.classList.add('selected');
        this.selectedElements.add(selectableItem);
      }
      this.onSelect(Array.from(this.selectedElements));
    } else {
      // Clic sur le fond (ou dans une iframe non sélectionnable) : tout désélectionner.
      this._clearSelection();
      this.onSelect([]);
    }
  }

  _clearSelection() {
    this.selectedElements.forEach(el => el.classList.remove('selected'));
    this.selectedElements.clear();
  }

  destroy() {
    this.container.removeEventListener('mousedown', this._onMouseDownBound);
    this.container.removeEventListener('mousemove', this._onMouseMoveBound);
    document.removeEventListener('mouseup', this._onMouseUpBound);
    this.container.removeEventListener('click', this._onClickBound);
    this._removeOverlay();
    this.iframeListeners.forEach(({ doc }) => {
      try {
        doc.removeEventListener('click', this._onClickBound);
        doc.removeEventListener('mousemove', this._onMouseMoveBound);
        doc.removeEventListener('mouseup', this._onMouseUpBound);
      } catch (e) {
        console.warn('Erreur lors de la suppression d’un écouteur d’iframe', e);
      }
    });
    this.iframeListeners = [];
    if (this.selectionBox && this.selectionBox.parentNode) {
      this.selectionBox.parentNode.removeChild(this.selectionBox);
    }
    this.selectedElements.clear();
  }
}
