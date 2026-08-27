// FAIZ KHATRI — Ultra-Premium Portfolio Controller v3.0

(function () {
  'use strict';

  // ── CUSTOM CURSOR ──────────────────────────────────────────────
  const cur = document.getElementById('cur');
  const ring = document.getElementById('ring');
  let mx = -200, my = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (cur) { cur.style.left = mx + 'px'; cur.style.top = my + 'px'; }
    if (ring) { ring.style.left = mx + 'px'; ring.style.top = my + 'px'; }
  });

  // Cursor scaling on interactive elements
  function bindCursorHovers() {
    document.querySelectorAll('a, button, .chip, .proj-list-item, .info-row, .exp-item, .filter-btn').forEach(el => {
      if (el._cursorBound) return;
      el._cursorBound = true;
      el.addEventListener('mouseenter', () => {
        if (!ring) return;
        ring.style.width = '52px';
        ring.style.height = '52px';
        ring.style.borderColor = 'rgba(56,189,248,.5)';
      });
      el.addEventListener('mouseleave', () => {
        if (!ring) return;
        ring.style.width = '36px';
        ring.style.height = '36px';
        ring.style.borderColor = 'rgba(255,255,255,.25)';
      });
    });
  }
  bindCursorHovers();
  new MutationObserver(bindCursorHovers).observe(document.body, { childList: true, subtree: true });

  // ── BACKGROUND GRID CANVAS ─────────────────────────────────────
  const canvas = document.getElementById('bg-grid-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H;

    function resizeCanvas() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function drawGrid() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;

      const step = 80;
      ctx.beginPath();
      for (let x = 0; x <= W; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
      }
      for (let y = 0; y <= H; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
      }
      ctx.stroke();
    }

    drawGrid();
    window.addEventListener('resize', drawGrid);
  }

  // ── TYPEWRITER ─────────────────────────────────────────────────
  let words = [
    'Advanced RAG Systems',
    'Agentic AI Workflows',
    'LLM Applications',
    'Full Stack Products',
    'AWS Bedrock Solutions'
  ];

  let wi = 0, ci = 0, deleting = false;
  const typedEl = document.getElementById('typed');

  function tick() {
    if (!typedEl) return;
    const w = words[wi];
    typedEl.textContent = deleting ? w.slice(0, --ci) : w.slice(0, ++ci);

    if (!deleting && ci === w.length) {
      deleting = true;
      return setTimeout(tick, 2000);
    }
    if (deleting && ci === 0) {
      deleting = false;
      wi = (wi + 1) % words.length;
    }
    setTimeout(tick, deleting ? 30 : 70);
  }
  tick();

  // Allow i18n to update typewriter words
  if (typeof window.onTypewriterWordsUpdate === 'function') {
    window.onTypewriterWordsUpdate(localizedWords => {
      if (Array.isArray(localizedWords) && localizedWords.length) {
        words = localizedWords;
        wi = 0; ci = 0; deleting = false;
      }
    });
  }

  // ── DOCK — LANGUAGE SELECTOR ───────────────────────────────────
  const langBtn = document.getElementById('langBtn');
  const langMenu = document.getElementById('langMenu');
  const langCurrent = document.getElementById('langCurrent');

  if (langBtn && langMenu) {
    langBtn.addEventListener('click', e => {
      e.stopPropagation();
      langMenu.classList.toggle('open');
    });

    document.addEventListener('click', e => {
      if (!langBtn.contains(e.target) && !langMenu.contains(e.target)) {
        langMenu.classList.remove('open');
      }
    });

    langMenu.querySelectorAll('.lang-item').forEach(item => {
      item.addEventListener('click', () => {
        const lang = item.dataset.lang;
        langMenu.querySelectorAll('.lang-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        if (langCurrent) langCurrent.textContent = lang.toUpperCase();
        langMenu.classList.remove('open');

        // Trigger i18n change if available
        if (typeof window.setLocale === 'function') window.setLocale(lang);
      });
    });
  }

  // ── DOCK — MOBILE BURGER ───────────────────────────────────────
  const burger = document.getElementById('dockBurger');
  const dockMid = document.getElementById('dock-mid');

  if (burger && dockMid) {
    burger.addEventListener('click', e => {
      e.stopPropagation();
      dockMid.classList.toggle('open');
    });

    document.addEventListener('click', e => {
      if (!burger.contains(e.target) && !dockMid.contains(e.target)) {
        dockMid.classList.remove('open');
      }
    });

    dockMid.querySelectorAll('.dock-link').forEach(link => {
      link.addEventListener('click', () => dockMid.classList.remove('open'));
    });
  }

  // ── DOCK — ACTIVE LINK ON SCROLL ──────────────────────────────
  const sections = [...document.querySelectorAll('section[id]')];
  const dockLinks = [...document.querySelectorAll('.dock-link')];

  window.addEventListener('scroll', () => {
    let current = '';
    const y = window.scrollY + 120;
    sections.forEach(s => {
      if (y >= s.offsetTop) current = s.id;
    });
    dockLinks.forEach(a => {
      a.classList.toggle('active-link', a.getAttribute('href') === '#' + current);
    });
  }, { passive: true });

  // ── PROJECT FILTERING ──────────────────────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('[data-category]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const f = btn.dataset.filter;

      projectItems.forEach(item => {
        const cats = (item.dataset.category || '').split(' ');
        if (f === 'all' || cats.includes(f)) {
          item.classList.remove('hidden-card');
          item.style.opacity = '0';
          item.style.transform = 'translateY(10px)';
          item.style.transition = 'opacity .4s ease, transform .4s ease';
          requestAnimationFrame(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          });
        } else {
          item.classList.add('hidden-card');
        }
      });
    });
  });

  // ── SCROLL REVEAL ──────────────────────────────────────────────
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.06 });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // ── CONTACT FORM ───────────────────────────────────────────────
  const form = document.getElementById('contactForm');
  const sendBtn = document.getElementById('sendBtn');

  if (form && sendBtn) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      sendBtn.textContent = 'Message Sent ✓';
      sendBtn.style.background = '#22c55e';
      sendBtn.style.color = '#fff';
      setTimeout(() => {
        sendBtn.textContent = 'Send Message →';
        sendBtn.style.background = '';
        sendBtn.style.color = '';
        form.reset();
      }, 3500);
    });
  }

  // ── HERO NAME HOVER PARALLAX ───────────────────────────────────
  const heroName = document.querySelector('.hero-name');
  if (heroName) {
    document.addEventListener('mousemove', e => {
      const px = (e.clientX / window.innerWidth - 0.5) * 8;
      const py = (e.clientY / window.innerHeight - 0.5) * 4;
      heroName.style.transform = `translate(${px}px, ${py}px)`;
    });
  }

  // ── DOCK SCROLL EFFECT ─────────────────────────────────────────
  const dock = document.getElementById('dock');
  if (dock) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        dock.style.boxShadow = '0 8px 40px rgba(0,0,0,.7), 0 0 60px rgba(56,189,248,.08)';
      } else {
        dock.style.boxShadow = '';
      }
    }, { passive: true });
  }

})();
