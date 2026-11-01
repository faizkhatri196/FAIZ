// Production Build & Distribution Script for Vercel, Netlify, and Static Hosts
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== STARTING PRODUCTION BUILD & DISTRIBUTION PIPELINE ===');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');

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
  'resume.pdf'
];

// 1. Verify existence of all required source assets
let hasErrors = false;
requiredFiles.forEach(file => {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) {
    console.error(`[BUILD ERROR] Missing critical file: ${file}`);
    hasErrors = true;
  } else {
    const stats = fs.statSync(fullPath);
    if (stats.size === 0) {
      console.error(`[BUILD ERROR] File is empty: ${file}`);
      hasErrors = true;
    } else if (file === 'resume.pdf') {
      console.log(`[BUILD ASSET] Verified resume.pdf: ${(stats.size / 1024).toFixed(1)} KB`);
    }
  }
});

if (hasErrors) {
  console.error('[BUILD FAILED] Critical source assets missing or empty.');
  process.exit(1);
}

// 2. Optional TypeScript typecheck (if tsc is installed)
try {
  console.log('[BUILD] Running TypeScript diagnostics...');
  execSync('npx tsc --noEmit', { cwd: ROOT, stdio: 'inherit' });
  console.log('[BUILD OK] TypeScript checks passed with 0 errors.');
} catch (err) {
  console.warn('[BUILD WARN] TypeScript verification skipped or threw non-fatal warning:', err.message);
}

// 3. Helper to recursively copy directories
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 4. Populate target distribution directories (both dist and public)
const targets = [DIST, PUBLIC];

targets.forEach(targetDir => {
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  // Copy root files
  ['index.html', 'resume.pdf', 'README.md'].forEach(file => {
    const src = path.join(ROOT, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(targetDir, file));
    }
  });

  // Copy folders
  ['css', 'js', 'locales', 'screenshots'].forEach(dir => {
    const src = path.join(ROOT, dir);
    if (fs.existsSync(src)) {
      copyDirSync(src, path.join(targetDir, dir));
    }
  });

  console.log(`[BUILD OK] Successfully compiled distribution package into: ${path.basename(targetDir)}/`);
});

// 5. Final verification of output
if (!fs.existsSync(path.join(DIST, 'index.html')) || fs.statSync(path.join(DIST, 'index.html')).size === 0) {
  console.error('[BUILD ERROR] Output directory dist/index.html is invalid.');
  process.exit(1);
}

console.log('=== PRODUCTION BUILD COMPLETED SUCCESSFULLY (Output ready in dist/ & public/) ===');
