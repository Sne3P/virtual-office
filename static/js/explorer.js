document.addEventListener('DOMContentLoaded', function() {
  // Toggle view (grid <-> list) via URL parameter (rechargement de page)
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

  // Initialize SelectionManager on explorer-content
  const explorerContent = document.querySelector('#explorer-main .explorer-content');
  if (explorerContent) {
    window.explorerSelectionManager = new SelectionManager(
      explorerContent,
      '.explorer-item',
      function(selectedItems) {
        console.log('Selected items:', selectedItems);
      },
      { exclusionSelectors: ['#explorer-actions', '#drive-selector'] }
    );
  }

  // Drag & Drop implementation for rearranging items
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

  // Attach context menus for items and background
  function attachContextMenus() {
    // Context menu on explorer items
    document.querySelectorAll('.explorer-item').forEach(item => {
      item.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        document.querySelectorAll('.context-menu').forEach(menu => menu.remove());
        const itemTitle = item.querySelector('.item-title').textContent;
        const itemType = item.getAttribute('data-type'); // 'file' or 'directory'
        const menuItems = [
          {
            label: 'Delete',
            action: function() {
              if (confirm('Delete "' + itemTitle + '"?')) {
                window.location.href = "{% url 'explorer:delete_item' 'REPLACE_TYPE' 'REPLACE_ID' %}"
                  .replace('REPLACE_TYPE', itemType)
                  .replace('REPLACE_ID', item.getAttribute('data-id'));
              }
            }
          },
          {
            label: 'Rename',
            action: function() {
              window.location.href = "{% url 'explorer:rename_item' 'REPLACE_TYPE' 'REPLACE_ID' %}"
                .replace('REPLACE_TYPE', itemType)
                .replace('REPLACE_ID', item.getAttribute('data-id'));
            }
          }
        ];
        if (itemType === 'directory') {
          menuItems.push({
            label: 'Open Folder',
            action: function() {
              window.location.href = item.getAttribute('data-id') + '/';
            }
          });
        }
        menuItems.push({
          label: 'Move',
          action: function() {
            window.location.href = "{% url 'explorer:move_item' 'REPLACE_TYPE' 'REPLACE_ID' %}"
              .replace('REPLACE_TYPE', itemType)
              .replace('REPLACE_ID', item.getAttribute('data-id'));
          }
        });
        const menu = new ContextMenu(menuItems, { animate: true });
        menu.show(e.pageX, e.pageY);
      });
    });

    // Context menu on background of explorer-main
    const explorerMainEl = document.getElementById('explorer-main');
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
            window.location.href = "{% url 'explorer:create_directory' current_directory.id %}";
          }
        },
        {
          label: 'New File',
          action: function() {
            window.location.href = "{% url 'explorer:upload_file' current_directory.id %}";
          }
        }
      ];
      const menu = new ContextMenu(menuItems, { animate: true });
      menu.show(e.pageX, e.pageY);
    });
  }
  attachContextMenus();

  // Global click: close context menus and clear selection if clicking outside items
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

  // Delete Selected: submit hidden form with selected items
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
