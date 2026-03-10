import React, { useState, useRef, useEffect } from 'react'
import './App.css'

// ── Canary AI mascot SVG ──────────────────────────────────────────────────────
const CanaryLogo = ({ size = 36, showBg = true }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={showBg ? { background: '#FFF9A0', borderRadius: '10px', border: '1.5px solid #E6D800' } : {}}
  >
    <ellipse cx="50" cy="65" rx="26" ry="24" fill="white" stroke="#000" strokeWidth="2.5"/>
    <circle cx="50" cy="42" r="20" fill="white" stroke="#000" strokeWidth="2.5"/>
    <ellipse cx="50" cy="62" rx="18" ry="12" fill="#f5f5f5"/>
    <path d="M36 58 Q50 52 64 58 Q50 68 36 58Z" fill="white" stroke="#000" strokeWidth="1"/>
    <path d="M24 60 Q18 55 20 70 Q28 75 36 68Z" fill="white" stroke="#000" strokeWidth="2"/>
    <path d="M76 60 Q82 55 80 70 Q72 75 64 68Z" fill="white" stroke="#000" strokeWidth="2"/>
    <line x1="42" y1="87" x2="38" y2="96" stroke="#FFF130" strokeWidth="3" strokeLinecap="round"/>
    <line x1="42" y1="96" x2="34" y2="96" stroke="#FFF130" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="42" y1="96" x2="40" y2="100" stroke="#FFF130" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="58" y1="87" x2="62" y2="96" stroke="#FFF130" strokeWidth="3" strokeLinecap="round"/>
    <line x1="62" y1="96" x2="66" y2="96" stroke="#FFF130" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="62" y1="96" x2="60" y2="100" stroke="#FFF130" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="43" cy="40" r="3.5" fill="#000"/>
    <circle cx="57" cy="40" r="3.5" fill="#000"/>
    <circle cx="44.2" cy="38.8" r="1" fill="white"/>
    <circle cx="58.2" cy="38.8" r="1" fill="white"/>
    <path d="M47 46 L50 51 L53 46Z" fill="#FFF130" stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
    <ellipse cx="50" cy="25" rx="26" ry="5" fill="#000"/>
    <path d="M28 25 Q28 8 50 8 Q72 8 72 25Z" fill="#000"/>
    <path d="M28 24 Q28 20 50 20 Q72 20 72 24" fill="none" stroke="white" strokeWidth="1.5"/>
    <path d="M48 58 L50 55 L52 58 L50 76Z" fill="#000"/>
    <path d="M47 57 L53 57 L52 60 L48 60Z" fill="#000"/>
  </svg>
)

// ── Stock / index data ────────────────────────────────────────────────────────
const stocks = [
  {
    id: 1,
    ticker: 'AAPL',
    name: 'Apple Inc.',
    price: '178.25',
    change: '+2.34',
    changePct: '+1.33%',
    up: true,
    time: '2m',
    unread: 2,
    color: '#555555',
    stats: {
      open: '176.48', high: '179.02', low: '176.12',
      marketCap: '2.76T', volume: '58.3M', pe: '28.4',
      week52High: '199.62', week52Low: '124.17', dividend: '0.24 (0.54%)',
      sector: 'Technology',
    },
    lastMessage: 'AAPL looks technically strong above $175 — momentum is building.',
  },
  {
    id: 2,
    ticker: 'NVDA',
    name: 'NVIDIA Corp.',
    price: '875.40',
    change: '+32.18',
    changePct: '+3.81%',
    up: true,
    time: '11m',
    unread: 0,
    color: '#152DFF',
    stats: {
      open: '843.22', high: '881.10', low: '840.55',
      marketCap: '2.16T', volume: '42.1M', pe: '68.2',
      week52High: '974.00', week52Low: '410.17', dividend: 'N/A',
      sector: 'Semiconductors',
    },
    lastMessage: 'AI infrastructure demand is the primary catalyst driving NVDA right now.',
  },
  {
    id: 3,
    ticker: 'META',
    name: 'Meta Platforms',
    price: '502.30',
    change: '-2.60',
    changePct: '-0.51%',
    up: false,
    time: '1h',
    unread: 0,
    color: '#000000',
    stats: {
      open: '505.80', high: '507.44', low: '499.21',
      marketCap: '1.28T', volume: '14.7M', pe: '24.1',
      week52High: '531.49', week52Low: '274.38', dividend: 'N/A',
      sector: 'Communication',
    },
    lastMessage: "Meta's Reality Labs losses are worth watching in the next earnings call.",
  },
  {
    id: 4,
    ticker: 'SPX',
    name: 'S&P 500 Index',
    price: '5,234.18',
    change: '+14.29',
    changePct: '+0.27%',
    up: true,
    time: '3h',
    unread: 5,
    color: '#27AE60',
    stats: {
      open: '5,219.89', high: '5,241.35', low: '5,210.08',
      marketCap: '—', volume: '—', pe: '23.8 (fwd)',
      week52High: '5,264.85', week52Low: '4,103.78', dividend: '~1.35% (avg)',
      sector: 'Broad Market Index',
    },
    lastMessage: 'The index is holding key support — breadth indicators look healthy.',
  },
  {
    id: 5,
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    price: '172.82',
    change: '-3.74',
    changePct: '-2.12%',
    up: false,
    time: 'Yesterday',
    unread: 0,
    color: '#E74C3C',
    stats: {
      open: '176.56', high: '177.20', low: '171.44',
      marketCap: '548.9B', volume: '102.4M', pe: '40.7',
      week52High: '299.29', week52Low: '138.80', dividend: 'N/A',
      sector: 'Auto / EV',
    },
    lastMessage: 'Margin compression remains the key concern heading into next quarter.',
  },
  {
    id: 6,
    ticker: 'MSFT',
    name: 'Microsoft Corp.',
    price: '415.60',
    change: '+3.30',
    changePct: '+0.80%',
    up: true,
    time: 'Yesterday',
    unread: 1,
    color: '#9B59B6',
    stats: {
      open: '412.30', high: '416.88', low: '411.74',
      marketCap: '3.09T', volume: '20.6M', pe: '35.9',
      week52High: '430.82', week52Low: '309.45', dividend: '0.75 (0.72%)',
      sector: 'Technology',
    },
    lastMessage: 'Azure growth re-accelerating is the bull case thesis in one sentence.',
  },
]

// ── Initial messages per stock ────────────────────────────────────────────────
const initialMessages = {
  1: [
    { id: 1, text: 'What\'s your read on Apple right now?', sent: true, time: '10:14 AM', read: true },
    { id: 2, text: 'AAPL is showing resilience above the $175 support zone. RSI is at 58 — not overbought yet, with room to push toward $185 resistance. Services revenue growth remains the structural tailwind.', sent: false, time: '10:14 AM', read: true },
    { id: 3, text: 'Should I be worried about iPhone sales slowing in China?', sent: true, time: '10:16 AM', read: true },
    { id: 4, text: 'It\'s a real headwind — China revenue was down ~13% YoY last quarter. That said, India is emerging as a meaningful offset. Watch the March quarter guidance closely for any update on geographic mix.', sent: false, time: '10:16 AM', read: true },
    { id: 5, text: 'AAPL looks technically strong above $175 — momentum is building.', sent: false, time: '10:28 AM', read: false },
  ],
  2: [
    { id: 1, text: 'Is NVDA still worth buying at these levels?', sent: true, time: '9:02 AM', read: true },
    { id: 2, text: 'Valuation is stretched at ~68x earnings, but the AI infrastructure cycle is still early. Data center revenue grew 409% YoY last quarter. The key risk is whether hyperscaler capex holds up — so far, signs point to yes.', sent: false, time: '9:03 AM', read: true },
    { id: 3, text: 'What about AMD as competition?', sent: true, time: '9:05 AM', read: true },
    { id: 4, text: 'AMD\'s MI300X is gaining traction but NVIDIA\'s CUDA ecosystem moat remains wide. Most enterprises aren\'t switching overnight. NVDA still commands ~80% of the AI accelerator market.', sent: false, time: '9:06 AM', read: true },
    { id: 5, text: 'AI infrastructure demand is the primary catalyst driving NVDA right now.', sent: false, time: '9:20 AM', read: true },
  ],
  3: [
    { id: 1, text: 'Meta seems to be pulling back — is this a dip or a reversal?', sent: true, time: '8:45 AM', read: true },
    { id: 2, text: 'The pullback from $530 looks like a normal consolidation after a strong run. Ad revenue growth (~24% YoY) is solid, and Reels monetisation is maturing well. Key support is around $490.', sent: false, time: '8:46 AM', read: true },
    { id: 3, text: "Meta's Reality Labs losses are worth watching in the next earnings call.", sent: false, time: '8:50 AM', read: true },
  ],
  4: [
    { id: 1, text: 'Give me a macro read on the S&P 500.', sent: true, time: '7:30 AM', read: true },
    { id: 2, text: 'The index is in a technically healthy uptrend — above both the 50-day and 200-day moving averages. Breadth is improving, with more sectors participating. Sticky inflation remains the main risk to multiple expansion.', sent: false, time: '7:31 AM', read: true },
    { id: 3, text: 'Should I be rotating out of tech into defensives?', sent: true, time: '7:34 AM', read: true },
    { id: 4, text: 'Not necessarily. Tech earnings revisions are still positive, which typically supports outperformance. A barbell of growth + dividend payers might give you balance without fully de-risking.', sent: false, time: '7:35 AM', read: true },
    { id: 5, text: 'What sectors look most interesting right now?', sent: true, time: '7:40 AM', read: true },
    { id: 6, text: 'Industrials (reshoring theme), Energy (supply discipline), and selective Financials (rate tailwind) all look interesting on a 6-12 month view alongside mega-cap tech.', sent: false, time: '7:41 AM', read: true },
    { id: 7, text: 'The index is holding key support — breadth indicators look healthy.', sent: false, time: '7:55 AM', read: false },
  ],
  5: [
    { id: 1, text: 'Tesla is getting crushed. What\'s happening?', sent: true, time: 'Yesterday', read: true },
    { id: 2, text: 'TSLA is down on margin pressure — automotive gross margins (ex-credits) are around 17%, well below the ~26% peak in 2022. Price cuts to maintain volume are the culprit. Near-term, $165 is a key support level to watch.', sent: false, time: 'Yesterday', read: true },
    { id: 3, text: 'Margin compression remains the key concern heading into next quarter.', sent: false, time: 'Yesterday', read: true },
  ],
  6: [
    { id: 1, text: 'How is Microsoft positioned in the AI race?', sent: true, time: 'Yesterday', read: true },
    { id: 2, text: 'Very well. The OpenAI partnership gives MSFT a major distribution advantage through Copilot integrations across Office 365, GitHub, and Azure. Azure OpenAI service is a material revenue driver now.', sent: false, time: 'Yesterday', read: true },
    { id: 3, text: 'Azure growth re-accelerating is the bull case thesis in one sentence.', sent: false, time: 'Yesterday', read: false },
  ],
}

// ── Ticker avatar ─────────────────────────────────────────────────────────────
function TickerAvatar({ stock, size = 50, showRing = false }) {
  const fontSize = size <= 32 ? 9 : size <= 44 ? 11 : 13
  return (
    <div className="avatar-wrapper" style={{ width: size, height: size }}>
      <div
        className="avatar ticker-avatar"
        style={{
          width: size,
          height: size,
          background: stock.color,
          fontSize,
        }}
      >
        {stock.ticker}
      </div>
      {showRing && <span className="online-dot" style={{ background: '#FFF245', border: '2px solid #fff' }} />}
    </div>
  )
}

// ── Trend arrow ───────────────────────────────────────────────────────────────
const TrendUp = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
)
const TrendDown = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

// ── Main component ────────────────────────────────────────────────────────────
export default function App() {
  const [activeId, setActiveId]     = useState(1)
  const [messages, setMessages]     = useState(initialMessages)
  const [input, setInput]           = useState('')
  const [search, setSearch]         = useState('')
  const [showInfo, setShowInfo]     = useState(false)
  const [tradingStyle, setTradingStyle] = useState('Balanced')
  const [showStyleMenu, setShowStyleMenu] = useState(false)
  const messagesEndRef              = useRef(null)
  const styleMenuRef                = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (styleMenuRef.current && !styleMenuRef.current.contains(e.target)) {
        setShowStyleMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = stocks.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.ticker.toLowerCase().includes(search.toLowerCase())
  )

  const active         = stocks.find(s => s.id === activeId)
  const activeMessages = messages[activeId] || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages, activeId])

  function sendMessage() {
    if (!input.trim()) return
    const newMsg = {
      id: Date.now(),
      text: input.trim(),
      sent: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    }
    setMessages(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), newMsg],
    }))
    setInput('')
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="app">

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      <aside className="sidebar">

        {/* Header */}
        <div className="sidebar-header">
          <div className="brand">
            <CanaryLogo size={34} showBg />
            <div className="brand-text">
              <span className="brand-name">Canary.ai</span>
            </div>
          </div>
          <button className="icon-btn" title="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>

        {/* Filter row */}
        <div className="filter-row">
          <button className="filter-label">
            Watchlist
            <svg className="filter-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <button className="new-msg-btn" title="Add Stock">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="search-wrap">
          <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search stocks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch('')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Stock list */}
        <div className="conv-list">
          {filtered.length === 0 ? (
            <div className="no-results">No stocks found</div>
          ) : (
            filtered.map(stock => (
              <button
                key={stock.id}
                className={`conv-item ${activeId === stock.id ? 'active' : ''}`}
                onClick={() => setActiveId(stock.id)}
              >
                <TickerAvatar stock={stock} size={50} />
                <div className="conv-info">
                  <div className="conv-top">
                    <span className="conv-name">{stock.name}</span>
                    <span className={`price-change ${stock.up ? 'up' : 'down'}`}>
                      {stock.up ? <TrendUp /> : <TrendDown />}
                      {stock.changePct}
                    </span>
                  </div>
                  <div className="conv-bottom">
                    <span className="conv-last">{stock.lastMessage}</span>
                    {stock.unread > 0 && (
                      <span className="unread-badge">{stock.unread > 9 ? '9+' : stock.unread}</span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ══ CHAT PANEL ═══════════════════════════════════════════════════════ */}
      <main className="chat-panel">

        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <TickerAvatar stock={active} size={42} showRing />
            <div className="chat-header-info">
              <span className="chat-name">
                {active?.name}
                <span className="ticker-badge">{active?.ticker}</span>
              </span>
              <span className="chat-price-row">
                <span className="chat-price">${active?.price}</span>
                <span className={`chat-change ${active?.up ? 'up' : 'down'}`}>
                  {active?.up ? <TrendUp /> : <TrendDown />}
                  {active?.change} ({active?.changePct})
                </span>
              </span>
            </div>
          </div>
          <div className="chat-header-actions">
            <button className="icon-btn" title="Price Alerts">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            <button className="icon-btn" title="View Chart">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </button>
            <button className="icon-btn" title="Stock Info" onClick={() => setShowInfo(!showInfo)}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-area">
          <div className="date-sep"><span>Today</span></div>

          {/* Canary AI intro chip */}
          <div className="ai-intro">
            <CanaryLogo size={28} showBg />
            <span>Canary AI is analyzing <strong>{active?.name}</strong> for you</span>
          </div>

          {activeMessages.map((msg, i) => {
            const prevMsg = activeMessages[i - 1]
            const showAvatar = !msg.sent && (!prevMsg || prevMsg.sent)
            return (
              <div key={msg.id} className={`msg-row ${msg.sent ? 'sent' : 'received'}`}>
                {!msg.sent && (
                  <div className="msg-avatar-space">
                    {showAvatar && <CanaryLogo size={28} showBg />}
                  </div>
                )}
                <div className="msg-bubble-wrap">
                  <div className={`msg-bubble ${msg.sent ? 'bubble-sent' : 'bubble-received'}`}>
                    {msg.text}
                  </div>
                  <div className="msg-meta">
                    <span className="msg-time">{msg.time}</span>
                    {msg.sent && (
                      <span className="msg-read">
                        {msg.read ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B6BEF" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                            <polyline points="25 6 14 17" transform="translate(-5,0)"/>
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="input-bar">
          <button className="icon-btn attach-btn" title="Attach chart / file">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>
          <textarea
            className="msg-input"
            placeholder={`Ask Canary about ${active?.ticker}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
          />
          {input.trim() ? (
            <button className="send-btn active" onClick={sendMessage} title="Send">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          ) : (
            <div className="style-picker-wrap" ref={styleMenuRef}>
              {showStyleMenu && (
                <div className="style-menu">
                  <p className="style-menu-label">Trading Style</p>
                  {[
                    { key: 'Conservative', desc: 'Capital preservation, low risk', color: '#22c55e' },
                    { key: 'Balanced',     desc: 'Moderate growth, managed risk',  color: '#FFF130' },
                    { key: 'Aggressive',   desc: 'Max returns, high risk tolerance', color: '#ef4444' },
                  ].map(({ key, desc, color }) => (
                    <button
                      key={key}
                      className={`style-option ${tradingStyle === key ? 'selected' : ''}`}
                      onClick={() => { setTradingStyle(key); setShowStyleMenu(false) }}
                    >
                      <span className="style-dot" style={{ background: color }} />
                      <span className="style-option-text">
                        <span className="style-option-name">{key}</span>
                        <span className="style-option-desc">{desc}</span>
                      </span>
                      {tradingStyle === key && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
              <button
                className={`style-btn ${showStyleMenu ? 'open' : ''}`}
                onClick={() => setShowStyleMenu(v => !v)}
                title="Trading style"
              >
                <span
                  className="style-btn-dot"
                  style={{
                    background: tradingStyle === 'Conservative' ? '#22c55e'
                               : tradingStyle === 'Aggressive'  ? '#ef4444'
                               : '#FFF130',
                  }}
                />
                <span className="style-btn-label">{tradingStyle}</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: showStyleMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ══ INFO PANEL ═══════════════════════════════════════════════════════ */}
      {showInfo && (
        <div className="info-panel">
          <div className="info-header">
            <button className="icon-btn" onClick={() => setShowInfo(false)}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="info-body">
            <TickerAvatar stock={active} size={72} />
            <h2 className="info-name">{active?.name}</h2>
            <p className="info-ticker-label">{active?.ticker} · {active?.stats.sector}</p>

            {/* Price hero */}
            <div className="info-price-hero">
              <span className="info-price-big">${active?.price}</span>
              <span className={`info-price-change ${active?.up ? 'up' : 'down'}`}>
                {active?.up ? <TrendUp /> : <TrendDown />}
                {active?.change} ({active?.changePct})
              </span>
            </div>

            {/* Quick action buttons */}
            <div className="info-actions">
              <button className="info-action-btn">
                <span className="info-action-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </span>
                Alert
              </button>
              <button className="info-action-btn">
                <span className="info-action-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </span>
                Chart
              </button>
              <button className="info-action-btn">
                <span className="info-action-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </span>
                Trade
              </button>
            </div>

            {/* Stats */}
            <div className="info-section">
              <h3>Today's Range</h3>
              <div className="stat-row"><span>Open</span><span>${active?.stats.open}</span></div>
              <div className="stat-row"><span>High</span><span className="up">${active?.stats.high}</span></div>
              <div className="stat-row"><span>Low</span><span className="down">${active?.stats.low}</span></div>
            </div>

            <div className="info-section">
              <h3>Key Stats</h3>
              <div className="stat-row"><span>Market Cap</span><span>{active?.stats.marketCap}</span></div>
              <div className="stat-row"><span>Volume</span><span>{active?.stats.volume}</span></div>
              <div className="stat-row"><span>P/E Ratio</span><span>{active?.stats.pe}</span></div>
              <div className="stat-row"><span>Dividend</span><span>{active?.stats.dividend}</span></div>
            </div>

            <div className="info-section">
              <h3>52-Week Range</h3>
              <div className="stat-row"><span>High</span><span className="up">${active?.stats.week52High}</span></div>
              <div className="stat-row"><span>Low</span><span className="down">${active?.stats.week52Low}</span></div>
              <div className="range-bar">
                <div
                  className="range-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0,
                      ((parseFloat(active?.price.replace(/,/g,'')) - parseFloat(active?.stats.week52Low.replace(/,/g,''))) /
                       (parseFloat(active?.stats.week52High.replace(/,/g,'')) - parseFloat(active?.stats.week52Low.replace(/,/g,'')))) * 100
                    ))}%`,
                    background: active?.up ? '#22c55e' : '#ef4444',
                  }}
                />
              </div>
            </div>

            <div className="info-section">
              <h3>Notifications</h3>
              <div className="info-option">
                <span>Price alerts</span>
                <div className="toggle active" />
              </div>
              <div className="info-option">
                <span>Earnings alerts</span>
                <div className="toggle active" />
              </div>
              <div className="info-option">
                <span>News digest</span>
                <div className="toggle" />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
