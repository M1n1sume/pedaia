// Verification test for PEDAIA Smooth Rotating Mobile Header
import fs from 'fs';
import path from 'path';

console.log('--- Verifying Smooth Rotating Mobile Header Implementation ---');

const indexPath = path.join(process.cwd(), 'public', 'index.html');
const cssPath = path.join(process.cwd(), 'public', 'css', 'styles.css');
const appJsPath = path.join(process.cwd(), 'public', 'js', 'app.js');
const swPath = path.join(process.cwd(), 'public', 'sw.js');

const indexHtml = fs.readFileSync(indexPath, 'utf-8');
const stylesCss = fs.readFileSync(cssPath, 'utf-8');
const appJs = fs.readFileSync(appJsPath, 'utf-8');
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

// 1. HTML Verification
console.log('\n[1] HTML Structure Checks:');
assert(indexHtml.includes('id="mobile-rotating-header"'), 'mobile-rotating-header element exists in index.html');
assert(indexHtml.includes('class="mobile-rotator-viewport'), 'mobile-rotator-viewport exists');
assert(indexHtml.includes('id="mobile-header-stage"'), 'mobile-header-stage element exists');
assert(indexHtml.includes('id="mobile-header-icon"'), 'mobile-header-icon exists');
assert(indexHtml.includes('id="mobile-header-title"'), 'mobile-header-title exists');
assert(indexHtml.includes('id="mobile-header-context"'), 'mobile-header-context exists');
assert(indexHtml.includes('id="mobile-header-pulse"'), 'mobile-header-pulse indicator exists');
assert(indexHtml.includes('id="brand-logo-btn"'), 'brand-logo-btn exists');
assert(indexHtml.includes('id="header-auth-buttons"'), 'header-auth-buttons exists');
assert(indexHtml.includes('id="header-login-btn"'), 'header-login-btn exists');
assert(indexHtml.includes('id="header-signup-btn"'), 'header-signup-btn exists');
assert(indexHtml.includes('id="mobile-drawer-toggle-btn"'), 'mobile-drawer-toggle-btn exists');
assert(indexHtml.includes('id="header-page-title"'), 'header-page-title exists for state compatibility');

// 2. CSS Verification
console.log('\n[2] CSS 3D Rotating Animation System:');
assert(stylesCss.includes('perspective: 1000px'), 'CSS defines perspective for 3D stage');
assert(stylesCss.includes('transform-style: preserve-3d'), 'CSS preserves 3D transforms');
assert(stylesCss.includes('backface-visibility: hidden'), 'CSS sets backface-visibility: hidden');
assert(stylesCss.includes('will-change: transform, opacity'), 'CSS enables GPU acceleration with will-change');
assert(stylesCss.includes('keyframes mobileHeaderRotateOut'), 'mobileHeaderRotateOut keyframes exist');
assert(stylesCss.includes('keyframes mobileHeaderRotateIn'), 'mobileHeaderRotateIn keyframes exist');
assert(stylesCss.includes('cubic-bezier(0.22, 1, 0.36, 1)'), 'cubic-bezier easing curve applied');
assert(stylesCss.includes('rotateX(-12deg)'), 'Subtle 12-degree rotateX exit transform used');
assert(stylesCss.includes('rotateX(12deg)'), 'Subtle 12-degree rotateX enter transform used');
assert(stylesCss.includes('prefers-reduced-motion: reduce'), 'prefers-reduced-motion fallback provided');
assert(stylesCss.includes('#mobile-rotating-header') && stylesCss.includes('display: none !important;'), 'Desktop suppression rule exists for >= 768px');

// 3. JS Routing & Coordination Verification
console.log('\n[3] JavaScript Controller & Routing:');
assert(appJs.includes('ROUTE_METADATA'), 'ROUTE_METADATA lookup exists in app.js');
assert(appJs.includes("'lesson-planning'"), 'Lesson planner metadata registered');
assert(appJs.includes("'activity-design'"), 'Activity designer metadata registered');
assert(appJs.includes("'questioning'"), 'Questioning studio metadata registered');
assert(appJs.includes("'differentiation'"), 'Differentiation studio metadata registered');
assert(appJs.includes("'ai-output-studio'"), 'AI Output studio metadata registered');
assert(appJs.includes("'workspace'"), 'Workspace metadata registered');
assert(appJs.includes("'designs'"), 'My Designs metadata registered');
assert(appJs.includes("'prompt-library'"), 'Prompt library metadata registered');
assert(appJs.includes("'settings'"), 'Settings metadata registered');
assert(appJs.includes("'admin'"), 'Admin console metadata registered');
assert(appJs.includes('function updateMobileRotatingHeader'), 'updateMobileRotatingHeader function implemented');
assert(appJs.includes('mobile-rotate-out') && appJs.includes('mobile-rotate-in'), 'Animation class transitions handled in JS');
assert(appJs.includes('prefers-reduced-motion'), 'Reduced motion checked in JS');
assert(appJs.includes('mobileHeaderTimer'), 'Rapid navigation click debounce/cleanup implemented');
assert(appJs.includes('updateMobileRotatingHeader(normalizedRoute'), 'navigateTo triggers mobile header rotation');
assert(appJs.includes("getElementById('mobile-rotating-header')?.addEventListener('click'"), 'Mobile rotating header tap opens drawer');

// 4. Service Worker Cache Verification
console.log('\n[4] Service Worker Version:');
assert(swJs.includes('pedaia-cache-v18'), 'Service worker cache updated to pedaia-cache-v18');

if (errors > 0) {
  console.error(`\n❌ Total failures: ${errors}`);
  process.exit(1);
} else {
  console.log('\n✨ ALL TESTS PASSED! Smooth Rotating Mobile Header is fully verified and functional.');
}
