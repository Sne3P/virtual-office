document.addEventListener('DOMContentLoaded', function() {
  window.dragManager = {
    makeDraggable: function(win, handle) {
      let offsetX = 0, offsetY = 0, startX = 0, startY = 0;
      let iframe = win.querySelector('iframe');
      handle.style.cursor = 'move';
      handle.addEventListener('mousedown', dragMouseDown);
      
      function dragMouseDown(e) {
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        if (iframe) { iframe.style.pointerEvents = 'none'; }
        document.addEventListener('mousemove', elementDrag);
        document.addEventListener('mouseup', stopDragging);
      }
      
      function elementDrag(e) {
        e.preventDefault();
        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;
        startX = e.clientX;
        startY = e.clientY;
        win.style.top = (win.offsetTop + offsetY) + 'px';
        win.style.left = (win.offsetLeft + offsetX) + 'px';
      }
      
      function stopDragging() {
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('mouseup', stopDragging);
        if (iframe) { iframe.style.pointerEvents = 'auto'; }
      }
    },
    bringToFront: function(win) {
      let maxZ = 0;
      document.querySelectorAll('.app-window').forEach(w => {
        const z = parseInt(window.getComputedStyle(w).zIndex) || 0;
        if (z > maxZ) maxZ = z;
      });
      win.style.zIndex = maxZ + 1;
    }
  };
});
