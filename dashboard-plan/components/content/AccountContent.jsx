window.AccountContent = function AccountContent() {
  return (
    <div>
      <div className="acct-hero">
        <div className="acct-avatar"><CanaryLogo size={44}/></div>
        <div style={{ textAlign:'center' }}>
          <div className="acct-name">Ken Nguyen</div>
          <div className="acct-email">ken@canaryai.com</div>
        </div>
        <div className="acct-stats">
          <div className="acct-stat"><div className="acct-stat-v" style={{color:'#059669'}}>$142K</div><div className="acct-stat-l">Portfolio</div></div>
          <div className="acct-stat"><div className="acct-stat-v" style={{color:'#818cf8'}}>247</div><div className="acct-stat-l">Trades</div></div>
        </div>
      </div>
      <div className="acct-rows">
        {[
          { icon:'solar:user-bold-duotone',          label:'Member Since',   val:'Jan 2024',    c:'#818cf8' },
          { icon:'solar:shield-check-bold-duotone',  label:'Account Tier',   val:'Pro Trader',  c:'#fb923c' },
          { icon:'solar:bill-list-bold-duotone',      label:'Open Positions', val:'7 positions', c:'#059669' },
          { icon:'solar:chart-2-bold-duotone',        label:'All-Time Return',val:'+38.4%',      c:'#16a34a' },
        ].map(function(r, i) {
          return (
            <div key={i} className="acct-row">
              <div className="acct-row-label">
                <iconify-icon icon={r.icon} width="17" style={{color:r.c}}/>
                {r.label}
              </div>
              <div className="acct-row-val">{r.val}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
