// Master Portfolio Application Controller

function initMainApp() {

  // ── AUDIO SOUND EFFECTS SYNTHESIZER ──
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Trigger audio initialization on first user interaction
  document.body.addEventListener('click', initAudio, { once: true });
  document.body.addEventListener('touchstart', initAudio, { once: true });

  function playHoverSound() {
    if (!audioCtx || audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.012, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  }

  function playClickSound() {
    initAudio();
    if (!audioCtx || audioCtx.state === 'suspended') return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(250, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  }

  // ── CUSTOM NEON CURSOR & HERO PARALLAX ──
  const cur = document.getElementById('cur');
  const ring = document.getElementById('ring');
  const heroInner = document.querySelector('.hero-inner');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    
    if (cur) {
      cur.style.left = mx - 4 + 'px';
      cur.style.top = my - 4 + 'px';
    }

    if (heroInner && window.scrollY < window.innerHeight) {
      const x = (mx - window.innerWidth / 2) * -0.025;
      const y = (my - window.innerHeight / 2) * -0.025;
      heroInner.style.transform = `translate(${x}px, ${y}px)`;
    }
  });

  // Smooth ring follow loop
  (function loopRing() {
    if (ring) {
      rx += (mx - rx - 23) * 0.12;
      ry += (my - ry - 23) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
    }
    requestAnimationFrame(loopRing);
  })();

  // Attach hover events to interactive nodes
  function applyCursorHovers() {
    document.querySelectorAll('a, button, .proj-card, .stat, .sk-cat, .btn, .lang-trigger, .lang-opt, .exp-card').forEach(el => {
      // Avoid duplicate bindings
      if (el.dataset.hoverBound) return;
      el.dataset.hoverBound = 'true';

      el.addEventListener('mouseenter', () => {
        if (cur && ring) {
          cur.style.transform = 'scale(2.2)';
          cur.style.background = 'var(--mag)';
          cur.style.boxShadow = '0 0 15px 4px var(--mag)';
          ring.style.transform = 'scale(1.5)';
          ring.style.borderColor = 'var(--mag)';
        }
        playHoverSound();
      });

      el.addEventListener('mouseleave', () => {
        if (cur && ring) {
          cur.style.transform = 'scale(1)';
          cur.style.background = 'var(--cyan)';
          cur.style.boxShadow = '0 0 15px 4px var(--cyan)';
          ring.style.transform = 'scale(1)';
          ring.style.borderColor = 'rgba(0,245,255,.3)';
        }
      });

      el.addEventListener('click', () => {
        playClickSound();
      });
    });
  }
  applyCursorHovers();
  
  // Re-apply hover binds when DOM modifications happen (e.g. language load)
  const observer = new MutationObserver(applyCursorHovers);
  observer.observe(document.body, { childList: true, subtree: true });

  // ── DYNAMIC TYPEWRITER WITH LOCALIZATION LINK ──
  let words = ['AI Engineer', 'Full-Stack Developer', 'IT Engineering Student', 'GenAI Enthusiast', 'UI Animation Nerd'];
  let wi = 0, ci = 0, del = false;
  const typedEl = document.getElementById('typed');

  function typewriterTick() {
    if (!typedEl) return;
    const w = words[wi];
    typedEl.textContent = del ? w.slice(0, --ci) : w.slice(0, ++ci);
    
    if (!del && ci === w.length) {
      del = true;
      setTimeout(typewriterTick, 1500); // Wait at full word
      return;
    }
    if (del && ci === 0) {
      del = false;
      wi = (wi + 1) % words.length;
    }
    setTimeout(typewriterTick, del ? 40 : 80);
  }
  typewriterTick();

  // Register listener with i18n system to refresh words instantly on language swap
  if (typeof window.onTypewriterWordsUpdate === 'function') {
    window.onTypewriterWordsUpdate((localizedWords) => {
      words = localizedWords;
      wi = 0;
      ci = 0;
      del = false;
    });
  }

  // ── SCROLL REVEAL ──
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('vis');
        e.target.querySelectorAll('.sk-fill').forEach(b => {
          setTimeout(() => { b.style.width = b.dataset.w + '%'; }, 180);
        });
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fu').forEach(el => revealObserver.observe(el));

  // Skills fill trigger backup
  const skillsSec = document.getElementById('skills');
  if (skillsSec) {
    const skillsObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        document.querySelectorAll('.sk-fill').forEach(b => {
          setTimeout(() => { b.style.width = b.dataset.w + '%'; }, 200);
        });
      }
    }, { threshold: 0.1 });
    skillsObserver.observe(skillsSec);
  }

  // ── ACTIVE NAV LINK ON SCROLL ──
  const sections = [...document.querySelectorAll('section[id]')];
  const navLinks = [...document.querySelectorAll('.nav-links a')];

  window.addEventListener('scroll', () => {
    if (isTransitioning) return;
    let currentSectionId = '';
    const scrollPos = window.scrollY;

    sections.forEach(s => {
      if (scrollPos >= s.offsetTop - 150) {
        currentSectionId = s.id;
      }
    });

    navLinks.forEach(a => {
      const href = a.getAttribute('href');
      if (href === '#' + currentSectionId) {
        a.style.color = 'var(--cyan)';
      } else {
        a.style.color = '';
      }
    });
  }, { passive: true });

  // ── CONTACT FORM BUTTON FEEDBACK ──
  const sendBtn = document.getElementById('sendBtn');
  if (sendBtn) {
    sendBtn.addEventListener('click', function() {
      this.textContent = 'Message Sent ✓';
      this.style.background = 'var(--grn)';
      this.style.color = 'var(--bg)';
      this.style.borderColor = 'var(--grn)';
      this.style.boxShadow = '0 0 30px rgba(57,255,20,.4)';
      setTimeout(() => {
        this.textContent = window.translate('contact.btn_send') || 'Send Message →';
        this.style.cssText = '';
      }, 3200);
    });
  }

  // ── 3D INTEGRATED TILT MATRIX ──
  document.querySelectorAll('.proj-card, .stat, .sk-cat, .exp-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation angles
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.transition = 'transform 0.08s ease-out';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      card.style.transition = 'transform 0.4s ease-out';
    });
  });

  // ── MAGNETIC UTILITY FOR HERO BUTTONS ──
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });

  // ── SIMPLE COLOR WIPE PAGE TRANSITION ENGINE ──
  const tOverlay = document.getElementById('transition-overlay');
  let isTransitioning = false;
  
  window.triggerTransition = function(midpointCallback) {
    if (isTransitioning) return;
    isTransitioning = true;
    
    if (tOverlay) {
      tOverlay.style.animation = 'none';
      tOverlay.offsetHeight; // force DOM reflow
      tOverlay.classList.add('active');
    }
    
    // Call state update at midpoint of swipe
    setTimeout(() => {
      if (typeof midpointCallback === 'function') {
        midpointCallback();
      }
    }, 750);
    
    // End transition
    setTimeout(() => {
      isTransitioning = false;
      if (tOverlay) {
        tOverlay.classList.remove('active');
      }
    }, 1500);
  };

  // Wire up transition on nav page anchor links
  document.querySelectorAll('.nav-links a, .hero-btns a').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (targetId.startsWith('#')) {
        e.preventDefault();
        
        window.triggerTransition(() => {
          const targetSection = document.querySelector(targetId);
          if (targetSection) {
            window.scrollTo({
              top: targetSection.offsetTop,
              behavior: 'instant'
            });
          }
        });
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMainApp);
} else {
  initMainApp();
}
