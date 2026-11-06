// PEDAIA Authentication & Admin Atelier Test Suite
import assert from 'assert';

const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};
global.window = {
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
  dispatchEvent: () => {}
};

const { store, BLANK_EDUCATOR_PROFILE } = await import('../public/js/state.js');

console.log('=== STARTING USER AUTH & ADMIN ATELIER TESTS ===\n');

// 1. Initial State & M1n1sume Admin Presence
console.log('--- Test 1: M1n1sume Seeded as Admin ---');
const users = store.getAuthUsers();
assert.ok(users['usr_m1n1sume'], 'Admin M1n1sume account must be seeded by default');
assert.strictEqual(users['usr_m1n1sume'].username, 'M1n1sume');
assert.strictEqual(users['usr_m1n1sume'].role, 'admin');
assert.strictEqual(users['usr_m1n1sume'].isInitialized, false, 'M1n1sume should not be initialized until password is set');
assert.strictEqual(users['usr_m1n1sume'].passwordHash, null, 'M1n1sume passwordHash must be null initially');
console.log('✓ Admin M1n1sume correctly seeded without hardcoded password');

// 2. First-Time Login Attempt for M1n1sume
console.log('\n--- Test 2: M1n1sume Requires First-Time Admin Password Setup ---');
const loginAttempt1 = await store.loginUser({ username: 'M1n1sume', password: 'any' });
assert.strictEqual(loginAttempt1.success, false);
assert.strictEqual(loginAttempt1.requiresAdminSetup, true);
assert.ok(loginAttempt1.message.includes('master'));
console.log('✓ First-time login prompt properly flags requiresAdminSetup');

// 3. Admin M1n1sume Sets Master Password
console.log('\n--- Test 3: M1n1sume Master Password Setup ---');
const setupRes = await store.setupAdminPassword('MySecretAdminPass2026!');
assert.strictEqual(setupRes.success, true);
assert.strictEqual(setupRes.user.username, 'M1n1sume');
assert.strictEqual(setupRes.user.role, 'admin');
assert.strictEqual(setupRes.user.isInitialized, true);
assert.ok(setupRes.user.passwordHash && setupRes.user.passwordHash.length > 20, 'Password must be hashed');
assert.notStrictEqual(setupRes.user.passwordHash, 'MySecretAdminPass2026!', 'Plaintext password must never be stored');
assert.strictEqual(store.isAdmin(), true, 'store.isAdmin() must be true for M1n1sume');
assert.strictEqual(store.getCurrentUser().username, 'M1n1sume');
console.log('✓ M1n1sume successfully configured master password and established admin session');

// 4. Authenticate M1n1sume with Master Password
console.log('\n--- Test 4: M1n1sume Subsequent Login Verification ---');
store.logoutUser();
assert.strictEqual(store.isAuthenticated(), false);

// Wrong password
await assert.rejects(async () => {
  await store.loginUser({ username: 'M1n1sume', password: 'WrongPassword123' });
}, /Incorrect password/);

// Correct password
const loginSuccess = await store.loginUser({ username: 'M1n1sume', password: 'MySecretAdminPass2026!' });
assert.strictEqual(loginSuccess.success, true);
assert.strictEqual(store.isAdmin(), true);
console.log('✓ Master password validation and rejection verified');

// 5. New User Registration with Distinct Username and Password
console.log('\n--- Test 5: Standard Educator Registration (Auth vs Profile Separation) ---');
const regRes = await store.registerUser({
  username: 'prof_clara',
  password: 'ClaraPassword2026!',
  initialName: 'Prof. Clara Oswald'
});
assert.strictEqual(regRes.success, true);
assert.strictEqual(regRes.user.username, 'prof_clara');
assert.strictEqual(regRes.user.role, 'educator');
assert.strictEqual(store.isAdmin(), false, 'Standard educator must not be admin');

// Check profile details are separated from auth username
const claraProfile = store.getEducatorProfile(regRes.user.id);
assert.strictEqual(claraProfile.name, 'Prof. Clara Oswald', 'Profile name set correctly');
assert.notStrictEqual(claraProfile.name, regRes.user.username, 'Profile name is distinct from username');
assert.strictEqual(claraProfile.institution, '', 'Unset profile fields remain blank');
console.log('✓ User registration verified with distinct credentials and separated educator profile');

// 6. Data Isolation Between Accounts
console.log('\n--- Test 6: Cross-Account Data Isolation (Designs & Outputs) ---');
// While logged in as prof_clara, save design and output
const claraDesign = store.saveDesign({
  title: 'Clara 5E Thermodynamics',
  framework: '5E Inquiry Model',
  subject: 'Physics',
  output: '# Thermodynamics 5E Plan'
});
const claraOutput = store.saveOutput({
  title: 'Clara Physics Slide Deck',
  category: 'presentations',
  type: 'slides',
  content: '# Slide Deck Content'
});

assert.strictEqual(store.getDesigns().length, 1);
assert.strictEqual(store.getDesigns()[0].id, claraDesign.id);
assert.strictEqual(store.getOutputs().length, 1);
assert.strictEqual(store.getOutputs()[0].id, claraOutput.id);

// Switch back to M1n1sume (Admin)
await store.loginUser({ username: 'M1n1sume', password: 'MySecretAdminPass2026!' });
assert.strictEqual(store.getCurrentUser().username, 'M1n1sume');

// M1n1sume should NOT see Clara's designs in their personal design atelier
assert.strictEqual(store.getDesigns().length, 0, 'Admin personal designs should not leak Clara designs');
assert.strictEqual(store.getOutputs().length, 0, 'Admin personal outputs should not leak Clara outputs');

// M1n1sume saves an admin design
const adminDesign = store.saveDesign({
  title: 'Admin Master Curriculum Architecture',
  framework: 'UbD',
  subject: 'Instructional Leadership',
  output: '# Curriculum Architecture'
});
assert.strictEqual(store.getDesigns().length, 1);
assert.strictEqual(store.getDesigns()[0].title, 'Admin Master Curriculum Architecture');

// Log back in as Clara
await store.loginUser({ username: 'prof_clara', password: 'ClaraPassword2026!' });
assert.strictEqual(store.getDesigns().length, 1);
assert.strictEqual(store.getDesigns()[0].title, 'Clara 5E Thermodynamics', 'Clara only sees her own designs');
assert.strictEqual(store.getOutputs().length, 1);
assert.strictEqual(store.getOutputs()[0].title, 'Clara Physics Slide Deck');
console.log('✓ Absolute data isolation verified between accounts with zero leakage');

// 7. Admin Inspection & User Management
console.log('\n--- Test 7: Admin Console Capabilities for M1n1sume ---');
// As Clara, admin list should be empty
assert.deepStrictEqual(store.getAllUsersForAdmin(), []);

// As M1n1sume
await store.loginUser({ username: 'M1n1sume', password: 'MySecretAdminPass2026!' });
const allUsers = store.getAllUsersForAdmin();
assert.strictEqual(allUsers.length, 2, 'Admin sees all registered users');
const m1n1 = allUsers.find(u => u.username === 'M1n1sume');
const clara = allUsers.find(u => u.username === 'prof_clara');
assert.ok(m1n1);
assert.ok(clara);
assert.strictEqual(m1n1.role, 'admin');
assert.strictEqual(clara.role, 'educator');
assert.strictEqual(clara.profileName, 'Prof. Clara Oswald');
assert.strictEqual(clara.designsCount, 1);
assert.strictEqual(clara.outputsCount, 1);
console.log('✓ Admin user overview verified with role-based protection');

console.log('\n========================================================');
console.log('🎉 ALL USER AUTH & ADMIN ATELIER TESTS PASSED (100%)!');
console.log('========================================================\n');
