window.SettingsContent = function SettingsContent() {
  const [toggles, setToggles] = React.useState({ alerts:true, email:false, sound:true, refresh:true, darkmode:false, ai:true });

  const flip = function(key) {
    setToggles(function(t) {
      var next = { ...t, [key]: !t[key] };
      return next;
    });
  };

  const sections = [
    {
      title:'Notifications',
      rows:[
        { key:'alerts', icon:'solar:bell-bold-duotone',           label:'Price Alerts',         sub:'Get notified on target price hits', c:'#A8BEFF' },
        { key:'email',  icon:'solar:letter-bold-duotone',          label:'Email Reports',        sub:'Weekly portfolio summary', c:'#86efac' },
        { key:'sound',  icon:'solar:volume-loud-bold-duotone',     label:'Sound Effects',        sub:'UI interaction sounds', c:'#fb923c' },
      ]
    },
    {
      title:'Display',
      rows:[
        { key:'refresh',  icon:'solar:refresh-bold-duotone',        label:'Auto-Refresh',         sub:'Update prices every 10s', c:'#818cf8' },
        { key:'darkmode', icon:'solar:moon-bold-duotone',            label:'Dark Mode',            sub:'Coming soon', c:'#64748b' },
      ]
    },
    {
      title:'AI Features',
      rows:[
        { key:'ai', icon:'solar:stars-bold-duotone',               label:'AI Recommendations',   sub:'Smart trade suggestions', c:'#FFF130' },
      ]
    }
  ];

  return (
    <div>
      {sections.map(function(sec, si) {
        return (
          <div key={si} className="settings-section" style={{ borderBottom: si < sections.length - 1 ? '2px solid #f5f5f5' : '' }}>
            <div className="settings-title">{sec.title}</div>
            {sec.rows.map(function(row) {
              var isOn = toggles[row.key];
              return (
                <div key={row.key} className="setting-row">
                  <div>
                    <div className="setting-label">
                      <iconify-icon icon={row.icon} width="18" style={{color:row.c}}/>
                      {row.label}
                    </div>
                    <div className="setting-sub">{row.sub}</div>
                  </div>
                  <div
                    className={'toggle ' + (isOn ? 'on' : 'off')}
                    onClick={function() { flip(row.key); }}
                    ref={function(el) {
                      if (el) {
                        gsap.set(el, {
                          backgroundColor: isOn ? '#A8BEFF' : '#e5e5e5',
                          borderColor: isOn ? '#8090e0' : '#d0d0d0'
                        });
                      }
                    }}/>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
