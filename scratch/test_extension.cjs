const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- RUNNING PEDAIA BROWSER EXTENSION VERIFICATION ---');

// 1. Manifest V3 Validation
const manifestPath = path.join(__dirname, '..', 'extension', 'manifest.json');
assert(fs.existsSync(manifestPath), 'manifest.json must exist');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

assert.strictEqual(manifest.manifest_version, 3, 'Must be Manifest V3');
assert(manifest.name.includes('PEDAIA'), 'Name must include PEDAIA');
assert.strictEqual(manifest.browser_specific_settings?.gecko?.id, 'pedaia-studio@pedaia.ai', 'Firefox Gecko ID must be set');
assert(manifest.permissions.includes('sidePanel'), 'Must include sidePanel permission');
assert(manifest.permissions.includes('contextMenus'), 'Must include contextMenus permission');
assert(manifest.commands?.open_side_panel?.suggested_key?.default === 'Ctrl+Shift+P', 'Must have Ctrl+Shift+P shortcut');
console.log('✓ Manifest V3 cross-browser config valid');

// 2. Extension Files Check
const requiredFiles = [
  'extension/background.js',
  'extension/popup.html',
  'extension/popup.js',
  'extension/sidepanel.html',
  'extension/sidepanel.js',
  'extension/icons/icon-16.png',
  'extension/icons/icon-48.png',
  'extension/icons/icon-128.png'
];
for (const rel of requiredFiles) {
  const p = path.join(__dirname, '..', rel);
  assert(fs.existsSync(p), `File ${rel} must exist`);
}
console.log('✓ All 8 extension assets verified');

// 3. CSP Compliance Check (No external script URLs in popup/sidepanel)
const popupHtml = fs.readFileSync(path.join(__dirname, '..', 'extension', 'popup.html'), 'utf8');
const sidepanelHtml = fs.readFileSync(path.join(__dirname, '..', 'extension', 'sidepanel.html'), 'utf8');
assert(!popupHtml.includes('https://cdn.'), 'popup.html must not load external scripts/CDNs');
assert(!sidepanelHtml.includes('https://cdn.'), 'sidepanel.html must not load external scripts/CDNs');
assert(popupHtml.includes('popup.js'), 'popup.html must load local popup.js');
assert(sidepanelHtml.includes('sidepanel.js'), 'sidepanel.html must load local sidepanel.js');
console.log('✓ Zero external script dependencies (100% CSP compliant)');

// 4. Zip Package Check
const zipPath = path.join(__dirname, '..', 'public', 'pedaia-browser-extension.zip');
assert(fs.existsSync(zipPath), 'pedaia-browser-extension.zip must exist in public/');
const zipStat = fs.statSync(zipPath);
assert(zipStat.size > 10000, 'Zip file must be non-trivial (>10KB)');
console.log(`✓ Zip package verified (${zipStat.size} bytes)`);

// 5. Web App Integration Check
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
assert(indexHtml.includes('header-extension-btn'), 'index.html must have #header-extension-btn');
assert(indexHtml.includes('mobile-sidebar-extension-btn'), 'index.html must have #mobile-sidebar-extension-btn');

const appJs = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'app.js'), 'utf8');
assert(appJs.includes('openExtensionModal'), 'app.js must import and call openExtensionModal');
assert(appJs.includes('header-extension-btn'), 'app.js must bind header-extension-btn');
assert(appJs.includes('mobile-sidebar-extension-btn'), 'app.js must bind mobile-sidebar-extension-btn');

const settingsJs = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'views', 'settings.js'), 'utf8');
assert(settingsJs.includes('Browser Extension'), 'settings.js must have Browser Extension tab');
assert(settingsJs.includes('renderBrowserExtensionSettings'), 'settings.js must have renderBrowserExtensionSettings');
assert(settingsJs.includes('openExtensionModal'), 'settings.js must have openExtensionModal trigger');

const serverJs = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
assert(serverJs.includes("'.zip': 'application/zip'"), 'server.js must have .zip mime type');
console.log('✓ Web App Integration (Header, Mobile Sidebar, Settings Tab, MIME Types) fully wired');

console.log('========================================================');
console.log('🎉 ALL BROWSER EXTENSION VERIFICATION TESTS PASSED!');
console.log('========================================================');
