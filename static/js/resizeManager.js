// static/js/resizeManager.js
document.addEventListener('DOMContentLoaded', function() {
    window.resizeManager = {
      makeResizable: function(win) {
        const resizer = document.createElement('div');
        resizer.className = 'resizer';
        win.appendChild(resizer);
        resizer.addEventListener('mousedown', initResize);
        function initResize(e) {
          e.preventDefault();
          document.addEventListener('mousemove', Resize);
          document.addEventListener('mouseup', stopResize);
        }
        function Resize(e) {
          const rect = win.getBoundingClientRect();
          win.style.width = (e.clientX - rect.left) + 'px';
          win.style.height = (e.clientY - rect.top) + 'px';
        }
        function stopResize() {
          document.removeEventListener('mousemove', Resize);
          document.removeEventListener('mouseup', stopResize);
        }
      }
    };
  });
  