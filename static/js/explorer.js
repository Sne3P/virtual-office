document.addEventListener('DOMContentLoaded', function() {
  /* ============================ UTILITAIRES ============================ */
  const getCookie = (name) => {
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
  };

  const deleteSelectedBtn = document.getElementById('delete-selected-btn');
  const updateDeleteButtonCount = () => {
    const count = window.selectionManager.selectedElements.size;
    deleteSelectedBtn.innerHTML = '<i class="fa-solid fa-trash"></i> (' + count + ')';
  };

  const performDeletion = (items) => {
    if (!confirm('Supprimer ' + items.length + ' item(s) ?')) return;
    const csrfToken = getCookie('csrftoken');
    const deleteUrl = explorerMainEl.getAttribute('data-delete-url');
    fetch(deleteUrl, {
      method: 'POST',
      body: JSON.stringify({ selected: items }),
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        window.selectionManager.selectedElements.forEach(item => item.remove());
        updateDeleteButtonCount();
      } else {
        alert('Erreur lors de la suppression: ' + (data.error || ''));
      }
    })
    .catch(error => console.error(error));
  };

  /* ============================ VARIABLES ============================ */
  let selectionBox = null, startX = 0, startY = 0, selectionBoxActive = false;
  const explorerBody = document.getElementById('explorer-body');
  const explorerMainEl = document.getElementById('explorer-main');
  const driveType = explorerMainEl.getAttribute('data-drive-type');

  /* ============================ ZONE DE SÉLECTION PAR GLISSANT ============================ */
  explorerBody.addEventListener('mousedown', function(e) {
    if (e.target.closest('.explorer-item')) return;
    if (!e.target.closest('#explorer-main')) return;
    selectionBoxActive = true;
    startX = e.pageX;
    startY = e.pageY;
    selectionBox = document.createElement('div');
    selectionBox.className = 'selection-box';
    selectionBox.style.left = startX + 'px';
    selectionBox.style.top = startY + 'px';
    document.body.appendChild(selectionBox);
    e.preventDefault();
  });
  document.addEventListener('mousemove', function(e) {
    if (!selectionBox) return;
    const currentX = e.pageX, currentY = e.pageY;
    const rect = {
      left: Math.min(startX, currentX),
      top: Math.min(startY, currentY),
      width: Math.abs(startX - currentX),
      height: Math.abs(startY - currentY)
    };
    Object.assign(selectionBox.style, {
      left: rect.left + 'px',
      top: rect.top + 'px',
      width: rect.width + 'px',
      height: rect.height + 'px'
    });
  });
  document.addEventListener('mouseup', function(e) {
    if (!selectionBox) return;
    const boxRect = selectionBox.getBoundingClientRect();
    document.querySelectorAll('.explorer-item').forEach(item => {
      const itemRect = item.getBoundingClientRect();
      if (!(itemRect.left > boxRect.right ||
            itemRect.right < boxRect.left ||
            itemRect.top > boxRect.bottom ||
            itemRect.bottom < boxRect.top)) {
        item.classList.add('selected');
        window.selectionManager.selectedElements.add(item);
      }
    });
    selectionBox.remove();
    selectionBox = null;
    updateDeleteButtonCount();
    selectionBoxActive = false;
  });

  /* ============================ SELECTION MANAGER ============================ */
  window.selectionManager = new SelectionManager(
    explorerMainEl,
    '.explorer-item',
    function() { if (!selectionBoxActive) updateDeleteButtonCount(); },
    { exclusionSelectors: ['#explorer-actions', '#drive-selector', '#explorer-breadcrumbs'], multiSelectModifier: 'ctrl' }
  );

  /* ============================ BOUTONS D'ACTION ============================ */
  const toggleViewBtn = document.getElementById('toggle-view');
  toggleViewBtn.addEventListener('click', function() {
    const url = new URL(window.location.href);
    if (explorerMainEl.classList.contains('grid-view')) {
      url.searchParams.set('view', 'list');
      toggleViewBtn.innerHTML = '<i class="fa-solid fa-list"></i>';
    } else {
      url.searchParams.set('view', 'grid');
      toggleViewBtn.innerHTML = '<i class="fa-solid fa-th"></i>';
    }
    window.location.href = url.toString();
  });
  document.getElementById('new-folder-btn').addEventListener('click', function(e) {
    e.preventDefault();
    createInlineFolder();
  });
  document.getElementById('new-file-btn').addEventListener('click', function(e) {
    e.preventDefault();
    createInlineFile();
  });
  // Bouton Reload ajouté pour forcer le rafraîchissement
  const reloadBtn = document.getElementById('reload-btn');
  if (reloadBtn) {
    reloadBtn.addEventListener('click', function() {
      window.location.reload();
    });
  }

  /* ============================ FONCTIONS INLINE (Création & Renommage) ============================ */
  const createInlineFolder = () => {
    if (document.querySelector('.explorer-item.new-folder')) return;
    const container = document.querySelector('#explorer-main .explorer-content');
    if (!container) return;
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
    container.appendChild(newFolderDiv);
    input.focus();
    let submitted = false;
    const finishFolderCreation = () => {
      if (submitted) return;
      submitted = true;
      const name = input.value.trim();
      if (!name) { newFolderDiv.remove(); return; }
      const formData = new FormData();
      formData.append('name', name);
      formData.append('csrfmiddlewaretoken', getCookie('csrftoken'));
      const createUrl = explorerMainEl.getAttribute('data-create-directory-url');
      fetch(createUrl, {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          addNewItemToDOM({ id: data.directory_id, name: data.name }, 'directory');
          newFolderDiv.remove();
        } else {
          alert('Erreur lors de la création: ' + JSON.stringify(data.errors));
          newFolderDiv.remove();
        }
      })
      .catch(error => { console.error(error); newFolderDiv.remove(); });
    };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') finishFolderCreation(); });
    input.addEventListener('blur', finishFolderCreation);
  };

  const createInlineFile = () => {
    if (document.querySelector('.explorer-item.new-file')) return;
    const container = document.querySelector('#explorer-main .explorer-content');
    if (!container) return;
    const newFileDiv = document.createElement('div');
    newFileDiv.className = 'explorer-item file-item new-file';
    newFileDiv.setAttribute('data-type', 'file');
    newFileDiv.setAttribute('data-id', 'new');
    newFileDiv.innerHTML = '<i class="fa-solid fa-file explorer-icon"></i>';
    const input = document.createElement('input');
    input.type = 'file';
    input.className = 'inline-file-input';
    newFileDiv.appendChild(input);
    container.appendChild(newFileDiv);
    input.focus();
    input.addEventListener('change', function() {
      const file = input.files[0];
      if (!file) { newFileDiv.remove(); return; }
      const formData = new FormData();
      formData.append('file', file);
      formData.append('csrfmiddlewaretoken', getCookie('csrftoken'));
      const uploadUrl = explorerMainEl.getAttribute('data-upload-file-url');
      fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          addNewItemToDOM({ id: data.file_id, name: data.name }, 'file');
          newFileDiv.remove();
        } else {
          alert('Erreur lors de l\'upload du fichier.');
          newFileDiv.remove();
        }
      })
      .catch(error => { console.error(error); newFileDiv.remove(); });
    });
    input.addEventListener('blur', function() {
      if (!input.files || !input.files[0]) { newFileDiv.remove(); }
    });
  };

  const addNewItemToDOM = (itemData, itemType) => {
    const container = document.querySelector('#explorer-main .explorer-content');
    const newItem = document.createElement('div');
    newItem.className = 'explorer-item ' + (itemType === 'directory' ? 'folder-item' : 'file-item');
    newItem.setAttribute('data-id', itemData.id);
    newItem.setAttribute('data-type', itemType);
    newItem.setAttribute('data-rename-url', "/explorer/item/" + itemType + "/" + itemData.id + "/rename/");
    newItem.setAttribute('draggable', 'true');
    newItem.innerHTML = itemType === 'directory' ?
      '<i class="fa-solid fa-folder explorer-icon"></i><div class="item-title">' + itemData.name + '</div>' :
      '<i class="fa-solid fa-file explorer-icon"></i><div class="item-title">' + itemData.name + '</div>';
    container.appendChild(newItem);
    bindExplorerItem(newItem);
  };

  const inlineRename = (item) => {
    const titleElem = item.querySelector('.item-title');
    const currentName = titleElem.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.className = 'inline-rename-input';
    titleElem.innerHTML = '';
    titleElem.appendChild(input);
    input.focus();
    const submitRename = () => {
      const newName = input.value.trim();
      if (newName === '' || newName === currentName) {
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
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) titleElem.textContent = data.new_name;
        else {
          alert('Erreur de renommage: ' + JSON.stringify(data.errors));
          titleElem.textContent = currentName;
        }
      })
      .catch(error => { console.error(error); titleElem.textContent = currentName; });
    };
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') submitRename();
      if (e.key === 'Escape') titleElem.textContent = currentName;
    });
    input.addEventListener('blur', submitRename);
  };

  const bindExplorerItem = (item) => {
    if (item.dataset.bound === "true") return;
    item.addEventListener('dragstart', function(e) {
      const payload = {
        type: item.getAttribute('data-type'),
        id: item.getAttribute('data-id')
      };
      e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    });
    item.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll('.context-menu').forEach(menu => menu.remove());
      const type = item.getAttribute('data-type');
      const itemId = item.getAttribute('data-id');
      let selected = Array.from(window.selectionManager.selectedElements);
      if (selected.length === 0) selected = [item];
      const menuItems = [
        {
          label: 'Delete',
          action: () => {
            const items = selected.map(el => ({
              type: el.getAttribute('data-type'),
              id: el.getAttribute('data-id')
            }));
            performDeletion(items);
          }
        },
        {
          label: 'Rename',
          action: () => { inlineRename(item); }
        }
      ];
      if (type === 'directory') {
        menuItems.push({
          label: 'Open Folder',
          action: () => {
            window.location.href = "/explorer/drive/" + driveType + "/directory/" + itemId + "/";
          }
        });
      }
      const menu = new ContextMenu(menuItems, { animate: true });
      menu.show(e.pageX, e.pageY);
    });
    item.dataset.bound = "true";
  };

  /* ============================ SUPPRESSION MULTIPLE ============================ */
  deleteSelectedBtn.addEventListener('click', function() {
    const selected = Array.from(window.selectionManager.selectedElements);
    if (selected.length === 0) { alert('Aucun item sélectionné.'); return; }
    const items = selected.map(el => ({
      type: el.getAttribute('data-type'),
      id: el.getAttribute('data-id')
    }));
    performDeletion(items);
  });

  /* ============================ DRAG & DROP POUR MOVE ITEM ============================ */
  explorerMainEl.addEventListener('dragover', function(e) {
    if (!e.target.closest('.folder-item')) {
      e.dataTransfer.dropEffect = "none";
      e.preventDefault();
    }
  });
  explorerMainEl.addEventListener('drop', function(e) {
    if (!e.target.closest('.folder-item')) {
      e.preventDefault();
      return;
    }
  });
  document.querySelectorAll('.explorer-item.folder-item').forEach(folder => {
    folder.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      folder.classList.add('drag-over');
    });
    folder.addEventListener('dragleave', function(e) {
      folder.classList.remove('drag-over');
    });
    folder.addEventListener('drop', function(e) {
      e.preventDefault();
      folder.classList.remove('drag-over');
      try {
        const itemData = JSON.parse(e.dataTransfer.getData('text/plain'));
        const targetId = folder.getAttribute('data-id');
        // Bloquer le drop si on tente de déposer un dossier dans lui-même
        if (itemData.type === 'directory' && itemData.id === targetId) {
          alert("Impossible de déposer un dossier dans lui-même.");
          return;
        }
        const moveUrl = `/explorer/item/${itemData.type}/${itemData.id}/move/`;
        const csrfToken = getCookie('csrftoken');
        const formData = new FormData();
        formData.append('target_directory', targetId);
        formData.append('csrfmiddlewaretoken', csrfToken);
        fetch(moveUrl, {
          method: 'POST',
          body: formData,
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            const movedItem = document.querySelector(`.explorer-item[data-type="${itemData.type}"][data-id="${itemData.id}"]`);
            if (movedItem) movedItem.remove();
          } else {
            alert('Erreur lors du déplacement: ' + (data.errors || ''));
          }
        })
        .catch(error => console.error(error));
      } catch(err) {
        console.error("Données de drop invalides", err);
      }
    });
  });

  /* ============================ MENUS CONTEXTUELS ============================ */
  const attachContextMenus = () => {
    document.querySelectorAll('.explorer-item').forEach(item => {
      if (!item.dataset.bound) bindExplorerItem(item);
    });
    explorerMainEl.addEventListener('contextmenu', function(e) {
      if (e.target.closest('.explorer-item')) return;
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll('.context-menu').forEach(menu => menu.remove());
      const menuItems = [
        { label: 'Deselect All', action: () => {
            window.selectionManager.clearSelection();
            updateDeleteButtonCount();
          }
        },
        { label: 'New Folder', action: createInlineFolder },
        { label: 'New File', action: createInlineFile }
      ];
      const menu = new ContextMenu(menuItems, { animate: true });
      menu.show(e.pageX, e.pageY);
    });
  };
  attachContextMenus();

  /* ============================ GESTION DES ÉVÈNEMENTS GLOBAUX ============================ */
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.context-menu')) {
      document.querySelectorAll('.context-menu').forEach(menu => menu.remove());
    }
    if (!e.target.closest('.explorer-item')) {
      window.selectionManager.clearSelection();
      updateDeleteButtonCount();
    }
  });
  explorerMainEl.addEventListener('dblclick', function(e) {
    const item = e.target.closest('.explorer-item');
    if (item && item.getAttribute('data-type') === 'directory') {
      window.location.href = "/explorer/drive/" + driveType + "/directory/" + item.getAttribute('data-id') + "/";
    }
  });
});
