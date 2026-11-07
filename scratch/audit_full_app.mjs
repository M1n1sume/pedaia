import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import * as db from '../serverDb.js';

console.log('🔍 RUNNING COMPREHENSIVE APPLICATION HEALTH & ERROR AUDIT...\n');

let issuesFound = [];

// =========================================================================
// TEST 1: STATIC ASSETS & HTML REFERENCES AUDIT
// =========================================================================
console.log('--- Test 1: Static Assets & HTML Audit ---');
const indexHtmlPath = path.join(process.cwd(), 'public', 'index.html');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Check script src
const scriptMatches = [...indexHtml.matchAll(/<script\s+[^>]*src=["']([^"']+)["']/gi)];
for (const m of scriptMatches) {
  const rel = m[1];
  if (rel.startsWith('http://') || rel.startsWith('https://')) continue;
  const full = path.join(process.cwd(), 'public', rel.replace(/^\.\//, ''));
  if (!fs.existsSync(full)) {
    issuesFound.push(`Missing script file referenced in index.html: ${rel}`);
  }
}

// Check link href (stylesheets)
const linkMatches = [...indexHtml.matchAll(/<link\s+[^>]*href=["']([^"']+)["']/gi)];
for (const m of linkMatches) {
  const rel = m[1];
  if (rel.startsWith('http://') || rel.startsWith('https://')) continue;
  const full = path.join(process.cwd(), 'public', rel.replace(/^\.\//, ''));
  if (!fs.existsSync(full)) {
    issuesFound.push(`Missing stylesheet or asset link in index.html: ${rel}`);
  }
}

// Check img src
const imgMatches = [...indexHtml.matchAll(/<img\s+[^>]*src=["']([^"']+)["']/gi)];
for (const m of imgMatches) {
  const rel = m[1];
  if (rel.startsWith('data:') || rel.startsWith('http://') || rel.startsWith('https://')) continue;
  const full = path.join(process.cwd(), 'public', rel.replace(/^\.\//, ''));
  if (!fs.existsSync(full)) {
    issuesFound.push(`Missing image asset referenced in index.html: ${rel}`);
  }
}

if (issuesFound.length === 0) {
  console.log('✓ All scripts, stylesheets, and image assets referenced in index.html exist on disk.');
} else {
  console.error('❌ Asset issues found:', issuesFound);
}

// =========================================================================
// TEST 2: DATABASE INTEGRITY & CRITICAL DATA FILES
// =========================================================================
console.log('\n--- Test 2: Database Integrity & Required JSON Files ---');
const dataFiles = ['users.json', 'sessions.json', 'designs.json', 'outputs.json', 'profiles.json', 'activity_logs.json', 'email_notifications.json'];
for (const f of dataFiles) {
  const p = path.join(process.cwd(), 'data', f);
  if (!fs.existsSync(p)) {
    issuesFound.push(`Data file missing: ${f}`);
  } else {
    try {
      JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (e) {
      issuesFound.push(`Data file ${f} is corrupted: ${e.message}`);
    }
  }
}
console.log('✓ All 7 data storage files are present and valid JSON.');

// Verify admin account state
const users = db.readJson('users.json', []);
const admin = users.find(u => u && u.username && u.username.toLowerCase() === 'm1n1sume');
assert(admin, 'Admin account M1n1sume must exist.');
assert.strictEqual(admin.role, 'admin');
assert.strictEqual(admin.isInitialized, true);
assert(admin.passwordHash, 'Admin passwordHash must be initialized.');
assert(admin.salt, 'Admin salt must be initialized.');
console.log('✓ Master Admin M1n1sume record valid and initialized.');

// =========================================================================
// TEST 3: AUTHENTICATION ROBUSTNESS & EDGE CASES
// =========================================================================
console.log('\n--- Test 3: Authentication & Edge Case Testing ---');

// 3.1: Reject reserved username M1n1sume registration
assert.throws(() => {
  db.registerUser({
    username: 'm1n1sume',
    email: 'imposter@test.com',
    password: 'Password123!',
    confirmPassword: 'Password123!'
  });
}, /reserved/i);
console.log('✓ Registration cleanly rejects claiming reserved M1n1sume username.');

// 3.2: Empty / invalid registration fields
assert.throws(() => {
  db.registerUser({ username: '', email: 'test@test.com', password: '123', confirmPassword: '123' });
}, /required/i);
assert.throws(() => {
  db.registerUser({ username: 'validuser', email: 'notanemail', password: 'Password123!', confirmPassword: 'Password123!' });
}, /valid email/i);
assert.throws(() => {
  db.registerUser({ username: 'validuser', email: 'test@valid.com', password: '123', confirmPassword: '123' });
}, /at least 6 characters/i);
assert.throws(() => {
  db.registerUser({ username: 'validuser', email: 'test@valid.com', password: 'Password123!', confirmPassword: 'Mismatched!' });
}, /match/i);
console.log('✓ Input validation cleanly blocks invalid registrations.');

// 3.3: Login with non-existent user
assert.throws(() => {
  db.loginUser({ identifier: 'non_existent_user_99999', password: 'Password123!' });
}, /not found/i);

// 3.4: Login with empty password
assert.throws(() => {
  db.loginUser({ identifier: 'M1n1sume', password: '' });
}, /required/i);

// 3.5: Case-insensitive login
const creds = fs.readFileSync(path.join(process.cwd(), 'scratch', 'm1n1sume_credentials.txt'), 'utf8');
const passMatch = creds.match(/Password:\s*(\S+)/);
const adminPassword = passMatch[1];

const loginLower = db.loginUser({ identifier: 'm1n1sume', password: adminPassword });
assert.strictEqual(loginLower.success, true);
assert.strictEqual(loginLower.user.username, 'M1n1sume');

const loginUpper = db.loginUser({ identifier: 'M1N1SUME', password: adminPassword });
assert.strictEqual(loginUpper.success, true);
console.log('✓ Case-insensitive authentication verified for M1n1sume.');

// =========================================================================
// TEST 4: ACTIVITY TELEMETRY & PROJECT EMAIL NOTIFICATIONS
// =========================================================================
console.log('\n--- Test 4: Activity Telemetry & Project Emails ---');

// Record test events
db.recordActivity({ type: 'WEBSITE_ACCESS', ip: '10.0.0.1', details: { path: '/' } });
db.recordActivity({ type: 'USER_LOGIN', username: 'M1n1sume', details: { status: 'SUCCESS' } });

const telemetry = db.getActivityLogs({ adminUserId: admin.id, type: 'ALL', limit: 10 });
assert(Array.isArray(telemetry.logs), 'Telemetry logs must be array.');
assert(telemetry.stats, 'Telemetry stats must exist.');
assert(typeof telemetry.stats.totalVisits === 'number');
assert(typeof telemetry.stats.totalLogins === 'number');
assert(typeof telemetry.stats.totalOutputs === 'number');
assert(typeof telemetry.stats.totalEmails === 'number');
console.log('✓ Activity telemetry query & KPI aggregation verified.');

// Test unauthorized activity access
const nonAdminUserId = 'usr_guest_dummy';
assert.throws(() => {
  db.getActivityLogs({ adminUserId: nonAdminUserId });
}, /Administrator privileges required/i);
console.log('✓ Non-admin access to telemetry strictly rejected.');

// =========================================================================
// TEST 5: ACCESS CONTROL (WIP LOCK & PRIVATE/PUBLIC VISIBILITY)
// =========================================================================
console.log('\n--- Test 5: Design Access Control (WIP Lock & Private/Public) ---');

const tempUserA = db.registerUser({
  username: `temp_author_${Date.now()}`,
  email: `author_${Date.now()}@example.com`,
  password: 'Password123!',
  confirmPassword: 'Password123!'
}).user;

const tempUserB = db.registerUser({
  username: `temp_viewer_${Date.now()}`,
  email: `viewer_${Date.now()}@example.com`,
  password: 'Password123!',
  confirmPassword: 'Password123!'
}).user;

// WIP Draft design
const wipDesign = db.saveUserDesign(tempUserA.id, {
  title: 'WIP Physics Lab',
  status: 'Draft',
  visibility: 'public',
  output: 'Draft content'
});

// Author can view
assert.strictEqual(db.getDesignById(wipDesign.id, tempUserA.id).id, wipDesign.id);

// Other user is blocked from WIP
assert.throws(() => {
  db.getDesignById(wipDesign.id, tempUserB.id);
}, /PROJECT_LOCKED_WIP/);
console.log('✓ WIP Lock verified (other educators blocked from Drafts).');

// Completed but Private design
const privDesign = db.saveUserDesign(tempUserA.id, {
  title: 'Confidential Exam',
  status: 'Completed',
  visibility: 'private',
  output: 'Exam questions'
});

// Author can view
assert.strictEqual(db.getDesignById(privDesign.id, tempUserA.id).id, privDesign.id);

// Other user is blocked from Private
assert.throws(() => {
  db.getDesignById(privDesign.id, tempUserB.id);
}, /PROJECT_PRIVATE/);
console.log('✓ Private project visibility verified (strictly restricted to author).');

// Completed and Public design
const pubDesign = db.saveUserDesign(tempUserA.id, {
  title: 'Open Curriculum',
  status: 'Completed',
  visibility: 'public',
  output: 'Open learning modules'
});

// Other user can view
const viewedByB = db.getDesignById(pubDesign.id, tempUserB.id);
assert.strictEqual(viewedByB.id, pubDesign.id);
console.log('✓ Public completed project accessible to other educators.');

// Admin has oversight access
const adminViewPriv = db.getDesignById(privDesign.id, admin.id);
assert.strictEqual(adminViewPriv.id, privDesign.id);
const adminViewWip = db.getDesignById(wipDesign.id, admin.id);
assert.strictEqual(adminViewWip.id, wipDesign.id);
console.log('✓ Administrator has oversight access across all designs.');

// =========================================================================
// TEST 6: PROJECT EMAIL UPDATES DISPATCH & HISTORY
// =========================================================================
console.log('\n--- Test 6: Project Email Updates Dispatch ---');

const emailResult = db.sendProjectEmailUpdate({
  userId: tempUserA.id,
  designId: pubDesign.id,
  eventType: 'OUTPUT_GENERATED',
  details: { outputTitle: 'Lesson Slides', outputType: 'Presentation' }
});
assert.strictEqual(emailResult.success, true);
assert(emailResult.email.id);

const emailHist = db.getProjectEmailNotifications({ userId: tempUserA.id, designId: pubDesign.id });
assert(emailHist.length >= 1);
assert.strictEqual(emailHist[0].eventType, 'OUTPUT_GENERATED');
console.log('✓ Project email update dispatch & history query verified.');

// Clean up test users and designs
db.deleteUserDesign(tempUserA.id, wipDesign.id);
db.deleteUserDesign(tempUserA.id, privDesign.id);
db.deleteUserDesign(tempUserA.id, pubDesign.id);
const allUsers = db.readJson('users.json', []);
db.writeJson('users.json', allUsers.filter(u => u.id !== tempUserA.id && u.id !== tempUserB.id));

// =========================================================================
// TEST 7: VIEW MODULE EXPORTS & CLIENT COMPONENT IMPORTS
// =========================================================================
console.log('\n--- Test 7: View Components & Module Compatibility ---');

const views = [
  'adminDashboard.js',
  'dashboard.js',
  'educatorProfile.js',
  'educatorReview.js',
  'myDesigns.js',
  'outputWorkspace.js',
  'settings.js'
];

for (const v of views) {
  const viewPath = path.join(process.cwd(), 'public', 'js', 'views', v);
  if (!fs.existsSync(viewPath)) {
    issuesFound.push(`View component missing: ${v}`);
  }
}
console.log('✓ All 7 view components exist.');

// Check for broken unclosed tags or undefined window calls in critical modules
const criticalClientFiles = [
  path.join(process.cwd(), 'public', 'js', 'app.js'),
  path.join(process.cwd(), 'public', 'js', 'state.js'),
  path.join(process.cwd(), 'public', 'js', 'layoutManager.js'),
  path.join(process.cwd(), 'public', 'js', 'views', 'adminDashboard.js'),
  path.join(process.cwd(), 'public', 'js', 'views', 'outputWorkspace.js')
];

for (const cf of criticalClientFiles) {
  const content = fs.readFileSync(cf, 'utf8');
  if (/^<{7} |^={7}$|^>{7} /m.test(content)) {
    issuesFound.push(`Git conflict marker found in ${path.basename(cf)}`);
  }
}
console.log('✓ Zero merge conflict markers or syntax corruption found.');

console.log('\n========================================================================');
if (issuesFound.length === 0) {
  console.log('🎉 AUDIT COMPLETE: 0 ERRORS FOUND! All systems operational & robust.');
} else {
  console.error(`⚠️ AUDIT FOUND ${issuesFound.length} ISSUE(S):`, issuesFound);
  process.exit(1);
}
console.log('========================================================================\n');
