document.addEventListener('DOMContentLoaded', function() {
  const explorerMain = document.getElementById('explorer-main');
  const driveType = explorerMain.getAttribute('data-drive-type');

  // Toggle view
  const toggleViewBtn = document.getElementById('toggle-view');
  toggleViewBtn.addEventListener('click', function() {
    const url = new URL(window.location.href);
    if (explorerMain.classList.contains('grid-view')) {
      url.searchParams.set('view', 'list');
      toggleViewBtn.innerHTML = '<i class="fa-solid fa-list"></i>';
    } else {
      url.searchParams.set('view', 'grid');
      toggleViewBtn.innerHTML = '<i class="fa-solid fa-th"></i>';
    }
    window.location.href = url.toString();
  });

  // New Folder button: déclenche la création inline
  const newFolderBtn = document.getElementById('new-folder-btn');
  newFolderBtn.addEventListener('click', function(e) {
    e.preventDefault();
    createInlineFolder();
  });

  // New File button
  const newFileBtn = document.getElementById('new-file-btn');
  newFileBtn.addEventListener('click', function(e) {
    e.preventDefault();
    createInlineFile();
  });

  // Fonction de renommage inline
  function inlineRename(item) {
    const titleElem = item.querySelector('.item-title');
    const currentName = titleElem.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.className = 'inline-rename-input';
    titleElem.innerHTML = '';
    titleElem.appendChild(input);
    input.focus();

    function submitRename() {
      const newName = input.value.trim();
      // Si vide ou inchangé, on restaure l'ancien nom
      if(newName === '' || newName === currentName) {
        titleElem.textContent = currentName;
        return;
      }
      const formData = new FormData();
      formData.append('new_name', newName);
      formData.append('csrfmiddlewaretoken', getCookie('csrftoken'));
      const renameUrl = item.getAttribute('data-rename-url');
      fetch(renameUrl, {
        method: 'POST',
        body: formData,
        headers: {'X-Requested-With': 'XMLHttpRequest'}
      })
      .then(response => response.json())
      .then(data => {
        if(data.success){
          titleElem.textContent = data.new_name;
        } else {
          alert('Erreur de renommage: ' + JSON.stringify(data.errors));
          titleElem.textContent = currentName;
        }
      })
      .catch(error => {
        console.error(error);
        titleElem.textContent = currentName;
      });
    }

    input.addEventListener('keydown', function(e) {
      if(e.key === 'Enter'){
        submitRename();
      }
      if(e.key === 'Escape'){
        titleElem.textContent = currentName;
      }
    });
    input.addEventListener('blur', submitRename);
  }

  // Création inline d'un dossier (envoi via fetch)
  function createInlineFolder() {
    if (document.querySelector('.explorer-item.new-folder')) return;
    const explorerContent = document.querySelector('#explorer-main .explorer-content');
    if (!explorerContent) return;
    const newFolderDiv = document.createElement('div');
    newFolderDiv.className = 'explorer-item folder-item new-folder';
    newFolderDiv.setAttribute('data-type', 'directory');
    newFolderDiv.setAttribute('data-id', 'new');
    newFolderDiv.innerHTML = '<i class="fa-solid fa-folder explorer-icon"></i>';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-folder-input';
    input.placeholder = 'New Folder';
    newFolderDiv.appendChild(input);
    explorerContent.appendChild(newFolderDiv);
    input.focus();

    let submitted = false;
    function finishFolderCreation() {
      if (submitted) return;
      submitted = true;
      const name = input.value.trim();
      if (!name) { newFolderDiv.remove(); return; }
      const formData = new FormData();
      formData.append('name', name);
      formData.append('csrfmiddlewaretoken', getCookie('csrftoken'));
      const createUrl = explorerMain.getAttribute('data-create-directory-url');
      fetch(createUrl, {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          window.location.reload();
        } else {
          alert('Error creating folder: ' + JSON.stringify(data.errors));
          newFolderDiv.remove();
        }
      })
      .catch(error => {
        console.error(error);
        newFolderDiv.remove();
      });
    }
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') finishFolderCreation();
    });
    input.addEventListener('blur', finishFolderCreation);
  }

  // Création inline d'un fichier
  function createInlineFile() {
    if (document.querySelector('.explorer-item.new-file')) return;
    const explorerContent = document.querySelector('#explorer-main .explorer-content');
    if (!explorerContent) return;
    const newFileDiv = document.createElement('div');
    newFileDiv.className = 'explorer-item file-item new-file';
    newFileDiv.setAttribute('data-type', 'file');
    newFileDiv.setAttribute('data-id', 'new');
    newFileDiv.innerHTML = '<i class="fa-solid fa-file explorer-icon"></i>';
    const input = document.createElement('input');
    input.type = 'file';
    input.className = 'inline-file-input';
    newFileDiv.appendChild(input);
    explorerContent.appendChild(newFileDiv);
    input.focus();

    input.addEventListener('change', function() {
      const file = input.files[0];
      if (!file) { newFileDiv.remove(); return; }
      const formData = new FormData();
      formData.append('file', file);
      formData.append('csrfmiddlewaretoken', getCookie('csrftoken'));
      const uploadUrl = explorerMain.getAttribute('data-upload-file-url');
      fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) { window.location.reload(); }
        else { alert('Error uploading file.'); newFileDiv.remove(); }
      })
      .catch(error => {
        console.error(error);
        newFileDiv.remove();
      });
    });
    input.addEventListener('blur', function() {
      if (!input.files || !input.files[0]) { newFileDiv.remove(); }
    });
  }

  // Utilitaire: récupérer le CSRF token depuis les cookies
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  // Initialisation du SelectionManager (assurez-vous que la classe SelectionManager est disponible)
  const explorerMainEl = document.getElementById('explorer-main');
  if (explorerMainEl && window.SelectionManager) {
    window.explorerSelectionManager = new SelectionManager(
      explorerMainEl,
      '.explorer-item',
      function(selectedItems) { console.log('Selected items:', selectedItems); },
      { exclusionSelectors: ['#explorer-actions', '#drive-selector', '#explorer-breadcrumbs'] }
    );
  }

  // Drag & Drop
  let dragSrcEl = null;
  function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
    this.classList.add('dragging');
  }
  function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  }
  function handleDragEnter(e) { this.classList.add('over'); }
  function handleDragLeave(e) { this.classList.remove('over'); }
  function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    if (dragSrcEl !== this) {
      const srcHTML = dragSrcEl.outerHTML;
      dragSrcEl.outerHTML = this.outerHTML;
      this.outerHTML = srcHTML;
      initDraggableItems();
    }
    return false;
  }
  function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.explorer-item').forEach(item => item.classList.remove('over'));
  }
  function initDraggableItems() {
    const items = document.querySelectorAll('.explorer-item');
    items.forEach(item => {
      item.addEventListener('dragstart', handleDragStart, false);
      item.addEventListener('dragenter', handleDragEnter, false);
      item.addEventListener('dragover', handleDragOver, false);
      item.addEventListener('dragleave', handleDragLeave, false);
      item.addEventListener('drop', handleDrop, false);
      item.addEventListener('dragend', handleDragEnd, false);
    });
  }
  initDraggableItems();

  // URL templates pour les menus contextuels (définis dans le template)
  var deleteUrlTemplate = window.deleteUrlTemplate || "";
  var renameUrlTemplate = window.renameUrlTemplate || "";
  var moveUrlTemplate = window.moveUrlTemplate || "";

  // Attacher les menus contextuels
  function attachContextMenus() {
    document.querySelectorAll('.explorer-item').forEach(item => {
      item.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        document.querySelectorAll('.context-menu').forEach(menu => menu.remove());
        const title = item.querySelector('.item-title').textContent;
        const type = item.getAttribute('data-type');
        const itemId = item.getAttribute('data-id');
        const menuItems = [
          {
            label: 'Delete',
            action: function() {
              if (confirm('Delete "' + title + '"?')) {
                var url = deleteUrlTemplate.replace("__TYPE__", type)
                                             .replace("__ID__", itemId);
                window.location.href = url;
              }
            }
          },
          {
            label: 'Rename',
            action: function() {
              inlineRename(item);
            }
          }
        ];
        if (type === 'directory') {
          menuItems.push({
            label: 'Open Folder',
            action: function() {
              window.location.href = "/drive/" + driveType + "/directory/" + itemId + "/";
            }
          });
        }
        menuItems.push({
          label: 'Move',
          action: function() {
            window.location.href = moveUrlTemplate.replace("__TYPE__", type)
                                                  .replace("__ID__", itemId);
          }
        });
        const menu = new ContextMenu(menuItems, { animate: true });
        menu.show(e.pageX, e.pageY);
      });
    });
    // Menu contextuel sur le fond
    explorerMainEl.addEventListener('contextmenu', function(e) {
      if (e.target.closest('.explorer-item')) return;
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll('.context-menu').forEach(menu => menu.remove());
      const menuItems = [
        { label: 'Deselect All', action: function() {
            if (window.explorerSelectionManager) {
              window.explorerSelectionManager._clearSelection();
              window.explorerSelectionManager.onSelect([]);
            }
          }
        },
        { label: 'New Folder', action: createInlineFolder },
        { label: 'New File', action: createInlineFile }
      ];
      const menu = new ContextMenu(menuItems, { animate: true });
      menu.show(e.pageX, e.pageY);
    });
  }
  attachContextMenus();

  // Fermeture globale des menus contextuels et réinitialisation de la sélection
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.context-menu')) {
      document.querySelectorAll('.context-menu').forEach(menu => menu.remove());
    }
    if (!e.target.closest('.explorer-item')) {
      if (window.explorerSelectionManager) {
        window.explorerSelectionManager._clearSelection();
        window.explorerSelectionManager.onSelect([]);
      }
    }
  });

  // Double-click pour ouvrir un dossier
  explorerMainEl.addEventListener('dblclick', function(e) {
    const item = e.target.closest('.explorer-item');
    if (item && item.getAttribute('data-type') === 'directory') {
      window.location.href = "/drive/" + driveType + "/directory/" + item.getAttribute('data-id') + "/";
    }
  });

  // Bouton Delete Selected: envoi via fetch
  const deleteSelectedBtn = document.getElementById('delete-selected-btn');
  deleteSelectedBtn.addEventListener('click', function() {
    if (window.explorerSelectionManager) {
      const selected = Array.from(window.explorerSelectionManager.selectedElements);
      if (selected.length === 0) { alert('No items selected.'); return; }
      if (!confirm('Delete ' + selected.length + ' selected item(s)?')) return;
      const selStr = selected.map(el => el.getAttribute('data-type') + '-' + el.getAttribute('data-id')).join(',');
      const formData = new FormData();
      formData.append('selected', selStr);
      formData.append('csrfmiddlewaretoken', getCookie('csrftoken'));
      const deleteUrl = document.getElementById('delete-selected-form').action;
      fetch(deleteUrl, {
         method: 'POST',
         body: formData,
         headers: { 'X-Requested-With': 'XMLHttpRequest' }
      })
      .then(response => response.json())
      .then(data => {
         if (data.success) {
             window.location.reload();
         } else {
             alert('Error deleting selected items.');
         }
      })
      .catch(error => console.error(error));
    }
  });
});
