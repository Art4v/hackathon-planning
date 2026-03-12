window.CanaryLogo = ({ size=36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    {/* Body */}
    <ellipse cx="20" cy="27" rx="10" ry="9" fill="#FFE500"/>
    {/* Head */}
    <circle cx="20" cy="15" r="8.5" fill="#FFE500"/>
    {/* Eyes */}
    <circle cx="17" cy="14" r="2" fill="#222"/>
    <circle cx="23" cy="14" r="2" fill="#222"/>
    <circle cx="17.7" cy="13.3" r="0.7" fill="white"/>
    <circle cx="23.7" cy="13.3" r="0.7" fill="white"/>
    {/* Beak */}
    <polygon points="20,17 17.5,19.5 22.5,19.5" fill="#f0a800"/>
    {/* Wing */}
    <ellipse cx="13" cy="26" rx="4" ry="6" fill="#f0c800" transform="rotate(-15 13 26)"/>
    <ellipse cx="27" cy="26" rx="4" ry="6" fill="#f0c800" transform="rotate(15 27 26)"/>
    {/* Feet */}
    <line x1="17" y1="36" x2="15" y2="38" stroke="#f0a800" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="17" y1="36" x2="17" y2="38" stroke="#f0a800" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="23" y1="36" x2="21" y2="38" stroke="#f0a800" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="23" y1="36" x2="23" y2="38" stroke="#f0a800" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
