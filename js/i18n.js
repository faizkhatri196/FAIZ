// Multi-language Translation Engine (i18n) - Offline & CORS-Safe

const SUPPORTED_LANGUAGES = ['en', 'hi', 'ja', 'es'];
let currentLang = localStorage.getItem('pref-lang') || 'en';
let translations = {};

// Typewriter word updates hook
let typewriterWordsUpdateCallback = null;

// Register callback for typewriter
window.onTypewriterWordsUpdate = function(callback) {
  typewriterWordsUpdateCallback = callback;
};

// Retrieve pre-loaded translations from window scope variables
function getTranslations(lang) {
  const dictionary = window['locale_' + lang];
  if (dictionary) return dictionary;
  
  // Fallback to English if not found
  console.warn(`Translation dictionary for "${lang}" not found in window scope. Falling back to English.`);
  return window.locale_en || null;
}

// Deep resolve JSON path (e.g. "hero.badge")
function resolvePath(obj, path) {
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
      
      // Sync glitch-wrap parent data-text attribute
      const parent = el.parentElement;
      if (parent && parent.classList.contains('glitch-wrap')) {
        const temp = document.createElement('div');
        temp.innerHTML = text;
        parent.setAttribute('data-text', temp.textContent || temp.innerText);
      }
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

  // Trigger typewriter update if active
  const heroWords = resolvePath(translations, 'hero.typewriter');
  if (heroWords && typewriterWordsUpdateCallback) {
    typewriterWordsUpdateCallback(heroWords);
  }

  // Update language selector UI active state
  document.querySelectorAll('.lang-opt').forEach(opt => {
    if (opt.dataset.lang === currentLang) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });
  
  const activeLangDisplay = document.querySelector('.lang-active-display');
  if (activeLangDisplay) {
    activeLangDisplay.textContent = currentLang.toUpperCase();
  }
}

// Switch language with matrix screen transition
function switchLanguage(lang) {
  if (!SUPPORTED_LANGUAGES.includes(lang)) return;
  if (lang === currentLang && Object.keys(translations).length > 0) return;

  const newTranslations = getTranslations(lang);
  if (!newTranslations) return;

  const applyChanges = () => {
    currentLang = lang;
    translations = newTranslations;
    localStorage.setItem('pref-lang', lang);
    updateDOM();
  };

  // If transition engine is available globally, use it for a premium feel
  if (window.triggerTransition) {
    window.triggerTransition(applyChanges);
  } else {
    applyChanges();
  }
}

// Initialize localization
function initLocaleSystem() {
  translations = getTranslations(currentLang);
  if (translations) {
    updateDOM();
  }

  // Wire up selector if present
  const langTrigger = document.querySelector('.lang-trigger');
  const langDropdown = document.querySelector('.lang-dropdown-options');

  if (langTrigger && langDropdown) {
    langTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      langDropdown.classList.remove('show');
    });

    document.querySelectorAll('.lang-opt').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedLang = opt.dataset.lang;
        switchLanguage(selectedLang);
      });
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLocaleSystem);
} else {
  initLocaleSystem();
}

// Export translation helper to window for other scripts
window.translate = function(key) {
  return resolvePath(translations, key) || key;
};
window.getCurrentLanguage = () => currentLang;
window.switchLanguage = switchLanguage;
