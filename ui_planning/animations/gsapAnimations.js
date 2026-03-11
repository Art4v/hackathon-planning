window.AnimUtils = {
  /* ── Sky animations (infinite loops) ── */
  animateCloud: function(el, duration, delay) {
    gsap.fromTo(el,
      { x: '110vw' },
      { x: '-120%', duration: duration, delay: delay, ease: 'none', repeat: -1 }
    );
  },

  animateBird: function(el, duration, delay) {
    gsap.fromTo(el,
      { x: '110vw' },
      { x: -200, duration: duration, delay: delay, ease: 'none', repeat: -1 }
    );
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
};
