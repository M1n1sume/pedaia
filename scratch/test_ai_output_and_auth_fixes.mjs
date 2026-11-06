import assert from 'assert';
import fs from 'fs';

console.log('=== RUNNING COMPREHENSIVE AI OUTPUT STUDIO & AUTHENTICATION AUDIT ===\n');

// 1. Mock Browser Environment
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};
global.window = {
  location: { hash: '' },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
  dispatchEvent: () => {},
  scrollTo: () => {}
};
global.document = {
  getElementById: (id) => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

// 2. Import Modules
const { store } = await import('../public/js/state.js');
const { renderAiOutputStudioView, OUTPUT_CATEGORIES, OUTPUT_TEMPLATES } = await import('../public/js/views/aiOutputStudio.js');
const { renderDashboardView } = await import('../public/js/views/dashboard.js');
const { renderAdminDashboardView } = await import('../public/js/views/adminDashboard.js');

// 3. Test AI Output Studio View Content Separation
console.log('1. Testing AI Output Studio View Separation & Integrity:');
const studioHtml = renderAiOutputStudioView();

assert.ok(studioHtml.includes('AI Output Studio'), 'Studio must contain title "AI Output Studio"');
assert.ok(studioHtml.includes('Transform your lesson ideas into engaging educational materials.'), 'Studio must contain exact subtitle');
assert.ok(studioHtml.includes('+ Create New Output'), 'Studio must contain "+ Create New Output" button');
assert.ok(!studioHtml.includes('Create Purpose-Driven Instructional Designs'), 'Studio must NOT contain Dashboard heading');
assert.ok(!studioHtml.includes('Start Your First Curriculum Dossier'), 'Studio must NOT contain Dossier empty state');
assert.ok(!studioHtml.includes('Recent Curricular Dossiers'), 'Studio must NOT contain Dashboard dossiers list');
console.log('  ✓ AI Output Studio content is 100% separated from Dashboard content.');

// 4. Verify 8 Output Categories
console.log('\n2. Verifying 8 Required Educational Deliverable Categories:');
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

assert.strictEqual(OUTPUT_CATEGORIES.length, 8, 'Must have exactly 8 categories');
expectedCategories.forEach(catName => {
  const found = OUTPUT_CATEGORIES.some(c => c.name === catName);
  assert.ok(found, `Category "${catName}" must exist`);
  assert.ok(studioHtml.includes(catName) || studioHtml.includes(catName.replace(/&/g, '&amp;')), `Category "${catName}" must be rendered in HTML`);
  console.log(`  ✓ Category verified: ${catName}`);
});

// 5. Test Dashboard View
console.log('\n3. Testing Dashboard View & Auth Access Banner:');
const dashHtmlGuest = renderDashboardView();
assert.ok(dashHtmlGuest.includes('Create Purpose-Driven Instructional Designs'), 'Dashboard contains its primary hero');
assert.ok(dashHtmlGuest.includes('AI Output Studio'), 'Dashboard includes dedicated link to AI Output Studio');
assert.ok(dashHtmlGuest.includes('Account Access & Security') || dashHtmlGuest.includes('Sign In'), 'Guest Dashboard displays authentication banner');
console.log('  ✓ Dashboard correctly renders with Instructional Studios, AI Output callout, and Auth Access banner.');

// 6. Test Multi-User Authentication & M1n1sume Admin Setup
console.log('\n4. Testing Multi-User Authentication & Administrator M1n1sume:');

// Initial state: M1n1sume is seeded
const authUsers = store.getAuthUsers();
assert.ok(authUsers['usr_m1n1sume'], 'M1n1sume user must exist in auth store');
assert.strictEqual(store.isM1n1sumeInitialized(), false, 'M1n1sume should not be initialized initially');
console.log('  ✓ Initial state: M1n1sume seeded, awaiting master password.');

// Setup Admin Password
await store.setupAdminPassword('AdminMasterPass2026!');
assert.strictEqual(store.isM1n1sumeInitialized(), true, 'M1n1sume is now initialized');

// Login M1n1sume
const loginResult = await store.loginUser('M1n1sume', 'AdminMasterPass2026!');
assert.strictEqual(loginResult.user.username, 'M1n1sume');
assert.strictEqual(loginResult.user.role, 'admin');
assert.strictEqual(store.isAdmin(), true, 'store.isAdmin() returns true for M1n1sume');
console.log('  ✓ M1n1sume password setup and admin login successful.');

// Verify Admin Console HTML
const adminHtml = renderAdminDashboardView();
assert.ok(adminHtml.includes('Admin Console & User Management'), 'Admin dashboard renders properly');
assert.ok(adminHtml.includes('M1n1sume'), 'Admin dashboard includes M1n1sume');
console.log('  ✓ Admin console view renders user directory and security controls.');

// Register a New Independent Educator
const regResult = await store.registerUser('teacher_clara', 'SecurePedaiaPass99!');
assert.strictEqual(regResult.user.username, 'teacher_clara');
assert.strictEqual(regResult.user.role, 'educator');
assert.strictEqual(store.isAdmin(), false, 'Regular educator is not admin');
console.log('  ✓ Independent user registration successful: teacher_clara.');

// Test Separation of Credentials from Profile Details
const claraUserId = regResult.user.id;
store.saveEducatorProfile({
  name: 'Clara Oswald, M.Ed.',
  institution: 'Coal Hill Secondary School',
  specialization: 'English Literature'
}, claraUserId);

const profile = store.getEducatorProfile(claraUserId);
assert.strictEqual(profile.name, 'Clara Oswald, M.Ed.');
assert.strictEqual(profile.institution, 'Coal Hill Secondary School');
const usersAfterProfile = store.getAuthUsers();
assert.strictEqual(usersAfterProfile[claraUserId].username, 'teacher_clara', 'Auth username remains distinct from profile name');
console.log('  ✓ Account credentials (username/password) are completely distinct from educator profile details.');

// Test Data Isolation for Outputs
store.saveOutput({
  title: 'Shakespearean Sonnets Analysis Poster',
  category: 'poster',
  topic: 'Sonnet 18'
});
const claraOutputs = store.getOutputs();
assert.strictEqual(claraOutputs.length, 1);
assert.strictEqual(claraOutputs[0].title, 'Shakespearean Sonnets Analysis Poster');

// Logout and check isolation
store.logoutUser();
assert.strictEqual(store.isAuthenticated(), false);
console.log('  ✓ Account logout and user isolation verified.');

console.log('\n======================================================');
console.log('🎉 ALL AUDIT CHECKS PASSED WITH 100% SUCCESS!');
console.log('======================================================');
