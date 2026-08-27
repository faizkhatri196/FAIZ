// FAIZ KHATRI — Ultra-Premium Portfolio Controller v5.0 (AI Engineer Edition)

(function () {
  'use strict';

  // ── SMOOTH HARDWARE-ACCELERATED LERP CURSOR ────────────────────
  const cur = document.getElementById('cur');
  const ring = document.getElementById('ring');
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse), (max-width: 900px)').matches;

  let mouseX = -200, mouseY = -200;
  let ringX = -200, ringY = -200;
  let isHovered = false;

  if (!isTouch && cur && ring) {
    window.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cur.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }, { passive: true });

    function renderCursor() {
      // Smooth lerp for ring follower
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Cursor scaling on interactive elements
    function bindCursorHovers() {
      document.querySelectorAll('a, button, .proj-feature, .proj-wide, .proj-list-item, .info-row, .exp-item, .filter-btn, .skill-group').forEach(el => {
        if (el._cursorBound) return;
        el._cursorBound = true;
        el.addEventListener('mouseenter', () => {
          isHovered = true;
          ring.style.width = '54px';
          ring.style.height = '54px';
          ring.style.borderColor = 'rgba(56,189,248,.6)';
          ring.style.backgroundColor = 'rgba(56,189,248,.04)';
        });
        el.addEventListener('mouseleave', () => {
          isHovered = false;
          ring.style.width = '38px';
          ring.style.height = '38px';
          ring.style.borderColor = 'rgba(255,255,255,.22)';
          ring.style.backgroundColor = 'transparent';
        });
      });
    }
    bindCursorHovers();
    new MutationObserver(bindCursorHovers).observe(document.body, { childList: true, subtree: true });
  }

  // ── BACKGROUND GRID CANVAS ─────────────────────────────────────
  const canvas = document.getElementById('bg-grid-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H;

    function resizeCanvas() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      drawGrid();
    }

    function drawGrid() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,0.025)';
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

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
  }

  // ── AI ENGINEER TYPEWRITER ─────────────────────────────────────
  let words = [
    'Agentic AI Workflows',
    'Advanced RAG Systems',
    'LLM Tool Calling & Graphs',
    'AWS Bedrock Orchestration',
    'Autonomous AI Solutions'
  ];

  let wi = 0, ci = 0, deleting = false;
  const typedEl = document.getElementById('typed');

  function tick() {
    if (!typedEl) return;
    const w = words[wi] || words[0];
    typedEl.textContent = deleting ? w.slice(0, --ci) : w.slice(0, ++ci);

    if (!deleting && ci === w.length) {
      deleting = true;
      return setTimeout(tick, 2200);
    }
    if (deleting && ci === 0) {
      deleting = false;
      wi = (wi + 1) % words.length;
    }
    setTimeout(tick, deleting ? 30 : 65);
  }
  tick();

  // Allow i18n to dynamically update typewriter words
  if (typeof window.onTypewriterWordsUpdate === 'function') {
    window.onTypewriterWordsUpdate(localizedWords => {
      if (Array.isArray(localizedWords) && localizedWords.length) {
        words = localizedWords;
        wi = 0; ci = 0; deleting = false;
      }
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
    const y = window.scrollY + 140;
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
          item.style.transition = 'opacity .35s ease, transform .35s ease';
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
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // ── CONTACT FORM ───────────────────────────────────────────────
  const form = document.getElementById('contactForm');
  const sendBtn = document.getElementById('sendBtn');

  if (form && sendBtn) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const originalText = sendBtn.textContent;
      sendBtn.textContent = 'Message Sent ✓';
      sendBtn.style.background = '#22c55e';
      sendBtn.style.color = '#fff';
      setTimeout(() => {
        sendBtn.textContent = originalText;
        sendBtn.style.background = '';
        sendBtn.style.color = '';
        form.reset();
      }, 3500);
    });
  }

  // ── HERO NAME HOVER PARALLAX (Desktop only) ────────────────────
  const heroName = document.querySelector('.hero-name');
  if (heroName && !isTouch) {
    document.addEventListener('mousemove', e => {
      const px = (e.clientX / window.innerWidth - 0.5) * 8;
      const py = (e.clientY / window.innerHeight - 0.5) * 4;
      heroName.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    }, { passive: true });
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
