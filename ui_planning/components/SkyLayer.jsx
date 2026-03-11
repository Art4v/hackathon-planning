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

window.SkyLayer = function SkyLayer() {
  const cloudRefs = React.useRef([]);
  const birdRefs = React.useRef([]);
  const { CLOUDS, BIRDS } = window.APP_DATA;

  React.useEffect(() => {
    var tweens = [];

    CLOUDS.forEach(function(c, i) {
      var el = cloudRefs.current[i];
      if (el) {
        AnimUtils.animateCloud(el, c.duration, c.delay);
        tweens.push(el);
      }
    });

    BIRDS.forEach(function(b, i) {
      var el = birdRefs.current[i];
      if (el) {
        AnimUtils.animateBird(el, b.duration, b.delay);
        tweens.push(el);
        var wings = el.querySelectorAll('.bird-wing');
        wings.forEach(function(w) {
          AnimUtils.animateFlap(w, b.flapSpeed, b.wingDelay);
          tweens.push(w);
        });
      }
    });

    return function() {
      tweens.forEach(function(el) { gsap.killTweensOf(el); });
    };
  }, []);

  return (
    <>
      {CLOUDS.map((c, i) => (
        <div key={i} className="cloud"
          ref={function(el) { cloudRefs.current[i] = el; }}
          style={{ width: c.width, height: Math.round(c.width * 0.35), top: c.top }}/>
      ))}
      {BIRDS.map((b, i) => (
        <FlyingBird key={i}
          ref={function(el) { birdRefs.current[i] = el; }}
          style={{ top: b.top }}/>
      ))}
    </>
  );
};
