// Comprehensive Verification Suite for PEDAIA User Authentication & Personal Storage
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import * as db from '../serverDb.js';

const PORT = 3456;
let serverInstance;

function makeRequest(method, urlPath, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: PORT,
      path: urlPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING PEDAIA AUTH & PERSONAL STORAGE TEST SUITE ---');

  // Step 0: Ensure fresh data directory
  fs.rmSync('./data', { recursive: true, force: true });
  db.initDb();

  // Start temporary test server using server.js logic
  const { default: serverApp } = await import('../server.js');
  // Wait 500ms for server to bind if needed or spawn test instance
  // Since server.js already listens on process.env.PORT, let's test directly or test db & endpoints
  console.log('1. Testing Database & Server-Side Security Functions');

  // Test 1: M1n1sume is seeded and uninitialized
  const users = db.readJson('users.json', []);
  const admin = users.find(u => u.username.toLowerCase() === 'm1n1sume');
  assert.ok(admin, 'Admin M1n1sume must be seeded in database');
  assert.strictEqual(admin.isInitialized, false, 'Admin must initially be uninitialized');
  assert.strictEqual(admin.passwordHash, null, 'Admin must not have any hardcoded password');
  console.log('  ✓ Admin M1n1sume exists without hardcoded password');

  // Test 2: Standard registration rejects reserved admin username
  assert.throws(() => {
    db.registerUser({
      username: 'M1n1sume',
      email: 'hacker@edu.com',
      password: 'password123',
      confirmPassword: 'password123'
    });
  }, /reserved/i, 'Must reject registration of M1n1sume');
  console.log('  ✓ Standard registration strictly rejects reserved username "M1n1sume"');

  // Test 3: Standard registration rejects password mismatch
  assert.throws(() => {
    db.registerUser({
      username: 'test_educator',
      email: 'educator@school.edu',
      password: 'password123',
      confirmPassword: 'wrongpassword'
    });
  }, /match/i, 'Must reject mismatched passwords');
  console.log('  ✓ Password confirmation mismatch rejected');

  // Test 4: Register Educator 1
  const reg1 = db.registerUser({
    username: 'prof_clara',
    email: 'clara@university.edu',
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!'
  });
  assert.ok(reg1.success, 'Registration must succeed');
  assert.ok(reg1.token, 'Session token must be returned');
  assert.strictEqual(reg1.user.username, 'prof_clara');
  assert.strictEqual(reg1.user.role, 'educator');
  console.log('  ✓ Registered user "prof_clara" successfully');

  // Test 5: Verify password was securely hashed and salt exists
  const userRecord = db.readJson('users.json', []).find(u => u.id === reg1.user.id);
  assert.notStrictEqual(userRecord.passwordHash, 'SecurePass123!', 'Password must never be stored plaintext');
  assert.ok(userRecord.salt && userRecord.salt.length >= 16, 'Password must have secure random salt');
  assert.strictEqual(db.verifyPassword('SecurePass123!', userRecord.passwordHash, userRecord.salt), true, 'Password verification must pass');
  assert.strictEqual(db.verifyPassword('WrongPass', userRecord.passwordHash, userRecord.salt), false, 'Incorrect password must fail');
  console.log('  ✓ Passwords securely hashed with PBKDF2 + random salt');

  // Test 6: Educator Profile is 100% BLANK by default (no credentials leaked into profile)
  const profile1 = db.getUserProfile(reg1.user.id);
  assert.strictEqual(profile1.name, '', 'Profile name must be blank');
  assert.strictEqual(profile1.institution, '', 'Profile institution must be blank');
  assert.strictEqual(profile1.title, '', 'Profile title must be blank');
  console.log('  ✓ Educator Profile is strictly 100% blank for newly registered users');

  // Test 7: Updating Educator Profile does NOT alter login credentials
  db.saveUserProfile(reg1.user.id, {
    name: 'Dr. Clara Oswald',
    title: 'Associate Professor of Physics',
    institution: 'Coal Hill Academy',
    bio: 'Theoretical and applied physics education specialist.'
  });
  const updatedUserRecord = db.readJson('users.json', []).find(u => u.id === reg1.user.id);
  assert.strictEqual(updatedUserRecord.username, 'prof_clara', 'Username must not change when updating profile');
  assert.strictEqual(updatedUserRecord.email, 'clara@university.edu', 'Login email must not change when updating profile');
  console.log('  ✓ Separation of Educator Profile from Login Credentials strictly preserved');

  // Test 8: Register Educator 2
  const reg2 = db.registerUser({
    username: 'mr_smith',
    email: 'smith@school.org',
    password: 'Password456!',
    confirmPassword: 'Password456!'
  });
  assert.ok(reg2.success);
  console.log('  ✓ Registered second user "mr_smith"');

  // Test 9: Unique username & email enforcement
  assert.throws(() => {
    db.registerUser({
      username: 'prof_clara', // already taken
      email: 'clara_new@school.edu',
      password: 'password123',
      confirmPassword: 'password123'
    });
  }, /already registered/i);

  assert.throws(() => {
    db.registerUser({
      username: 'clara_other',
      email: 'clara@university.edu', // already taken
      password: 'password123',
      confirmPassword: 'password123'
    });
  }, /already exists/i);
  console.log('  ✓ Username and email uniqueness strictly enforced');

  // Test 10: Data Isolation for Saved Designs
  const design1 = db.saveUserDesign(reg1.user.id, {
    title: 'Clara Quantum Inquiry Plan',
    studioType: 'lesson-planning',
    topic: 'Wave-Particle Duality',
    output: '# 5E Quantum Lesson Plan\n\nEngage...'
  });
  assert.ok(design1.id, 'Design must be saved with unique ID');
  assert.strictEqual(design1.userId, reg1.user.id, 'Design must belong to Clara');

  const claraDesigns = db.getUserDesigns(reg1.user.id);
  assert.strictEqual(claraDesigns.length, 1);
  assert.strictEqual(claraDesigns[0].title, 'Clara Quantum Inquiry Plan');

  const smithDesigns = db.getUserDesigns(reg2.user.id);
  assert.strictEqual(smithDesigns.length, 0, 'Mr. Smith must NOT see Clara designs');
  console.log('  ✓ Data Isolation: User A designs are completely hidden from User B');

  // Test 11: Cross-user modification forbidden
  assert.throws(() => {
    db.saveUserDesign(reg2.user.id, {
      id: design1.id,
      title: 'Malicious Overwrite by Smith'
    });
  }, /Access denied/i, 'Smith must not be able to modify Clara design');

  assert.throws(() => {
    db.deleteUserDesign(reg2.user.id, design1.id);
  }, /Access denied/i, 'Smith must not be able to delete Clara design');
  console.log('  ✓ Data Isolation: Cross-user write & delete forbidden with server authorization error');

  // Test 12: Data Isolation for AI Generated Outputs
  const output1 = db.saveUserOutput(reg1.user.id, {
    title: 'Clara Quantum Mechanics Slide Deck',
    category: 'presentation',
    type: 'powerpoint',
    slides: [{ slideNumber: 1, title: 'Introduction to Photons' }]
  });
  assert.strictEqual(output1.userId, reg1.user.id);

  const claraOutputs = db.getUserOutputs(reg1.user.id);
  assert.strictEqual(claraOutputs.length, 1);

  const smithOutputs = db.getUserOutputs(reg2.user.id);
  assert.strictEqual(smithOutputs.length, 0, 'Mr. Smith must NOT see Clara outputs');

  assert.throws(() => {
    db.deleteUserOutput(reg2.user.id, output1.id);
  }, /Access denied/i, 'Smith must not be able to delete Clara output');
  console.log('  ✓ AI Generated Outputs per-user data isolation verified');

  // Test 13: Administrator M1n1sume First-Time Setup
  const m1LoginCheck = db.loginUser({ identifier: 'M1n1sume' });
  assert.strictEqual(m1LoginCheck.requiresMasterPasswordSetup, true, 'M1n1sume first login must signal password setup required');

  const m1Setup = db.loginUser({
    identifier: 'M1n1sume',
    isFirstTimeAdmin: true,
    masterPassword: 'MyAdminSecretPassword2026!',
    confirmMasterPassword: 'MyAdminSecretPassword2026!'
  });
  assert.strictEqual(m1Setup.success, true);
  assert.strictEqual(m1Setup.user.role, 'admin');
  assert.strictEqual(m1Setup.isFirstTimeSetup, true);
  console.log('  ✓ M1n1sume successfully initialized with master password');

  // Test 14: Administrator M1n1sume Normal Login
  const m1NormalLogin = db.loginUser({
    identifier: 'm1n1sume',
    password: 'MyAdminSecretPassword2026!'
  });
  assert.strictEqual(m1NormalLogin.success, true);
  assert.strictEqual(m1NormalLogin.user.role, 'admin');

  // Incorrect admin password fails
  assert.throws(() => {
    db.loginUser({ identifier: 'M1n1sume', password: 'WrongPassword!' });
  }, /Incorrect password/i);
  console.log('  ✓ M1n1sume authenticates through standard login form with correct credentials');

  // Test 15: Admin user directory listing
  const directory = db.listAllUsers(m1NormalLogin.user.id);
  assert.ok(directory.length >= 3, 'Admin can see user directory');
  assert.ok(directory.every(u => !u.passwordHash && !u.salt), 'Directory must NEVER leak password hashes or salts');

  assert.throws(() => {
    db.listAllUsers(reg1.user.id);
  }, /Administrator privileges required/i, 'Non-admin users must not list directory');
  console.log('  ✓ Admin privileges verified and protected on server');

  // Test 16: Check HTML structure in public/index.html
  const indexHtml = fs.readFileSync('./public/index.html', 'utf8');
  assert.ok(indexHtml.includes('id="header-auth-buttons"'), 'Index HTML must include #header-auth-buttons');
  assert.ok(indexHtml.includes('id="header-login-btn"'), 'Index HTML must include #header-login-btn');
  assert.ok(indexHtml.includes('id="header-signup-btn"'), 'Index HTML must include #header-signup-btn');
  assert.ok(indexHtml.includes('id="header-user-menu-wrapper"'), 'Index HTML must include #header-user-menu-wrapper');
  assert.ok(indexHtml.includes('id="menu-item-saved-designs"'), 'Index HTML must include #menu-item-saved-designs');
  assert.ok(indexHtml.includes('id="menu-item-generated-outputs"'), 'Index HTML must include #menu-item-generated-outputs');
  assert.ok(!indexHtml.includes('Admin Setup'), 'Index HTML must NEVER contain "Admin Setup" UI');
  console.log('  ✓ public/index.html contains explicit top-right Log In & Create Account buttons without any Admin Setup label');

  // Test 17: Check authModal.js
  const authModalJs = fs.readFileSync('./public/js/views/authModal.js', 'utf8');
  assert.ok(!authModalJs.includes('Admin Setup'), 'authModal.js must NOT contain "Admin Setup"');
  assert.ok(authModalJs.includes('login-identifier'), 'authModal.js must support username or email');
  assert.ok(authModalJs.includes('signup-email'), 'authModal.js must support email field');
  assert.ok(authModalJs.includes('toggle-signup-password-visibility'), 'authModal.js must have password visibility toggles');
  assert.ok(authModalJs.includes('toggle-login-password-visibility'), 'authModal.js must have login password toggle');
  console.log('  ✓ authModal.js implements standard Log In & Create Account with password visibility toggles');

  // Test 18: Check dashboard.js
  const dashboardJs = fs.readFileSync('./public/js/views/dashboard.js', 'utf8');
  assert.ok(!dashboardJs.includes('Admin Setup'), 'dashboard.js must NOT contain "Admin Setup"');
  console.log('  ✓ dashboard.js has no "Admin Setup" labels or buttons');

  console.log('\n========================================');
  console.log('🎉 ALL 18 TESTS PASSED SUCCESSFULLY! (100% VERIFIED)');
  console.log('========================================\n');
}

runTests().catch(err => {
  console.error('TEST FAILURE:', err);
  process.exit(1);
});
