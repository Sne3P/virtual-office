document.addEventListener('DOMContentLoaded', function() {
  let windowCounter = 0;
  const taskbarGroups = {}; // ex: { terminal: [id1, id2], ... }
  const windowsContainer = document.getElementById('windows-container');
  const taskbarIconsContainer = document.getElementById('taskbar-icons');
  const startButton = document.getElementById('start-button');
  const startMenu = document.getElementById('start-menu');
  const desktop = document.getElementById('desktop');
  const startSearch = document.getElementById('start-search');

  // Ajout pour permettre le scroll dans le start menu :
  if (startMenu) {
    startMenu.style.maxHeight = '400px';
    startMenu.style.overflowY = 'auto';
  }

  // Désactivation du clic droit natif sauf sur notre menu custom
  document.addEventListener('contextmenu', function(e) {
    if (!e.target.closest('.context-menu')) e.preventDefault();
  });

  function closeStartMenu() {
    startMenu.classList.remove('active');
  }

  // Barre de recherche : filtrage des .start-app
  if (startSearch) {
    startSearch.addEventListener('click', e => e.stopPropagation());

    // Nouveau : écouteur d'input pour filtrer
    startSearch.addEventListener('input', function(e) {
      const query = e.target.value.toLowerCase().trim();
      const apps = document.querySelectorAll('.start-app');
      apps.forEach(app => {
        const text = app.textContent.toLowerCase();
        app.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }

  function openTaskManager() {
    const tm = document.getElementById('task-manager');
    if (tm) {
      tm.classList.toggle('active');
      if (tm.classList.contains('active')) updateTaskManager();
    }
  }

  function deactivateAllWindows() {
    document.querySelectorAll('.app-window').forEach(win => win.classList.remove('active-window'));
    markTaskbarActive(null);
  }

  function activateDesktop() {
    deactivateAllWindows();
    desktop.classList.add('active-desktop');
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.desktop-icon').forEach(icon => icon.classList.remove('selected'));
    }
  });

  function updateWindowTitle(win) {
    const app = win.dataset.app;
    const instances = taskbarGroups[app] || [];
    const cfg = window.appsConfig && window.appsConfig[app];
    if (instances.length > 1) {
      const idx = instances.indexOf(win.id);
      win.querySelector('.window-title').textContent = (cfg ? cfg.name : app) + ' (' + (idx + 1) + ')';
    } else {
      win.querySelector('.window-title').textContent = cfg ? cfg.name : app;
    }
  }

  // Fonction centralisée pour mettre la fenêtre win au premier plan
  function bringWindowToFront(win) {
    deactivateAllWindows();
    win.classList.add('active-window');
    window.dragManager.bringToFront(win);
    markTaskbarActive(win.id);
  }

  function createAppWindow(appName) {
    windowCounter++;
    const winId = 'app-window-' + windowCounter;
    const cfg = window.appsConfig && window.appsConfig[appName];
    const win = document.createElement('div');
    win.className = 'app-window';
    win.id = winId;
    win.dataset.app = appName;
    win.dataset.state = 'open';
    Object.assign(win.style, { top: '150px', left: '250px', width: '600px', height: '400px' });

    // Header
    const header = document.createElement('div');
    header.className = 'window-header';
    const title = document.createElement('div');
    title.className = 'window-title';
    title.textContent = cfg ? cfg.name : appName;
    const controls = document.createElement('div');
    controls.className = 'window-controls';
    ['minimize','maximize','close'].forEach(btnType => {
      const btn = document.createElement('button');
      btn.className = 'window-btn ' + btnType;
      controls.appendChild(btn);
    });
    header.append(title, controls);
    win.appendChild(header);

    // Content
    const content = document.createElement('div');
    content.className = 'window-content';
    if (cfg && cfg.url) {
      const iframe = document.createElement('iframe');
      iframe.src = cfg.url;
      iframe.className = 'app-iframe';
      iframe.frameBorder = "0";
      content.appendChild(iframe);
    } else {
      content.innerHTML = '<p>Application non définie.</p>';
    }
    win.appendChild(content);
    windowsContainer.appendChild(win);

    // Rendre la fenêtre déplaçable et redimensionnable (via les composants externes)
    window.dragManager.makeDraggable(win, header);
    window.resizeManager.makeResizable(win);

    // Au clic sur la fenêtre (hors boutons), la mettre au premier plan
    win.addEventListener('mousedown', function(e) {
      if (!e.target.closest('.window-btn')) {
        bringWindowToFront(win);
      }
    });

    // Contrôles de la fenêtre
    controls.querySelector('.close').addEventListener('click', function(e) {
      e.stopPropagation();
      win.classList.add('closing');
      setTimeout(() => {
        windowsContainer.removeChild(win);
        removeTaskbarIcon(winId, appName);
        updateTaskbarGroup(appName);
        updateTaskManager();
      }, 300);
    });
    controls.querySelector('.minimize').addEventListener('click', function(e) {
      e.stopPropagation();
      if (win.dataset.state !== 'minimized') {
        win.dataset.state = 'minimized';
        win.classList.add('minimize-animation');
        setTimeout(() => {
          win.style.display = 'none';
          win.classList.remove('minimize-animation');
          win.classList.remove('active-window');
          markTaskbarActive(null);
          updateTaskManager();
        }, 300);
        addTaskbarIcon(winId, appName);
      }
    });
    controls.querySelector('.maximize').addEventListener('click', function(e) {
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
          markTaskbarActive(win.id);
        }, 300);
      } else {
        win.dataset.prevTop = win.style.top;
        win.dataset.prevLeft = win.style.left;
        win.dataset.prevWidth = win.style.width;
        win.dataset.prevHeight = win.style.height;
        win.classList.add('enlarge-animation');
        setTimeout(() => {
          win.classList.add('maximized');
          Object.assign(win.style, { top: '0', left: '0', width: '100%', height: '100%' });
          win.classList.remove('enlarge-animation');
          markTaskbarActive(win.id);
        }, 300);
      }
    });

    addTaskbarIcon(winId, appName);
    updateWindowTitle(win);
    closeStartMenu();
    updateTaskManager();
  }

  function addDesktopIcon(appName) {
    if (!document.querySelector(`.desktop-icon[data-app="${appName}"]`)) {
      const container = document.querySelector('.desktop-icons');
      const cfg = (window.appsConfig && window.appsConfig[appName]) || { name: appName, icon: '/static/images/default.png' };
      const icon = document.createElement('div');
      icon.className = 'desktop-icon';
      icon.setAttribute('data-app', appName);
      icon.dataset.pinned = "true";
      const freeCell = window.iconManager.findEmptyCell(0, 0);
      Object.assign(icon.style, { left: freeCell.left + 'px', top: freeCell.top + 'px' });
      icon.innerHTML = `<img src="${cfg.icon}" alt="${cfg.name}"><span>${cfg.name}</span>`;
      container.appendChild(icon);
      window.iconManager.attachIconEvents(icon);
      window.iconManager.saveIconPositions();
      setTimeout(() => { window.iconManager.loadIconPositions(); }, 100);
    }
  }

  function addTaskbarIcon(winId, appName) {
    const cfg = (window.appsConfig && window.appsConfig[appName]) || { name: appName, icon: '/static/images/default.png' };
    if (taskbarGroups[appName]) {
      if (!taskbarGroups[appName].includes(winId)) taskbarGroups[appName].push(winId);
      updateTaskbarGroup(appName);
    } else {
      taskbarGroups[appName] = [winId];
      const group = document.createElement('div');
      group.className = 'taskbar-group';
      group.dataset.app = appName;
      group.innerHTML = `
        <div class="taskbar-icon" data-window-id="${winId}">
          <img src="${cfg.icon}" alt="${cfg.name}">
          <span>${cfg.name}</span>
        </div>
        <div class="group-list"></div>
        <div class="group-count" data-count="1"></div>
      `;
      group.addEventListener('click', function(e) {
        e.stopPropagation();
        // Si plusieurs fenêtres pour cette app, afficher un menu contextuel
        if (taskbarGroups[appName].length > 1) {
          const items = taskbarGroups[appName].map(id => {
            const win = document.getElementById(id);
            const label = win ? win.querySelector('.window-title').textContent : cfg.name;
            return {
              label: label,
              action: function() {
                if (win) {
                  if (win.dataset.state === 'minimized') {
                    win.dataset.state = 'open';
                    win.classList.remove('minimized');
                    win.style.display = 'block';
                  }
                  bringWindowToFront(win);
                  updateTaskManager();
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
            bringWindowToFront(win);
            updateTaskManager();
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
      } else {
        countEl.style.display = 'none';
      }
      updateWindowTitles(appName);
    }
  }

  function updateWindowTitles(appName) {
    (taskbarGroups[appName] || []).forEach(id => {
      const win = document.getElementById(id);
      if (win) updateWindowTitle(win);
    });
  }

  function removeTaskbarIcon(winId, appName) {
    if (taskbarGroups[appName]) {
      taskbarGroups[appName] = taskbarGroups[appName].filter(id => id !== winId);
      if (!taskbarGroups[appName].length) {
        const group = document.querySelector(`.taskbar-group[data-app="${appName}"]`);
        if (group) taskbarIconsContainer.removeChild(group);
        delete taskbarGroups[appName];
      } else {
        updateTaskbarGroup(appName);
      }
    }
  }

  function markTaskbarActive(activeId) {
    Object.keys(taskbarGroups).forEach(app => {
      const group = document.querySelector(`.taskbar-group[data-app="${app}"]`);
      if (group) {
        if (activeId && taskbarGroups[app].includes(activeId)) {
          group.classList.add('active');
          group.querySelector('.taskbar-icon').classList.add('active');
        } else {
          group.classList.remove('active');
          group.querySelector('.taskbar-icon').classList.remove('active');
        }
      }
    });
  }

  // Context menus pour le bureau et la taskbar
  desktop.addEventListener('contextmenu', function(e) {
    if (!e.target.closest('.app-window') &&
        !e.target.closest('.desktop-icon') &&
        !e.target.closest('#start-menu') &&
        !e.target.closest('#taskbar') &&
        !e.target.closest('.context-menu')) {
      e.preventDefault();
      const menu = new ContextMenu(
        [{ label: 'Options du bureau', action: () => { deactivateAllWindows(); activateDesktop(); } }],
        { animate: true }
      );
      menu.show(e.pageX, e.pageY);
    }
  });
  
  document.getElementById('taskbar').addEventListener('contextmenu', function(e) {
    if (!e.target.closest('.taskbar-icon')) {
      e.preventDefault();
      const menu = new ContextMenu([
        { label: 'Paramètres de la barre', action: () => { alert('Paramètres de la barre'); } },
        { label: 'Ouvrir Gestionnaire de tâches', action: () => { openTaskManager(); } }
      ], { animate: true });
      menu.show(e.pageX, e.pageY);
    }
  });

  function updateTaskManager() {
    if (window.taskManager && typeof window.taskManager.update === 'function') {
      window.taskManager.update();
    }
  }

  function initDesktop() {
    // Instanciation du SelectionManager sur le conteneur des icônes
    const desktopIconsContainer = document.querySelector('.desktop-icons');
    if (desktopIconsContainer) {
      new SelectionManager(desktopIconsContainer, '.desktop-icon', selectedIcons => {
        // Action lors de la sélection multiple
      }, {
        exclusionSelectors: []
      });
    }

    // Déplacement groupé des icônes sélectionnées
    desktopIconsContainer.addEventListener('mousedown', function(e) {
      const targetIcon = e.target.closest('.desktop-icon');
      if (targetIcon && targetIcon.classList.contains('selected')) {
        const selectedIcons = Array.from(document.querySelectorAll('.desktop-icon.selected'));
        const initialPositions = selectedIcons.map(el => ({
          el: el,
          startLeft: parseInt(el.style.left, 10) || el.offsetLeft,
          startTop: parseInt(el.style.top, 10) || el.offsetTop
        }));
        const startX = e.pageX;
        const startY = e.pageY;

        function onMouseMove(ev) {
          const deltaX = ev.pageX - startX;
          const deltaY = ev.pageY - startY;
          initialPositions.forEach(({ el, startLeft, startTop }) => {
            el.style.left = (startLeft + deltaX) + 'px';
            el.style.top = (startTop + deltaY) + 'px';
          });
        }
        function onMouseUp(ev) {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          window.iconManager.saveIconPositions();
        }
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }
    });

    // Clic sur les icônes individuelles
    document.querySelectorAll('.desktop-icon').forEach(icon => {
      icon.addEventListener('dblclick', function() {
        createAppWindow(this.getAttribute('data-app'));
      });
      icon.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        const menu = new ContextMenu([
          { label: 'Ouvrir', action: () => { createAppWindow(this.getAttribute('data-app')); } },
          { label: 'Supprimer les icônes sélectionnées', action: () => {
              const sels = document.querySelectorAll('.desktop-icon.selected');
              if (sels.length > 0) {
                sels.forEach(el => el.parentElement.removeChild(el));
              } else {
                this.parentElement.removeChild(this);
              }
              window.iconManager.saveIconPositions();
            }
          }
        ], { animate: true });
        menu.show(e.pageX, e.pageY);
      });
    });

    // Clic sur le bureau pour fermer le start menu et désélectionner les icônes
    document.addEventListener('click', function(e) {
      if (!e.target.closest('#start-menu') && !e.target.closest('#start-button')) {
        closeStartMenu();
      }
      if (!e.target.closest('.desktop-icon') && !e.target.closest('.selection-box')) {
        document.querySelectorAll('.desktop-icon.selected').forEach(el => el.classList.remove('selected'));
      }
    });

    startButton.addEventListener('click', function(e) {
      e.stopPropagation();
      startMenu.classList.toggle('active');
    });
    
    document.querySelectorAll('.start-app').forEach(app => {
      app.addEventListener('click', function(e) {
        e.stopPropagation();
        createAppWindow(this.getAttribute('data-app'));
        closeStartMenu();
      });
      app.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        const menu = new ContextMenu([{ label: 'Épingler au bureau', action: () => { addDesktopIcon(this.getAttribute('data-app')); } }], { animate: true });
        menu.show(e.pageX, e.pageY);
      });
    });
  }
  
  initDesktop();
});
