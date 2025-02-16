// static/js/desktop.js
document.addEventListener('DOMContentLoaded', function() {
    let windowCounter = 0;
    let taskbarGroups = {}; // Ex : { terminal: [winId1, winId2], explorer: [winId3] }
    const windowsContainer = document.getElementById('windows-container');
    const taskbarIconsContainer = document.getElementById('taskbar-icons');
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    const startSearch = document.getElementById('start-search');
    const taskManagerButton = document.getElementById('task-manager-button');
    const taskManagerPanel = document.getElementById('task-manager');
    const taskList = document.getElementById('task-list');
    const closeTaskManagerBtn = document.getElementById('close-task-manager');
  
    // Création d'une fenêtre d'application
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
  
      // En-tête
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
  
      // Contenu
      const content = document.createElement('div');
      content.className = 'window-content';
      content.style.overflow = 'hidden'; // Pas de scroll externe
      if (appName === 'terminal') {
        const iframe = document.createElement('iframe');
        iframe.src = '/terminal/';
        iframe.className = 'app-iframe';
        iframe.frameBorder = "0";
        content.appendChild(iframe);
      } else if (appName === 'explorer') {
        content.innerHTML = '<p>Contenu de l\'Explorer géré par l\'app.</p>';
      } else {
        content.innerHTML = '<p>Application non définie.</p>';
      }
      win.appendChild(content);
      windowsContainer.appendChild(win);
  
      // Rendre déplaçable et redimensionnable
      window.dragManager.makeDraggable(win, header);
      window.resizeManager.makeResizable(win);
  
      // Au clic, amener au premier plan
      win.addEventListener('mousedown', function() {
        window.dragManager.bringToFront(win);
        markTaskbarActive(windowId);
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
      // Bouton minimiser
      btnMinimize.addEventListener('click', function(e) {
        e.stopPropagation();
        if (win.dataset.state !== 'minimized') {
          win.dataset.state = 'minimized';
          win.classList.add('minimized');
          win.style.display = 'none';
          addTaskbarIcon(windowId, appName);
          updateTaskManager();
        }
      });
      // Bouton maximiser/restaurer
      btnMaximize.addEventListener('click', function(e) {
        e.stopPropagation();
        if (win.classList.contains('maximized')) {
          win.classList.remove('maximized');
          win.style.top = win.dataset.prevTop;
          win.style.left = win.dataset.prevLeft;
          win.style.width = win.dataset.prevWidth;
          win.style.height = win.dataset.prevHeight;
        } else {
          win.dataset.prevTop = win.style.top;
          win.dataset.prevLeft = win.style.left;
          win.dataset.prevWidth = win.style.width;
          win.dataset.prevHeight = win.style.height;
          win.classList.add('maximized');
          win.style.top = '0';
          win.style.left = '0';
          win.style.width = '100%';
          win.style.height = '100%';
        }
      });
  
      addTaskbarIcon(windowId, appName);
      updateTaskManager();
    }
  
    // Gestion de la barre des tâches
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
            <div class="active-indicator"></div>
          </div>
          <div class="group-list"></div>
          <div class="group-count">${taskbarGroups[appName].length}</div>
        `;
        group.addEventListener('click', function(e) {
          e.stopPropagation();
          // Ne pas afficher le dropdown si le groupe contient une seule instance
          if (taskbarGroups[appName].length > 1) {
            group.classList.toggle('expanded');
          }
        });
        taskbarIconsContainer.appendChild(group);
      }
    }
  
    function updateTaskbarGroup(appName) {
      const group = document.querySelector(`.taskbar-group[data-app="${appName}"]`);
      if (group) {
        const groupList = group.querySelector('.group-list');
        groupList.innerHTML = '';
        taskbarGroups[appName].forEach((winId, idx) => {
          const item = document.createElement('div');
          item.className = 'group-item';
          item.dataset.windowId = winId;
          // Si plus d'une instance, numéroter à partir de 2
          item.textContent = taskbarGroups[appName].length > 1 ? appName + ' (' + (idx+1) + ')' : appName;
          item.addEventListener('click', function(e) {
            e.stopPropagation();
            const win = document.getElementById(winId);
            if (win) {
              win.dataset.state = 'open';
              win.classList.remove('minimized');
              win.style.display = 'block';
              window.dragManager.bringToFront(win);
            }
            group.classList.remove('expanded');
            markTaskbarActive(winId);
            updateTaskManager();
          });
          groupList.appendChild(item);
        });
        group.querySelector('.group-count').textContent = taskbarGroups[appName].length;
      }
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
  
    function updateTaskbarIcon(windowId, state) {
      for (let app in taskbarGroups) {
        if (taskbarGroups[app].includes(windowId)) {
          const group = document.querySelector(`.taskbar-group[data-app="${app}"]`);
          const mainIcon = group.querySelector('.taskbar-icon');
          if (state === 'minimized') {
            mainIcon.classList.remove('active');
          } else {
            mainIcon.classList.add('active');
          }
        }
      }
    }
  
    function markTaskbarActive(windowId) {
      for (let app in taskbarGroups) {
        const group = document.querySelector(`.taskbar-group[data-app="${app}"]`);
        if (group) {
          const mainIcon = group.querySelector('.taskbar-icon');
          const win = document.getElementById(mainIcon.dataset.windowId);
          if (win && win.dataset.state === 'open' && win.id === windowId) {
            mainIcon.classList.add('active');
            group.classList.add('active');
          } else {
            mainIcon.classList.remove('active');
            group.classList.remove('active');
          }
        }
      }
    }
  
    function getAppIcon(appName) {
      if (appName === 'terminal') return '/static/images/terminal.png';
      if (appName === 'explorer') return '/static/images/explorer.png';
      return '/static/images/default.png';
    }
  
    // Task Manager
    function updateTaskManager() {
      taskList.innerHTML = '';
      document.querySelectorAll('.app-window').forEach(win => {
        const item = document.createElement('div');
        item.className = 'task-item';
        item.innerHTML = `<span>${win.dataset.app} - ${win.dataset.state}</span>
                          <button data-window-id="${win.id}" class="close-task-btn"><i class="fa-solid fa-xmark"></i></button>`;
        item.querySelector('.close-task-btn').addEventListener('click', function(e) {
          e.stopPropagation();
          const id = this.getAttribute('data-window-id');
          const w = document.getElementById(id);
          if (w) {
            w.classList.add('closing');
            setTimeout(() => {
              windowsContainer.removeChild(w);
              removeTaskbarIcon(id, w.dataset.app);
              updateTaskManager();
            }, 300);
          }
        });
        taskList.appendChild(item);
      });
    }
  
    // Initialisation du Start Menu et du Task Manager
    function initDesktop() {
      document.addEventListener('click', function() {
        startMenu.classList.add('hidden');
        document.querySelectorAll('.taskbar-group').forEach(group => group.classList.remove('expanded'));
      });
      startButton.addEventListener('click', function(e) {
        e.stopPropagation();
        startMenu.classList.toggle('hidden');
        if (!startMenu.classList.contains('hidden')) startSearch.focus();
      });
      document.querySelectorAll('.start-app').forEach(app => {
        app.addEventListener('click', function(e) {
          e.stopPropagation();
          const appName = this.getAttribute('data-app');
          createAppWindow(appName);
          startMenu.classList.add('hidden');
        });
      });
      document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.addEventListener('dblclick', function() {
          const appName = this.getAttribute('data-app');
          createAppWindow(appName);
        });
      });
      taskManagerButton.addEventListener('click', function(e) {
        e.stopPropagation();
        updateTaskManager();
        taskManagerPanel.classList.toggle('hidden');
      });
      closeTaskManagerBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        taskManagerPanel.classList.add('hidden');
      });
    }
  
    initDesktop();
  });
  