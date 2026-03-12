const FlyingBird = React.forwardRef(({ style }, ref) => (
  <svg className="canary-bird" width="36" height="24" viewBox="0 0 36 24" fill="none" style={style} ref={ref}>
    <g transform="scale(-1,1) translate(-36,0)">
      {/* Tail */}
      <polygon points="2,12 7,8 7,16" fill="#FFD000"/>
      {/* Body */}
      <ellipse cx="16" cy="12" rx="10" ry="6" fill="#FFE500"/>
      {/* Wing — single, animated via parent <g> */}
      <g className="bird-wing">
        <ellipse cx="11" cy="14" rx="7" ry="3" fill="#FFD000"/>
      </g>
      {/* Head */}
      <circle cx="26" cy="9" r="5" fill="#FFE500"/>
      {/* Eye */}
      <circle cx="28" cy="8" r="1.2" fill="#222"/>
      <circle cx="28.5" cy="7.5" r="0.4" fill="white"/>
      {/* Beak */}
      <polygon points="31,9 35,10.5 31,12" fill="#FF8C00"/>
    </g>
  </svg>
));

// Static star positions so they don't jump on re-render
var STAR_DATA = (function() {
  var stars = [];
  // Simple seeded pseudo-random using a fixed seed
  var seed = 12345;
  function rand() { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646; }
  for (var i = 0; i < 35; i++) {
    stars.push({
      left: rand() * 100,
      top: rand() * 60,
      size: 1.5 + rand() * 2.5,
      delay: rand() * 3
    });
  }
  return stars;
})();

window.SkyLayer = function SkyLayer({ isNight }) {
  const cloudRefs = React.useRef([]);
  const birdRefs = React.useRef([]);
  const starRefs = React.useRef([]);
  const { CLOUDS, BIRDS } = window.APP_DATA;

  React.useEffect(() => {
    var timelines = [];

    CLOUDS.forEach(function(c, i) {
      var el = cloudRefs.current[i];
      if (el) {
        var tl = AnimUtils.animateCloud(el, c.duration, c.delay);
        timelines.push(tl);
      }
    });

    if (!isNight) {
      BIRDS.forEach(function(b, i) {
        var el = birdRefs.current[i];
        if (el) {
          var tl = AnimUtils.animateBird(el, b.duration, b.delay);
          timelines.push(tl);
          var wings = el.querySelectorAll('.bird-wing');
          wings.forEach(function(w) {
            AnimUtils.animateFlap(w, b.flapSpeed, b.wingDelay);
            timelines.push({ kill: function() { gsap.killTweensOf(w); } });
          });
        }
      });
    }

    if (isNight) {
      STAR_DATA.forEach(function(s, i) {
        var el = starRefs.current[i];
        if (el) {
          AnimUtils.animateTwinkle(el, s.delay);
          timelines.push({ kill: function() { gsap.killTweensOf(el); } });
        }
      });
    }

    return function() {
      timelines.forEach(function(tl) { tl.kill(); });
    };
  }, [isNight]);

  return (
    <>
      {CLOUDS.map((c, i) => (
        <div key={i} className={'cloud' + (isNight ? ' night' : '')}
          ref={function(el) { cloudRefs.current[i] = el; }}
          style={{ width: c.width, height: Math.round(c.width * 0.35), top: c.top }}/>
      ))}
      {!isNight && BIRDS.map((b, i) => (
        <FlyingBird key={i}
          ref={function(el) { birdRefs.current[i] = el; }}
          style={{ top: b.top }}/>
      ))}
      {isNight && STAR_DATA.map((s, i) => (
        <div key={i} className="star"
          ref={function(el) { starRefs.current[i] = el; }}
          style={{ left: s.left + '%', top: s.top + '%', width: s.size, height: s.size }}/>
      ))}
    </>
  );
};
