// PEDAIA Comprehensive Diagnostic & Audit Suite
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const errors = [];
const warnings = [];

function recordError(area, message) {
  errors.push(`[${area}] ${message}`);
  console.error(`❌ [${area}] ${message}`);
}

function recordWarning(area, message) {
  warnings.push(`[${area}] ${message}`);
  console.warn(`⚠️ [${area}] ${message}`);
}

console.log('=== STARTING DEEP PEDAIA APPLICATION AUDIT ===\n');

// -------------------------------------------------------------
// 1. Audit Server Endpoints & Handlers
// -------------------------------------------------------------
console.log('--- Step 1: Testing Server Endpoints & API Handlers ---');
try {
  const serverPath = path.join(rootDir, 'server.js');
  const serverCode = fs.readFileSync(serverPath, 'utf8');

  // Verify static mime types
  if (!serverCode.includes("'.zip': 'application/zip'")) {
    recordError('Server', 'Missing .zip MIME type in server.js');
  }

  // Check required routes
  const requiredRoutes = ['/api/status', '/api/generate', '/api/lms/publish'];
  for (const route of requiredRoutes) {
    if (!serverCode.includes(route)) {
      recordError('Server', `Missing route ${route} in server.js`);
    }
  }

  // Check if built-in offline generator handles all studios
  const requiredStudioTypes = [
    'lesson-plan',
    'activity-design',
    'questioning-studio',
    'differentiation-studio'
  ];
  for (const st of requiredStudioTypes) {
    if (!serverCode.includes(st)) {
      recordWarning('Server', `Built-in fallback generator may be missing specific handler for '${st}'`);
    }
  }
} catch (err) {
  recordError('Server', err.message);
}

// -------------------------------------------------------------
// 2. Audit Client-side State & Storage
// -------------------------------------------------------------
console.log('\n--- Step 2: Testing State Management & Storage ---');
try {
  // Mock localStorage for Node environment
  const mockStorage = {};
  global.localStorage = {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
  };
  global.window = {
    matchMedia: () => ({ matches: false, addEventListener: () => {} }),
    dispatchEvent: () => {},
    CustomEvent: class CustomEvent { constructor(type) { this.type = type; } }
  };
  global.document = {
    documentElement: {
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      setAttribute: () => {},
      style: {}
    }
  };

  const { store } = await import('../public/js/state.js');
  const initialSettings = store.getSettings();
  if (!initialSettings) recordError('State', 'store.getSettings() returned null');
  
  const designs = store.getDesigns();
  if (!Array.isArray(designs)) recordError('State', 'store.getDesigns() did not return an array');
  
  const templates = store.getTemplates();
  if (!Array.isArray(templates)) recordError('State', 'store.getTemplates() did not return an array');

  console.log(`✓ State initialized with ${designs.length} sample designs and ${templates.length} templates`);
} catch (err) {
  recordError('State', `Failed to initialize state: ${err.message}\n${err.stack}`);
}

// -------------------------------------------------------------
// 3. Audit Palette & Unified Theme System
// -------------------------------------------------------------
console.log('\n--- Step 3: Testing Unified Theme & Palette Tokens ---');
try {
  const { PEDAIA_BRAND, THEME_MODES, applyPalette, getCurrentPalette } = await import('../public/js/palette.js');
  if (PEDAIA_BRAND.primary !== '#312E81') recordError('Palette', `Primary color mismatch: expected #312E81, got ${PEDAIA_BRAND.primary}`);
  if (PEDAIA_BRAND.secondary !== '#7C3AED') recordError('Palette', `Secondary color mismatch: expected #7C3AED, got ${PEDAIA_BRAND.secondary}`);
  if (PEDAIA_BRAND.accent !== '#14B8A6') recordError('Palette', `Accent color mismatch: expected #14B8A6, got ${PEDAIA_BRAND.accent}`);

  applyPalette('light');
  applyPalette('dark');
  applyPalette('system');
  console.log('✓ Unified Theme tokens validated across light, dark, and system modes');
} catch (err) {
  recordError('Palette', `Theme system error: ${err.message}`);
}

// -------------------------------------------------------------
// 4. Audit View Render Functions
// -------------------------------------------------------------
console.log('\n--- Step 4: Testing View Render Functions ---');
const viewsToTest = [
  { name: 'Dashboard', path: '../public/js/views/dashboard.js', fn: 'renderDashboardView' },
  { name: 'Lesson Planner', path: '../public/js/views/lessonPlanner.js', fn: 'renderLessonPlannerView' },
  { name: 'Activity Designer', path: '../public/js/views/activityDesigner.js', fn: 'renderActivityDesignerView' },
  { name: 'Questioning Studio', path: '../public/js/views/questioningStudio.js', fn: 'renderQuestioningStudioView' },
  { name: 'Differentiation Studio', path: '../public/js/views/differentiationStudio.js', fn: 'renderDifferentiationStudioView' },
  { name: 'Output Workspace', path: '../public/js/views/outputWorkspace.js', fn: 'renderOutputWorkspaceView' },
  { name: 'My Designs', path: '../public/js/views/myDesigns.js', fn: 'renderMyDesignsView' },
  { name: 'Prompt Library', path: '../public/js/views/promptLibrary.js', fn: 'renderPromptLibraryView' },
  { name: 'Settings', path: '../public/js/views/settings.js', fn: 'renderSettingsView' }
];

for (const v of viewsToTest) {
  try {
    const mod = await import(v.path);
    if (typeof mod[v.fn] !== 'function') {
      recordError('Views', `${v.name} missing function ${v.fn}`);
      continue;
    }
    const html = mod[v.fn]();
    if (!html || typeof html !== 'string' || html.length < 50) {
      recordError('Views', `${v.name} render output was empty or invalid`);
    } else {
      console.log(`✓ ${v.name} rendered cleanly (${html.length} chars)`);
    }
  } catch (err) {
    recordError('Views', `Error rendering ${v.name}: ${err.message}\n${err.stack}`);
  }
}

// -------------------------------------------------------------
// 5. Audit AI Service & Providers Configuration
// -------------------------------------------------------------
console.log('\n--- Step 5: Testing AI Providers & Engine Configuration ---');
try {
  const { AI_PROVIDERS, getProviderConfig } = await import('../public/js/aiProviders.js');
  const providerCount = Object.keys(AI_PROVIDERS).length;
  if (providerCount < 15) {
    recordWarning('AI Providers', `Expected at least 15 AI providers, found ${providerCount}`);
  }
  for (const [id, prov] of Object.entries(AI_PROVIDERS)) {
    if (!prov.name || !prov.category || !prov.models) {
      recordError('AI Providers', `Provider ${id} is missing required fields (name, category, models)`);
    }
  }
  console.log(`✓ Validated ${providerCount} AI Providers and model catalogs`);
} catch (err) {
  recordError('AI Providers', err.message);
}

// -------------------------------------------------------------
// 6. Audit LMS Service & Packaging
// -------------------------------------------------------------
console.log('\n--- Step 6: Testing LMS Integration & Packaging ---');
try {
  const { lmsService } = await import('../public/js/lmsService.js');
  const sampleDesign = {
    id: 'test-design-1',
    title: 'Photosynthesis & Cellular Energy',
    subject: 'Biology',
    level: 'Grade 9',
    output: '# Photosynthesis\n## Objectives\nUnderstand ATP cycles.'
  };

  const canvasPkg = lmsService.buildCanvasPackage(sampleDesign);
  if (!canvasPkg || !canvasPkg.assignment || !canvasPkg.page) {
    recordError('LMS', 'Canvas package builder failed to generate assignment and page structure');
  }

  const classroomShareUrl = lmsService.getClassroomShareUrl(sampleDesign);
  if (!classroomShareUrl.includes('classroom.google.com/share')) {
    recordError('LMS', 'Google Classroom share URL invalid');
  }
  console.log('✓ Canvas & Google Classroom packaging modules validated');
} catch (err) {
  recordError('LMS', err.message);
}

// -------------------------------------------------------------
// 7. Audit index.html Markup & IDs
// -------------------------------------------------------------
console.log('\n--- Step 7: Testing index.html Elements & Script Links ---');
try {
  const indexHtml = fs.readFileSync(path.join(rootDir, 'public', 'index.html'), 'utf8');
  
  // Verify main container
  if (!indexHtml.includes('id="main-view-container"')) {
    recordError('HTML', 'index.html is missing #main-view-container');
  }
  
  // Check critical header buttons
  const criticalIds = [
    'header-file-hub-btn',
    'header-api-status-btn',
    'header-palette-btn',
    'header-extension-btn',
    'header-settings-btn',
    'header-profile-btn'
  ];
  for (const id of criticalIds) {
    if (!indexHtml.includes(`id="${id}"`)) {
      recordError('HTML', `index.html is missing button #${id}`);
    }
  }

  // Check script tags
  if (!indexHtml.includes('<script type="module" src="./js/app.js"></script>')) {
    recordError('HTML', 'index.html missing script module import for ./js/app.js');
  }
  console.log('✓ index.html structure, critical IDs, and script tags validated');
} catch (err) {
  recordError('HTML', err.message);
}

// -------------------------------------------------------------
// Final Report
// -------------------------------------------------------------
console.log('\n======================================================');
console.log(`AUDIT FINISHED: ${errors.length} Errors, ${warnings.length} Warnings`);
console.log('======================================================');

if (errors.length > 0) {
  console.error('\nERRORS FOUND:');
  errors.forEach(e => console.error(e));
  process.exit(1);
} else {
  console.log('🎉 ZERO ERRORS FOUND IN AUDIT SUITE!');
  process.exit(0);
}
