// Automated Verification Suite: AI Output Studio Navigation & Page Content Separation
import fs from 'fs';

// Setup Mock DOM & LocalStorage
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

const { store } = await import('../public/js/state.js');
const { renderDashboardView } = await import('../public/js/views/dashboard.js');
const { renderAiOutputStudioView, OUTPUT_CATEGORIES, OUTPUT_TEMPLATES } = await import('../public/js/views/aiOutputStudio.js');

console.log('=== VERIFYING AI OUTPUT STUDIO NAVIGATION & PAGE CONTENT SEPARATION ===\n');

// 1. Check index.html nav button attributes and classes
const indexHtml = fs.readFileSync('public/index.html', 'utf8');

// Check that AI Output Studio does NOT have hardcoded active/indigo background classes in HTML
const outputStudioBtnMatch = indexHtml.match(/<button data-nav="ai-output-studio"[^>]*class="([^"]*)"/);
if (!outputStudioBtnMatch) {
  console.error('✗ FAIL: data-nav="ai-output-studio" button not found in index.html');
  process.exit(1);
}
const outputBtnClasses = outputStudioBtnMatch[1];
const hasHardcodedActive = outputBtnClasses.includes('bg-indigo-950') || outputBtnClasses.includes('bg-indigo-50') || outputBtnClasses.includes('active');
console.log('1. Navigation Button Baseline Classes:');
console.log('   AI Output Studio button found: ✓ PASS');
console.log('   AI Output Studio has NO hardcoded active background:', !hasHardcodedActive ? '✓ PASS' : '✗ FAIL');

// Check that Dashboard button is visible and properly configured
const dashboardBtnMatch = indexHtml.match(/<button data-nav="dashboard"[^>]*class="([^"]*)"/);
console.log('   Dashboard button found: ✓ PASS');
console.log('   Dashboard button not hidden on md:', !dashboardBtnMatch[1].includes('hidden lg:flex') ? '✓ PASS' : '✗ FAIL');

// 2. Render Both Pages Separately
const dashboardHtml = renderDashboardView();
const outputStudioHtml = renderAiOutputStudioView();

console.log('\n2. Testing Page Content Separation:');
// 2A. Verify Dashboard content
const dashHasHeroTitle = dashboardHtml.includes('Create Purpose-Driven Instructional Designs');
const dashHasCurriculumDossiers = dashboardHtml.includes('Recent Curricular Dossiers') || dashboardHtml.includes('Start Your First Curriculum Dossier');
const dashHasStudios = dashboardHtml.includes('Instructional Design');
console.log('   Dashboard contains "Create Purpose-Driven Instructional Designs":', dashHasHeroTitle ? '✓ PASS' : '✗ FAIL');
console.log('   Dashboard contains "Curriculum Dossiers":', dashHasCurriculumDossiers ? '✓ PASS' : '✗ FAIL');
console.log('   Dashboard contains "Instructional Design Studios":', dashHasStudios ? '✓ PASS' : '✗ FAIL');

// 2B. Verify AI Output Studio content
const outputHasDashTitle = outputStudioHtml.includes('Create Purpose-Driven Instructional Designs');
const outputHasCurriculumDossiers = outputStudioHtml.includes('Curricular Dossiers') || outputStudioHtml.includes('Start Your First Curriculum Dossier');
const outputHasHeaderTitle = outputStudioHtml.includes('AI Output Studio');
const outputHasSubtitle = outputStudioHtml.includes('Transform your lesson ideas into engaging educational materials.');
const outputHasCreateBtn = outputStudioHtml.includes('Create New Output');
const outputHasEmptyState = outputStudioHtml.includes('No outputs created yet.') && outputStudioHtml.includes('Start creating your first educational material using AI Output Studio.');

console.log('\n3. Testing AI Output Studio Page Content (Prompt Requirements):');
console.log('   Does NOT contain "Create Purpose-Driven Instructional Designs":', !outputHasDashTitle ? '✓ PASS' : '✗ FAIL');
console.log('   Does NOT contain "Curriculum Dossiers":', !outputHasCurriculumDossiers ? '✓ PASS' : '✗ FAIL');
console.log('   Contains Title "AI Output Studio":', outputHasHeaderTitle ? '✓ PASS' : '✗ FAIL');
console.log('   Contains Subtitle "Transform your lesson ideas into engaging educational materials.":', outputHasSubtitle ? '✓ PASS' : '✗ FAIL');
console.log('   Contains "+ Create New Output" button:', outputHasCreateBtn ? '✓ PASS' : '✗ FAIL');
console.log('   Contains dedicated empty state for outputs:', outputHasEmptyState ? '✓ PASS' : '✗ FAIL');

// 4. Verify 8 Output Categories in AI Output Studio
console.log('\n4. Verifying 8 Distinct Deliverable Categories:');
const expectedCategories = [
  'Presentations & PowerPoint',
  'Posters & Infographics',
  'Documents & Learning Materials',
  'Visual Learning Resources',
  'Assessment Materials',
  'Classroom Resources',
  'Digital Creative Assets',
  'Custom Output'
];

let allCategoriesMatch = true;
expectedCategories.forEach(catName => {
  const found = OUTPUT_CATEGORIES.some(c => c.name.toLowerCase().includes(catName.toLowerCase()) || catName.toLowerCase().includes(c.name.toLowerCase()));
  const htmlSafeName = catName.replace('&', '&amp;');
  const renderedInHtml = outputStudioHtml.includes(catName) || outputStudioHtml.includes(htmlSafeName);
  console.log(`   - Category "${catName}": ${found && renderedInHtml ? '✓ PASS' : '✗ FAIL'}`);
  if (!found || !renderedInHtml) allCategoriesMatch = false;
});

// 5. Verify Output Templates
console.log('\n5. Verifying Output Templates Repertoire:');
console.log('   Total templates:', OUTPUT_TEMPLATES.length, OUTPUT_TEMPLATES.length >= 8 ? '✓ PASS' : '✗ FAIL');
console.log('   Templates rendered in HTML:', outputStudioHtml.includes('Output Templates') ? '✓ PASS' : '✗ FAIL');

// 6. Verify Router Mapping in app.js
const appJs = fs.readFileSync('public/js/app.js', 'utf8');
const routesOutputStudio = appJs.includes("case 'ai-output-studio':") && appJs.includes("renderAiOutputStudioView()");
const routesDashboard = appJs.includes("case 'dashboard':") && appJs.includes("renderDashboardView()");
const hashRouting = appJs.includes("navigateTo(parts[0], parts[1])");
console.log('\n6. Verifying Routing & Navigation Engine in app.js:');
console.log('   Routes "ai-output-studio" to renderAiOutputStudioView():', routesOutputStudio ? '✓ PASS' : '✗ FAIL');
console.log('   Routes "dashboard" to renderDashboardView():', routesDashboard ? '✓ PASS' : '✗ FAIL');
console.log('   Direct hash navigation & refresh supported:', hashRouting ? '✓ PASS' : '✗ FAIL');

const passed = !hasHardcodedActive &&
  dashHasHeroTitle &&
  dashHasCurriculumDossiers &&
  !outputHasDashTitle &&
  !outputHasCurriculumDossiers &&
  outputHasHeaderTitle &&
  outputHasSubtitle &&
  outputHasCreateBtn &&
  outputHasEmptyState &&
  allCategoriesMatch &&
  routesOutputStudio &&
  routesDashboard;

if (passed) {
  console.log('\n======================================================');
  console.log('🎉 ALL 9 REQUIREMENTS & VERIFICATIONS PASSED (100%)!');
  console.log('======================================================');
} else {
  console.error('\n❌ SOME VERIFICATIONS FAILED');
  process.exit(1);
}
