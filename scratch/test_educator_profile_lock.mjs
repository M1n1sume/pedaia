import assert from 'assert';
import fs from 'fs';

// Mock browser environment for unit testing vanilla modules
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; }
};

global.window = {
  location: { hash: '' },
  matchMedia: () => ({ matches: false, addEventListener: () => {} }),
  dispatchEvent: () => {},
  showToast: () => {}
};
global.document = {
  documentElement: {
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    style: {},
    setAttribute: () => {},
    getAttribute: () => null
  },
  body: {
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    style: {}
  }
};

global.fetch = async (url, opts) => {
  return {
    ok: true,
    json: async () => ({
      success: true,
      token: 'mock_jwt_token',
      user: { id: 'usr_clara', username: 'dr_clara', email: 'clara@academy.edu', role: 'educator' }
    })
  };
};

async function runTests() {
  console.log('========================================');
  console.log('TESTING EDUCATOR PROFILE LOCKED SECTION');
  console.log('========================================');

  const { store } = await import('../public/js/state.js');
  const { renderEducatorProfileView, setupEducatorProfileListeners } = await import('../public/js/views/educatorProfile.js');

  // Test 1: By default, session is unauthenticated
  localStorage.clear();
  assert.strictEqual(store.isAuthenticated(), false, 'Default session should be unauthenticated');

  // Test 2: Unauthenticated view renders the LOCKED section
  const lockedHtml = renderEducatorProfileView();
  assert(lockedHtml.includes('id="educator-profile-locked-root"'), 'Must contain locked root container');
  assert(lockedHtml.includes('Educator Profile &amp; Portfolio Locked'), 'Must display locked title');
  assert(lockedHtml.includes('Account Authentication Required'), 'Must display authentication requirement badge');
  assert(lockedHtml.includes('id="prof-lock-login-btn"'), 'Must provide Log In to Account button');
  assert(lockedHtml.includes('id="prof-lock-signup-btn"'), 'Must provide Create Account button');
  assert(!lockedHtml.includes('id="prof-enter-edit-btn"'), 'Must NOT display Edit Profile button when locked');
  assert(!lockedHtml.includes('id="educator-profile-protected-root"'), 'Must NOT display unlocked protected root when locked');
  console.log('  ✓ Unauthenticated state renders locked section with Log In & Create Account buttons');

  // Test 3: Authenticate a user
  await store.registerUser({
    username: 'dr_clara',
    email: 'clara@academy.edu',
    password: 'SecurePassword123'
  });
  assert.strictEqual(store.isAuthenticated(), true, 'User should now be authenticated');
  assert.strictEqual(store.getCurrentUser().username, 'dr_clara', 'Active user should be dr_clara');

  // Test 4: Authenticated view renders the UNLOCKED Educator Profile & Portfolio
  const unlockedHtml = renderEducatorProfileView();
  assert(unlockedHtml.includes('id="educator-profile-protected-root"'), 'Must render protected root when authenticated');
  assert(unlockedHtml.includes('dr_clara'), 'Must show username in authenticated credentials banner');
  assert(unlockedHtml.includes('id="prof-enter-edit-btn"'), 'Must render Edit Profile button when authenticated');
  assert(unlockedHtml.includes('Portfolio Completion'), 'Must render Portfolio Completion tracker');
  assert(unlockedHtml.includes('Portfolio & Curricular Activity'), 'Must render Portfolio & Curricular Activity metrics');
  assert(!unlockedHtml.includes('id="educator-profile-locked-root"'), 'Must NOT render locked container when authenticated');
  console.log('  ✓ Authenticated user can view unlocked profile, stats, and Edit Profile button');

  // Test 5: Log out user -> reverts back to locked state
  store.logoutUser();
  assert.strictEqual(store.isAuthenticated(), false, 'User is now logged out');
  const relockedHtml = renderEducatorProfileView();
  assert(relockedHtml.includes('id="educator-profile-locked-root"'), 'Must revert to locked container upon signout');
  assert(!relockedHtml.includes('id="prof-enter-edit-btn"'), 'Must hide Edit Profile button upon signout');
  console.log('  ✓ Logging out immediately re-locks the section');

  console.log('========================================');
  console.log('🎉 ALL PROFILE LOCK TESTS PASSED (100%)');
  console.log('========================================');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
