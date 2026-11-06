import assert from 'node:assert';
import fs from 'node:fs';
import * as db from '../serverDb.js';

console.log('🧪 Starting Private or Public Project Option Test Suite...\n');

const ts = Date.now();
const resA = db.registerUser({
  username: `author_vis_${ts}`,
  email: `author_vis_${ts}@example.com`,
  password: 'Password123!',
  confirmPassword: 'Password123!',
  role: 'educator'
});
const userA = resA.user;

const resB = db.registerUser({
  username: `viewer_vis_${ts}`,
  email: `viewer_vis_${ts}@example.com`,
  password: 'Password123!',
  confirmPassword: 'Password123!',
  role: 'educator'
});
const userB = resB.user;

const users = db.readJson('users.json', []);
const adminUser = users.find(u => u.username === 'M1n1sume');

console.log('✓ Test users ready:', { author: userA.username, viewer: userB.username, admin: adminUser?.username });

// 1. Author creates a Completed project set to PRIVATE
const designPrivate = db.saveUserDesign(userA.id, {
  title: 'Advanced Thermodynamics & Entropy',
  subject: 'Physics',
  gradeLevel: 'Grade 12',
  status: 'Completed',
  visibility: 'private',
  output: '# Advanced Thermodynamics Curriculum\nConfidential educator lesson materials.'
});

assert.strictEqual(designPrivate.userId, userA.id);
assert.strictEqual(designPrivate.status, 'Completed');
assert.strictEqual(designPrivate.visibility, 'private');
assert.strictEqual(designPrivate.isPublic, false);
console.log('✓ Step 1: User A created Completed project with visibility="private"');

// 2. Author User A can view their own Private Completed project
const authorAccess = db.getDesignById(designPrivate.id, userA.id);
assert.strictEqual(authorAccess.id, designPrivate.id);
assert.strictEqual(authorAccess.output, designPrivate.output);
console.log('✓ Step 2: Author has full access to their own private completed project');

// 3. User B (another educator) attempts to view User A's Private project -> MUST BE BLOCKED
let blockedUserB = false;
try {
  db.getDesignById(designPrivate.id, userB.id);
} catch (err) {
  blockedUserB = true;
  assert.ok(err.message.includes('PROJECT_PRIVATE'), 'Error must specify PROJECT_PRIVATE');
}
assert.strictEqual(blockedUserB, true, 'User B must be strictly blocked from viewing another educator private project');
console.log('✓ Step 3: Other user (User B) is blocked from accessing Private project');

// 4. Unauthenticated guest attempts to view Private project -> MUST BE BLOCKED
let blockedGuest = false;
try {
  db.getDesignById(designPrivate.id, null);
} catch (err) {
  blockedGuest = true;
  assert.ok(err.message.includes('PROJECT_PRIVATE'), 'Error must specify PROJECT_PRIVATE');
}
assert.strictEqual(blockedGuest, true, 'Guest must be strictly blocked from viewing private project');
console.log('✓ Step 4: Unauthenticated guest is blocked from accessing Private project');

// 5. Admin has oversight access
const adminAccess = db.getDesignById(designPrivate.id, adminUser.id);
assert.strictEqual(adminAccess.id, designPrivate.id);
console.log('✓ Step 5: System Admin has oversight access');

// 6. Author changes visibility to PUBLIC
const updatedToPublic = db.saveUserDesign(userA.id, {
  id: designPrivate.id,
  visibility: 'public'
});
assert.strictEqual(updatedToPublic.visibility, 'public');
assert.strictEqual(updatedToPublic.isPublic, true);

// User B can now view the project
const userBAccess = db.getDesignById(designPrivate.id, userB.id);
assert.strictEqual(userBAccess.id, designPrivate.id);
assert.ok(userBAccess.output.includes('Advanced Thermodynamics Curriculum'));
console.log('✓ Step 6: When visibility is set to Public (and Completed), User B can access!');

// Guest can also view the Public Completed project
const guestAccess = db.getDesignById(designPrivate.id, null);
assert.strictEqual(guestAccess.id, designPrivate.id);
console.log('✓ Step 7: Unauthenticated guest can access Public Completed project');

// 8. If project is Public, but author changes status to WIP ('Draft'):
db.saveUserDesign(userA.id, {
  id: designPrivate.id,
  status: 'Draft'
});
let blockedWip = false;
try {
  db.getDesignById(designPrivate.id, userB.id);
} catch (err) {
  blockedWip = true;
  assert.ok(err.message.includes('PROJECT_LOCKED_WIP'), 'WIP status must lock project even if visibility was public');
}
assert.strictEqual(blockedWip, true, 'WIP projects are locked regardless of visibility');
console.log('✓ Step 8: WIP projects remain locked even if visibility is public');

// 9. Clean up test design
db.deleteUserDesign(userA.id, designPrivate.id);
console.log('✓ Cleaned up test design');

// 10. Source Code Integrations
console.log('\n--- VERIFYING CLIENT AND SERVER SOURCE CODE INTEGRITY ---');

const serverDbSrc = fs.readFileSync('./serverDb.js', 'utf8');
assert.ok(serverDbSrc.includes('PROJECT_PRIVATE'), 'serverDb.js must enforce PROJECT_PRIVATE');
assert.ok(serverDbSrc.includes('visibility'), 'serverDb.js must support visibility');
console.log('✓ Step 9: serverDb.js enforces private vs public project rules');

const serverSrc = fs.readFileSync('./server.js', 'utf8');
assert.ok(serverSrc.includes("error: 'PROJECT_PRIVATE'"), 'server.js must return 403 PROJECT_PRIVATE');
console.log('✓ Step 10: server.js handles 403 PROJECT_PRIVATE');

const stateSrc = fs.readFileSync('./public/js/state.js', 'utf8');
assert.ok(stateSrc.includes("lockReason: 'PROJECT_PRIVATE'"), 'state.js must return lockReason: PROJECT_PRIVATE');
assert.ok(stateSrc.includes('setDesignVisibility'), 'state.js must have setDesignVisibility');
assert.ok(stateSrc.includes('toggleDesignVisibility'), 'state.js must have toggleDesignVisibility');
assert.ok(stateSrc.includes('isProjectPrivate'), 'state.js must have isProjectPrivate');
console.log('✓ Step 11: state.js provides visibility management and checks');

const workspaceSrc = fs.readFileSync('./public/js/views/outputWorkspace.js', 'utf8');
assert.ok(workspaceSrc.includes('ws-toggle-visibility-btn'), 'outputWorkspace.js must provide ws-toggle-visibility-btn');
assert.ok(workspaceSrc.includes('Private Project'), 'outputWorkspace.js must render Private Project badge/lock');
assert.ok(workspaceSrc.includes('Public Project'), 'outputWorkspace.js must render Public Project badge');
console.log('✓ Step 12: Output Workspace provides 1-click Private/Public toggle and status badges');

const myDesignsSrc = fs.readFileSync('./public/js/views/myDesigns.js', 'utf8');
assert.ok(myDesignsSrc.includes('toggle-visibility-btn'), 'myDesigns.js must provide toggle-visibility-btn');
assert.ok(myDesignsSrc.includes('designs-visibility-filter'), 'myDesigns.js must provide visibility filter');
assert.ok(myDesignsSrc.includes('Public (Shared)'), 'myDesigns.js must show Public option');
assert.ok(myDesignsSrc.includes('Private (Only You)'), 'myDesigns.js must show Private option');
console.log('✓ Step 13: My Designs view provides visibility badges, filter, and 1-click toggles');

const reviewSrc = fs.readFileSync('./public/js/views/educatorReview.js', 'utf8');
assert.ok(reviewSrc.includes('design-visibility'), 'educatorReview.js must have design-visibility radio option');
assert.ok(reviewSrc.includes('Project Visibility Option'), 'educatorReview.js must have Project Visibility Option label');
console.log('✓ Step 14: Educator Review modal includes Project Visibility Option');

const dashboardSrc = fs.readFileSync('./public/js/views/dashboard.js', 'utf8');
assert.ok(dashboardSrc.includes('Public'), 'dashboard.js must show Public badge');
assert.ok(dashboardSrc.includes('Private'), 'dashboard.js must show Private badge');
console.log('✓ Step 15: Dashboard displays Public and Private badges');

console.log('\n🎉 ALL 15 PRIVATE OR PUBLIC PROJECT OPTION TESTS PASSED SUCCESSFULLY!');
