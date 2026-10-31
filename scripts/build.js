// Production Build Verification Script
const fs = require('fs');
const path = require('path');

console.log('--- STARTING PRODUCTION BUILD VERIFICATION ---');

const requiredFiles = [
  'index.html',
  'css/style.css',
  'js/main.js',
  'js/three-scene.js',
  'js/i18n.js',
  'locales/en.js',
  'locales/hi.js',
  'locales/ja.js',
  'locales/es.js',
  'resume.pdf',
  'README.md'
];

let hasErrors = false;

requiredFiles.forEach(file => {
  const fullPath = path.resolve(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) {
    console.error(`[BUILD ERROR] Missing critical file: ${file}`);
    hasErrors = true;
  } else {
    const stats = fs.statSync(fullPath);
    if (stats.size === 0) {
      console.error(`[BUILD ERROR] File is empty: ${file}`);
      hasErrors = true;
    } else {
      console.log(`[BUILD OK] Verified asset: ${file} (${stats.size} bytes)`);
    }
  }
});

if (hasErrors) {
  console.error('[BUILD FAILED]');
  process.exit(1);
} else {
  console.log('--- PRODUCTION BUILD VERIFICATION PASSED ---');
}
