window.Dock = function Dock({ windows, openWindow, isNight }) {
  const mascotRef = React.useRef(null);
  const { DOCK_ITEMS } = window.APP_DATA;

  React.useEffect(() => {
    if (mascotRef.current) {
      AnimUtils.animateBob(mascotRef.current);
    }
    return () => {
      if (mascotRef.current) gsap.killTweensOf(mascotRef.current);
    };
  }, []);

  return (
    <div className="dock-wrap">
      <div className="dock-cloud-shape"></div>
      <div className="dock-content">
        <div className="mascot-wrap" ref={mascotRef}><CanaryLogo size={80} sleeping={isNight}/></div>
        <div className="dock-title">Canary <em>AI</em></div>
        <div className="dock-tagline">The trader you always wanted to be</div>
        <div className="dock-icons">
          {DOCK_ITEMS.map(d => {
            const isOpen = windows.find(w => w.id === d.id)?.open;
            return (
              <div key={d.id} className="dock-item" onClick={() => openWindow(d.id)}>
                <div className="dock-btn"
                  style={{ background: d.bg, borderColor: d.border, boxShadow: '0 5px 0 ' + d.shadow }}
                  onMouseEnter={function(e) { AnimUtils.dockHoverIn(e.currentTarget); }}
                  onMouseLeave={function(e) { AnimUtils.dockHoverOut(e.currentTarget); }}
                  onMouseDown={function(e) { AnimUtils.dockPress(e.currentTarget); }}
                  onMouseUp={function(e) { AnimUtils.dockRelease(e.currentTarget, d.shadow); }}>
                  <iconify-icon icon={d.icon} width="32" style={{ color: d.iconColor }}/>
                  <div className={'dock-dot ' + (isOpen ? 'visible' : '')}/>
                </div>
                <div className="dock-label">{d.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
