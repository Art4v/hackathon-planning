window.App = function App() {
  const { DOCK_ITEMS } = window.APP_DATA;
  const SNAP_THRESHOLD = 30;
  const resizeRef = React.useRef(null);
  const windowsRef = React.useRef(null);
  const getSnapTargetRef = React.useRef(null);
  const [zCounter, setZCounter] = React.useState(200);
  const [snapIndicator, setSnapIndicator] = React.useState(null);
  const [windows, setWindows] = React.useState(
    DOCK_ITEMS.map(function(d, i) {
      return {
        id: d.id, title: d.id,
        x: window.innerWidth / 2 - d.defaultW / 2 + (i - 2) * 30,
        y: window.innerHeight / 2 - d.defaultH / 2 + (i - 2) * 25,
        width: d.defaultW, height: d.defaultH,
        minW: d.minW, minH: d.minH,
        open: false, z: 100 + i,
        tabs: null, activeTab: null,
      };
    })
  );

  // Keep windowsRef in sync every render
  windowsRef.current = windows;

  /* ── Snap detection ── */
  var getSnapTarget = React.useCallback(function(draggedId, x, y, w, h) {
    var ws = windowsRef.current;
    var best = null;
    var bestDist = Infinity;
    var dr = x + w, db = y + h;

    for (var i = 0; i < ws.length; i++) {
      var t = ws[i];
      if (t.id === draggedId || !t.open) continue;
      var tr = t.x + t.width, tb = t.y + t.height;

      // perpendicular overlap checks
      var overlapX = Math.max(0, Math.min(dr, tr) - Math.max(x, t.x));
      var overlapY = Math.max(0, Math.min(db, tb) - Math.max(y, t.y));
      var minOverlapX = Math.min(w, t.width) * 0.5;
      var minOverlapY = Math.min(h, t.height) * 0.5;

      var edges = [
        { dist: Math.abs(dr - t.x), ok: overlapY >= minOverlapY, edge: 'right' },
        { dist: Math.abs(x - tr),   ok: overlapY >= minOverlapY, edge: 'left' },
        { dist: Math.abs(db - t.y), ok: overlapX >= minOverlapX, edge: 'bottom' },
        { dist: Math.abs(y - tb),   ok: overlapX >= minOverlapX, edge: 'top' },
      ];

      for (var j = 0; j < edges.length; j++) {
        if (edges[j].ok && edges[j].dist < SNAP_THRESHOLD && edges[j].dist < bestDist) {
          bestDist = edges[j].dist;
          best = { targetId: t.id, edge: edges[j].edge, rect: { x: t.x, y: t.y, width: t.width, height: t.height } };
        }
      }
    }
    return best;
  }, []);

  // Store getSnapTarget in a ref so AppWindow can call it stably
  getSnapTargetRef.current = getSnapTarget;
  var getSnapTargetStable = React.useCallback(function() {
    return getSnapTargetRef.current.apply(null, arguments);
  }, []);

  /* ── Global mouse handlers for resize ── */
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

  /* ── Open window (handles absorbed tabs) ── */
  var openWindow = React.useCallback(function(id) {
    setZCounter(function(z) {
      var next = z + 1;
      setWindows(function(ws) {
        // Check if this window is absorbed as a tab in another window
        var host = ws.find(function(w) { return w.open && w.tabs && w.tabs.some(function(t) { return t.id === id; }); });
        if (host) {
          // Switch to that tab and bring host to front
          return ws.map(function(w) {
            return w.id === host.id ? { ...w, activeTab: id, z: next } : w;
          });
        }
        // Normal open
        return ws.map(function(w) { return w.id === id ? { ...w, open: true, z: next } : w; });
      });
      return next;
    });
  }, []);

  /* ── Close window (un-merge on close) ── */
  var closeWindow = React.useCallback(function(id) {
    setWindows(function(ws) {
      return ws.map(function(w) {
        if (w.id === id) {
          return { ...w, open: false, tabs: null, activeTab: null };
        }
        return w;
      });
    });
  }, []);

  /* ── Position sync (fallback for normal drag) ── */
  var onPositionSync = React.useCallback(function(id, newX, newY) {
    setWindows(function(ws) {
      return ws.map(function(w) { return w.id === id ? { ...w, x: newX, y: newY } : w; });
    });
  }, []);

  /* ── Snap update (called during drag) ── */
  var onSnapUpdate = React.useCallback(function(snap) {
    if (snap) {
      setSnapIndicator({ x: snap.rect.x, y: snap.rect.y, width: snap.rect.width, height: snap.rect.height });
    } else {
      setSnapIndicator(null);
    }
  }, []);

  /* ── Drag end with snap merge ── */
  var onDragEndWithSnap = React.useCallback(function(draggedId, newX, newY) {
    setSnapIndicator(null);

    // We need current windows to check snap
    setWindows(function(ws) {
      var dragged = ws.find(function(w) { return w.id === draggedId; });
      if (!dragged) return ws;

      // Recalculate snap against current state
      var best = null;
      var bestDist = Infinity;
      var dr = newX + dragged.width, db = newY + dragged.height;

      for (var i = 0; i < ws.length; i++) {
        var t = ws[i];
        if (t.id === draggedId || !t.open) continue;
        var tr = t.x + t.width, tb = t.y + t.height;
        var overlapX = Math.max(0, Math.min(dr, tr) - Math.max(newX, t.x));
        var overlapY = Math.max(0, Math.min(db, tb) - Math.max(newY, t.y));
        var minOverlapX = Math.min(dragged.width, t.width) * 0.5;
        var minOverlapY = Math.min(dragged.height, t.height) * 0.5;
        var edges = [
          { dist: Math.abs(dr - t.x), ok: overlapY >= minOverlapY },
          { dist: Math.abs(newX - tr), ok: overlapY >= minOverlapY },
          { dist: Math.abs(db - t.y), ok: overlapX >= minOverlapX },
          { dist: Math.abs(newY - tb), ok: overlapX >= minOverlapX },
        ];
        for (var j = 0; j < edges.length; j++) {
          if (edges[j].ok && edges[j].dist < SNAP_THRESHOLD && edges[j].dist < bestDist) {
            bestDist = edges[j].dist;
            best = { targetId: t.id };
          }
        }
      }

      if (!best) {
        // No snap — just update position
        return ws.map(function(w) { return w.id === draggedId ? { ...w, x: newX, y: newY } : w; });
      }

      // Merge dragged into target (host)
      var hostId = best.targetId;
      return ws.map(function(w) {
        if (w.id === hostId) {
          var hostTabs = w.tabs || [{ id: w.id }];
          var guestTabs = dragged.tabs || [{ id: dragged.id }];
          var allTabs = hostTabs.concat(guestTabs);
          return {
            ...w,
            tabs: allTabs,
            activeTab: w.activeTab || w.id,
            width: Math.max(w.width, dragged.width),
            height: Math.max(w.height, dragged.height),
            minW: Math.max(w.minW, dragged.minW),
            minH: Math.max(w.minH, dragged.minH),
          };
        }
        if (w.id === draggedId) {
          return { ...w, open: false, tabs: null, activeTab: null };
        }
        // Also close any windows that were tabs of the dragged window
        if (dragged.tabs && dragged.tabs.some(function(t) { return t.id === w.id; })) {
          return w; // already closed
        }
        return w;
      });
    });
  }, []);

  /* ── Tab click ── */
  var onTabClick = React.useCallback(function(hostId, tabId) {
    setWindows(function(ws) {
      return ws.map(function(w) {
        return w.id === hostId ? { ...w, activeTab: tabId } : w;
      });
    });
  }, []);

  /* ── Tab detach (drag out) ── */
  var onTabDetach = React.useCallback(function(e, hostId, tabId) {
    e.preventDefault();
    var startX = e.clientX, startY = e.clientY;

    // Create ghost element
    var ghost = document.createElement('div');
    ghost.className = 'tab-drag-ghost';
    ghost.textContent = tabId;
    ghost.style.left = startX + 10 + 'px';
    ghost.style.top = startY - 15 + 'px';
    document.body.appendChild(ghost);

    var onMove = function(ev) {
      ghost.style.left = ev.clientX + 10 + 'px';
      ghost.style.top = ev.clientY - 15 + 'px';
    };

    var onUp = function(ev) {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.removeChild(ghost);

      // Check distance from host window
      var dropX = ev.clientX, dropY = ev.clientY;

      setWindows(function(ws) {
        var host = ws.find(function(w) { return w.id === hostId; });
        if (!host) return ws;

        // Check if cursor is far enough from host
        var inX = dropX >= host.x - 60 && dropX <= host.x + host.width + 60;
        var inY = dropY >= host.y - 60 && dropY <= host.y + host.height + 60;
        if (inX && inY) return ws; // Too close, cancel

        // Detach the tab
        var newHostTabs = host.tabs.filter(function(t) { return t.id !== tabId; });

        return ws.map(function(w) {
          if (w.id === hostId) {
            if (newHostTabs.length <= 1) {
              // Convert back to standalone
              return { ...w, tabs: null, activeTab: null };
            }
            // Keep as tabbed, switch active if needed
            var newActive = w.activeTab === tabId ? newHostTabs[0].id : w.activeTab;
            return { ...w, tabs: newHostTabs, activeTab: newActive };
          }
          if (w.id === tabId) {
            // Re-open the detached window at drop position
            var dockItem = DOCK_ITEMS.find(function(d) { return d.id === tabId; });
            return {
              ...w,
              open: true,
              x: dropX - 100,
              y: dropY - 30,
              width: dockItem ? dockItem.defaultW : w.width,
              height: dockItem ? dockItem.defaultH : w.height,
              minW: dockItem ? dockItem.minW : w.minW,
              minH: dockItem ? dockItem.minH : w.minH,
              tabs: null,
              activeTab: null,
              z: 9000,
            };
          }
          return w;
        });
      });

      // Bring detached window to front
      setZCounter(function(z) {
        var next = z + 1;
        setWindows(function(ws) {
          return ws.map(function(w) { return w.id === tabId ? { ...w, z: next } : w; });
        });
        return next;
      });
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [DOCK_ITEMS]);

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
        var displayId = win.tabs ? win.activeTab : win.id;
        var theme = DOCK_ITEMS.find(function(d) { return d.id === displayId; });
        return (
          <AppWindow key={win.id}
            win={win}
            theme={theme}
            onClose={closeWindow}
            onFocus={bringToFront}
            onDragEndWithSnap={onDragEndWithSnap}
            getSnapTarget={getSnapTargetStable}
            onSnapUpdate={onSnapUpdate}
            onResizeStart={startResize}
            onTabClick={onTabClick}
            onTabDetach={onTabDetach}/>
        );
      })}

      {/* Snap indicator overlay */}
      {snapIndicator && (
        <div className="snap-indicator" style={{
          left: snapIndicator.x, top: snapIndicator.y,
          width: snapIndicator.width, height: snapIndicator.height
        }}/>
      )}
    </div>
  );
};
