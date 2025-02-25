document.addEventListener('DOMContentLoaded', function(){
  window.taskManager = {
    panel: document.getElementById('task-manager'),
    list: document.getElementById('task-list'),
    
    update: function(){
      this.list.innerHTML = '';
      const windows = document.querySelectorAll('.app-window');
      windows.forEach(win => {
        const appName = win.dataset.app;
        const titleEl = win.querySelector('.window-title');
        const title = titleEl ? titleEl.textContent : appName;
        const state = win.dataset.state;
        const item = document.createElement('div');
        item.className = 'task-item';
        item.innerHTML = `<span>${title} - ${state}</span>
                          <button class="close-task-btn" data-window-id="${win.id}">
                            <i class="fa-solid fa-xmark"></i>
                          </button>`;
        // Lorsqu'on clique sur l'item, restaurer (si minimisée) et activer la fenêtre
        item.addEventListener('click', function(e){
          e.stopPropagation();
          if(win.dataset.state === 'minimized'){
            win.dataset.state = 'open';
            win.classList.remove('minimized');
            win.style.display = 'block';
          }
          if(typeof deactivateAllWindows === 'function'){
            deactivateAllWindows();
          }
          win.classList.add('active-window');
          if(typeof markTaskbarActive === 'function'){
            markTaskbarActive(win.id);
          }
          window.dragManager.bringToFront(win);
          // Rafraîchir la liste pour mettre à jour l'état affiché
          setTimeout(() => {
            window.taskManager.update();
          }, 100);
        });
        // Bouton de fermeture d'une fenêtre
        item.querySelector('.close-task-btn').addEventListener('click', function(e){
          e.stopPropagation();
          win.classList.add('closing');
          setTimeout(() => {
            if(win.parentNode) win.parentNode.removeChild(win);
            window.taskManager.update();
          }, 300);
        });
        this.list.appendChild(item);
      }, this);
    },
    
    toggle: function(){
      if(this.panel.classList.contains('active')){
        this.hide();
      } else {
        this.show();
      }
    },
    
    show: function(){
      this.panel.classList.add('active');
      this.update();
    },
    
    hide: function(){
      this.panel.classList.remove('active');
    }
  };
});
