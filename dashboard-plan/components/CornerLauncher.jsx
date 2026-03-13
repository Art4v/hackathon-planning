window.CornerLauncher = function CornerLauncher({ position, dockItems, windows, onToggle, onClearAll }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const launcherRef = React.useRef(null);

  // Dismiss on outside click or Escape
  React.useEffect(function() {
    if (!menuOpen) return;
    function onDown(e) {
      if (launcherRef.current && !launcherRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    function onKey(e) { if (e.key === 'Escape') setMenuOpen(false); }
    var id = setTimeout(function() {
      document.addEventListener('mousedown', onDown);
      document.addEventListener('keydown', onKey);
    }, 0);
    return function() {
      clearTimeout(id);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <div className={'corner-launcher corner-launcher--' + position} ref={launcherRef}>
      <button className="corner-launcher-btn"
        onClick={function() { setMenuOpen(function(v) { return !v; }); }}
        title="Quick Launch">
        <iconify-icon icon="solar:widget-4-bold-duotone" width="22"/>
      </button>
      {menuOpen && (
        <div className="corner-menu">
          <button className="corner-menu-item corner-clear-all"
            onClick={function() { onClearAll(); setMenuOpen(false); }}
            title="Clear All">
            <iconify-icon icon="solar:close-circle-bold-duotone" width="24"/>
            <span className="corner-menu-label">Clear All</span>
          </button>
          {dockItems.map(function(d, i) {
            var isOpen = windows.find(function(w) { return w.id === d.id; });
            isOpen = isOpen && isOpen.open;
            return (
              <button key={d.id} className={'corner-menu-item' + (isOpen ? ' corner-menu-item--active' : '')}
                style={{ animationDelay: ((i + 1) * 40) + 'ms' }}
                onClick={function() { onToggle(d.id); }}
                title={d.label}>
                <iconify-icon icon={d.icon} width="24" style={{ color: d.iconColor }}/>
                <span className="corner-menu-label">{d.label}</span>
                {isOpen && <span className="corner-menu-dot"/>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
