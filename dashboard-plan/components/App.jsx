window.App = function App() {
  const { DOCK_ITEMS } = window.APP_DATA;
  const resizeRef = React.useRef(null);
  const [zCounter, setZCounter] = React.useState(200);
  const [windows, setWindows] = React.useState(
    DOCK_ITEMS.map(function(d, i) {
      return {
        id: d.id, title: d.id,
        x: window.innerWidth / 2 - d.defaultW / 2 + (i - 2) * 30,
        y: window.innerHeight / 2 - d.defaultH / 2 + (i - 2) * 25,
        width: d.defaultW, height: d.defaultH,
        minW: d.minW, minH: d.minH,
        open: false, z: 100 + i,
      };
    })
  );

  /* Global mouse handlers for resize only (drag is handled by GSAP Draggable) */
  React.useEffect(function() {
    var onMove = function(e) {
      if (resizeRef.current) {
        var ref = resizeRef.current;
        var id = ref.id, dir = ref.dir, sx = ref.sx, sy = ref.sy;
        var ox = ref.ox, oy = ref.oy, ow = ref.ow, oh = ref.oh;
        var minW = ref.minW, minH = ref.minH;
        var dx = e.clientX - sx, dy = e.clientY - sy;
        var vW = window.innerWidth, vH = window.innerHeight;
        var nX = ox, nY = oy, nW = ow, nH = oh;
        if (dir.includes('e')) nW = Math.min(vW - ox, Math.max(minW, ow + dx));
        if (dir.includes('s')) nH = Math.min(vH - oy, Math.max(minH, oh + dy));
        if (dir.includes('w')) {
          nW = Math.max(minW, ow - dx);
          nX = Math.max(0, ox + (ow - nW));
          nW = ox + ow - nX;
          nW = Math.max(minW, nW);
        }
        if (dir.includes('n')) {
          nH = Math.max(minH, oh - dy);
          nY = Math.max(0, oy + (oh - nH));
          nH = oy + oh - nY;
          nH = Math.max(minH, nH);
        }
        setWindows(function(ws) {
          return ws.map(function(w) {
            return w.id === id ? { ...w, x: nX, y: nY, width: nW, height: nH } : w;
          });
        });
      }
    };
    var onUp = function() {
      resizeRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return function() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  var bringToFront = React.useCallback(function(id) {
    setZCounter(function(z) {
      var next = z + 1;
      setWindows(function(ws) {
        return ws.map(function(w) { return w.id === id ? { ...w, z: next } : w; });
      });
      return next;
    });
  }, []);

  var openWindow = React.useCallback(function(id) {
    setZCounter(function(z) {
      var next = z + 1;
      setWindows(function(ws) {
        return ws.map(function(w) { return w.id === id ? { ...w, open: true, z: next } : w; });
      });
      return next;
    });
  }, []);

  var closeWindow = React.useCallback(function(id) {
    setWindows(function(ws) {
      return ws.map(function(w) { return w.id === id ? { ...w, open: false } : w; });
    });
  }, []);

  var onPositionSync = React.useCallback(function(id, newX, newY) {
    setWindows(function(ws) {
      return ws.map(function(w) { return w.id === id ? { ...w, x: newX, y: newY } : w; });
    });
  }, []);

  var startResize = React.useCallback(function(e, id, dir) {
    e.preventDefault();
    var win = windows.find(function(w) { return w.id === id; });
    resizeRef.current = {
      id: id, dir: dir,
      sx: e.clientX, sy: e.clientY,
      ox: win.x, oy: win.y,
      ow: win.width, oh: win.height,
      minW: win.minW, minH: win.minH
    };
  }, [windows]);

  return (
    <div className="desktop">
      <SkyLayer/>
      {/* Brand corner */}
      <div className="brand-corner">
        <CanaryLogo size={28}/>
        <div className="brand-name">Canary <em>AI</em></div>
      </div>

      {/* Center dock */}
      <Dock windows={windows} openWindow={openWindow}/>

      {/* Windows */}
      {windows.filter(function(w) { return w.open; }).map(function(win) {
        var theme = DOCK_ITEMS.find(function(d) { return d.id === win.id; });
        return (
          <AppWindow key={win.id}
            win={win}
            theme={theme}
            onClose={closeWindow}
            onFocus={bringToFront}
            onPositionSync={onPositionSync}
            onResizeStart={startResize}/>
        );
      })}
    </div>
  );
};
