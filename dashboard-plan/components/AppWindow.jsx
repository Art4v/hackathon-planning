var SNAP_LAYOUTS = [
  { id: 'full',  x: 0,    y: 0,    w: 1,      h: 1   },
  { id: 'left',  x: 0,    y: 0,    w: 0.5,    h: 1   },
  { id: 'right', x: 0.5,  y: 0,    w: 0.5,    h: 1   },
  { id: 'l23',   x: 0,    y: 0,    w: 0.6667, h: 1   },
  { id: 'tl',    x: 0,    y: 0,    w: 0.5,    h: 0.5 },
  { id: 'tr',    x: 0.5,  y: 0,    w: 0.5,    h: 0.5 },
  { id: 'bl',    x: 0,    y: 0.5,  w: 0.5,    h: 0.5 },
  { id: 'br',    x: 0.5,  y: 0.5,  w: 0.5,    h: 0.5 },
];

window.AppWindow = function AppWindow({ win, theme, connectedEdges, onClose, onFocus, onDragEndWithSnap, getSnapTarget, onSnapUpdate, onResizeStart, onGroupDrag, onGroupDragEnd, registerWindowEl, onSnapToLayout }) {
  const windowRef = React.useRef(null);
  const draggableRef = React.useRef(null);

  // Store callback props in refs so GSAP callbacks always call latest versions
  const callbacksRef = React.useRef({});
  callbacksRef.current.onFocus = onFocus;
  callbacksRef.current.getSnapTarget = getSnapTarget;
  callbacksRef.current.onSnapUpdate = onSnapUpdate;
  callbacksRef.current.onDragEndWithSnap = onDragEndWithSnap;
  callbacksRef.current.onGroupDrag = onGroupDrag;
  callbacksRef.current.onGroupDragEnd = onGroupDragEnd;

  // Keep win in a ref for onDrag
  const winRef = React.useRef(win);
  winRef.current = win;

  // Snap layout popup state (null=closed, {left,top}=open at cursor)
  const [snapPopupPos, setSnapPopupPos] = React.useState(null);

  function handleTitlebarContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    var left = Math.min(e.clientX, window.innerWidth - 230);
    var top = Math.min(e.clientY, window.innerHeight - 140);
    setSnapPopupPos({ left: left, top: top });
  }

  React.useEffect(function() {
    if (!snapPopupPos) return;
    function onDown() { setSnapPopupPos(null); }
    function onKey(e) { if (e.key === 'Escape') setSnapPopupPos(null); }
    var id = setTimeout(function() {
      document.addEventListener('mousedown', onDown);
      document.addEventListener('keydown', onKey);
    }, 0);
    return function() {
      clearTimeout(id);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [snapPopupPos]);

  // Register/unregister window element
  React.useEffect(function() {
    registerWindowEl(win.id, windowRef.current);
    return function() { registerWindowEl(win.id, null); };
  }, [win.id, registerWindowEl]);

  /* GSAP window-open animation */
  React.useEffect(function() {
    if (windowRef.current) {
      gsap.fromTo(windowRef.current,
        { opacity: 0, scale: 0.94 },
        { opacity: 1, scale: 1, duration: 0.18, ease: 'power2.out',
          onComplete: function() {
            gsap.set(windowRef.current, { clearProps: 'scale,opacity' });
          }
        }
      );
    }
  }, []);

  /* GSAP Draggable for window drag */
  React.useEffect(function() {
    if (!windowRef.current) return;

    var instances = Draggable.create(windowRef.current, {
      type: 'top,left',
      trigger: windowRef.current.querySelector('.win-titlebar'),
      zIndexBoost: false,
      cursor: 'grab',
      activeCursor: 'grabbing',
      onDragStart: function() {
        callbacksRef.current.onFocus(winRef.current.id);
      },
      onDrag: function() {
        var el = windowRef.current;
        var w = winRef.current;
        var x = parseFloat(el.style.left), y = parseFloat(el.style.top);
        var vW = window.innerWidth;

        // Screen edge snap detection (ungrouped only)
        var screenSnap = null;
        if (!w.groupId) {
          if (x < 40) screenSnap = 'left';
          else if (x + w.width > vW - 40) screenSnap = 'right';
        }

        if (w.groupId) {
          // Group drag — move siblings imperatively
          var dx = x - w.x, dy = y - w.y;
          callbacksRef.current.onGroupDrag(w.id, w.groupId, dx, dy);
          // Snap detection against external windows only
          var snap = callbacksRef.current.getSnapTarget(w.id, x, y, w.width, w.height, w.groupId);
          callbacksRef.current.onSnapUpdate(snap, w.width, w.height, null);
        } else {
          var snap2 = callbacksRef.current.getSnapTarget(w.id, x, y, w.width, w.height);
          callbacksRef.current.onSnapUpdate(snap2, w.width, w.height, screenSnap);
        }
      },
      onDragEnd: function() {
        var el = windowRef.current;
        var w = winRef.current;
        var newX = parseFloat(el.style.left), newY = parseFloat(el.style.top);

        if (w.groupId) {
          var dx = newX - w.x, dy = newY - w.y;
          callbacksRef.current.onGroupDragEnd(w.id, w.groupId, dx, dy);
        } else {
          callbacksRef.current.onDragEndWithSnap(w.id, newX, newY);
        }
      }
    });
    draggableRef.current = instances[0];

    return function() {
      if (draggableRef.current) draggableRef.current.kill();
    };
  }, [win.id]);

  // Compute conditional border-radius and border based on connected edges
  var has = connectedEdges || {};
  var R = 16;
  var borderRadius = [
    (has.top || has.left) ? 0 : R,
    (has.top || has.right) ? 0 : R,
    (has.bottom || has.right) ? 0 : R,
    (has.bottom || has.left) ? 0 : R,
  ].map(function(r) { return r + 'px'; }).join(' ');

  var borderStyle = {
    borderTop: has.top ? 'none' : '2px solid ' + theme.border,
    borderRight: has.right ? 'none' : '2px solid ' + theme.border,
    borderBottom: has.bottom ? 'none' : '2px solid ' + theme.border,
    borderLeft: has.left ? 'none' : '2px solid ' + theme.border,
    borderRadius: borderRadius,
  };

  return (
    <div className="app-window" ref={windowRef}
      style={{
        left: win.x, top: win.y,
        width: win.width, height: win.height,
        zIndex: win.z,
        ...borderStyle,
      }}
      onMouseDown={function() { onFocus(win.id); }}>
      <div className="win-titlebar"
        onContextMenu={handleTitlebarContextMenu}
        style={{ background: theme.bg, borderBottomColor: theme.border }}>
        <span className="win-title" style={{ color: theme.iconColor }}>{win.id}</span>
        <div className="win-actions">
          <button className="win-close" style={{ color: theme.iconColor }}
            onMouseDown={function(e) { e.stopPropagation(); }}
            onClick={function() { onClose(win.id); }}>[x]</button>
        </div>
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
      {snapPopupPos && (
        <div className="snap-layout-popup"
          style={{ left: snapPopupPos.left, top: snapPopupPos.top }}
          onMouseDown={function(e) { e.stopPropagation(); }}>
          {SNAP_LAYOUTS.map(function(layout) {
            return (
              <div key={layout.id} className="snap-layout-item"
                onClick={function() {
                  setSnapPopupPos(null);
                  onSnapToLayout(win.id, layout);
                }}>
                <div className="snap-layout-screen">
                  <div className="snap-layout-highlight" style={{
                    left: (layout.x * 100) + '%',
                    top: (layout.y * 100) + '%',
                    width: (layout.w * 100) + '%',
                    height: (layout.h * 100) + '%',
                  }}/>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
