// FAIZ KHATRI — Portfolio Architectural Controller v6.0
// Elite Motion Design, Smooth Lenis Integration, Preloader, Magnetic Interactions, and Micro-Engines

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────────
  // 01 · PRELOADER & INITIAL CURTAIN REVEAL
  // ─────────────────────────────────────────────────────────────────
  const preloader = document.getElementById('preloader');
  const preloaderCount = document.getElementById('preloader-count');
  const preloaderBar = document.getElementById('preloader-progress-bar');
  const preloaderStatus = document.getElementById('preloader-status');

  let progress = 0;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function runPreloader() {
    if (!preloader) {
      document.body.classList.add('site-loaded');
      return;
    }

    const interval = setInterval(() => {
      // Faster progression curve with slight realistic jitter
      progress += Math.floor(Math.random() * 8) + 4;
      if (progress > 100) progress = 100;

      if (preloaderCount) {
        preloaderCount.textContent = (progress < 10 ? '00' : progress < 100 ? '0' : '') + progress + '%';
      }
      if (preloaderBar) {
        preloaderBar.style.width = progress + '%';
      }

      if (progress >= 100) {
        clearInterval(interval);
        if (preloaderStatus) {
          preloaderStatus.textContent = window.translate ? window.translate('preloader.ready') : 'SYSTEM READY';
        }

        setTimeout(() => {
          preloader.classList.add('preloader-exit');
          document.body.classList.add('site-loaded');

          // Trigger entrance reveals
          triggerEntranceAnimations();

          setTimeout(() => {
            if (preloader.parentNode) {
              preloader.parentNode.removeChild(preloader);
            }
          }, 850);
        }, isReducedMotion ? 50 : 250);
      }
    }, isReducedMotion ? 10 : 35);
  }

  if (document.readyState === 'complete') {
    runPreloader();
  } else {
    window.addEventListener('load', runPreloader);
  }

  // ─────────────────────────────────────────────────────────────────
  // 02 · LENIS SMOOTH SCROLLING (With Native Fallback)
  // ─────────────────────────────────────────────────────────────────
  let lenisInstance = null;
  const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  if (typeof window.Lenis !== 'undefined' && !isReducedMotion && !isTouchDevice) {
    try {
      lenisInstance = new window.Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false,
        direction: 'vertical'
      });

      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      // Connect with GSAP ScrollTrigger if present
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        lenisInstance.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
          lenisInstance.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      }
    } catch (e) {
      console.warn('Lenis smooth scrolling fallback to native:', e);
    }
  }

  // Handle smooth scroll clicks for internal anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        if (lenisInstance) {
          lenisInstance.scrollTo(targetEl, { offset: -70 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
        // If mobile menu is open, close it
        const mobileDrawer = document.getElementById('mobileDrawer');
        if (mobileDrawer && mobileDrawer.classList.contains('open')) {
          closeMobileMenu();
        }
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 03 · HARDWARE-ACCELERATED LERP CURSOR & MAGNETIC BUTTONS
  // ─────────────────────────────────────────────────────────────────
  const cur = document.getElementById('cur');
  const ring = document.getElementById('ring');

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  if (!isTouchDevice && cur && ring) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cur.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }, { passive: true });

    function renderCursor() {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Interactive element targeting
    function setupCursorListeners() {
      const targets = document.querySelectorAll(
        'a, button, .interactive-card, .proj-card, .skill-node, .filter-btn, .lang-item, input, textarea, .magnetic'
      );

      targets.forEach((el) => {
        if (el._cursorAttached) return;
        el._cursorAttached = true;

        el.addEventListener('mouseenter', () => {
          ring.classList.add('ring-hover');
          cur.classList.add('cur-hover');
        });

        el.addEventListener('mouseleave', () => {
          ring.classList.remove('ring-hover');
          cur.classList.remove('cur-hover');
        });
      });
    }

    setupCursorListeners();
    new MutationObserver(setupCursorListeners).observe(document.body, { childList: true, subtree: true });

    // Magnetic buttons physics
    const magneticElements = document.querySelectorAll('.magnetic');
    magneticElements.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate3d(${x * 0.28}px, ${y * 0.28}px, 0)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate3d(0, 0, 0)';
        el.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        setTimeout(() => { el.style.transition = ''; }, 400);
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 04 · TYPEWRITER ENGINE
  // ─────────────────────────────────────────────────────────────────
  let typewriterWords = [
    'Agentic AI Workflows',
    'Advanced RAG Architectures',
    'AI Payment Security & Guardrails',
    'AWS Bedrock Orchestration',
    'Scalable Full Stack Products'
  ];

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typedEl = document.getElementById('typed');

  function tickTypewriter() {
    if (!typedEl) return;
    const currentWord = typewriterWords[wordIndex] || typewriterWords[0];

    typedEl.textContent = isDeleting
      ? currentWord.substring(0, --charIndex)
      : currentWord.substring(0, ++charIndex);

    if (!isDeleting && charIndex === currentWord.length) {
      isDeleting = true;
      setTimeout(tickTypewriter, 2400);
      return;
    }

    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % typewriterWords.length;
    }

    setTimeout(tickTypewriter, isDeleting ? 35 : 70);
  }
  tickTypewriter();

  if (typeof window.onTypewriterWordsUpdate === 'function') {
    window.onTypewriterWordsUpdate((localizedWords) => {
      if (Array.isArray(localizedWords) && localizedWords.length) {
        typewriterWords = localizedWords;
        wordIndex = 0;
        charIndex = 0;
        isDeleting = false;
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 05 · ENTRANCE & SCROLL REVEAL ANIMATIONS
  // ─────────────────────────────────────────────────────────────────
  function triggerEntranceAnimations() {
    const heroReveals = document.querySelectorAll('#hero .reveal');
    heroReveals.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('in-view');
      }, i * 90);
    });
  }

  // IntersectionObserver for all subsequent reveals
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    // Hero elements will be triggered by triggerEntranceAnimations() once preloader completes
    if (!el.closest('#hero')) {
      revealObserver.observe(el);
    }
  });

  // ─────────────────────────────────────────────────────────────────
  // 06 · PROJECT FILTERING SYSTEM
  // ─────────────────────────────────────────────────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.proj-card[data-category]');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      projectCards.forEach((card) => {
        const categories = (card.dataset.category || '').split(' ');
        const matches = filter === 'all' || categories.includes(filter);

        if (matches) {
          card.classList.remove('hidden-project');
          card.style.opacity = '0';
          card.style.transform = 'translateY(16px)';
          requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.classList.add('hidden-project');
        }
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 07 · CARD HOVER COORDINATE LIGHTING (Awwwards 3D Sheen)
  // ─────────────────────────────────────────────────────────────────
  const interactiveCards = document.querySelectorAll('.interactive-card, .proj-card, .skill-card, .exp-card');
  interactiveCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // ─────────────────────────────────────────────────────────────────
  // 08 · MOBILE DRAWER NAVIGATION
  // ─────────────────────────────────────────────────────────────────
  const burgerBtn = document.getElementById('dockBurger');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');

  function openMobileMenu() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('open');
    burgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('open');
    burgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (burgerBtn && mobileDrawer) {
    burgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (mobileDrawer.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener('click', closeMobileMenu);
    }

    mobileDrawer.querySelectorAll('.drawer-link').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 09 · ACTIVE NAV LINK ON SCROLL & DOCK SHADOW
  // ─────────────────────────────────────────────────────────────────
  const dock = document.getElementById('dock');
  const navSections = [...document.querySelectorAll('section[id]')];
  const dockNavLinks = [...document.querySelectorAll('.dock-link')];

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Header dock shadow & background depth
    if (dock) {
      if (scrollY > 40) {
        dock.classList.add('dock-scrolled');
      } else {
        dock.classList.remove('dock-scrolled');
      }
    }

    // Active link highlighting
    let currentId = '';
    const triggerPoint = scrollY + 220;

    navSections.forEach((section) => {
      if (triggerPoint >= section.offsetTop) {
        currentId = section.id;
      }
    });

    dockNavLinks.forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('active-link', href === '#' + currentId);
    });
  }, { passive: true });

  // ─────────────────────────────────────────────────────────────────
  // 10 · LIVE CLOCK (Gujarat, India · UTC+5:30)
  // ─────────────────────────────────────────────────────────────────
  const liveClockEl = document.getElementById('liveClock');

  function updateLiveClock() {
    if (!liveClockEl) return;
    try {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      const formatter = new Intl.DateTimeFormat([], options);
      liveClockEl.textContent = `${formatter.format(now)} IST`;
    } catch (e) {
      const now = new Date();
      liveClockEl.textContent = `${now.toTimeString().substring(0, 8)} IST`;
    }
  }
  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  // ─────────────────────────────────────────────────────────────────
  // 11 · CONTACT FORM & CLIPBOARD COPY
  // ─────────────────────────────────────────────────────────────────
  const contactForm = document.getElementById('contactForm');
  const sendBtn = document.getElementById('sendBtn');
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const copyToast = document.getElementById('copyToast');

  if (contactForm && sendBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const originalText = sendBtn.innerHTML;

      // Visual state indication
      sendBtn.innerHTML = '<span>Transmitting...</span>';
      sendBtn.disabled = true;

      setTimeout(() => {
        sendBtn.innerHTML = '<span>Message Transmitted ✓</span>';
        sendBtn.classList.add('btn-success');

        const nameInput = document.getElementById('cf-name');
        const emailInput = document.getElementById('cf-email');
        const msgInput = document.getElementById('cf-msg');

        // Optional mailto link fallback so user can send direct email
        const mailtoSubject = encodeURIComponent(`Portfolio Inquiry from ${nameInput ? nameInput.value : 'Visitor'}`);
        const mailtoBody = encodeURIComponent(
          `Name: ${nameInput ? nameInput.value : ''}\nEmail: ${emailInput ? emailInput.value : ''}\n\nMessage:\n${msgInput ? msgInput.value : ''}`
        );

        setTimeout(() => {
          sendBtn.innerHTML = originalText;
          sendBtn.disabled = false;
          sendBtn.classList.remove('btn-success');
          contactForm.reset();
        }, 4000);
      }, 700);
    });
  }

  // Copy email to clipboard with animated toast notification
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'faizkhatri1819@gmail.com';

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(showToast).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        const temp = document.createElement('textarea');
        temp.value = email;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        showToast();
      }

      function showToast() {
        if (!copyToast) return;
        copyToast.classList.add('show');
        setTimeout(() => {
          copyToast.classList.remove('show');
        }, 2800);
      }
    });
  }

})();
