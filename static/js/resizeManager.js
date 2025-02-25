document.addEventListener('DOMContentLoaded', function() {
  window.resizeManager = {
    makeResizable: function(win) {
      const minWidth = 200;
      const minHeight = 150;
      const handles = [
        { cls: 'resizer bottom-right', cursor: 'nwse-resize' },
        { cls: 'resizer top', cursor: 'ns-resize' },
        { cls: 'resizer right', cursor: 'ew-resize' },
        { cls: 'resizer bottom', cursor: 'ns-resize' },
        { cls: 'resizer left', cursor: 'ew-resize' }
      ];
      let currentHandle = null;
      let startX, startY, startWidth, startHeight, startLeft, startTop;
      
      const iframe = win.querySelector('iframe');
      
      handles.forEach(config => {
        const handle = document.createElement('div');
        handle.className = config.cls;
        handle.style.cursor = config.cursor;
        handle.style.position = 'absolute';
        if (config.cls.indexOf('bottom-right') > -1) {
          handle.style.right = '-5px';
          handle.style.bottom = '-5px';
        } else if (config.cls.indexOf('top') > -1 && config.cls.indexOf('top') === 0) {
          handle.style.top = '-5px';
          handle.style.left = '50%';
          handle.style.transform = 'translateX(-50%)';
        } else if (config.cls.indexOf('right') > -1 && config.cls.indexOf('bottom-right') === -1) {
          handle.style.right = '-5px';
          handle.style.top = '50%';
          handle.style.transform = 'translateY(-50%)';
        } else if (config.cls.indexOf('bottom') > -1 && config.cls.indexOf('bottom-right') === -1) {
          handle.style.bottom = '-5px';
          handle.style.left = '50%';
          handle.style.transform = 'translateX(-50%)';
        } else if (config.cls.indexOf('left') > -1) {
          handle.style.left = '-5px';
          handle.style.top = '50%';
          handle.style.transform = 'translateY(-50%)';
        }
        win.appendChild(handle);
        
        handle.addEventListener('mousedown', function(e) {
          e.preventDefault();
          currentHandle = handle;
          const rect = win.getBoundingClientRect();
          startX = e.clientX;
          startY = e.clientY;
          startWidth = rect.width;
          startHeight = rect.height;
          startLeft = rect.left;
          startTop = rect.top;
          if (iframe) { iframe.style.pointerEvents = 'none'; }
          document.addEventListener('mousemove', resize);
          document.addEventListener('mouseup', stopResize);
        });
      });
      
      function resize(e) {
        if (!currentHandle) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        if (currentHandle.classList.contains('bottom-right')) {
          const newWidth = Math.max(startWidth + dx, minWidth);
          const newHeight = Math.max(startHeight + dy, minHeight);
          win.style.width = newWidth + 'px';
          win.style.height = newHeight + 'px';
        } else if (currentHandle.classList.contains('top')) {
          const newHeight = Math.max(startHeight - dy, minHeight);
          win.style.height = newHeight + 'px';
          win.style.top = (startTop + dy) + 'px';
        } else if (currentHandle.classList.contains('right')) {
          const newWidth = Math.max(startWidth + dx, minWidth);
          win.style.width = newWidth + 'px';
        } else if (currentHandle.classList.contains('bottom')) {
          const newHeight = Math.max(startHeight + dy, minHeight);
          win.style.height = newHeight + 'px';
        } else if (currentHandle.classList.contains('left')) {
          const newWidth = Math.max(startWidth - dx, minWidth);
          win.style.width = newWidth + 'px';
          win.style.left = (startLeft + dx) + 'px';
        }
      }
      
      function stopResize() {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
        if (iframe) { iframe.style.pointerEvents = 'auto'; }
        currentHandle = null;
      }
    }
  };
});
