window.APP_DATA = {
  STOCKS: [
    { ticker:'AAPL', name:'Apple Inc.',   price:'$187.42', change:'+1.24%', up:true,  vol:'62.3M',
      theme:{ bg:'#FFF8A0', border:'#FFE566', shadow:'#e6d000', text:'#5a4d00', line:'#c8a800', fill:'rgba(200,168,0,0.12)', pill:'ay' },
      data:[172,175,174,178,176,180,182,181,184,186,185,187] },
    { ticker:'TSLA', name:'Tesla Inc.',   price:'$243.11', change:'-2.87%', up:false, vol:'98.1M',
      theme:{ bg:'#fee2e2', border:'#fca5a5', shadow:'#f87171', text:'#7f1d1d', line:'#dc2626', fill:'rgba(220,38,38,0.09)', pill:'ar' },
      data:[260,258,255,253,257,250,248,251,247,245,244,243] },
    { ticker:'NVDA', name:'NVIDIA Corp.', price:'$872.55', change:'+4.63%', up:true,  vol:'41.7M',
      theme:{ bg:'#d1fae5', border:'#6ee7b7', shadow:'#34d399', text:'#064e3b', line:'#059669', fill:'rgba(5,150,105,0.1)',  pill:'ag' },
      data:[830,838,842,835,848,854,858,862,856,868,870,873] },
    { ticker:'MSFT', name:'Microsoft',    price:'$408.10', change:'+0.87%', up:true,  vol:'18.4M',
      theme:{ bg:'#D6E4FF', border:'#A8BEFF', shadow:'#7b93e0', text:'#1e3a8a', line:'#4a6cf7', fill:'rgba(74,108,247,0.1)', pill:'ab' },
      data:[400,401,403,402,404,403,405,406,405,407,407,408] },
  ],

  DOCK_ITEMS: [
    { id:'portfolio', label:'Portfolio', icon:'solar:graph-new-bold-duotone', bg:'#FFF8A0', border:'#FFE566', shadow:'#e6d000', iconColor:'#c8a800', defaultW:530, defaultH:520, minW:440, minH:400 },
    { id:'chat',      label:'Chat',      icon:'solar:chat-round-bold-duotone', bg:'#D6E4FF', border:'#A8BEFF', shadow:'#8090e0', iconColor:'#4a6cf7', defaultW:400, defaultH:480, minW:320, minH:360 },
    { id:'account',   label:'Account',   icon:'solar:user-circle-bold-duotone',bg:'#d1fae5',border:'#6ee7b7', shadow:'#34d399', iconColor:'#059669', defaultW:340, defaultH:430, minW:300, minH:340 },
    { id:'settings',  label:'Settings',  icon:'solar:settings-bold-duotone',  bg:'#ede9fe', border:'#c4b5fd', shadow:'#a78bfa', iconColor:'#7c3aed', defaultW:360, defaultH:450, minW:300, minH:320 },
    { id:'payment',   label:'Payment',   icon:'solar:card-bold-duotone',       bg:'#fce7f3', border:'#f9a8d4', shadow:'#f472b6', iconColor:'#db2777', defaultW:380, defaultH:480, minW:340, minH:400 },
  ],

  CLOUDS: [
    { width:180, top:'8%',  duration:55, delay:0   },
    { width:120, top:'20%', duration:40, delay:12  },
    { width:220, top:'35%', duration:70, delay:5   },
    { width:90,  top:'50%', duration:35, delay:22  },
    { width:160, top:'65%', duration:60, delay:8   },
    { width:100, top:'15%', duration:45, delay:30  },
    { width:140, top:'75%', duration:50, delay:18  },
  ],

  BIRDS: [
    { top:'12%', duration:22, delay:0,   flapSpeed:0.3,  wingDelay:0    },
    { top:'28%', duration:35, delay:8,   flapSpeed:0.42, wingDelay:0.1  },
    { top:'55%', duration:28, delay:3,   flapSpeed:0.25, wingDelay:0.05 },
    { top:'40%', duration:40, delay:15,  flapSpeed:0.38, wingDelay:0.15 },
    { top:'70%', duration:20, delay:25,  flapSpeed:0.28, wingDelay:0    },
    { top:'20%', duration:32, delay:18,  flapSpeed:0.35, wingDelay:0.2  },
  ],
};
