// Multi-language Translation Engine (i18n) - Ultra-Smooth, Offline & CORS-Safe

(function() {
  'use strict';

  const SUPPORTED_LANGUAGES = ['en', 'hi', 'ja', 'es'];
  let currentLang = localStorage.getItem('pref-lang') || 'en';
  let translations = {};

  // Typewriter word updates hook
  let typewriterWordsUpdateCallback = null;

  window.onTypewriterWordsUpdate = function(callback) {
    typewriterWordsUpdateCallback = callback;
    // Trigger immediately if translations are already present
    const heroWords = resolvePath(translations, 'hero.typewriter');
    if (heroWords && typewriterWordsUpdateCallback) {
      typewriterWordsUpdateCallback(heroWords);
    }
  };

  // Retrieve pre-loaded translations from window scope
  function getTranslations(lang) {
    const dictionary = window['locale_' + lang];
    if (dictionary) return dictionary;
    console.warn(`Translation dictionary for "${lang}" not found. Falling back to English.`);
    return window.locale_en || {};
  }

  // Deep resolve JSON path (e.g. "hero.statement")
  function resolvePath(obj, path) {
    if (!obj || !path) return null;
    return path.split('.').reduce((prev, curr) => prev ? prev[curr] : null, obj);
  }

  // Update DOM elements with translations
  function updateDOM() {
    // Translate standard elements
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
      } else {
        opt.classList.remove('active');
      }
    });

    const activeLangDisplay = document.getElementById('langCurrent');
    if (activeLangDisplay) {
      activeLangDisplay.textContent = currentLang.toUpperCase();
    }
  }

  // Switch language
  function switchLanguage(lang) {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    currentLang = lang;
    translations = getTranslations(lang);
    localStorage.setItem('pref-lang', lang);
    updateDOM();
  }

  // Initialize localization
  function initLocaleSystem() {
    translations = getTranslations(currentLang);
    updateDOM();

    // Wire up dock language selector
    const langBtn = document.getElementById('langBtn');
    const langMenu = document.getElementById('langMenu');

    if (langBtn && langMenu) {
      langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langMenu.classList.toggle('open');
      });

      document.addEventListener('click', (e) => {
        if (!langBtn.contains(e.target) && !langMenu.contains(e.target)) {
          langMenu.classList.remove('open');
        }
      });

      langMenu.querySelectorAll('.lang-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const selectedLang = item.dataset.lang;
          if (selectedLang) {
            switchLanguage(selectedLang);
          }
          langMenu.classList.remove('open');
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLocaleSystem);
  } else {
    initLocaleSystem();
  }

  // Global helpers
  window.translate = function(key) {
    return resolvePath(translations, key) || key;
  };
  window.getCurrentLanguage = () => currentLang;
  window.switchLanguage = switchLanguage;
  window.setLocale = switchLanguage;

})();
