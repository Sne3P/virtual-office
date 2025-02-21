document.addEventListener('DOMContentLoaded', function() {
  let windowCounter = 0;
  // stocke les IDs par application, ex: { terminal: [id1, id2], explorer: [id3] }
  const taskbarGroups = {}; 
  const windowsContainer = document.getElementById('windows-container');
  const taskbarIconsContainer = document.getElementById('taskbar-icons');
  const startButton = document.getElementById('start-button');
  const startMenu = document.getElementById('start-menu');
  const taskManagerButton = document.getElementById('task-manager-button');
  const taskManagerPanel = document.getElementById('task-manager');
  const taskList = document.getElementById('task-list');

  // Déclare l'écouteur pour désactiver l'activité de toutes les fenêtres
  function deactivateAllWindows() {
    document.querySelectorAll('.app-window').forEach(win => {
      win.classList.remove('active-window');
    });
  }

  // Met à jour le titre de la fenêtre (en-tête) en ajoutant la numérotation si nécessaire
  function updateWindowTitle(win) {
    const app = win.dataset.app;
    let instances = taskbarGroups[app] || [];
    if (instances.length > 1) {
      // Trouve l'index de cette fenêtre dans le groupe
      let index = instances.indexOf(win.id);
      win.querySelector('.window-title').textContent = app.charAt(0).toUpperCase() + app.slice(1) + ' (' + (index+1) + ')';
    } else {
      win.querySelector('.window-title').textContent = app.charAt(0).toUpperCase() + app.slice(1);
    }
  }

  // Crée et affiche une fenêtre d'application
  function createAppWindow(appName) {
    windowCounter++;
    const windowId = 'app-window-' + windowCounter;
    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = windowId;
    win.dataset.app = appName;
    win.dataset.state = 'open';
    // Position et taille par défaut
    win.style.top = '150px';
    win.style.left = '250px';
    win.style.width = '600px';
    win.style.height = '400px';

    // Création de l'en‑tête
    const header = document.createElement('div');
    header.className = 'window-header';
    const title = document.createElement('div');
    title.className = 'window-title';
    title.textContent = appName.charAt(0).toUpperCase() + appName.slice(1);
    const controls = document.createElement('div');
    controls.className = 'window-controls';
    const btnMinimize = document.createElement('button');
    btnMinimize.className = 'window-btn minimize';
    const btnMaximize = document.createElement('button');
    btnMaximize.className = 'window-btn maximize';
    const btnClose = document.createElement('button');
    btnClose.className = 'window-btn close';
    controls.appendChild(btnMinimize);
    controls.appendChild(btnMaximize);
    controls.appendChild(btnClose);
    header.appendChild(title);
    header.appendChild(controls);
    win.appendChild(header);

    // Création du contenu
    const content = document.createElement('div');
    content.className = 'window-content';
    if(appName === 'terminal'){
      const iframe = document.createElement('iframe');
      iframe.src = '/terminal/';
      iframe.className = 'app-iframe';
      iframe.frameBorder = "0";
      content.appendChild(iframe);
    } else if(appName === 'explorer'){
      content.innerHTML = '<p>Contenu de l\'Explorer.</p>';
    } else {
      content.innerHTML = '<p>Application non définie.</p>';
    }
    win.appendChild(content);
    windowsContainer.appendChild(win);

    // Appliquer les modules de déplacement et redimensionnement (inchangés)
    window.dragManager.makeDraggable(win, header);
    window.resizeManager.makeResizable(win);

    // Écouteur sur l'ensemble de la fenêtre (hors éléments interactifs comme boutons)
    win.addEventListener('click', function(e) {
      // On laisse passer si clic sur iframe ou sur la barre des tâches
      if(e.target.closest('.window-btn')) return;
      deactivateAllWindows();
      win.classList.add('active-window');
      window.dragManager.bringToFront(win);
      markTaskbarActive(win.id);
    });

    // Bouton fermer
    btnClose.addEventListener('click', function(e) {
      e.stopPropagation();
      win.classList.add('closing');
      setTimeout(() => {
        windowsContainer.removeChild(win);
        removeTaskbarIcon(windowId, appName);
        updateTaskManager();
      }, 300);
    });
    // Bouton minimiser (animation simple)
    btnMinimize.addEventListener('click', function(e) {
      e.stopPropagation();
      if(win.dataset.state !== 'minimized'){
        win.dataset.state = 'minimized';
        win.classList.add('minimize-animation');
        setTimeout(() => {
          win.style.display = 'none';
          win.classList.remove('minimize-animation');
        }, 300);
        addTaskbarIcon(windowId, appName);
        updateTaskManager();
      }
    });
    // Bouton maximiser/restaurer avec animation CSS
    btnMaximize.addEventListener('click', function(e) {
      e.stopPropagation();
      if (win.classList.contains('maximized')) {
        // Restauration
        win.classList.add('restore-animation');
        setTimeout(() => {
          win.classList.remove('maximized');
          win.style.top = win.dataset.prevTop;
          win.style.left = win.dataset.prevLeft;
          win.style.width = win.dataset.prevWidth;
          win.style.height = win.dataset.prevHeight;
          win.classList.remove('restore-animation');
        }, 300);
      } else {
        // Maximisation
        win.dataset.prevTop = win.style.top;
        win.dataset.prevLeft = win.style.left;
        win.dataset.prevWidth = win.style.width;
        win.dataset.prevHeight = win.style.height;
        win.classList.add('enlarge-animation');
        setTimeout(() => {
          win.classList.add('maximized');
          win.style.top = '0';
          win.style.left = '0';
          win.style.width = '100%';
          win.style.height = '100%';
          win.classList.remove('enlarge-animation');
        }, 300);
      }
    });
    

    // Ajoute la fenêtre dans le groupe de la barre des tâches
    addTaskbarIcon(windowId, appName);
    // Met à jour le titre avec la numérotation si nécessaire
    updateWindowTitle(win);
    updateTaskManager();
  }

  // Gestion de la barre des tâches (fonctionne de manière centralisée)
  function addTaskbarIcon(windowId, appName) {
    if(taskbarGroups[appName]){
      if(taskbarGroups[appName].indexOf(windowId) === -1){
        taskbarGroups[appName].push(windowId);
      }
      updateTaskbarGroup(appName);
    } else {
      taskbarGroups[appName] = [windowId];
      const group = document.createElement('div');
      group.className = 'taskbar-group';
      group.dataset.app = appName;
      group.innerHTML = `
        <div class="taskbar-icon" data-window-id="${windowId}">
          <img src="${getAppIcon(appName)}" alt="${appName}">
          <span>${appName}</span>
        </div>
        <div class="group-list"></div>
        <div class="group-count"></div>
      `;
      // Clic sur le groupe : si plusieurs instances, ouvre le stack
      group.addEventListener('click', function(e){
        e.stopPropagation();
        if(taskbarGroups[appName].length > 1){
          group.classList.toggle('expanded');
        } else {
          const win = document.getElementById(taskbarGroups[appName][0]);
          if(win && win.dataset.state === 'minimized'){
            win.dataset.state = 'open';
            win.classList.remove('minimized');
            win.style.display = 'block';
            window.dragManager.bringToFront(win);
            markTaskbarActive(win.id);
          } else if(win){
            window.dragManager.bringToFront(win);
            markTaskbarActive(win.id);
          }
        }
      });
      taskbarIconsContainer.appendChild(group);
    }
  }

  function updateTaskbarGroup(appName) {
    const group = document.querySelector(`.taskbar-group[data-app="${appName}"]`);
    if(group){
      const groupList = group.querySelector('.group-list');
      groupList.innerHTML = '';
      taskbarGroups[appName].forEach((winId, idx) => {
        const item = document.createElement('div');
        item.className = 'group-item';
        item.dataset.windowId = winId;
        let displayName = appName;
        if(taskbarGroups[appName].length > 1){
          displayName += ' (' + (idx+1) + ')';
        }
        item.textContent = displayName;
        item.addEventListener('click', function(e){
          e.stopPropagation();
          const win = document.getElementById(winId);
          if(win){
            win.dataset.state = 'open';
            win.classList.remove('minimized');
            win.style.display = 'block';
            window.dragManager.bringToFront(win);
            markTaskbarActive(win.id);
          }
          group.classList.remove('expanded');
          updateTaskManager();
        });
        groupList.appendChild(item);
      });
      const countEl = group.querySelector('.group-count');
      if(taskbarGroups[appName].length > 1){
        countEl.style.display = 'block';
        countEl.textContent = taskbarGroups[appName].length;
      } else {
        countEl.style.display = 'none';
      }
    }
  }

  function removeTaskbarIcon(windowId, appName) {
    if(taskbarGroups[appName]){
      taskbarGroups[appName] = taskbarGroups[appName].filter(id => id !== windowId);
      if(taskbarGroups[appName].length === 0){
        const group = document.querySelector(`.taskbar-group[data-app="${appName}"]`);
        if(group) taskbarIconsContainer.removeChild(group);
        delete taskbarGroups[appName];
      } else {
        updateTaskbarGroup(appName);
      }
    }
  }

  // Active l'indicateur bleu sur le groupe dont la fenêtre active est présente
  function markTaskbarActive(activeWindowId) {
    for(let app in taskbarGroups){
      const group = document.querySelector(`.taskbar-group[data-app="${app}"]`);
      if(group){
        if(taskbarGroups[app].includes(activeWindowId)){
          group.classList.add('active');
          group.querySelector('.taskbar-icon').classList.add('active');
        } else {
          group.classList.remove('active');
          group.querySelector('.taskbar-icon').classList.remove('active');
        }
      }
    }
  }

  function getAppIcon(appName) {
    if(appName === 'terminal') return '/static/images/terminal.png';
    if(appName === 'explorer') return '/static/images/explorer.png';
    return '/static/images/default.png';
  }

  // Mise à jour du Task Manager (affiche les tâches par fenêtre)
  function updateTaskManager() {
    taskList.innerHTML = '';
    for(let app in taskbarGroups){
      taskbarGroups[app].forEach((winId, idx) => {
        const win = document.getElementById(winId);
        if(win){
          let displayName = app;
          if(taskbarGroups[app].length > 1){
            displayName += ' (' + (idx+1) + ')';
          }
          const item = document.createElement('div');
          item.className = 'task-item';
          item.innerHTML = `<span>${displayName} - ${win.dataset.state}</span>
                            <button data-window-id="${win.id}" class="close-task-btn"><i class="fa-solid fa-xmark"></i></button>`;
          item.addEventListener('mouseover', function(){
            item.style.background = 'rgba(255,255,255,0.15)';
          });
          item.addEventListener('mouseout', function(){
            item.style.background = 'transparent';
          });
          item.querySelector('.close-task-btn').addEventListener('click', function(e){
            e.stopPropagation();
            const id = this.getAttribute('data-window-id');
            const w = document.getElementById(id);
            if(w){
              w.classList.add('closing');
              setTimeout(() => {
                windowsContainer.removeChild(w);
                removeTaskbarIcon(id, w.dataset.app);
                updateTaskManager();
              }, 300);
            }
          });
          taskList.appendChild(item);
        }
      });
    }
  }

  // Clic sur le bureau (élément #desktop) désactive toutes les fenêtres actives
  document.getElementById('desktop').addEventListener('click', function(e){
    if(!e.target.closest('.app-window')){
      deactivateAllWindows();
    }
  });

  // Initialisation du Start Menu et autres écouteurs
  function initDesktop() {
    document.addEventListener('click', function(){
      startMenu.classList.add('hidden');
      document.querySelectorAll('.taskbar-group').forEach(group => group.classList.remove('expanded'));
    });
    startButton.addEventListener('click', function(e){
      e.stopPropagation();
      startMenu.classList.toggle('hidden');
    });
    document.querySelectorAll('.start-app').forEach(app => {
      app.addEventListener('click', function(e){
        e.stopPropagation();
        const appName = this.getAttribute('data-app');
        createAppWindow(appName);
        startMenu.classList.add('hidden');
      });
    });
    document.querySelectorAll('.desktop-icon').forEach(icon => {
      icon.addEventListener('dblclick', function(){
        const appName = this.getAttribute('data-app');
        createAppWindow(appName);
      });
    });
    taskManagerButton.addEventListener('click', function(e){
      e.stopPropagation();
      updateTaskManager();
      taskManagerPanel.classList.toggle('hidden');
    });
  }

  initDesktop();
});
