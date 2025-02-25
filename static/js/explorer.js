// explorer/static/js/explorer.js
document.addEventListener('DOMContentLoaded', function() {
  // Initialiser le SelectionManager pour la zone principale de l'explorer
  const explorerContent = document.querySelector('#explorer-main .explorer-content');
  if (explorerContent) {
    window.explorerSelectionManager = new SelectionManager(
      explorerContent,
      '.explorer-item',
      function(selectedItems) {
        console.log('Éléments sélectionnés :', selectedItems);
      }
    );
  }
  
  // Ouverture par double-clic sur les dossiers
  document.querySelectorAll('.folder-item').forEach(item => {
    item.addEventListener('dblclick', function() {
      const folderId = item.getAttribute('data-id');
      window.location.href = folderId + '/';
    });
  });
  
  // Context menu sur chaque élément explorer
  document.querySelectorAll('.explorer-item').forEach(item => {
    item.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const isFolder = item.classList.contains('folder-item');
      const menuItems = [];
      menuItems.push({
        label: 'Delete',
        action: () => {
          if (confirm('Confirmez la suppression de "' + item.querySelector('.item-title').textContent + '" ?')) {
            // Implémenter la suppression via une vue ou formulaire POST
            alert('Suppression à implémenter');
          }
        }
      });
      menuItems.push({
        label: 'Rename',
        action: () => {
          // Afficher un prompt pour renommer et rediriger vers une vue de renommage
          const newName = prompt('Nouveau nom pour "' + item.querySelector('.item-title').textContent + '":');
          if (newName) {
            alert('Renommage à implémenter');
          }
        }
      });
      if (isFolder) {
        menuItems.push({
          label: 'Open Folder',
          action: () => {
            window.location.href = item.getAttribute('data-id') + '/';
          }
        });
      }
      menuItems.push({
        label: 'Create Text File',
        action: () => {
          alert('Création d\'un fichier texte à implémenter');
        }
      });
      const menu = new ContextMenu(menuItems, { animate: true });
      menu.show(e.pageX, e.pageY);
    });
  });
  
  // Gestion des boutons dans l'en-tête
  const btnSortName = document.getElementById('btn-sort-name');
  const btnSortDate = document.getElementById('btn-sort-date');
  
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
