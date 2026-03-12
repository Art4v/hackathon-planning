window.ChatContent = function ChatContent() {
  const [messages, setMessages] = React.useState([
    { from:'ai',   text:"Hey! I'm Canary AI. Ask me anything about your portfolio or the markets.", time:'9:30 AM' },
    { from:'user', text:'How is AAPL performing today?', time:'9:31 AM' },
    { from:'ai',   text:'AAPL is up 1.24% at $187.42 with strong volume of 62.3M. Sentiment looks bullish — earnings beat estimates by 8% this morning.', time:'9:31 AM' },
    { from:'user', text:'Should I buy more NVDA?', time:'9:33 AM' },
    { from:'ai',   text:"NVDA is up 4.63% today at $872.55, breaking above the $870 resistance level. Strong momentum, but consider your position size — it's already up 28% this month.", time:'9:33 AM' },
  ]);
  const [input, setInput] = React.useState('');
  const bottomRef = React.useRef(null);

  React.useEffect(function() { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const send = function() {
    if (!input.trim()) return;
    const userMsg = { from:'user', text:input, time:'Now' };
    const aiReply = { from:'ai', text:'Analysing "' + input + '"... Real Canary AI will give you deep market insights here!', time:'Now' };
    setMessages(function(m) { return [...m, userMsg, aiReply]; });
    setInput('');
  };

  return (
    <div className="chat-wrap">
      <div className="chat-header">
        <div className="chat-header-icon">
          <iconify-icon icon="solar:chat-round-bold-duotone" width="20" style={{color:'#4a6cf7'}}/>
        </div>
        <div>
          <div className="chat-header-name">Canary AI</div>
          <div className="chat-header-status">● Online</div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map(function(m, i) {
          return (
            <div key={i} className={'chat-msg ' + m.from}>
              {m.from === 'ai' && (
                <div style={{ width:30, height:30, borderRadius:'50%', background:'#D6E4FF', border:'2px solid #A8BEFF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <iconify-icon icon="solar:chat-round-bold-duotone" width="15" style={{color:'#4a6cf7'}}/>
                </div>
              )}
              <div>
                <div className="chat-bubble">{m.text}</div>
                <div className="chat-time" style={{ textAlign: m.from === 'user' ? 'right' : 'left' }}>{m.time}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}/>
      </div>

      <div className="chat-input-area">
        <input className="chat-input" placeholder="Ask about your portfolio…"
          value={input} onChange={function(e) { setInput(e.target.value); }}
          onKeyDown={function(e) { if (e.key === 'Enter') send(); }}/>
        <button className="chat-send" onClick={send}>
          <iconify-icon icon="solar:arrow-up-bold" width="16"/>
        </button>
      </div>
    </div>
  );
};
