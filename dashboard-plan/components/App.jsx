window.App = function App() {
  const { DOCK_ITEMS } = window.APP_DATA;
  const SNAP_THRESHOLD = 30;
  const resizeRef = React.useRef(null);
  const windowsRef = React.useRef(null);
  const windowElsRef = React.useRef({});
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
        groupId: null, connections: [],
      };
    })
  );

  // Keep windowsRef in sync every render
  windowsRef.current = windows;

  /* ── Night mode state ── */
  const [isNightOverride, setIsNightOverride] = React.useState(null); // null=auto, true=night, false=day

  function checkIsNight() {
    var formatter = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Sydney', hour: 'numeric', hour12: false });
    var hour = parseInt(formatter.format(new Date()), 10);
    return hour < 10 || hour >= 16;
  }

  var isNight = isNightOverride !== null ? isNightOverride : checkIsNight();

  function toggleNightMode() {
    setIsNightOverride(function(prev) {
      if (prev === null) return true;   // auto → force night
      if (prev === true) return false;  // night → force day
      return null;                      // day → auto
    });
  }

  /* ── Helpers ── */
  function oppositeEdge(edge) {
    return { right: 'left', left: 'right', top: 'bottom', bottom: 'top' }[edge];
  }

  function findReachable(ws, startId) {
    var visited = {};
    var queue = [startId];
    visited[startId] = true;
    while (queue.length > 0) {
      var cur = queue.shift();
      var win = ws.find(function(w) { return w.id === cur; });
      if (!win) continue;
      for (var i = 0; i < win.connections.length; i++) {
        var nId = win.connections[i].neighborId;
        if (!visited[nId]) {
          visited[nId] = true;
          queue.push(nId);
        }
      }
    }
    return visited;
  }

  /* ── Window element registry ── */
  var registerWindowEl = React.useCallback(function(id, el) {
    if (el) windowElsRef.current[id] = el; else delete windowElsRef.current[id];
  }, []);

  /* ── Snap detection ── */
  var getSnapTarget = React.useCallback(function(draggedId, x, y, w, h, excludeGroupId) {
    var ws = windowsRef.current;
    var best = null;
    var bestDist = Infinity;
    var dr = x + w, db = y + h;
    var dragged = ws.find(function(ww) { return ww.id === draggedId; });

    for (var i = 0; i < ws.length; i++) {
      var t = ws[i];
      if (t.id === draggedId || !t.open) continue;
      if (excludeGroupId && t.groupId === excludeGroupId) continue;
      if (dragged && dragged.connections.length > 0 && t.connections.length > 0) continue;
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

  /* ── Compute snap position for dragged window ── */
  function computeSnapPos(snap, dragged) {
    var t = snap.rect;
    if (snap.edge === 'right') return { x: t.x - dragged.width, y: t.y };
    if (snap.edge === 'left')  return { x: t.x + t.width, y: t.y };
    if (snap.edge === 'bottom') return { x: t.x, y: t.y - dragged.height };
    if (snap.edge === 'top')   return { x: t.x, y: t.y + t.height };
    return { x: dragged.x, y: dragged.y };
  }

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

  /* ── Bring to front (group-aware) ── */
  var bringToFront = React.useCallback(function(id) {
    setZCounter(function(z) {
      var next = z + 1;
      setWindows(function(ws) {
        var win = ws.find(function(w) { return w.id === id; });
        if (win && win.groupId) {
          var gid = win.groupId;
          return ws.map(function(w) { return w.groupId === gid ? { ...w, z: next } : w; });
        }
        return ws.map(function(w) { return w.id === id ? { ...w, z: next } : w; });
      });
      return next;
    });
  }, []);

  /* ── Open window ── */
  var openWindow = React.useCallback(function(id) {
    setZCounter(function(z) {
      var next = z + 1;
      setWindows(function(ws) {
        return ws.map(function(w) { return w.id === id ? { ...w, open: true, z: next } : w; });
      });
      return next;
    });
  }, []);

  /* ── Close window (group-aware) ── */
  var closeWindow = React.useCallback(function(id) {
    setWindows(function(ws) {
      var closing = ws.find(function(w) { return w.id === id; });
      if (!closing) return ws;

      var updated = ws.map(function(w) {
        if (w.id === id) {
          return { ...w, open: false, groupId: null, connections: [] };
        }
        // Remove connections referencing the closed window
        if (w.connections.some(function(c) { return c.neighborId === id; })) {
          return { ...w, connections: w.connections.filter(function(c) { return c.neighborId !== id; }) };
        }
        return w;
      });

      // If the closed window was in a group, check connectivity of remaining members
      if (closing.groupId) {
        updated = fixGroupConnectivity(updated, closing.groupId, id);
      }

      return updated;
    });
  }, []);

  /* ── Fix group connectivity after removing a window ── */
  function fixGroupConnectivity(ws, groupId, removedId) {
    var members = ws.filter(function(w) { return w.groupId === groupId && w.open && w.id !== removedId; });
    if (members.length === 0) return ws;
    if (members.length === 1) {
      // Single remaining member — remove from group if no connections
      var solo = members[0];
      if (solo.connections.length === 0) {
        return ws.map(function(w) { return w.id === solo.id ? { ...w, groupId: null } : w; });
      }
    }

    // BFS from first member to find reachable set
    var reachable = findReachable(ws, members[0].id);
    var allReachable = members.every(function(m) { return reachable[m.id]; });
    if (allReachable) return ws; // Still fully connected

    // Split: reachable keep groupId, unreachable get new groupId or null
    var newGroupId = 'g-' + Date.now();
    return ws.map(function(w) {
      if (w.groupId !== groupId || !w.open) return w;
      if (reachable[w.id]) return w; // keep current group
      // Check if this window has connections to other unreachable windows
      var hasConnections = w.connections.some(function(c) { return !reachable[c.neighborId]; });
      return { ...w, groupId: hasConnections ? newGroupId : null };
    });
  }

  /* ── Position sync (fallback for normal drag) ── */
  var onPositionSync = React.useCallback(function(id, newX, newY) {
    setWindows(function(ws) {
      return ws.map(function(w) { return w.id === id ? { ...w, x: newX, y: newY } : w; });
    });
  }, []);

  /* ── Snap update (called during drag) — show ghost at snap destination ── */
  var onSnapUpdate = React.useCallback(function(snap, draggedW, draggedH) {
    if (snap) {
      var pos = computeSnapPos(snap, { width: draggedW, height: draggedH });
      setSnapIndicator({ x: pos.x, y: pos.y, width: draggedW, height: draggedH });
    } else {
      setSnapIndicator(null);
    }
  }, []);

  /* ── Merge windows (Lego connect) ── */
  function mergeWindows(ws, draggedId, targetId, edge, snapX, snapY) {
    var dragged = ws.find(function(w) { return w.id === draggedId; });
    var target = ws.find(function(w) { return w.id === targetId; });
    if (!dragged || !target) return ws;

    var newGroupId = target.groupId || dragged.groupId || ('g-' + Date.now());
    var oldDraggedGroup = dragged.groupId;

    return ws.map(function(w) {
      if (w.id === draggedId) {
        var newConns = w.connections.concat([{ neighborId: targetId, edge: edge }]);
        return { ...w, x: snapX, y: snapY, groupId: newGroupId, connections: newConns };
      }
      if (w.id === targetId) {
        var newConns2 = w.connections.concat([{ neighborId: draggedId, edge: oppositeEdge(edge) }]);
        return { ...w, groupId: newGroupId, connections: newConns2 };
      }
      // If dragged had a different group, reassign all its former group members
      if (oldDraggedGroup && w.groupId === oldDraggedGroup) {
        return { ...w, groupId: newGroupId };
      }
      // If target had a group, members already share target's groupId — but if we generated new, update target's group too
      if (target.groupId && target.groupId !== newGroupId && w.groupId === target.groupId) {
        return { ...w, groupId: newGroupId };
      }
      return w;
    });
  }

  /* ── Drag end with snap merge (for ungrouped windows) ── */
  var onDragEndWithSnap = React.useCallback(function(draggedId, newX, newY) {
    setSnapIndicator(null);

    setWindows(function(ws) {
      var dragged = ws.find(function(w) { return w.id === draggedId; });
      if (!dragged) return ws;

      var snap = getSnapTarget(draggedId, newX, newY, dragged.width, dragged.height);
      if (!snap) {
        return ws.map(function(w) { return w.id === draggedId ? { ...w, x: newX, y: newY } : w; });
      }

      var snapPos = computeSnapPos(snap, dragged);
      var el = windowElsRef.current[draggedId];
      if (el) {
        AnimUtils.animateSnapMerge(el, snapPos.x, snapPos.y, function() {
          AnimUtils.animateSnapPulse(el);
          var targetEl = windowElsRef.current[snap.targetId];
          if (targetEl) AnimUtils.animateSnapPulse(targetEl);
        });
      }

      return mergeWindows(ws, draggedId, snap.targetId, snap.edge, snapPos.x, snapPos.y);
    });

    // Bring merged group to front
    bringToFront(draggedId);
  }, [getSnapTarget, bringToFront]);

  /* ── Group drag (imperative DOM moves during drag) ── */
  var onGroupDrag = React.useCallback(function(draggedId, groupId, dx, dy) {
    var ws = windowsRef.current;
    for (var i = 0; i < ws.length; i++) {
      var w = ws[i];
      if (w.groupId === groupId && w.id !== draggedId && w.open) {
        var el = windowElsRef.current[w.id];
        if (el) {
          el.style.left = (w.x + dx) + 'px';
          el.style.top = (w.y + dy) + 'px';
        }
      }
    }
    // Also move seams imperatively (they're rendered by React, so we need to update snap indicator)
  }, []);

  /* ── Group drag end ── */
  var onGroupDragEnd = React.useCallback(function(draggedId, groupId, dx, dy) {
    setSnapIndicator(null);

    setWindows(function(ws) {
      var dragged = ws.find(function(w) { return w.id === draggedId; });
      if (!dragged) return ws;

      var newX = dragged.x + dx;
      var newY = dragged.y + dy;

      // Check for snap to external window
      var snap = getSnapTarget(draggedId, newX, newY, dragged.width, dragged.height, groupId);
      if (snap) {
        var snapPos = computeSnapPos(snap, dragged);
        var adjustDx = snapPos.x - dragged.x;
        var adjustDy = snapPos.y - dragged.y;

        // Animate snap
        var el = windowElsRef.current[draggedId];
        if (el) {
          AnimUtils.animateSnapMerge(el, snapPos.x, snapPos.y, function() {
            AnimUtils.animateSnapPulse(el);
          });
        }

        // Move all group siblings to adjusted positions
        var updated = ws.map(function(w) {
          if (w.groupId === groupId && w.open) {
            return { ...w, x: w.x + adjustDx, y: w.y + adjustDy };
          }
          return w;
        });

        // Also animate sibling DOM elements to adjusted positions
        for (var i = 0; i < updated.length; i++) {
          var uw = updated[i];
          if (uw.groupId === groupId && uw.id !== draggedId && uw.open) {
            var sibEl = windowElsRef.current[uw.id];
            if (sibEl) {
              AnimUtils.animateSnapMerge(sibEl, uw.x, uw.y, null);
            }
          }
        }

        return mergeWindows(updated, draggedId, snap.targetId, snap.edge, snapPos.x, snapPos.y);
      }

      // No snap — sync all group positions to state
      return ws.map(function(w) {
        if (w.groupId === groupId && w.open) {
          return { ...w, x: w.x + dx, y: w.y + dy };
        }
        return w;
      });
    });

    bringToFront(draggedId);
  }, [getSnapTarget, bringToFront]);

  /* ── Un-merge (double-click seam) ── */
  var onUnmerge = React.useCallback(function(winAId, winBId, edge) {
    var elA = windowElsRef.current[winAId];
    var elB = windowElsRef.current[winBId];

    var doStateUpdate = function() {
      setWindows(function(ws) {
        // Sync positions from DOM
        var updated = ws.map(function(w) {
          if (w.id === winAId && elA) {
            return { ...w, x: parseFloat(elA.style.left), y: parseFloat(elA.style.top) };
          }
          if (w.id === winBId && elB) {
            return { ...w, x: parseFloat(elB.style.left), y: parseFloat(elB.style.top) };
          }
          return w;
        });

        // Remove connection between A and B
        updated = updated.map(function(w) {
          if (w.id === winAId) {
            return { ...w, connections: w.connections.filter(function(c) { return c.neighborId !== winBId; }) };
          }
          if (w.id === winBId) {
            return { ...w, connections: w.connections.filter(function(c) { return c.neighborId !== winAId; }) };
          }
          return w;
        });

        // Check graph connectivity from A
        var winA = updated.find(function(w) { return w.id === winAId; });
        if (!winA || !winA.groupId) return updated;
        var gid = winA.groupId;

        var reachableFromA = findReachable(updated, winAId);

        // Windows reachable from A keep A's groupId
        // Windows NOT reachable from A get a new groupId (or null if single)
        var unreachable = updated.filter(function(w) { return w.groupId === gid && w.open && !reachableFromA[w.id]; });
        var newGid = unreachable.length > 1 ? ('g-' + Date.now()) : null;

        updated = updated.map(function(w) {
          if (w.groupId !== gid || !w.open) return w;
          if (reachableFromA[w.id]) {
            // Check if A-side is now solo
            if (winA.connections.length === 0 && w.id === winAId) {
              return { ...w, groupId: null };
            }
            return w;
          }
          return { ...w, groupId: newGid };
        });

        // Also check if any window now has 0 connections -> groupId null
        updated = updated.map(function(w) {
          if (w.connections.length === 0 && w.groupId) {
            return { ...w, groupId: null };
          }
          return w;
        });

        return updated;
      });
    };

    if (elA && elB) {
      AnimUtils.animateUnmerge(elA, elB, edge, doStateUpdate);
    } else {
      doStateUpdate();
    }
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

  /* ── Compute connected edges for each window ── */
  function getConnectedEdges(win) {
    var edges = {};
    for (var i = 0; i < win.connections.length; i++) {
      edges[win.connections[i].edge] = true;
    }
    return edges;
  }

  /* ── Compute seam data ── */
  function computeSeams() {
    var seams = [];
    var seen = {};

    for (var i = 0; i < windows.length; i++) {
      var w = windows[i];
      if (!w.open) continue;
      for (var j = 0; j < w.connections.length; j++) {
        var conn = w.connections[j];
        var pairKey = [w.id, conn.neighborId].sort().join('|') + '|' + [conn.edge, oppositeEdge(conn.edge)].sort().join('|');
        if (seen[pairKey]) continue;
        seen[pairKey] = true;

        var neighbor = windows.find(function(n) { return n.id === conn.neighborId && n.open; });
        if (!neighbor) continue;

        var seamStyle = {};
        var isHorizontal = conn.edge === 'right' || conn.edge === 'left';
        var A = conn.edge === 'right' || conn.edge === 'bottom' ? w : neighbor;
        var B = conn.edge === 'right' || conn.edge === 'bottom' ? neighbor : w;

        if (isHorizontal) {
          // A is on left (its right edge touches B's left edge)
          seamStyle = {
            left: A.x + A.width - 5,
            top: Math.max(A.y, B.y),
            width: 10,
            height: Math.min(A.y + A.height, B.y + B.height) - Math.max(A.y, B.y),
            zIndex: Math.max(w.z, neighbor.z) + 1,
          };
        } else {
          // A is on top (its bottom edge touches B's top edge)
          seamStyle = {
            left: Math.max(A.x, B.x),
            top: A.y + A.height - 5,
            width: Math.min(A.x + A.width, B.x + B.width) - Math.max(A.x, B.x),
            height: 10,
            zIndex: Math.max(w.z, neighbor.z) + 1,
          };
        }

        seams.push({
          key: pairKey,
          style: seamStyle,
          winAId: w.id,
          winBId: conn.neighborId,
          edge: conn.edge,
        });
      }
    }
    return seams;
  }

  var seams = computeSeams();

  return (
    <div className={'desktop' + (isNight ? ' night' : '')}>
      <SkyLayer isNight={isNight}/>
      {/* Brand corner */}
      <div className="brand-corner">
        <CanaryLogo size={28} sleeping={isNight}/>
        <div className="brand-name">Canary <em>AI</em></div>
      </div>

      {/* Night mode toggle */}
      <button className="night-toggle" onClick={toggleNightMode}
        title={isNightOverride === null ? 'Auto (ASX hours)' : isNightOverride ? 'Forced night' : 'Forced day'}>
          {isNight ? '\u263D' : '\u2600'}
          {isNightOverride !== null && <span className="toggle-auto-dot"/>}
      </button>

      {/* Center dock */}
      <Dock windows={windows} openWindow={openWindow} isNight={isNight}/>

      {/* Windows */}
      {windows.filter(function(w) { return w.open; }).map(function(win) {
        var theme = DOCK_ITEMS.find(function(d) { return d.id === win.id; });
        var connectedEdges = getConnectedEdges(win);
        return (
          <AppWindow key={win.id}
            win={win}
            theme={theme}
            connectedEdges={connectedEdges}
            onClose={closeWindow}
            onFocus={bringToFront}
            onDragEndWithSnap={onDragEndWithSnap}
            getSnapTarget={getSnapTarget}
            onSnapUpdate={onSnapUpdate}
            onResizeStart={startResize}
            onGroupDrag={onGroupDrag}
            onGroupDragEnd={onGroupDragEnd}
            registerWindowEl={registerWindowEl}/>
        );
      })}

      {/* Merge seams */}
      {seams.map(function(seam) {
        return (
          <div key={seam.key}
            className="merge-seam"
            style={seam.style}
            onDoubleClick={function() { onUnmerge(seam.winAId, seam.winBId, seam.edge); }}/>
        );
      })}

      {/* Snap indicator overlay — ghost of dragged window at destination */}
      {snapIndicator && (
        <div className="snap-indicator" style={{
          left: snapIndicator.x, top: snapIndicator.y,
          width: snapIndicator.width, height: snapIndicator.height
        }}/>
      )}
    </div>
  );
};
