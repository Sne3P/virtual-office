document.addEventListener('DOMContentLoaded', function() {
  // Toggle view: grid <-> list via URL redirection
  const toggleViewBtn = document.getElementById('toggle-view');
  const explorerMain = document.getElementById('explorer-main');
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

  // Bouton "New Folder" déclenche la création inline d'un dossier
  const newFolderBtn = document.getElementById('new-folder-btn');
  newFolderBtn.addEventListener('click', function(e) {
    e.preventDefault();
    createInlineFolder();
  });

  // Bouton "New File" déclenche la création inline d'un fichier
  const newFileBtn = document.getElementById('new-file-btn');
  newFileBtn.addEventListener('click', function(e) {
    e.preventDefault();
    createInlineFile();
  });

  // Fonction de création inline d'un dossier
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

    function finishFolderCreation() {
      const name = input.value.trim();
      if (name === '') {
        newFolderDiv.remove();
        return;
      }
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
          alert('Error creating folder.');
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

  // Fonction de création inline d'un fichier
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

    input.addEventListener('change', function(e) {
      const file = input.files[0];
      if (!file) {
        newFileDiv.remove();
        return;
      }
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
        if (data.success) {
          window.location.reload();
        } else {
          alert('Error uploading file.');
          newFileDiv.remove();
        }
      })
      .catch(error => {
        console.error(error);
        newFileDiv.remove();
      });
    });
    input.addEventListener('blur', function() {
      if (!input.files || !input.files[0]) {
        newFileDiv.remove();
      }
    });
  }

  // Utility: obtenir le CSRF token depuis les cookies
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  // Initialiser le SelectionManager sur toute la zone principale
  const explorerMainEl = document.getElementById('explorer-main');
  if (explorerMainEl) {
    window.explorerSelectionManager = new SelectionManager(
      explorerMainEl,
      '.explorer-item',
      function(selectedItems) {
        console.log('Selected items:', selectedItems);
      },
      { exclusionSelectors: ['#explorer-actions', '#drive-selector', '#explorer-breadcrumbs'] }
    );
  }

  // Drag & Drop pour réarranger les éléments
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
  function handleDragEnter(e) {
    this.classList.add('over');
  }
  function handleDragLeave(e) {
    this.classList.remove('over');
  }
  function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    if (dragSrcEl !== this) {
      const srcHTML = dragSrcEl.outerHTML;
      dragSrcEl.outerHTML = this.outerHTML;
      this.outerHTML = srcHTML;
      initDraggableItems();
      // Optionnel : envoyer l'ordre mis à jour au backend
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

  // URL templates pour actions contextuelles (injectées depuis le template)
  var deleteUrlTemplate = window.deleteUrlTemplate || "";
  var renameUrlTemplate = window.renameUrlTemplate || "";
  var moveUrlTemplate = window.moveUrlTemplate || "";

  // Attacher les menus contextuels aux items et au fond
  function attachContextMenus() {
    document.querySelectorAll('.explorer-item').forEach(item => {
      item.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        document.querySelectorAll('.context-menu').forEach(menu => menu.remove());
        const itemTitle = item.querySelector('.item-title').textContent;
        const itemType = item.getAttribute('data-type');
        const menuItems = [
          {
            label: 'Delete',
            action: function() {
              if (confirm('Delete "' + itemTitle + '"?')) {
                var url = deleteUrlTemplate.replace("TYPE_PLACEHOLDER", itemType)
                                             .replace("ID_PLACEHOLDER", item.getAttribute('data-id'));
                window.location.href = url;
              }
            }
          },
          {
            label: 'Rename',
            action: function() {
              window.location.href = renameUrlTemplate.replace("TYPE_PLACEHOLDER", itemType)
                                                      .replace("ID_PLACEHOLDER", item.getAttribute('data-id'));
            }
          }
        ];
        if (itemType === 'directory') {
          menuItems.push({
            label: 'Open Folder',
            action: function() {
              window.location.href = "directory/" + item.getAttribute('data-id') + "/";
            }
          });
        }
        menuItems.push({
          label: 'Move',
          action: function() {
            window.location.href = moveUrlTemplate.replace("TYPE_PLACEHOLDER", itemType)
                                                  .replace("ID_PLACEHOLDER", item.getAttribute('data-id'));
          }
        });
        const menu = new ContextMenu(menuItems, { animate: true });
        menu.show(e.pageX, e.pageY);
      });
    });

    // Menu contextuel sur le fond de la zone principale
    explorerMainEl.addEventListener('contextmenu', function(e) {
      if (e.target.closest('.explorer-item')) return;
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll('.context-menu').forEach(menu => menu.remove());
      const menuItems = [
        {
          label: 'Deselect All',
          action: function() {
            if (window.explorerSelectionManager) {
              window.explorerSelectionManager._clearSelection();
              window.explorerSelectionManager.onSelect([]);
            }
          }
        },
        {
          label: 'New Folder',
          action: function() {
            createInlineFolder();
          }
        },
        {
          label: 'New File',
          action: function() {
            createInlineFile();
          }
        }
      ];
      const menu = new ContextMenu(menuItems, { animate: true });
      menu.show(e.pageX, e.pageY);
    });
  }
  attachContextMenus();

  // Global click: fermer les context menus et désélectionner si clic en dehors
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

  // Double-clic pour ouvrir un dossier (redirige vers "directory/<id>/")
  explorerMainEl.addEventListener('dblclick', function(e) {
    const item = e.target.closest('.explorer-item');
    if (item && item.getAttribute('data-type') === 'directory') {
      window.location.href = "directory/" + item.getAttribute('data-id') + "/";
    }
  });

  // Delete Selected: soumettre le formulaire caché avec les IDs sélectionnés
  const deleteSelectedBtn = document.getElementById('delete-selected-btn');
  deleteSelectedBtn.addEventListener('click', function() {
    if (window.explorerSelectionManager) {
      const selectedItems = Array.from(window.explorerSelectionManager.selectedElements);
      if (selectedItems.length === 0) {
        alert('No items selected.');
        return;
      }
      if (!confirm('Delete ' + selectedItems.length + ' selected item(s)?')) return;
      const selectedStr = selectedItems.map(el => el.getAttribute('data-type') + '-' + el.getAttribute('data-id')).join(',');
      document.getElementById('delete-selected-input').value = selectedStr;
      document.getElementById('delete-selected-form').submit();
    }
  });
});
