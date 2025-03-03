(function() {
  class DragManager {
    constructor() {
      this.dragItem = null;
      this.offsetX = 0;
      this.offsetY = 0;
      this.currentZIndex = 1000;
      this.mouseMoveHandler = this.mouseMove.bind(this);
      this.mouseUpHandler = this.mouseUp.bind(this);
      this.disabledIframes = [];
    }
    
    makeDraggable(element, handle) {
      handle = handle || element;
      handle.style.cursor = 'move';
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();

        if (element.classList.contains('app-window')) {
          document.querySelectorAll('.app-window').forEach(win => win.classList.remove('active-window'));
          element.classList.add('active-window');
        }
        // ------------------------------------------------------------------------------------------

 
        element.style.zIndex = ++this.currentZIndex;

        this.dragItem = element;
        this.offsetX = e.clientX - element.offsetLeft;
        this.offsetY = e.clientY - element.offsetTop;

      
        this.disabledIframes = [];
        element.querySelectorAll('iframe').forEach((iframe) => {
          this.disabledIframes.push({ iframe: iframe, original: iframe.style.pointerEvents });
          iframe.style.pointerEvents = 'none';
        });

        document.addEventListener('mousemove', this.mouseMoveHandler);
        document.addEventListener('mouseup', this.mouseUpHandler);
      });
    }
    
    mouseMove(e) {
      if (this.dragItem) {
        this.dragItem.style.left = (e.clientX - this.offsetX) + 'px';
        this.dragItem.style.top = (e.clientY - this.offsetY) + 'px';
      }
    }
    
    mouseUp() {
      if (this.dragItem) {
        // Restaurer les pointer-events des iframes
        this.disabledIframes.forEach(({ iframe, original }) => {
          iframe.style.pointerEvents = original || 'auto';
        });
        this.disabledIframes = [];
      }
      this.dragItem = null;
      document.removeEventListener('mousemove', this.mouseMoveHandler);
      document.removeEventListener('mouseup', this.mouseUpHandler);
    }

    bringToFront(element) {
      // Méthode complémentaire appelée depuis desktop.js
      element.style.zIndex = ++this.currentZIndex;
    }
  }
  
  window.dragManager = new DragManager();
})();
