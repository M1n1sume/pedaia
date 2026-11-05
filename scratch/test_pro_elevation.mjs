// Test Suite for Professional Studio Elevation Package
import assert from 'assert';

console.log('--- Testing Professional Studio Elevation Features ---');

// Mock localStorage & window for headless Node before importing state
const mockStore = {};
global.localStorage = {
  getItem: (k) => mockStore[k] || null,
  setItem: (k, v) => { mockStore[k] = String(v); },
  removeItem: (k) => delete mockStore[k]
};
global.window = {
  location: { origin: 'http://localhost:3000' }
};

const { store } = await import('../public/js/state.js');
const { renderOutputWorkspaceView, setActiveWorkspaceDesignId } = await import('../public/js/views/outputWorkspace.js');

const designs = store.getDesigns();
assert(designs.length > 0, 'Must have sample designs');
const sample = designs[0];

// Test rendering output workspace with active design
setActiveWorkspaceDesignId(sample.id);
const html = renderOutputWorkspaceView();

// Verify Scholarly Manuscript Masthead is present
assert(html.includes('PEDAIA FOLIO'), 'Workspace must include Scholarly Folio header');
assert(html.includes('Curricular Dossier'), 'Workspace must include Curricular Dossier');
assert(html.includes('Faculty Designer'), 'Workspace must include Faculty Designer metadata');
console.log('✓ Scholarly Manuscript Folio masthead verified');

// Verify Pedagogical Quality & Alignment Scorecard is present
assert(html.includes('Pedagogical Quality & Alignment Scorecard'), 'Workspace must render Quality Scorecard');
assert(html.includes("Bloom's Cognitive Spectrum Distribution"), 'Scorecard must render Bloom spectrum meter');
assert(html.includes('UDL: Multiple Engagement'), 'Scorecard must render UDL engagement check');
assert(html.includes('Standards Aligned'), 'Scorecard must render standards alignment badge');
console.log('✓ Live Pedagogical Quality & Alignment Scorecard verified');

// Verify Focus Mode & Print Folio buttons are present
assert(html.includes('ws-toggle-focus-btn'), 'Workspace must have Focus Mode button');
assert(html.includes('ws-print-folio-btn'), 'Workspace must have Print Folio button');
console.log('✓ Focus Folio mode and Print buttons verified');

console.log('🎉 ALL PROFESSIONAL STUDIO ELEVATION TESTS PASSED!');
