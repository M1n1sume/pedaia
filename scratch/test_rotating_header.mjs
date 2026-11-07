import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('--- TESTING MOBILE ANIMATED ROTATING HEADER IMPLEMENTATION ---');

const indexPath = path.resolve('public/index.html');
const cssPath = path.resolve('public/css/styles.css');
const jsPath = path.resolve('public/js/layoutManager.js');
const swPath = path.resolve('public/sw.js');

const indexHtml = fs.readFileSync(indexPath, 'utf-8');
const cssText = fs.readFileSync(cssPath, 'utf-8');
const jsText = fs.readFileSync(jsPath, 'utf-8');
const swText = fs.readFileSync(swPath, 'utf-8');

// 1. Verify index.html elements
console.log('1. Checking HTML structure...');
assert(indexHtml.includes('id="header-mobile-rotator"'), 'header-mobile-rotator missing in index.html');
assert(indexHtml.includes('id="header-rotator-toggle"'), 'header-rotator-toggle missing in index.html');
assert(indexHtml.includes('data-slide="auth"'), 'data-slide="auth" missing in index.html');
assert(indexHtml.includes('data-slide="tools"'), 'data-slide="tools" missing in index.html');
assert(indexHtml.includes('id="mobile-slide-auth"'), 'mobile-slide-auth missing in index.html');
assert(indexHtml.includes('id="mobile-slide-tools"'), 'mobile-slide-tools missing in index.html');
assert(indexHtml.includes('id="header-auth-buttons"'), 'header-auth-buttons missing in index.html');
assert(indexHtml.includes('id="header-login-btn"'), 'header-login-btn missing in index.html');
assert(indexHtml.includes('id="header-signup-btn"'), 'header-signup-btn missing in index.html');
assert(indexHtml.includes('id="header-user-menu-wrapper"'), 'header-user-menu-wrapper missing in index.html');
assert(indexHtml.includes('id="header-screen-fit-wrapper"'), 'header-screen-fit-wrapper missing in index.html');
assert(indexHtml.includes('id="header-settings-btn"'), 'header-settings-btn missing in index.html');
console.log('✓ HTML structure contains all required rotator elements and slides.');

// 2. Verify styles.css
console.log('2. Checking CSS animation & responsive rules...');
assert(cssText.includes('.header-rotator'), '.header-rotator missing in styles.css');
assert(cssText.includes('.header-rotator-toggle'), '.header-rotator-toggle missing in styles.css');
assert(cssText.includes('.rotator-pill'), '.rotator-pill missing in styles.css');
assert(cssText.includes('.rotator-pill.active'), '.rotator-pill.active missing in styles.css');
assert(cssText.includes('.header-slide'), '.header-slide missing in styles.css');
assert(cssText.includes('.header-slide.active'), '.header-slide.active missing in styles.css');
assert(cssText.includes('@media (max-width: 640px)'), 'mobile media query missing in styles.css');
assert(cssText.includes('@media (min-width: 641px)'), 'desktop media query missing in styles.css');
assert(cssText.includes('.header-slide-tools'), '.header-slide-tools ordering missing in styles.css');
assert(cssText.includes('.header-slide-auth'), '.header-slide-auth ordering missing in styles.css');
console.log('✓ CSS contains mobile rotation animation and desktop static inline reset.');

// 3. Verify layoutManager.js
console.log('3. Checking JavaScript rotator controller...');
assert(jsText.includes('export function initHeaderRotator'), 'initHeaderRotator not exported in layoutManager.js');
assert(jsText.includes('header-mobile-rotator'), 'header-mobile-rotator selector missing in layoutManager.js');
assert(jsText.includes('mobile-slide-auth'), 'mobile-slide-auth selector missing in layoutManager.js');
assert(jsText.includes('mobile-slide-tools'), 'mobile-slide-tools selector missing in layoutManager.js');
assert(jsText.includes('ROTATION_INTERVAL'), 'ROTATION_INTERVAL missing in layoutManager.js');
assert(jsText.includes('pauseInteraction'), 'pauseInteraction missing in layoutManager.js');
assert(jsText.includes('window.headerRotator'), 'window.headerRotator global missing in layoutManager.js');
console.log('✓ JavaScript module exports and configures rotator correctly.');

// 4. Verify sw.js cache bump
console.log('4. Checking Service Worker version...');
assert(swText.includes('pedaia-cache-v18'), 'sw.js cache not bumped to v18');
console.log('✓ Service Worker cache bumped to pedaia-cache-v18.');

console.log('\n--- ALL ROTATING HEADER TESTS PASSED! ---');
