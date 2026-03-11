window.PaymentContent = function PaymentContent() {
  const [side, setSide] = React.useState('buy');
  const [stock, setStock] = React.useState('AAPL');
  const [shares, setShares] = React.useState('10');
  const prices = { AAPL:187.42, TSLA:243.11, NVDA:872.55, MSFT:408.10 };
  const total = (parseFloat(shares) || 0) * (prices[stock] || 0);
  const isBuy = side === 'buy';

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div className="pay-tabs">
        <div className={'pay-tab buy ' + (side === 'buy' ? 'active' : '')} onClick={function() { setSide('buy'); }}>
          <iconify-icon icon="solar:arrow-up-bold" width="14"/> Buy
        </div>
        <div className={'pay-tab sell ' + (side === 'sell' ? 'active' : '')} onClick={function() { setSide('sell'); }}>
          <iconify-icon icon="solar:arrow-down-bold" width="14"/> Sell
        </div>
      </div>
      <div className="pay-form">
        <div className="pay-field">
          <label>Stock</label>
          <select className="pay-select" value={stock} onChange={function(e) { setStock(e.target.value); }}>
            {Object.keys(prices).map(function(s) {
              return <option key={s} value={s}>{s} — ${prices[s].toFixed(2)}</option>;
            })}
          </select>
        </div>
        <div className="pay-row">
          <div className="pay-field">
            <label>Shares</label>
            <input className="pay-input" type="number" min="1" value={shares} onChange={function(e) { setShares(e.target.value); }}/>
          </div>
          <div className="pay-field">
            <label>Price / Share</label>
            <input className="pay-input" value={'$' + prices[stock].toFixed(2)} readOnly style={{ background:'#f8f8f8', color:'#888' }}/>
          </div>
        </div>
        <div className="pay-preview">
          <div className="pay-preview-row">
            <span className="pay-preview-label">Order Type</span>
            <span className="pay-preview-val">Market</span>
          </div>
          <div className="pay-preview-row">
            <span className="pay-preview-label">Estimated Total</span>
            <span className="pay-preview-val" style={{ color: isBuy ? '#16a34a' : '#dc2626', fontSize:'1rem' }}>
              {isBuy ? '+' : '-'}${total.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 })}
            </span>
          </div>
          <div className="pay-preview-row">
            <span className="pay-preview-label">Buying Power</span>
            <span className="pay-preview-val">$28,340.00</span>
          </div>
        </div>
        <button className={'pay-btn ' + (isBuy ? 'buy-btn' : 'sell-btn')}
          onMouseEnter={function(e) { AnimUtils.buttonHoverIn(e.currentTarget); }}
          onMouseLeave={function(e) { AnimUtils.buttonHoverOut(e.currentTarget); }}
          onMouseDown={function(e) { AnimUtils.buttonPress(e.currentTarget); }}
          onMouseUp={function(e) { AnimUtils.buttonHoverIn(e.currentTarget); }}>
          {isBuy
            ? <><iconify-icon icon="solar:arrow-up-bold" width="16"/> Execute Buy Order</>
            : <><iconify-icon icon="solar:arrow-down-bold" width="16"/> Execute Sell Order</>}
        </button>
      </div>
    </div>
  );
};
