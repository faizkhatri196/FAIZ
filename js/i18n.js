// Multi-language Translation Engine (i18n) - Ultra-Smooth, Offline & CORS-Safe

(function() {
  'use strict';

  const SUPPORTED_LANGUAGES = ['en', 'hi', 'ja', 'es'];
  let currentLang = localStorage.getItem('pref-lang') || 'en';
  let translations = {};

  let typewriterWordsUpdateCallback = null;

  window.onTypewriterWordsUpdate = function(callback) {
    typewriterWordsUpdateCallback = callback;
    const heroWords = resolvePath(translations, 'hero.typewriter');
    if (heroWords && typewriterWordsUpdateCallback) {
      typewriterWordsUpdateCallback(heroWords);
    }
  };

  function getTranslations(lang) {
    const dictionary = window['locale_' + lang];
    if (dictionary) return dictionary;
    console.warn(`Translation dictionary for "${lang}" not found. Falling back to English.`);
    return window.locale_en || {};
  }

  function resolvePath(obj, path) {
    if (!obj || !path) return null;
    return path.split('.').reduce((prev, curr) => (prev ? prev[curr] : null), obj);
  }

  function updateDOM() {
    // Translate innerHTML elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = resolvePath(translations, key);
      if (text !== undefined && text !== null) {
        el.innerHTML = text;
      }
    });

    // Translate input placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = resolvePath(translations, key);
      if (text !== undefined && text !== null) {
        el.setAttribute('placeholder', text);
      }
    });

    // Translate aria-labels
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      const text = resolvePath(translations, key);
      if (text !== undefined && text !== null) {
        el.setAttribute('aria-label', text);
      }
    });

    // Update document language tag
    document.documentElement.lang = currentLang;

    // Trigger typewriter update
    const heroWords = resolvePath(translations, 'hero.typewriter');
    if (heroWords && typewriterWordsUpdateCallback) {
      typewriterWordsUpdateCallback(heroWords);
    }

    // Update language selector UI active state
    document.querySelectorAll('.lang-item').forEach(opt => {
      if (opt.dataset.lang === currentLang) {
        opt.classList.add('active');
        opt.setAttribute('aria-selected', 'true');
      } else {
        opt.classList.remove('active');
        opt.setAttribute('aria-selected', 'false');
      }
    });

    const activeLangDisplay = document.getElementById('langCurrent');
    if (activeLangDisplay) {
      activeLangDisplay.textContent = currentLang.toUpperCase();
    }

    // Dispatch global event for other components if needed
    window.dispatchEvent(new CustomEvent('portfolio:localeChanged', { detail: { lang: currentLang } }));
  }

  function switchLanguage(lang) {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    currentLang = lang;
    translations = getTranslations(lang);
    localStorage.setItem('pref-lang', lang);
    updateDOM();
  }

  function initLocaleSystem() {
    translations = getTranslations(currentLang);
    updateDOM();

    // Wire up dock language selector
    const langBtn = document.getElementById('langBtn');
    const langMenu = document.getElementById('langMenu');

    if (langBtn && langMenu) {
      langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = langMenu.classList.toggle('open');
        langBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      document.addEventListener('click', (e) => {
        if (!langBtn.contains(e.target) && !langMenu.contains(e.target)) {
          langMenu.classList.remove('open');
          langBtn.setAttribute('aria-expanded', 'false');
        }
      });

      langMenu.querySelectorAll('.lang-item, .lang-option, [data-lang]').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const selectedLang = item.dataset.lang;
          if (selectedLang) {
            switchLanguage(selectedLang);
          }
          langMenu.classList.remove('open');
          langBtn.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Wire up mobile drawer language buttons if present
    document.querySelectorAll('.mobile-lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedLang = btn.dataset.lang;
        if (selectedLang) {
          switchLanguage(selectedLang);
          document.querySelectorAll('.mobile-lang-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLocaleSystem);
  } else {
    initLocaleSystem();
  }

  window.translate = function(key) {
    return resolvePath(translations, key) || key;
  };
  window.getCurrentLanguage = () => currentLang;
  window.switchLanguage = switchLanguage;
  window.setLocale = switchLanguage;

})();
