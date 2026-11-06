// Setup Mock LocalStorage before importing state
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new MockLocalStorage();

// Verify Dashboard Studio Selection Integration
const { renderDashboardView, setupDashboardListeners } = await import('../public/js/views/dashboard.js');
const { store } = await import('../public/js/state.js');

console.log('=== VERIFYING DASHBOARD STUDIO SELECTION INTEGRATION ===\n');

// 1. Render Dashboard HTML
const dashboardHtml = renderDashboardView();

// 2. Check Quick Launch Studio Buttons in Hero
const hasQuickLaunchOutput = dashboardHtml.includes('id="quick-launch-output-btn"');
console.log('1. Hero Quick-Launch Studio Button:');
console.log('   Contains quick-launch-output-btn:', hasQuickLaunchOutput ? '✓ PASS' : '✗ FAIL');

// 3. Check Section 4 Studios Grid
const hasModuleV = dashboardHtml.includes('Module V') && dashboardHtml.includes('AI Output Studio');
const hasNavDestOutput = dashboardHtml.includes('data-dest="ai-output-studio"');
console.log('\n2. Instructional Design & Output Studios Section:');
console.log('   Contains Module V (AI Output Studio):', hasModuleV ? '✓ PASS' : '✗ FAIL');
console.log('   Contains navigation trigger for ai-output-studio:', hasNavDestOutput ? '✓ PASS' : '✗ FAIL');

// 4. Test with mock output to ensure Recent Deliverables render properly
const mockOutput = {
  id: 'out-test-123',
  title: 'Grade 10 Biology Genetics Slide Deck',
  category: 'presentation',
  subType: 'PowerPoint Presentations',
  subTypeName: 'PowerPoint Deck',
  topic: 'Mendelian Inheritance & Punnett Squares',
  subject: 'Science',
  createdAt: new Date().toISOString()
};

store.saveOutput(mockOutput);

const dashboardWithOutputsHtml = renderDashboardView();
const hasRecentDeliverables = dashboardWithOutputsHtml.includes('Recent Educational Deliverables');
const hasOutputCard = dashboardWithOutputsHtml.includes('data-output-id="out-test-123"');
console.log('\n3. Recent Educational Deliverables on Dashboard:');
console.log('   Renders Recent Deliverables section:', hasRecentDeliverables ? '✓ PASS' : '✗ FAIL');
console.log('   Contains generated output card:', hasOutputCard ? '✓ PASS' : '✗ FAIL');

// Clean up mock output
store.deleteOutput('out-test-123');
console.log('   Cleaned up mock output: ✓ PASS');

if (hasQuickLaunchOutput && hasModuleV && hasNavDestOutput && hasRecentDeliverables && hasOutputCard) {
  console.log('\n🎉 ALL DASHBOARD SELECTION TESTS PASSED (100%)!');
} else {
  console.error('\n❌ SOME TESTS FAILED');
  process.exit(1);
}
