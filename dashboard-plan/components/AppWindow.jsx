window.AppWindow = function AppWindow({ win, theme, connectedEdges, onClose, onFocus, onDragEndWithSnap, getSnapTarget, onSnapUpdate, onResizeStart, onGroupDrag, onGroupDragEnd, registerWindowEl }) {
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

        if (w.groupId) {
          // Group drag — move siblings imperatively
          var dx = x - w.x, dy = y - w.y;
          callbacksRef.current.onGroupDrag(w.id, w.groupId, dx, dy);
          // Snap detection against external windows only
          var snap = callbacksRef.current.getSnapTarget(w.id, x, y, w.width, w.height, w.groupId);
          callbacksRef.current.onSnapUpdate(snap, w.width, w.height);
        } else {
          var snap2 = callbacksRef.current.getSnapTarget(w.id, x, y, w.width, w.height);
          callbacksRef.current.onSnapUpdate(snap2, w.width, w.height);
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
        style={{ background: theme.bg, borderBottomColor: theme.border }}>
        <span className="win-title" style={{ color: theme.iconColor }}>{win.id}</span>
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
