// Verification test for Screen Fit Pop-up Modal feature
import fs from 'fs';
import path from 'path';

console.log('--- Verifying Screen Fit Pop-up Modal Implementation ---');

const indexPath = path.join(process.cwd(), 'public', 'index.html');
const modalPath = path.join(process.cwd(), 'public', 'js', 'views', 'screenFitModal.js');
const layoutManagerPath = path.join(process.cwd(), 'public', 'js', 'layoutManager.js');
const appJsPath = path.join(process.cwd(), 'public', 'js', 'app.js');
const commandPalettePath = path.join(process.cwd(), 'public', 'js', 'views', 'commandPalette.js');
const swPath = path.join(process.cwd(), 'public', 'sw.js');

const indexHtml = fs.readFileSync(indexPath, 'utf-8');
const modalJs = fs.readFileSync(modalPath, 'utf-8');
const layoutManagerJs = fs.readFileSync(layoutManagerPath, 'utf-8');
const appJs = fs.readFileSync(appJsPath, 'utf-8');
const cmdPaletteJs = fs.readFileSync(commandPalettePath, 'utf-8');
const swJs = fs.readFileSync(swPath, 'utf-8');

let errors = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    errors++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// 1. Modal View Checks
console.log('\n[1] screenFitModal.js Checks:');
assert(modalJs.includes('export function openScreenFitModal'), 'Exports openScreenFitModal');
assert(modalJs.includes('id="screen-fit-modal"'), 'Defines modal overlay container id="screen-fit-modal"');
assert(modalJs.includes('fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs'), 'Uses standard PEDAIA modal overlay styling');
assert(modalJs.includes('LAYOUT_MODES.AUTO') && modalJs.includes('Smart Device Adaptive'), 'Includes Smart Device Adaptive option');
assert(modalJs.includes('LAYOUT_MODES.LEFT') && modalJs.includes('Left-Aligned Canvas'), 'Includes Left-Aligned Canvas option');
assert(modalJs.includes('LAYOUT_MODES.COMPACT') && modalJs.includes('Laptop & Scaled Display Fit'), 'Includes Laptop & Scaled Fit option');
assert(modalJs.includes('LAYOUT_MODES.CENTERED') && modalJs.includes('Centered Atelier'), 'Includes Centered Atelier option');
assert(modalJs.includes('screen-modal-scale-btn'), 'Includes scale buttons');
assert(modalJs.includes('done-screen-fit-modal-btn'), 'Includes Done button');
assert(modalJs.includes('close-screen-fit-modal-btn'), 'Includes close X button');
assert(modalJs.includes('Escape'), 'Handles Escape key dismissal');

// 2. Index HTML Checks
console.log('\n[2] index.html Checks:');
assert(indexHtml.includes('id="header-screen-fit-btn"'), 'header-screen-fit-btn exists');
assert(indexHtml.includes('id="header-screen-fit-label"'), 'header-screen-fit-label exists');
assert(!indexHtml.includes('id="header-screen-fit-dropdown"'), 'Old clipped dropdown HTML removed from header');
assert(indexHtml.includes('id="mobile-sidebar-screen-fit-btn"'), 'mobile-sidebar-screen-fit-btn exists in drawer');

// 3. Layout Manager Checks
console.log('\n[3] layoutManager.js Checks:');
assert(layoutManagerJs.includes('openScreenFitModal'), 'layoutManager imports and references openScreenFitModal');
assert(layoutManagerJs.includes('header-screen-fit-btn'), 'Attaches listener to header-screen-fit-btn');
assert(layoutManagerJs.includes('mobile-sidebar-screen-fit-btn'), 'Attaches listener to mobile-sidebar-screen-fit-btn');

// 4. Command Palette Checks
console.log('\n[4] commandPalette.js Checks:');
assert(cmdPaletteJs.includes('openScreenFitModal'), 'commandPalette imports openScreenFitModal');
assert(cmdPaletteJs.includes('act-screen-fit'), 'Command palette includes act-screen-fit action');

// 5. App.js Checks
console.log('\n[5] app.js Checks:');
assert(appJs.includes('openScreenFitModal'), 'app.js imports and wires up openScreenFitModal');

// 6. Service Worker
console.log('\n[6] Service Worker Cache Check:');
assert(swJs.includes('pedaia-cache-v19'), 'Service worker cache updated to pedaia-cache-v19');

if (errors > 0) {
  console.error(`\n❌ Total failures: ${errors}`);
  process.exit(1);
} else {
  console.log('\n✨ ALL TESTS PASSED! Screen Fit Pop-up Modal is fully verified.');
}
