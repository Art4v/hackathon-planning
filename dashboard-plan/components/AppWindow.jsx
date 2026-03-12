window.AppWindow = function AppWindow({ win, theme, onClose, onFocus, onPositionSync, onResizeStart }) {
  const windowRef = React.useRef(null);
  const draggableRef = React.useRef(null);

  /* GSAP window-open animation */
  React.useEffect(function() {
    if (windowRef.current) {
      gsap.fromTo(windowRef.current,
        { opacity: 0, scale: 0.94 },
        { opacity: 1, scale: 1, duration: 0.18, ease: 'power2.out',
          onComplete: function() {
            /* Clear inline transform so Draggable starts clean */
            gsap.set(windowRef.current, { clearProps: 'scale,opacity' });
          }
        }
      );
    }
  }, []);

  /* GSAP Draggable for window drag (using top/left) */
  React.useEffect(function() {
    if (!windowRef.current) return;

    var instances = Draggable.create(windowRef.current, {
      type: 'top,left',
      trigger: windowRef.current.querySelector('.win-titlebar'),
      bounds: '.desktop',
      zIndexBoost: false,
      cursor: 'grab',
      activeCursor: 'grabbing',
      onDragStart: function() {
        onFocus(win.id);
      },
      onDragEnd: function() {
        var el = windowRef.current;
        onPositionSync(win.id, parseFloat(el.style.left), parseFloat(el.style.top));
      }
    });
    draggableRef.current = instances[0];

    return function() {
      if (draggableRef.current) draggableRef.current.kill();
    };
  }, [win.id, onFocus, onPositionSync]);

  return (
    <div className="app-window" ref={windowRef}
      style={{
        left: win.x, top: win.y,
        width: win.width, height: win.height,
        zIndex: win.z,
        borderColor: theme.border
      }}
      onMouseDown={function() { onFocus(win.id); }}>
      <div className="win-titlebar"
        style={{ background: theme.bg, borderBottomColor: theme.border }}>
        <span className="win-title" style={{ color: theme.iconColor }}>{win.title}</span>
        <button className="win-close" style={{ color: theme.iconColor }}
          onMouseDown={function(e) { e.stopPropagation(); }}
          onClick={function() { onClose(win.id); }}>[x]</button>
      </div>
      <div className="win-body" onMouseDown={function(e) { e.stopPropagation(); }} style={{ cursor: 'default' }}>
        <WindowContent id={win.id}/>
      </div>
      {['n','ne','e','se','s','sw','w','nw'].map(function(dir) {
        return (
          <div key={dir} className={'rh rh-' + dir}
            onMouseDown={function(e) {
              e.stopPropagation();
              if (e.button === 0) onResizeStart(e, win.id, dir);
            }}/>
        );
      })}
    </div>
  );
};
