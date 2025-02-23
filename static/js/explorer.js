document.addEventListener('DOMContentLoaded', function() {
  // Initialisation du SelectionManager pour la zone d'affichage de l'explorer
  const explorerContent = document.querySelector('#explorer-main .explorer-content');
  if (explorerContent) {
    window.explorerSelectionManager = new SelectionManager(explorerContent, '.explorer-item', function(selectedItems) {
      console.log('Items sélectionnés dans Explorer:', selectedItems);
    });
  }
  
  // Ajoute un context menu sur chaque élément explorer (dossier ou fichier)
  document.querySelectorAll('.explorer-item').forEach(item => {
    item.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const isFolder = item.classList.contains('folder-item');
      const menuItems = [];
      if (isFolder) {
        menuItems.push({ label: 'Open Folder', action: () => {
          window.location.href = item.getAttribute('data-id') + '/';
        }});
        menuItems.push({ label: 'Delete Folder', action: () => {
          if (confirm('Delete folder: ' + item.querySelector('.item-title').textContent + '?')) {
            // Implémenter la suppression via AJAX ou redirection
            alert('Folder deleted (fonctionnalité à implémenter)');
          }
        }});
      } else {
        menuItems.push({ label: 'Open File', action: () => {
          alert('Open file: ' + item.querySelector('.item-title').textContent);
        }});
        menuItems.push({ label: 'Delete File', action: () => {
          if (confirm('Delete file: ' + item.querySelector('.item-title').textContent + '?')) {
            alert('File deleted (fonctionnalité à implémenter)');
          }
        }});
      }
      const menu = new ContextMenu(menuItems, { animate: true });
      menu.show(e.pageX, e.pageY);
    });
  });
  
  // Gestion des boutons dans la barre d'en-tête
  const btnUpload = document.getElementById('btn-upload');
  const btnNewFolder = document.getElementById('btn-new-folder');
  const btnSortName = document.getElementById('btn-sort-name');
  const btnSortDate = document.getElementById('btn-sort-date');
  
  if (btnUpload) {
    btnUpload.addEventListener('click', function() {
      window.location.href = window.location.pathname + 'upload/';
    });
  }
  if (btnNewFolder) {
    btnNewFolder.addEventListener('click', function() {
      window.location.href = window.location.pathname + 'create/';
    });
  }
  if (btnSortName) {
    btnSortName.addEventListener('click', function() {
      const url = new URL(window.location.href);
      url.searchParams.set('sort', 'name');
      window.location.href = url.toString();
    });
  }
  if (btnSortDate) {
    btnSortDate.addEventListener('click', function() {
      const url = new URL(window.location.href);
      url.searchParams.set('sort', 'uploaded_at');
      window.location.href = url.toString();
    });
  }
});
