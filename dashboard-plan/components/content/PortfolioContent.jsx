function MiniCard({ stock }) {
  const [range, setRange] = React.useState('1W');
  const t = stock.theme;
  return (
    <div className="bubble-card-wrap"
      style={{ boxShadow: '0 5px 0 ' + t.shadow }}
      onMouseEnter={function(e) { AnimUtils.cardHoverIn(e.currentTarget); }}
      onMouseLeave={function(e) { AnimUtils.cardHoverOut(e.currentTarget); }}
      onMouseDown={function(e) { AnimUtils.cardPress(e.currentTarget); }}
      onMouseUp={function(e) { AnimUtils.cardHoverIn(e.currentTarget); }}>
      <div className="bubble-card" style={{ borderColor: t.border }}>
        <div className="card-header" style={{ background: t.bg, borderBottomColor: t.border }}>
          <div>
            <div className="card-ticker" style={{ color: t.text }}>{stock.ticker}</div>
            <div className="card-company" style={{ color: t.text }}>{stock.name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="card-price" style={{ color: t.text }}>{stock.price}</div>
            <div className={'card-pill ' + (stock.up ? 'up' : 'dn')}>{stock.up ? '▲' : '▼'} {stock.change}</div>
          </div>
        </div>
        <div className="card-chart">
          <SparkLine data={stock.data} color={t.line} fillColor={t.fill}/>
        </div>
        <div className="card-footer">
          <div className="vol-pill">Vol {stock.vol}</div>
          <div className="rpills">
            {['1D','1W','1M','3M'].map(function(r) {
              return <button key={r} className={'rpill ' + (range === r ? t.pill : '')} onClick={function() { setRange(r); }}>{r}</button>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

window.PortfolioContent = function PortfolioContent() {
  return (
    <div>
      <div className="pf-banner">
        <div>
          <div className="pf-lbl">Total Portfolio Value</div>
          <div className="pf-val">$142,830<span>.50</span></div>
          <div className="pf-chg">
            <iconify-icon icon="solar:arrow-up-bold" width="12"/> +$4,420 · +3.19%
          </div>
        </div>
        <div className="pf-stats">
          <div className="pf-stat"><div className="pf-stat-v" style={{color:'#818cf8'}}>7</div><div className="pf-stat-l">Positions</div></div>
          <div className="pf-stat"><div className="pf-stat-v" style={{color:'#16a34a',fontSize:'0.75rem'}}>OPEN</div><div className="pf-stat-l">Market</div></div>
        </div>
      </div>
      <div className="stock-grid">
        {window.APP_DATA.STOCKS.map(function(s, i) { return <MiniCard key={i} stock={s}/>; })}
      </div>
    </div>
  );
};
