# Canary AI Dashboard — Rebuild Prompts for Claude Code

> **⚠️ Frontend only:** Every prompt in this guide produces **client-side code only** — no backend, no server, no API keys. All data is mock/static. If a prompt mentions an API, it means a simulated fetch with fake data, never a real network call to an external service.

> **How to use:** Open Claude Code in your **empty target repo**. Copy-paste each prompt in order. Verify the app works (`npm run dev`) before moving to the next prompt. Each prompt builds on the previous one.
>
> **What you're building:** A stock trading dashboard with an animated sky background, glassmorphic UI, and a portfolio view — designed to impress at a hackathon demo. Everything runs in the browser with no backend or external APIs.

---

## Prompt 1 — Project Scaffolding

```
[Frontend only — no backend, no server, no external APIs.]

Scaffold a React + Vite project in the current directory (not in a subfolder — scaffold at the repo root).

Requirements:
- React 18, Vite, JavaScript (not TypeScript)
- Install these dependencies: gsap, lucide-react
- Create this folder structure inside src/:

  src/
    components/        # Reusable UI components (GlassCard, SparkLine, etc.)
    features/          # Feature folders (portfolio/, dock/, sky/, window/)
    hooks/             # Custom React hooks
    data/              # Mock data files
    styles/            # CSS files
    utils/             # Helpers (animation utilities, etc.)
    App.jsx
    main.jsx

- Configure a Vite alias so `@/` maps to `src/`
- Add a minimal App.jsx that renders a div with text "Canary AI" as a sanity check
- Make sure `npm run dev` works with no errors

Don't add any styling yet — we'll do that in the next step.
```

---

## Prompt 2 — Design System & Theme

```
[Frontend only — no backend, no server, no external APIs.]

Set up the design system and dark mode theme for a stock trading dashboard called "Canary AI". The visual style is "friendly fintech" — rounded glassmorphic cards, soft shadows, sky-themed background. Think playful and polished, not Bloomberg terminal.

1. Create `src/styles/tokens.css` with CSS custom properties:

   LIGHT MODE (default):
   - --color-sky: #B8D8F8 (main background)
   - --color-surface: rgba(255, 255, 255, 0.92) (card/dock background)
   - --color-text: #1a1a1a
   - --color-text-muted: #6b7280
   - --color-border: #ebebeb
   - --color-accent: #4a6cf7 (primary blue)
   - --color-up: #16a34a (stock going up)
   - --color-down: #dc2626 (stock going down)
   - --shadow-card: 0 16px 50px rgba(0, 0, 0, 0.14)
   - --shadow-button: 0 5px 0
   - --radius-card: 16px
   - --radius-pill: 8px
   - --radius-button: 12px

   DARK/NIGHT MODE (applied via `.night` class on body):
   - --color-sky: #0a1628
   - --color-surface: rgba(30, 41, 59, 0.95)
   - --color-text: #d0d8e8
   - --color-text-muted: #8896b0
   - --color-border: #2a3a5a
   - --color-accent: #6a7ec4

   Also add spacing scale (--space-1 through --space-8, 4px base) and font variables.

2. Create `src/styles/base.css` with:
   - CSS reset (* { margin:0; padding:0; box-sizing:border-box })
   - html, body, #root: full viewport, overflow hidden
   - Body font: 'Segoe UI', system-ui, sans-serif
   - A `.glass-card` utility class: background var(--color-surface), border-radius var(--radius-card), border 2.5px solid var(--color-border), box-shadow var(--shadow-card), backdrop-filter blur(12px)
   - Smooth transition on body background-color (0.4s) for theme switching

3. Create `src/components/GlassCard.jsx`:
   - Reusable component that applies the glass-card styles
   - Props: children, className, style, padding (default '20px')
   - Returns a div with the glass-card class merged with any custom className

4. Create `src/hooks/useTheme.js`:
   - Export a ThemeProvider (React context) and useTheme hook
   - State: mode = 'auto' | 'day' | 'night'
   - In 'auto' mode, check if current time is between 10:00-16:00 AEST (Sydney time) — if so, it's day; otherwise night
   - The resolved theme (isDark boolean) applies/removes the `night` class on document.body
   - Expose: { mode, isDark, cycleMode } where cycleMode goes auto → night → day → auto
   - Wrap App in ThemeProvider in main.jsx

5. Import tokens.css and base.css in main.jsx. Verify everything renders.
```

---

## Prompt 3 — Sky Background & Animations

```
[Frontend only — no backend, no server, no external APIs.]

Create the animated sky background. This is the first thing people see — it should look dreamy and polished.

1. Create `src/utils/animations.js` with GSAP animation helpers:

   - animateCloud(element, duration, delay): Moves a cloud from right edge to left edge in an infinite loop. Use a 3-waypoint GSAP timeline (20% accel, 60% coast, 20% decel) all with ease:'none'. Use force3D:true for performance.

   - animateTwinkle(element, delay): Oscillates opacity between 0.3 and 1.0, duration 1.5 + random(), yoyo infinite, ease power1.inOut.

   - animateBob(element): Gentle vertical bounce y:0 to y:-12 with subtle rotation -1.5 to 1.5, duration 2s, yoyo infinite, ease power1.inOut.

   - animateWindowOpen(element): Scale 0.94→1, opacity 0→1, y:10→0, duration 0.18s, ease power2.out.

   - dockHoverIn/Out(element): y:-3/0, duration 0.12s
   - dockPress(element): y:4, boxShadow:'none', duration 0.06s
   - dockRelease(element, shadowColor): y:-3, restore shadow, duration 0.06s

2. Create `src/features/sky/CloudElement.jsx`:
   - Renders a single cloud as a div
   - The cloud shape uses CSS: a rounded div (border-radius:50px, background:#fff, opacity:0.85) with ::before and ::after pseudo-elements as bumps on top (::before width:55% height:170% top:-55% left:15%, ::after width:38% height:140% top:-45% right:18%, both border-radius:50% background:#fff)
   - Props: width (px), top (css string like '8%')
   - Uses useEffect + ref to call animateCloud on mount, cleanup on unmount
   - Cloud container is position:absolute, left:0, pointer-events:none

3. Create `src/features/sky/StarField.jsx`:
   - Renders ~30 stars (small dots, 2-3px) at seeded random positions
   - Each star gets animateTwinkle with staggered delays
   - Stars are tiny circles (border-radius:50%, background:#e8d98a)
   - Only visible when night mode is active

4. Create `src/features/sky/SkyLayer.jsx`:
   - Position: fixed, inset:0, z-index:0
   - Background: var(--color-sky) with smooth transition
   - When NOT dark: render 7 CloudElements with these configs:
     { width:180, top:'8%',  duration:55, delay:0 }
     { width:120, top:'20%', duration:40, delay:12 }
     { width:220, top:'35%', duration:70, delay:5 }
     { width:90,  top:'50%', duration:35, delay:22 }
     { width:160, top:'65%', duration:60, delay:8 }
     { width:100, top:'15%', duration:45, delay:30 }
     { width:140, top:'75%', duration:50, delay:18 }
   - When dark: render StarField instead of clouds
   - Use useTheme() to determine day/night
   - Add will-change:transform to animated elements

5. Add SkyLayer as the first child in App.jsx (behind everything else).

Test: you should see clouds drifting across a blue sky. In night mode (force it temporarily to test), you should see twinkling stars on a navy background.
```

---

## Prompt 4 — Dock Launcher

```
[Frontend only — no backend, no server, no external APIs.]

Create the central dock that sits at the bottom center of the screen. It's shaped like a cloud and contains app launcher icons.

1. Create `src/data/dockItems.js` exporting a DOCK_ITEMS array:
   [
     { id:'portfolio', label:'Portfolio', icon:'LineChart', bg:'#FFF8A0', border:'#FFE566', shadow:'#e6d000', iconColor:'#c8a800', defaultW:530, defaultH:520, minW:440, minH:400 },
     { id:'chat', label:'Chat', icon:'MessageCircle', bg:'#D6E4FF', border:'#A8BEFF', shadow:'#8090e0', iconColor:'#4a6cf7', defaultW:400, defaultH:480, minW:320, minH:360 },
     { id:'account', label:'Account', icon:'UserCircle', bg:'#d1fae5', border:'#6ee7b7', shadow:'#34d399', iconColor:'#059669', defaultW:340, defaultH:430, minW:300, minH:340 },
     { id:'settings', label:'Settings', icon:'Settings', bg:'#ede9fe', border:'#c4b5fd', shadow:'#a78bfa', iconColor:'#7c3aed', defaultW:360, defaultH:450, minW:300, minH:320 },
     { id:'payment', label:'Payment', icon:'CreditCard', bg:'#fce7f3', border:'#f9a8d4', shadow:'#f472b6', iconColor:'#db2777', defaultW:380, defaultH:480, minW:340, minH:400 },
   ]
   (The icon values are lucide-react component names.)

2. Create `src/features/dock/CanaryLogo.jsx`:
   A simple SVG bird mascot (yellow canary). Here's the exact SVG — just wrap it as a React component with `size` and `sleeping` props:

   <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
     {/* Body */}
     <ellipse cx="20" cy="27" rx="10" ry="9" fill="#FFE500"/>
     {/* Head */}
     <circle cx="20" cy="15" r="8.5" fill="#FFE500"/>
     {/* Eyes - awake */}
     <circle cx="17" cy="14" r="2" fill="#222"/>
     <circle cx="23" cy="14" r="2" fill="#222"/>
     <circle cx="17.7" cy="13.3" r="0.7" fill="white"/>
     <circle cx="23.7" cy="13.3" r="0.7" fill="white"/>
     {/* If sleeping, replace eyes with horizontal lines and add floating 'z's */}
     {/* Beak */}
     <polygon points="20,17 17.5,19.5 22.5,19.5" fill="#f0a800"/>
     {/* Wings */}
     <ellipse cx="13" cy="26" rx="4" ry="6" fill="#f0c800" transform="rotate(-15 13 26)"/>
     <ellipse cx="27" cy="26" rx="4" ry="6" fill="#f0c800" transform="rotate(15 27 26)"/>
     {/* Feet */}
     <line x1="17" y1="36" x2="15" y2="38" stroke="#f0a800" strokeWidth="1.5" strokeLinecap="round"/>
     <line x1="17" y1="36" x2="17" y2="38" stroke="#f0a800" strokeWidth="1.5" strokeLinecap="round"/>
     <line x1="23" y1="36" x2="21" y2="38" stroke="#f0a800" strokeWidth="1.5" strokeLinecap="round"/>
     <line x1="23" y1="36" x2="23" y2="38" stroke="#f0a800" strokeWidth="1.5" strokeLinecap="round"/>
   </svg>

   When `sleeping` is true, show closed eyes (horizontal lines) and small floating "z" letters.

3. Create `src/features/dock/Dock.jsx`:
   - Centered at the bottom of the screen (position absolute, bottom ~5%, left 50%, transform translateX(-50%))
   - Cloud-shaped container: a large rounded div (580px wide, 200px tall, border-radius:80px, background: var(--color-surface), box-shadow: 0 6px 24px rgba(100,140,200,0.18)) with ::before and ::after bumps on top (same technique as sky clouds but bigger)
   - Inside the cloud:
     a. CanaryLogo at the top with bobbing animation (use animateBob from utils/animations.js). Pass `sleeping={isDark}` from useTheme.
     b. Title: "Canary AI" (bold, with "AI" in accent color #8FA4FF)
     c. Tagline: "The trader you always wanted to be" (small, muted text)
     d. Row of icon buttons from DOCK_ITEMS
   - Each icon button:
     - Colored circle (48px, background from item.bg, border 2.5px solid item.border, box-shadow: 0 5px 0 item.shadow)
     - lucide-react icon inside (size 24, color item.iconColor)
     - Label below the button (small text)
     - Active indicator dot below (visible when the app is open)
     - GSAP hover/press animations using dockHoverIn/Out/Press/Release from utils
   - Props: openWindows (array of open window ids), onOpen (callback with appId)
   - z-index: 2 (above sky, below windows)

4. Create `src/features/dock/Dock.css` for the dock-specific styles. Use CSS custom properties from tokens.css where possible.

5. Wire the Dock into App.jsx. For now, onOpen can just console.log the appId. Pass an empty array for openWindows.

Test: You should see the sky background with clouds, and a cloud-shaped dock at the center with 5 colorful icon buttons and the canary bird bobbing gently. Hovering buttons should lift them, pressing should push them down.
```

---

## Prompt 5 — Portfolio View (Star Feature)

```
[Frontend only — no backend, no server, no external APIs. All stock data is mock/static.]

Build the portfolio view — this is the main feature of the dashboard and needs to look premium.

1. Create `src/data/stocks.js` exporting mock stock data:

   export const STOCKS = [
     {
       ticker: 'AAPL', name: 'Apple Inc.', price: '$187.42', change: '+1.24%', up: true, vol: '62.3M',
       theme: { bg:'#FFF8A0', border:'#FFE566', shadow:'#e6d000', text:'#5a4d00', line:'#c8a800', fill:'rgba(200,168,0,0.12)' },
       data: [172,175,174,178,176,180,182,181,184,186,185,187]
     },
     {
       ticker: 'TSLA', name: 'Tesla Inc.', price: '$243.11', change: '-2.87%', up: false, vol: '98.1M',
       theme: { bg:'#fee2e2', border:'#fca5a5', shadow:'#f87171', text:'#7f1d1d', line:'#dc2626', fill:'rgba(220,38,38,0.09)' },
       data: [260,258,255,253,257,250,248,251,247,245,244,243]
     },
     {
       ticker: 'NVDA', name: 'NVIDIA Corp.', price: '$872.55', change: '+4.63%', up: true, vol: '41.7M',
       theme: { bg:'#d1fae5', border:'#6ee7b7', shadow:'#34d399', text:'#064e3b', line:'#059669', fill:'rgba(5,150,105,0.1)' },
       data: [830,838,842,835,848,854,858,862,856,868,870,873]
     },
     {
       ticker: 'MSFT', name: 'Microsoft', price: '$408.10', change: '+0.87%', up: true, vol: '18.4M',
       theme: { bg:'#D6E4FF', border:'#A8BEFF', shadow:'#7b93e0', text:'#1e3a8a', line:'#4a6cf7', fill:'rgba(74,108,247,0.1)' },
       data: [400,401,403,402,404,403,405,406,405,407,407,408]
     },
   ];

   export const PORTFOLIO = {
     totalValue: '$142,830.50',
     change: '+$4,420',
     changePercent: '+3.19%',
     positions: 7,
     marketStatus: 'OPEN',
   };

2. Create `src/components/SparkLine.jsx`:
   - Props: data (number array), color (string), fillColor (string), width (default 260), height (default 55)
   - Normalize data points to fill the SVG viewBox
   - Render an SVG with:
     a. A <polygon> for the gradient fill area (line path + bottom edge)
     b. A <polyline> for the line itself (stroke: color, strokeWidth: 2.5, strokeLinejoin/cap: round)
   - SVG should have preserveAspectRatio="none" and be display:block width:100%
   - Here's the math for point mapping:
     const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
     const pts = data.map((v, i) => {
       const x = (i / (data.length - 1)) * width;
       const y = height - ((v - min) / range) * (height - 10) - 3;
       return `${x.toFixed(1)},${y.toFixed(1)}`;
     });

3. Create `src/features/portfolio/PortfolioHeader.jsx`:
   - Shows "Total Portfolio Value" label (small, muted)
   - Large value: "$142,830.50" (the .50 in smaller/lighter weight)
   - Change pill: green background, shows "↑ +$4,420 · +3.19%"
   - Stats row on the right side: "7 Positions" and "OPEN Market" as small stat chips

4. Create `src/features/portfolio/StockCard.jsx`:
   - Props: stock (one item from STOCKS array)
   - Glassmorphic card with the stock's theme colors
   - Layout:
     a. Header band (background: theme.bg, border-bottom: theme.border): ticker (bold) + company name on left, price + change pill on right
     b. Sparkline chart in the middle (full width)
     c. Footer: volume pill on left ("Vol 62.3M"), time range buttons on right (1D, 1W, 1M, 3M — visual only for now)
   - The card has a 3D button effect: box-shadow: 0 5px 0 theme.shadow
   - Hover: lift up 3px (GSAP). Press: push down 6px.
   - Change pill: green with up arrow for positive, red with down arrow for negative

5. Create `src/features/portfolio/PortfolioView.jsx`:
   - Composes PortfolioHeader + a 2x2 grid of StockCards
   - Grid: CSS grid, 2 columns, gap 16px, padding 16px
   - Import STOCKS and PORTFOLIO from data/stocks.js

6. Create `src/features/portfolio/Portfolio.css` for all portfolio-specific styles.

Don't wire this into the app yet — we'll do that in the next prompt when we build the window system. But do export PortfolioView as the default export so it's ready to use.

Test: Temporarily render <PortfolioView /> directly in App.jsx to verify it looks good. You should see a header with portfolio value and 4 stock cards with colored sparklines in a 2x2 grid. Then revert App.jsx back.
```

---

## Prompt 6 — Window System

```
[Frontend only — no backend, no server, no external APIs.]

Create a window management system that opens app content in draggable windows.

1. Create `src/features/window/AppWindow.jsx`:
   - A draggable, floating window panel
   - Props: id, appId, title, icon (lucide component), themeColors ({bg, border, shadow, iconColor}), position ({x, y}), size ({w, h}), minSize ({w, h}), zIndex, onClose, onFocus, children
   - Structure:
     a. Title bar: colored icon circle (24px, bg from themeColors) + title text + close button (X icon)
     b. Content area: renders children, overflow auto
   - Make it draggable using GSAP Draggable (drag handle = title bar only)
     - bounds: document body / window
     - onDragStart: call onFocus to bring to front
   - Open animation: use animateWindowOpen from utils/animations.js on mount
   - Close: call onClose(id) — parent handles removal
   - Position via style: { position:'absolute', left, top, width, height, zIndex }

2. Create `src/features/window/AppWindow.css` for window styles:
   - Glass card appearance (var(--color-surface), border-radius: var(--radius-card), box-shadow: var(--shadow-card))
   - Title bar: 40px height, flex row, border-bottom, items centered
   - Close button: 24px circle, hover turns red
   - Content area: flex-grow, overflow auto

3. Create `src/features/window/WindowContent.jsx`:
   - A simple router component
   - Props: appId
   - Returns the correct content component based on appId:
     'portfolio' → <PortfolioView />
     Default → <div>Coming soon</div> (placeholder for other apps)

4. Create `src/features/window/WindowManager.jsx`:
   - Manages state: windows array [{id, appId, position, size, zIndex}]
   - openWindow(appId): creates a new window entry (or focuses existing one if already open)
     - Position: center of viewport with slight random offset so windows don't stack exactly
     - Size: from DOCK_ITEMS defaultW/defaultH
     - Assigns incrementing zIndex
   - closeWindow(id): removes from array
   - focusWindow(id): updates zIndex to be highest
   - Renders an AppWindow for each entry, passing WindowContent as children
   - Gets the lucide icon component and theme colors from DOCK_ITEMS config

5. Update App.jsx to compose everything:
   - SkyLayer (z-index 0, behind everything)
   - WindowManager (z-index 1, absolute positioned container for windows)
   - Dock (z-index 2, above windows when no window is focused)
   - Connect Dock's onOpen to WindowManager's openWindow
   - Pass list of open appIds to Dock for active indicator dots

6. Add a night mode toggle button in the top-right corner of the screen:
   - Small circular button (40px), position fixed, top:16px, right:20px, z-index:10
   - Shows Moon icon when in day mode, Sun icon when in night mode
   - Clicking calls cycleMode() from useTheme
   - Small tooltip below showing "Auto" / "Night" / "Day"

Test the full flow:
- Page loads with sky background and dock
- Click Portfolio icon → window opens with stock cards
- Drag the window around by its title bar
- Click the X to close it
- Click the night mode toggle → sky goes dark, stars appear, canary sleeps
- Open multiple windows → clicking one brings it to front
```

---

## Prompt 7 — Polish & Demo Prep

```
[Frontend only — no backend, no server, no external APIs.]

Final polish pass to make this hackathon-ready. Go through each of these and make the app feel premium:

1. ENTRANCE ANIMATION:
   When the page first loads, choreograph a staggered entrance:
   - Sky background fades in (opacity 0→1, 0.5s)
   - Clouds start animating after a 0.3s delay
   - Dock slides up from below (y:40→0, opacity 0→1, 0.6s, ease power3.out, delay 0.5s)
   - Use GSAP timeline for sequencing

2. NIGHT MODE POLISH:
   - In night mode, the dock cloud should be darker (background: rgba(26,42,74,0.92))
   - Stock cards should have slightly muted colors in dark mode (reduce bg opacity)
   - The night toggle button should have a subtle glow in dark mode
   - Theme transition should be smooth (0.4s on all color properties)

3. INTERACTION REFINEMENT:
   - Add a subtle scale(1.02) on stock card hover in addition to the lift
   - Window close animation: scale 1→0.96, opacity 1→0, 0.15s — then remove
   - Dock buttons should have cursor:pointer
   - Active dock dot: small green circle (6px) with a subtle pulse animation

4. VISUAL DETAILS:
   - Add a subtle "Canary AI" brand text in the top-left corner (position fixed, z-index 5, font-weight 900, with "AI" in #8FA4FF color)
   - Make sure all text is legible in both light and dark modes
   - Add subtle text-shadow on UI elements over the sky (0 1px 3px rgba(255,255,255,0.8) for light, adjust for dark)

5. BUG CHECK:
   - Open and close windows rapidly — no animation glitches
   - Toggle night mode while windows are open — colors update smoothly
   - Drag window to edge of screen — shouldn't go off-screen
   - Check console for any React warnings or errors
   - Make sure GSAP timelines are cleaned up on component unmount (no memory leaks)

6. If you find any visual bugs, rough edges, or things that don't look right — fix them. The bar is: someone watching a 2-minute demo should think "this looks professional".
```

---

## Future Prompts (Post-MVP)

Use these after the MVP is solid and you want to expand:

### Add Chat Panel
```
Add an AI chat panel. Create src/features/chat/ChatContent.jsx.
- Header: "Canary AI" with green online-status dot
- Pre-loaded conversation (3-4 messages about AAPL and NVDA performance)
- User messages on right (darker blue bg), AI messages on left (lighter blue bg)
- Text input at bottom with send button
- Auto-scroll to latest message
- No real AI backend — just show the pre-loaded messages and echo back user input
- Register 'chat' in WindowContent.jsx
```

### Add Buy/Sell Trading Panel
```
Add a trading panel. Create src/features/payment/PaymentContent.jsx.
- Buy (green) / Sell (red) tab toggle at the top
- Stock selector dropdown (AAPL, TSLA, NVDA, MSFT with their current prices)
- Shares quantity input
- Read-only "Price / Share" display
- Preview box: order type "Market", estimated total (shares × price), buying power ($28,340)
- Large execute button (green for buy, red for sell) with hover animation
- No real trading — just UI
- Register 'payment' in WindowContent.jsx
```

### Add Account & Settings
```
Add account and settings panels.

Account (src/features/account/AccountContent.jsx):
- Hero section with green gradient, canary avatar, name "Ken Nguyen", email
- Stats: $142K portfolio value, 247 trades
- Info rows: Member since Jan 2024, Pro Trader tier, 7 positions, +38.4% return

Settings (src/features/settings/SettingsContent.jsx):
- Sections: Notifications, Display, AI Features
- Toggle switches for: Price alerts, Email reports, Sound effects, Auto-refresh, Dark mode, AI suggestions
- Each toggle has icon, label, description text, and animated switch
- Dark mode toggle should be wired to the useTheme hook

Register both in WindowContent.jsx.
```

### Add Window Snap-Merge (Advanced)
```
Add Lego-style window snapping. When dragging a window within 30px of another window's edge, snap them together. Merged windows should:
- Track connections via groupId
- Move together when one is dragged
- Un-merge on double-clicking the seam between them
- Animate snap with 0.22s expo.out ease + a blue pulse effect (box-shadow expand)
- Animate un-merge by pushing windows 25px apart in opposite directions
```

### Add Corner Launchers
```
Add expandable corner launchers at bottom-left and bottom-right of the screen.
- Small circular button that expands into a vertical menu of all 5 app icons
- "Clear All" button at the top to close all windows
- Active dot indicator on open apps
- Staggered animation on menu open (each icon slides in with 50ms delay)
```

### Simulate Live Stock Data (Frontend Only — No Real API)
```
Replace the static STOCKS array with a simulated "live" feed — still 100% frontend, no API keys, no backend.

- Create src/services/stockService.js:
  - Export a generateRandomWalk(baseData, steps) function that takes existing sparkline data and appends small random deltas (±0.3%) to simulate price movement
  - Export a simulateQuoteFetch(ticker) async function that wraps the mock data in a Promise with a random 200-600ms delay (to mimic network latency)
- Create src/data/stockHistory.json with 30-day mock sparkline arrays for AAPL, TSLA, NVDA, MSFT (just extend the existing 12-point arrays to 30 points)
- Add a useStocks() hook:
  - On mount, call simulateQuoteFetch for each ticker (shows loading skeleton)
  - Every 15s, run generateRandomWalk to update prices and sparkline data in state
  - Return { stocks, portfolio, isLoading }
- Update PortfolioView to use useStocks() instead of importing STOCKS directly
- Show a simple loading skeleton (pulsing gray rectangles) while "fetching"
- No .env file needed — everything is self-contained in the browser
```

---

## Verification Checklist

After completing prompts 1-7, verify:

- [ ] `npm run dev` runs with no errors
- [ ] Animated sky background with drifting clouds
- [ ] Cloud-shaped dock at center with 5 colored icon buttons
- [ ] Canary bird mascot bobbing gently on the dock
- [ ] Click Portfolio → draggable window opens with stock cards
- [ ] 4 stock cards in a 2x2 grid with sparkline charts
- [ ] Portfolio header shows total value and change
- [ ] Drag windows by title bar, click X to close
- [ ] Night mode toggle: sky goes dark, stars twinkle, canary sleeps
- [ ] Smooth entrance animation on page load
- [ ] No console errors or React warnings
- [ ] Looks impressive enough for a hackathon demo
