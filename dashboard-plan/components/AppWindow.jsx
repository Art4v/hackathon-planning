window.AppWindow = function AppWindow({ win, theme, onClose, onFocus, onDragEndWithSnap, getSnapTarget, onSnapUpdate, onResizeStart, onTabClick, onTabDetach }) {
  const windowRef = React.useRef(null);
  const draggableRef = React.useRef(null);

  // Store callback props in refs so GSAP callbacks always call latest versions
  // without triggering Draggable re-creation
  const callbacksRef = React.useRef({});
  callbacksRef.current.onFocus = onFocus;
  callbacksRef.current.getSnapTarget = getSnapTarget;
  callbacksRef.current.onSnapUpdate = onSnapUpdate;
  callbacksRef.current.onDragEndWithSnap = onDragEndWithSnap;

  // Keep win dimensions in a ref for onDrag (avoids dep on win.width/height)
  const winRef = React.useRef(win);
  winRef.current = win;

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
        callbacksRef.current.onFocus(winRef.current.id);
      },
      onDrag: function() {
        var el = windowRef.current;
        var w = winRef.current;
        var x = parseFloat(el.style.left), y = parseFloat(el.style.top);
        var snap = callbacksRef.current.getSnapTarget(w.id, x, y, w.width, w.height);
        callbacksRef.current.onSnapUpdate(snap);
      },
      onDragEnd: function() {
        var el = windowRef.current;
        var newX = parseFloat(el.style.left), newY = parseFloat(el.style.top);
        callbacksRef.current.onDragEndWithSnap(winRef.current.id, newX, newY);
      }
    });
    draggableRef.current = instances[0];

    return function() {
      if (draggableRef.current) draggableRef.current.kill();
    };
  }, [win.id]);

  var displayId = win.tabs ? win.activeTab : win.id;
  var displayTitle = displayId;

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
        <span className="win-title" style={{ color: theme.iconColor }}>{displayTitle}</span>
        <button className="win-close" style={{ color: theme.iconColor }}
          onMouseDown={function(e) { e.stopPropagation(); }}
          onClick={function() { onClose(win.id); }}>[x]</button>
      </div>
      {win.tabs && (
        <div className="tab-bar">
          {win.tabs.map(function(tab) {
            return (
              <div key={tab.id}
                className={"tab-item" + (win.activeTab === tab.id ? " active" : "")}
                onClick={function() { onTabClick(win.id, tab.id); }}>
                <span className="tab-label">{tab.id}</span>
                {win.tabs.length > 1 && (
                  <span className="tab-detach"
                    onMouseDown={function(e) { e.stopPropagation(); onTabDetach(e, win.id, tab.id); }}>
                    &#x22EE;&#x22EE;
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
      <div className="win-body" onMouseDown={function(e) { e.stopPropagation(); }} style={{ cursor: 'default' }}>
        <WindowContent id={displayId}/>
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
