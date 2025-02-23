document.addEventListener('DOMContentLoaded', function() {
  let windowCounter = 0;
  const taskbarGroups = {}; // ex: { terminal: [id1, id2], ... }
  const windowsContainer = document.getElementById('windows-container');
  const taskbarIconsContainer = document.getElementById('taskbar-icons');
  const startButton = document.getElementById('start-button');
  const startMenu = document.getElementById('start-menu');
  const desktop = document.getElementById('desktop');
  const startSearch = document.getElementById('start-search'); // Barre de recherche du Start Menu

  // Désactive le clic droit natif (hors context menu custom)
  document.addEventListener('contextmenu', function(e) {
    if (!e.target.closest('.context-menu')) {
      e.preventDefault();
    }
  });
  
  function closeStartMenu() {
    startMenu.classList.remove('active');
  }
  
  if (startSearch) {
    startSearch.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
  
  function openTaskManager() {
    const taskManagerPanel = document.getElementById('task-manager');
    if (taskManagerPanel) {
      taskManagerPanel.classList.toggle('active');
    }
  }
  
  // Désélectionne uniquement les fenêtres actives (les icônes restent sélectionnables)
  function deactivateAll() {
    document.querySelectorAll('.app-window').forEach(win => win.classList.remove('active-window'));
  }
  
  function activateDesktop() {
    deactivateAll();
    desktop.classList.add('active-desktop');
  }
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.desktop-icon').forEach(icon => icon.classList.remove('selected'));
    }
  });
  
  function updateWindowTitle(win) {
    const app = win.dataset.app;
    const instances = taskbarGroups[app] || [];
    if (instances.length > 1) {
      const index = instances.indexOf(win.id);
      win.querySelector('.window-title').textContent =
        app.charAt(0).toUpperCase() + app.slice(1) + ' (' + (index + 1) + ')';
    } else {
      win.querySelector('.window-title').textContent =
        app.charAt(0).toUpperCase() + app.slice(1);
    }
  }
  
  function createAppWindow(appName) {
    windowCounter++;
    const windowId = 'app-window-' + windowCounter;
    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = windowId;
    win.dataset.app = appName;
    win.dataset.state = 'open';
    win.style.top = '150px';
    win.style.left = '250px';
    win.style.width = '600px';
    win.style.height = '400px';
    
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
    
    const content = document.createElement('div');
    content.className = 'window-content';
    if (appName === 'terminal') {
      const iframe = document.createElement('iframe');
      iframe.src = '/terminal/';
      iframe.className = 'app-iframe';
      iframe.frameBorder = "0";
      content.appendChild(iframe);
    } else if (appName === 'explorer') {
      // Correction : affichage d'une iframe pour l'explorer
      const iframe = document.createElement('iframe');
      iframe.src = '/explorer/'; // Assurez-vous que cette URL renvoie l'interface Explorer
      iframe.className = 'app-iframe';
      iframe.frameBorder = "0";
      content.appendChild(iframe);
    } else {
      content.innerHTML = '<p>Application non définie.</p>';
    }
    win.appendChild(content);
    windowsContainer.appendChild(win);
    
    window.dragManager.makeDraggable(win, header);
    window.resizeManager.makeResizable(win);
    
    win.addEventListener('mousedown', function(e) {
      if (!e.target.closest('.window-btn')) {
        deactivateAll();
        win.classList.add('active-window');
        window.dragManager.bringToFront(win);
        markTaskbarActive(win.id);
      }
    });
    
    btnClose.addEventListener('click', function(e) {
      e.stopPropagation();
      win.classList.add('closing');
      setTimeout(() => {
        windowsContainer.removeChild(win);
        removeTaskbarIcon(windowId, appName);
        updateTaskbarGroup(appName);
        updateTaskManager();
      }, 300);
    });
    
    btnMinimize.addEventListener('click', function(e) {
      e.stopPropagation();
      if (win.dataset.state !== 'minimized') {
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
    
    btnMaximize.addEventListener('click', function(e) {
      e.stopPropagation();
      if (win.classList.contains('maximized')) {
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
    
    addTaskbarIcon(windowId, appName);
    updateWindowTitle(win);
    closeStartMenu();
  }
  
  function addDesktopIcon(appName) {
    let existing = document.querySelector(`.desktop-icon[data-app="${appName}"]`);
    if (!existing) {
      const container = document.querySelector('.desktop-icons');
      const icon = document.createElement('div');
      icon.className = 'desktop-icon';
      icon.setAttribute('data-app', appName);
      icon.dataset.pinned = "true";
      const candidate = { left: 0, top: 0 };
      const freeCell = window.iconManager.findEmptyCell(candidate.left, candidate.top);
      icon.style.left = freeCell.left + 'px';
      icon.style.top = freeCell.top + 'px';
      icon.innerHTML = `<img src="${getAppIcon(appName)}" alt="${appName}"><span>${appName.charAt(0).toUpperCase() + appName.slice(1)}</span>`;
      container.appendChild(icon);
      window.iconManager.attachIconEvents(icon);
      // Effectue le POST, puis le GET pour recharger dynamiquement la configuration
      window.iconManager.saveIconPositions();
      setTimeout(() => {
        window.iconManager.loadIconPositions();
      }, 100);
    }
  }
  
  function addTaskbarIcon(windowId, appName) {
    if (taskbarGroups[appName]) {
      if (!taskbarGroups[appName].includes(windowId)) {
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
        <div class="group-count" data-count="1"></div>
      `;
      group.addEventListener('click', function(e) {
        e.stopPropagation();
        if (taskbarGroups[appName].length > 1) {
          const items = taskbarGroups[appName].map((winId, idx) => {
            const win = document.getElementById(winId);
            const label = win ? win.querySelector('.window-title').textContent : appName;
            return {
              label: label,
              action: function() {
                if (win) {
                  win.dataset.state = 'open';
                  win.classList.remove('minimized');
                  win.style.display = 'block';
                  window.dragManager.bringToFront(win);
                  markTaskbarActive(win.id);
                }
              }
            };
          });
          const menu = new ContextMenu(items, { animate: true });
          menu.show(e.pageX, e.pageY);
        } else {
          const win = document.getElementById(taskbarGroups[appName][0]);
          if (win) {
            if (win.dataset.state === 'minimized') {
              win.dataset.state = 'open';
              win.classList.remove('minimized');
              win.style.display = 'block';
            }
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
    if (group) {
      const countEl = group.querySelector('.group-count');
      if (taskbarGroups[appName].length > 1) {
        countEl.style.display = 'block';
        countEl.textContent = taskbarGroups[appName].length;
        countEl.setAttribute('data-count', taskbarGroups[appName].length);
      } else {
        countEl.style.display = 'none';
        countEl.setAttribute('data-count', '1');
      }
      updateWindowTitles(appName);
    }
  }
  
  function updateWindowTitles(appName) {
    const instances = taskbarGroups[appName] || [];
    instances.forEach(winId => {
      const win = document.getElementById(winId);
      if (win) updateWindowTitle(win);
    });
  }
  
  function removeTaskbarIcon(windowId, appName) {
    if (taskbarGroups[appName]) {
      taskbarGroups[appName] = taskbarGroups[appName].filter(id => id !== windowId);
      if (taskbarGroups[appName].length === 0) {
        const group = document.querySelector(`.taskbar-group[data-app="${appName}"]`);
        if (group) taskbarIconsContainer.removeChild(group);
        delete taskbarGroups[appName];
      } else {
        updateTaskbarGroup(appName);
      }
    }
  }
  
  function markTaskbarActive(activeWindowId) {
    for (let app in taskbarGroups) {
      const group = document.querySelector(`.taskbar-group[data-app="${app}"]`);
      if (group) {
        if (taskbarGroups[app].includes(activeWindowId)) {
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
    if (appName === 'terminal') return '/static/images/terminal.png';
    if (appName === 'explorer') return '/static/images/explorer.png';
    return '/static/images/default.png';
  }
  
  // Context Menu pour le bureau
  desktop.addEventListener('contextmenu', function(e) {
    if (e.target === desktop) {
      e.preventDefault();
      e.stopPropagation();
      const menu = new ContextMenu([
        { label: 'Options du bureau', action: () => { deactivateAll(); activateDesktop(); } }
      ]);
      menu.show(e.pageX, e.pageY);
    }
  });
  
  // Context Menu pour la barre des tâches (hors icônes)
  document.getElementById('taskbar').addEventListener('contextmenu', function(e) {
    if (!e.target.closest('.taskbar-icon')) {
      e.preventDefault();
      e.stopPropagation();
      const menu = new ContextMenu([
        { label: 'Paramètres de la barre', action: () => { alert('Paramètres de la barre'); } },
        { label: 'Ouvrir Gestionnaire de tâches', action: () => { openTaskManager(); } }
      ], { animate: true });
      menu.show(e.pageX, e.pageY);
    }
  });
  
  function initDesktop() {
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.app-window') &&
          !e.target.closest('.desktop-icon') &&
          !e.target.closest('#start-menu') &&
          !e.target.closest('#taskbar') &&
          !document.querySelector('.selection-box')) {
        deactivateAll();
        activateDesktop();
      }
      startMenu.classList.remove('active');
      document.querySelectorAll('.taskbar-group').forEach(group => group.classList.remove('expanded'));
    });
    
    startButton.addEventListener('click', function(e) {
      e.stopPropagation();
      startMenu.classList.toggle('active');
    });
    
    document.querySelectorAll('.start-app').forEach(app => {
      app.addEventListener('click', function(e) {
        e.stopPropagation();
        const appName = this.getAttribute('data-app');
        createAppWindow(appName);
        startMenu.classList.remove('active');
      });
      app.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const appName = this.getAttribute('data-app');
        const menu = new ContextMenu([
          { label: 'Épingler au bureau', action: () => { addDesktopIcon(appName); } }
        ]);
        menu.show(e.pageX, e.pageY);
      });
    });
    
    document.querySelectorAll('.desktop-icon').forEach(icon => {
      icon.addEventListener('dblclick', function() {
        const appName = this.getAttribute('data-app');
        createAppWindow(appName);
      });
      icon.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const menu = new ContextMenu([
          { label: 'Ouvrir', action: () => { createAppWindow(icon.getAttribute('data-app')); } },
          { label: 'Supprimer les icônes sélectionnées', action: () => {
              const selectedIcons = document.querySelectorAll('.desktop-icon.selected');
              if (selectedIcons.length > 0) {
                selectedIcons.forEach(el => el.parentElement.removeChild(el));
              } else {
                icon.parentElement.removeChild(icon);
              }
              window.iconManager.saveIconPositions();
            }
          }
        ]);
        menu.show(e.pageX, e.pageY);
      });
    });
  }
  
  initDesktop();
});
