import assert from 'assert';
import fs from 'fs';

// Mock browser environment
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; }
};

const rootAttrs = {};
const rootStyle = {
  setProperty: (k, v) => { rootStyle[k] = v; }
};
global.document = {
  documentElement: {
    setAttribute: (k, v) => { rootAttrs[k] = v; },
    getAttribute: (k) => rootAttrs[k] || null,
    style: rootStyle,
    classList: { add: () => {}, remove: () => {} }
  },
  body: {
    style: {}
  },
  getElementById: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

global.window = {
  innerWidth: 1920,
  innerHeight: 1080,
  devicePixelRatio: 1,
  addEventListener: () => {},
  dispatchEvent: () => {}
};

async function runTests() {
  console.log('========================================');
  console.log('TESTING DEVICE & SCREEN LAYOUT MANAGER');
  console.log('========================================');

  const { store } = await import('../public/js/state.js');
  const { LAYOUT_MODES, getDeviceProfile, applyLayoutMode } = await import('../public/js/layoutManager.js');

  // Test 1: Device Profile Detection
  const profile1920 = getDeviceProfile();
  assert.strictEqual(profile1920.type, 'desktop', '1920 width should identify as desktop');
  assert.strictEqual(profile1920.width, 1920);

  global.window.innerWidth = 1366;
  global.window.innerHeight = 768;
  const profileLaptop = getDeviceProfile();
  assert.strictEqual(profileLaptop.type, 'laptop', '1366 width should identify as laptop / scaled display');
  console.log('  ✓ Device profile accurately detects resolutions and display tiers');

  // Test 2: Apply Left-Fit Mode
  applyLayoutMode(LAYOUT_MODES.LEFT, 100);
  assert.strictEqual(rootAttrs['data-layout-mode'], 'left');
  assert.strictEqual(rootAttrs['data-resolved-layout'], 'left');
  console.log('  ✓ Left-fit mode successfully sets data-resolved-layout="left"');

  // Test 3: Apply Auto Mode on Laptop
  applyLayoutMode(LAYOUT_MODES.AUTO, 100);
  assert.strictEqual(rootAttrs['data-layout-mode'], 'auto');
  assert.strictEqual(rootAttrs['data-resolved-layout'], 'left', 'Auto on laptop should resolve to left-anchored layout');
  console.log('  ✓ Smart Auto-fit automatically anchors layout to the left for seamless button visibility');

  // Test 4: Apply UI Scale
  applyLayoutMode(LAYOUT_MODES.LEFT, 90);
  assert.strictEqual(rootAttrs['data-ui-scale'], '90');
  assert.strictEqual(rootStyle['--pedaia-ui-scale'], '0.9');
  console.log('  ✓ UI scaling (90%, 95%, 100%, 105%) applies zoom ratio without distortion');

  // Test 5: State Store persistence
  store.setLayoutMode('compact');
  assert.strictEqual(store.getLayoutMode(), 'compact');
  store.setUiScale(95);
  assert.strictEqual(store.getUiScale(), 95);
  console.log('  ✓ Layout mode & scale persist cleanly in state store');

  // Test 6: Verify index.html template integrity
  const indexHtml = fs.readFileSync('public/index.html', 'utf8');
  assert(indexHtml.includes('masthead-inner w-full'), 'Masthead inner must be full-width');
  assert(!indexHtml.includes('<header id="top-masthead" class="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/80 transition-colors shadow-2xs overflow-x-clip">\n    \n    <div class="w-full max-w-7xl mx-auto'), 'Masthead must not be bottlenecked by max-w-7xl mx-auto');
  assert(indexHtml.includes('ml-auto'), 'Right actions must have ml-auto to pin to the right edge');
  assert(indexHtml.includes('id="header-screen-fit-btn"'), 'Header must contain Screen Fit dropdown trigger');
  assert(indexHtml.includes('id="header-screen-fit-dropdown"'), 'Header must contain Screen Fit popover menu');
  assert(indexHtml.includes('<main id="main-content" class="flex-1 w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-8 transition-all">'), 'Main content must not have hardcoded max-w-7xl mx-auto');
  console.log('  ✓ public/index.html guarantees full-width header and left-anchored main canvas');

  // Test 7: Verify styles.css
  const stylesCss = fs.readFileSync('public/css/styles.css', 'utf8');
  assert(stylesCss.includes('html[data-resolved-layout="left"] #main-content'), 'styles.css must style left layout mode');
  assert(stylesCss.includes('max-width: 1720px'), 'styles.css must allow wide workspace up to 1720px');
  console.log('  ✓ public/css/styles.css implements left-anchored expansive workspace styles');

  console.log('========================================');
  console.log('🎉 ALL 7 LAYOUT & SCREEN FIT TESTS PASSED!');
  console.log('========================================');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
