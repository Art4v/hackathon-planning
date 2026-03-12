window.AnimUtils = {
  /* ── Sky animations (infinite loops) ── */
  animateCloud: function(el, duration, delay) {
    var vw = window.innerWidth;
    var startX = vw * 1.1;
    var endX = -(el.offsetWidth * 1.2);
    var totalDist = startX - endX;
    var wp1 = startX - totalDist * 0.25;
    var wp2 = startX - totalDist * 0.75;

    gsap.set(el, { x: startX });
    var tl = gsap.timeline({ repeat: -1, delay: delay });
    tl.to(el, { x: wp1, duration: duration * 0.2, ease: 'none' });
    tl.to(el, { x: wp2, duration: duration * 0.6, ease: 'none' });
    tl.to(el, { x: endX, duration: duration * 0.2, ease: 'none' });
    return tl;
  },

  animateBird: function(el, duration, delay) {
    var startX = window.innerWidth * 1.1;
    var endX = -200;
    var totalDist = startX - endX;
    var wp1 = startX - totalDist * 0.25;
    var wp2 = startX - totalDist * 0.75;

    gsap.set(el, { x: startX });
    var tl = gsap.timeline({ repeat: -1, delay: delay });
    tl.to(el, { x: wp1, duration: duration * 0.2, ease: 'none' });
    tl.to(el, { x: wp2, duration: duration * 0.6, ease: 'none' });
    tl.to(el, { x: endX, duration: duration * 0.2, ease: 'none' });
    return tl;
  },

  animateFlap: function(wingGroup, speed, delay) {
    gsap.fromTo(wingGroup,
      { rotation: -30 },
      { rotation: 30,
        duration: speed / 2,
        delay: delay,
        svgOrigin: '18 14',
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true }
    );
  },

  /* ── Star twinkle ── */
  animateTwinkle: function(el, delay) {
    gsap.fromTo(el, { opacity: 0.3 }, {
      opacity: 1, duration: 1.5 + Math.random(), delay: delay,
      ease: 'power1.inOut', repeat: -1, yoyo: true
    });
  },

  /* ── Mascot bob ── */
  animateBob: function(el) {
    gsap.fromTo(el,
      { y: 0, rotation: -1.5 },
      { y: -12, rotation: 1.5, duration: 2, ease: 'power1.inOut', repeat: -1, yoyo: true }
    );
  },

  /* ── Window open ── */
  animateWindowOpen: function(el) {
    gsap.fromTo(el,
      { opacity: 0, scale: 0.94, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.18, ease: 'power2.out' }
    );
  },

  /* ── Dock button hover/press ── */
  dockHoverIn: function(el) {
    gsap.to(el, { y: -3, duration: 0.12, ease: 'power2.out' });
  },
  dockHoverOut: function(el) {
    gsap.to(el, { y: 0, duration: 0.12, ease: 'power2.out' });
  },
  dockPress: function(el) {
    gsap.to(el, { y: 4, boxShadow: 'none', duration: 0.06 });
  },
  dockRelease: function(el, shadow) {
    gsap.to(el, { y: -3, boxShadow: '0 5px 0 ' + shadow, duration: 0.06 });
  },

  /* ── Toggle switch ── */
  animateToggle: function(el, isOn) {
    var knob = el.querySelector('::after') || el;
    gsap.to(el, {
      backgroundColor: isOn ? '#A8BEFF' : '#e5e5e5',
      borderColor: isOn ? '#8090e0' : '#d0d0d0',
      duration: 0.2
    });
  },

  /* ── Card hover ── */
  cardHoverIn: function(el) {
    gsap.to(el, { y: 3, duration: 0.12, ease: 'power2.out' });
  },
  cardHoverOut: function(el) {
    gsap.to(el, { y: 0, duration: 0.12, ease: 'power2.out' });
  },
  cardPress: function(el) {
    gsap.to(el, { y: 6, duration: 0.06 });
  },

  /* ── Pay button hover ── */
  buttonHoverIn: function(el) {
    gsap.to(el, { y: 2, duration: 0.1, ease: 'power2.out' });
  },
  buttonHoverOut: function(el) {
    gsap.to(el, { y: 0, duration: 0.1, ease: 'power2.out' });
  },
  buttonPress: function(el) {
    gsap.to(el, { y: 4, boxShadow: 'none', duration: 0.06 });
  },

  /* ── Lego merge snap ── */
  animateSnapMerge: function(el, snapX, snapY, onComplete) {
    gsap.to(el, { left: snapX, top: snapY, duration: 0.3, ease: 'back.out(1.4)', onComplete: onComplete });
  },
  animateSnapPulse: function(el) {
    gsap.fromTo(el, { boxShadow: '0 0 0 0px rgba(74,108,247,0.4)' },
      { boxShadow: '0 0 0 8px rgba(74,108,247,0)', duration: 0.4, ease: 'power2.out' });
  },

  /* ── Lego un-merge ── */
  animateUnmerge: function(elA, elB, edge, onComplete) {
    var offset = 25;
    var propsA = {};
    var propsB = {};
    if (edge === 'right' || edge === 'left') {
      var aDir = edge === 'right' ? '-=' : '+=';
      var bDir = edge === 'right' ? '+=' : '-=';
      propsA.left = aDir + offset;
      propsB.left = bDir + offset;
    } else {
      var aDir2 = edge === 'bottom' ? '-=' : '+=';
      var bDir2 = edge === 'bottom' ? '+=' : '-=';
      propsA.top = aDir2 + offset;
      propsB.top = bDir2 + offset;
    }
    propsA.duration = 0.25;
    propsA.ease = 'power2.out';
    propsB.duration = 0.25;
    propsB.ease = 'power2.out';
    propsB.onComplete = onComplete;
    gsap.to(elA, propsA);
    gsap.to(elB, propsB);
  },
};
