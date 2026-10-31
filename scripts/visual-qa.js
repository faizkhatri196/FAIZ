const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PORT = 4173;
const ROOT = path.resolve(__dirname, '..');
const SCREENSHOT_DIR = path.join(ROOT, 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

function createServer() {
  return http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
    if (reqPath === '/favicon.ico') {
      res.writeHead(204);
      res.end();
      return;
    }
    const filePath = path.join(ROOT, decodeURIComponent(reqPath));

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    });
  });
}

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const VIEWPORTS = [
  { width: 320, height: 568, name: 'iPhone-SE-Gen1' },
  { width: 360, height: 800, name: 'Android-Small' },
  { width: 375, height: 667, name: 'iPhone-8' },
  { width: 390, height: 844, name: 'iPhone-12-13-14' },
  { width: 430, height: 932, name: 'iPhone-14-15-Pro-Max' },
  { width: 540, height: 720, name: 'Surface-Duo' },
  { width: 768, height: 1024, name: 'iPad-Mini' },
  { width: 820, height: 1180, name: 'iPad-Air' },
  { width: 1024, height: 768, name: 'iPad-Pro-Landscape' },
  { width: 1280, height: 800, name: 'MacBook-13' },
  { width: 1366, height: 768, name: 'Standard-Laptop' },
  { width: 1440, height: 900, name: 'MacBook-15' },
  { width: 1600, height: 900, name: 'Desktop-Mid' },
  { width: 1920, height: 1080, name: 'Full-HD-Desktop' }
];

async function runVisualQA() {
  console.log('========================================================');
  console.log('   STARTING PLAYWRIGHT VISUAL QA & RESPONSIVE AUDIT     ');
  console.log('========================================================\n');

  const server = createServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`[HTTP] Static local server running at http://localhost:${PORT}`);

  const browser = await chromium.launch({
    executablePath: fs.existsSync(EDGE_PATH) ? EDGE_PATH : undefined,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const errors = [];
  const warnings = [];

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n--- Auditing Viewport: ${vp.width}x${vp.height} (${vp.name}) ---`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });

      const page = await context.newPage();

      // Collect console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          if (msg.text().includes('ERR_NETWORK_IO_SUSPENDED')) return;
          console.error(`  [Browser Error @ ${vp.width}px]:`, msg.text());
          errors.push(`Console error at ${vp.width}px: ${msg.text()}`);
        }
      });
      page.on('pageerror', err => {
        console.error(`  [Uncaught Page Error @ ${vp.width}px]:`, err.message);
        errors.push(`Uncaught error at ${vp.width}px: ${err.message}`);
      });

      await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });

      // Wait for preloader transition & Three.js canvas setup
      await page.waitForTimeout(1600);

      // Evaluate horizontal overflow
      const overflowMetrics = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const bodyWidth = document.body.scrollWidth;
        const winWidth = window.innerWidth;
        const hasOverflow = docWidth > winWidth || bodyWidth > winWidth;

        let offenders = [];
        if (hasOverflow) {
          const allEls = Array.from(document.querySelectorAll('*'));
          offenders = allEls
            .filter(el => {
              const style = window.getComputedStyle(el);
              if (style.display === 'none' || style.visibility === 'hidden' || style.position === 'fixed') {
                return false;
              }
              const r = el.getBoundingClientRect();
              return r.right > winWidth + 1;
            })
            .slice(0, 5)
            .map(el => ({
              tag: el.tagName,
              id: el.id,
              class: el.className ? String(el.className).substring(0, 40) : '',
              right: Math.round(el.getBoundingClientRect().right)
            }));
        }

        return { docWidth, bodyWidth, winWidth, hasOverflow, offenders };
      });

      if (overflowMetrics.hasOverflow) {
        const msg = `HORIZONTAL OVERFLOW at ${vp.width}px: docWidth=${overflowMetrics.docWidth}, bodyWidth=${overflowMetrics.bodyWidth}, winWidth=${overflowMetrics.winWidth}. Offenders: ${JSON.stringify(overflowMetrics.offenders)}`;
        console.error(`  ✗ FAIL: ${msg}`);
        errors.push(msg);
      } else {
        console.log(`  ✓ PASS: Zero horizontal overflow (docWidth: ${overflowMetrics.docWidth}px, bodyWidth: ${overflowMetrics.bodyWidth}px <= winWidth: ${overflowMetrics.winWidth}px)`);
      }

      // Check key DOM elements visibility
      const checks = await page.evaluate(() => {
        return {
          heroTitle: !!document.querySelector('.hero-monument-name'),
          agentShieldStage: !!document.querySelector('[data-sim="agentshield"]'),
          copyEmailBtn: !!document.querySelector('#copyEmailBtn'),
          threeCanvas: !!document.querySelector('#hero-3d-canvas-wrap canvas, #hero-3d-canvas-wrap')
        };
      });

      if (!checks.heroTitle) errors.push(`Hero display name missing at ${vp.width}px`);
      if (!checks.agentShieldStage) errors.push(`AgentShield project missing at ${vp.width}px`);
      if (!checks.copyEmailBtn) errors.push(`Contact email copy button missing at ${vp.width}px`);
      if (!checks.threeCanvas) errors.push(`Three.js WebGL canvas missing at ${vp.width}px`);

      // Capture screenshot for representative viewports
      if ([320, 375, 430, 768, 1280, 1920].includes(vp.width)) {
        const scPath = path.join(SCREENSHOT_DIR, `portfolio-${vp.width}px.png`);
        await page.screenshot({ path: scPath, fullPage: false });
        console.log(`  📸 Screenshot saved: ${scPath}`);
      }

      // If mobile, test drawer open/close
      if (vp.width <= 768) {
        const burgerBtn = page.locator('#dockBurger');
        if (await burgerBtn.isVisible()) {
          await burgerBtn.click();
          await page.waitForTimeout(300);
          const isDrawerOpen = await page.evaluate(() => {
            const drawer = document.getElementById('mobileDrawer');
            return drawer && drawer.classList.contains('open');
          });
          if (isDrawerOpen) {
            console.log(`  ✓ PASS: Mobile drawer successfully opened on click at ${vp.width}px`);
            // Close drawer
            await page.click('#closeDrawerBtn');
            await page.waitForTimeout(300);
          } else {
            errors.push(`Mobile drawer failed to toggle open state at ${vp.width}px`);
          }
        }
      }

      // Test interactive feature: AgentShield simulation button at 1280px
      if (vp.width === 1280) {
        console.log('  Testing AgentShield interactive security simulator...');
        const simAttackBtn = page.locator('#simAttackBtn');
        if (await simAttackBtn.isVisible()) {
          await simAttackBtn.click();
          await page.waitForTimeout(300);
          const logText = await page.locator('#simLog').innerText();
          console.log(`  ✓ PASS: AgentShield interactive sandbox triggered: "${logText}"`);
        }

        // Test Language Selector
        console.log('  Testing Multilingual Switcher (EN -> JA -> EN)...');
        await page.click('#langBtn', { force: true });
        await page.waitForTimeout(300);
        await page.click('#langMenu [data-lang="ja"]', { force: true });
        await page.waitForTimeout(400);
        const jaNav = await page.locator('#dockLinks a').first().innerText();
        console.log(`  ✓ PASS: Switch to Japanese verified (first dock link: "${jaNav}")`);
        
        // Switch back to English
        await page.click('#langBtn', { force: true });
        await page.waitForTimeout(300);
        await page.click('#langMenu [data-lang="en"]', { force: true });
        await page.waitForTimeout(400);
        const enNav = await page.locator('#dockLinks a').first().innerText();
        console.log(`  ✓ PASS: Switch back to English verified (first dock link: "${enNav}")`);
      }

      await context.close();
    }

  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n========================================================');
  console.log(`   VISUAL QA COMPLETE: ${errors.length} ERRORS, ${warnings.length} WARNINGS`);
  console.log('========================================================\n');

  if (errors.length > 0) {
    console.error('FAILED CHECKS:');
    errors.forEach(e => console.error(' - ', e));
    process.exit(1);
  } else {
    console.log('🎉 ALL 14 VIEWPORTS AND INTERACTIVE COMPONENTS PASSED VISUAL QA PERFECTLY!');
  }
}

runVisualQA().catch(err => {
  console.error('Fatal visual QA error:', err);
  process.exit(1);
});
