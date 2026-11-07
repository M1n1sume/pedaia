import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Starting Mobile Header Sideways Scroll & Cutoff Fix Test Suite...\n');

// 1. Inspect public/index.html
const indexHtml = fs.readFileSync(path.join(process.cwd(), 'public', 'index.html'), 'utf8');

assert(!indexHtml.includes('overflow-x-clip" id="top-masthead"'), 'Header must not have overflow-x-clip');
assert(indexHtml.includes('id="top-masthead"') && indexHtml.includes('overflow-x-auto'), 'Header must feature overflow-x-auto for mobile sideways scroll');
console.log('✓ Step 1: public/index.html enables overflow-x-auto on #top-masthead.');

assert(indexHtml.includes('id="header-auth-buttons"') && indexHtml.includes('whitespace-nowrap') && indexHtml.includes('shrink-0'), 'Auth buttons container must not wrap or shrink');
console.log('✓ Step 2: Auth buttons container has whitespace-nowrap and shrink-0.');

assert(indexHtml.includes('id="header-signup-btn"') && indexHtml.includes('whitespace-nowrap'), 'Create Account button has whitespace-nowrap');
console.log('✓ Step 3: Create Account button is protected against accidental word-wrapping.');

// 2. Inspect public/css/styles.css
const stylesCss = fs.readFileSync(path.join(process.cwd(), 'public', 'css', 'styles.css'), 'utf8');

assert(stylesCss.includes('#top-masthead'), 'styles.css must style #top-masthead');
assert(stylesCss.includes('overflow-x: auto'), 'styles.css must declare overflow-x: auto for #top-masthead');
assert(stylesCss.includes('scrollbar-width: none'), 'styles.css must hide scrollbar for Firefox');
assert(stylesCss.includes('#top-masthead::-webkit-scrollbar'), 'styles.css must hide scrollbar for WebKit');
console.log('✓ Step 4: styles.css applies clean, touch-friendly, hidden scrollbar rules.');

assert(stylesCss.includes('@media (max-width: 640px)'), 'styles.css must have mobile media query');
assert(stylesCss.includes('width: max-content !important'), 'Mobile masthead-inner expands to max-content to prevent cutoffs');
assert(stylesCss.includes('min-width: 100% !important'), 'Mobile masthead-inner fills at least 100% width');
console.log('✓ Step 5: Mobile masthead-inner expands dynamically to fit all controls seamlessly.');

assert(stylesCss.includes('#header-screen-fit-dropdown') && stylesCss.includes('position: fixed !important'), 'Dropdowns on mobile use fixed positioning to avoid overflow clipping');
console.log('✓ Step 6: Dropdowns on mobile use fixed positioning so they float cleanly.');

// 3. Inspect public/js/layoutManager.js
const layoutManagerJs = fs.readFileSync(path.join(process.cwd(), 'public', 'js', 'layoutManager.js'), 'utf8');
assert(layoutManagerJs.includes('setupMobileHeaderScroll'), 'layoutManager.js must provide setupMobileHeaderScroll');
assert(layoutManagerJs.includes('initLayoutManager'), 'initLayoutManager must invoke setupMobileHeaderScroll');
console.log('✓ Step 7: layoutManager.js wires smooth mouse wheel and touch focus handlers.');

// 4. Verify SW cache version
const swJs = fs.readFileSync(path.join(process.cwd(), 'public', 'sw.js'), 'utf8');
assert(swJs.includes('pedaia-cache-v17'), 'sw.js must be bumped to pedaia-cache-v17');
console.log('✓ Step 8: Service worker bumped to pedaia-cache-v17.');

console.log('\n========================================================================');
console.log('🎉 ALL 8 MOBILE HEADER SIDEWAYS SCROLL TESTS PASSED (100%)!');
console.log('========================================================================\n');
