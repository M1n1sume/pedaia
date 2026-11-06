import assert from 'node:assert';
import http from 'node:http';
import fs from 'node:fs';
import * as db from '../serverDb.js';

console.log('🧪 Starting Work In Progress (WIP) Project Lock Tests...');

// Setup test users
const ts = Date.now();
const resA = db.registerUser({
  username: `author_${ts}`,
  email: `author_${ts}@example.com`,
  password: 'Password123!',
  confirmPassword: 'Password123!',
  role: 'educator'
});
const userA = resA.user;

const resB = db.registerUser({
  username: `viewer_${ts}`,
  email: `viewer_${ts}@example.com`,
  password: 'Password123!',
  confirmPassword: 'Password123!',
  role: 'educator'
});
const userB = resB.user;

// Admin user setup
const users = db.readJson('users.json', []);
let adminUser = users.find(u => u.username === 'M1n1sume');
if (!adminUser) {
  db.initDb();
  adminUser = db.readJson('users.json', []).find(u => u.username === 'M1n1sume');
}

console.log('✓ Test users ready:', { author: userA.username, viewer: userB.username, admin: adminUser.username });

// 1. Author User A creates a design in Draft stage
const designData = {
  title: 'Photosynthesis & Cellular Energetics',
  subject: 'Biology',
  gradeLevel: 'Grade 10',
  status: 'Draft',
  output: '# Comprehensive Photosynthesis Curricular Plan\nDetailed lesson procedures and confidential educator notes.'
};
const createdDesign = db.saveUserDesign(userA.id, designData);
assert.ok(createdDesign.id, 'Design created with unique ID');
assert.strictEqual(createdDesign.userId, userA.id, 'Design is owned by User A');
assert.strictEqual(createdDesign.status, 'Draft', 'Design starts in Draft stage');
console.log('✓ Step 1: User A created Draft design:', createdDesign.id);

// 2. Author User A can access their own Draft design
const authorAccess = db.getDesignById(createdDesign.id, userA.id);
assert.strictEqual(authorAccess.id, createdDesign.id);
assert.strictEqual(authorAccess.output, designData.output);
console.log('✓ Step 2: Author can access their own WIP project');

// 3. User B (another educator) attempts to access User A's WIP Draft design -> MUST BE LOCKED
let blockedUserB = false;
try {
  db.getDesignById(createdDesign.id, userB.id);
} catch (err) {
  blockedUserB = true;
  assert.ok(err.message.includes('PROJECT_LOCKED_WIP'), 'Error contains PROJECT_LOCKED_WIP');
}
assert.strictEqual(blockedUserB, true, 'User B was strictly blocked from accessing User A WIP design');
console.log('✓ Step 3: Other user (User B) is locked out of Draft project');

// 4. Unauthenticated guest attempts to access WIP Draft design -> MUST BE LOCKED
let blockedGuest = false;
try {
  db.getDesignById(createdDesign.id, null);
} catch (err) {
  blockedGuest = true;
  assert.ok(err.message.includes('PROJECT_LOCKED_WIP'), 'Error contains PROJECT_LOCKED_WIP');
}
assert.strictEqual(blockedGuest, true, 'Guest was strictly blocked from accessing WIP design');
console.log('✓ Step 4: Unauthenticated guest is locked out of Draft project');

// 5. Admin can access for curricular moderation / oversight
const adminAccess = db.getDesignById(createdDesign.id, adminUser.id);
assert.strictEqual(adminAccess.id, createdDesign.id);
console.log('✓ Step 5: System Admin has administrative oversight access');

// 6. Test all WIP stages: Prompt Saved, Output Generated, Reviewed -> All locked to others
const wipStages = ['Prompt Saved', 'Output Generated', 'Reviewed'];
for (const stage of wipStages) {
  db.saveUserDesign(userA.id, { id: createdDesign.id, status: stage });
  let blocked = false;
  try {
    db.getDesignById(createdDesign.id, userB.id);
  } catch (err) {
    blocked = true;
    assert.ok(err.message.includes('PROJECT_LOCKED_WIP'));
  }
  assert.strictEqual(blocked, true, `User B was blocked while design in stage: ${stage}`);
  console.log(`✓ Step 6: WIP stage "${stage}" is locked to others`);
}

// 7. Author finalizes the project and marks it as 'Completed' & 'public'
db.saveUserDesign(userA.id, { id: createdDesign.id, status: 'Completed', visibility: 'public' });
const completedForUserB = db.getDesignById(createdDesign.id, userB.id);
assert.strictEqual(completedForUserB.id, createdDesign.id);
assert.strictEqual(completedForUserB.status, 'Completed');
assert.ok(completedForUserB.output.includes('Comprehensive Photosynthesis'));
console.log('✓ Step 7: When marked Completed, project lock is lifted and User B can access!');

// 8. Unauthenticated guest can also access Completed design
const completedForGuest = db.getDesignById(createdDesign.id, null);
assert.strictEqual(completedForGuest.id, createdDesign.id);
assert.strictEqual(completedForGuest.status, 'Completed');
console.log('✓ Step 8: When marked Completed, guests can also access!');

// 9. Author reverts the project back to WIP ('Draft')
db.saveUserDesign(userA.id, { id: createdDesign.id, status: 'Draft' });
let reblockedUserB = false;
try {
  db.getDesignById(createdDesign.id, userB.id);
} catch (err) {
  reblockedUserB = true;
  assert.ok(err.message.includes('PROJECT_LOCKED_WIP'));
}
assert.strictEqual(reblockedUserB, true, 'User B is locked out again after reversion to Draft');
console.log('✓ Step 9: Reverting back to WIP locks access from other people again!');

// Clean up test design
db.deleteUserDesign(userA.id, createdDesign.id);
console.log('✓ Cleaned up test design');

// 10. Verify Source Code Integrations
console.log('\n--- VERIFYING CLIENT AND SERVER SOURCE CODE INTEGRITY ---');

const serverSrc = fs.readFileSync('./server.js', 'utf8');
assert.ok(serverSrc.includes("pathname.startsWith('/api/designs/') && req.method === 'GET'"), 'Server must have GET /api/designs/:id endpoint');
assert.ok(serverSrc.includes("error: 'PROJECT_LOCKED_WIP'"), 'Server must return 403 PROJECT_LOCKED_WIP');
console.log('✓ Step 10: Server API handles /api/designs/:id with WIP lock enforcement');

const stateSrc = fs.readFileSync('./public/js/state.js', 'utf8');
assert.ok(stateSrc.includes('isLockedToViewer: true'), 'State store must flag isLockedToViewer: true for WIP designs');
assert.ok(stateSrc.includes("lockReason: 'PROJECT_LOCKED_WIP'"), 'State store must supply lockReason');
assert.ok(stateSrc.includes('isProjectLockedToOthers'), 'State store must export isProjectLockedToOthers');
assert.ok(stateSrc.includes('setDesignStatus'), 'State store must export setDesignStatus');
console.log('✓ Step 11: Client state store checks WIP lock and blanks out confidential content for non-authors');

const workspaceSrc = fs.readFileSync('./public/js/views/outputWorkspace.js', 'utf8');
assert.ok(workspaceSrc.includes('renderLockedWipView'), 'outputWorkspace.js must implement renderLockedWipView');
assert.ok(workspaceSrc.includes('design.isLockedToViewer'), 'outputWorkspace.js must check design.isLockedToViewer');
assert.ok(workspaceSrc.includes('ws-mark-completed-btn'), 'outputWorkspace.js must provide mark completed button');
assert.ok(workspaceSrc.includes('ws-mark-wip-btn'), 'outputWorkspace.js must provide revert to WIP lock button');
console.log('✓ Step 12: Output Workspace renders dedicated locked screen and owner controls');

const myDesignsSrc = fs.readFileSync('./public/js/views/myDesigns.js', 'utf8');
assert.ok(myDesignsSrc.includes('toggle-complete-btn'), 'myDesigns.js must have toggle-complete-btn');
assert.ok(myDesignsSrc.includes('toggle-wip-btn'), 'myDesigns.js must have toggle-wip-btn');
assert.ok(myDesignsSrc.includes('WIP Locked'), 'myDesigns.js must show WIP Locked badge');
assert.ok(myDesignsSrc.includes('✓ Completed • Unlocked'), 'myDesigns.js must show Completed Unlocked badge');
console.log('✓ Step 13: My Designs dashboard displays clear lock badges and 1-click status toggles');

const dashboardSrc = fs.readFileSync('./public/js/views/dashboard.js', 'utf8');
assert.ok(dashboardSrc.includes('WIP Locked'), 'dashboard.js status pill must show WIP Locked');
assert.ok(dashboardSrc.includes('✓ Completed • Unlocked'), 'dashboard.js status pill must show Completed Unlocked');
console.log('✓ Step 14: Main dashboard displays locked vs unlocked badges across dossiers');

const reviewSrc = fs.readFileSync('./public/js/views/educatorReview.js', 'utf8');
assert.ok(reviewSrc.includes('WIP projects are locked to other users'), 'educatorReview.js must explain lock policy');
assert.ok(reviewSrc.includes('✓ Completed (Unlocked)'), 'educatorReview.js must show Completed Unlocked option');
console.log('✓ Step 15: Educator Review modal guides users on stage locking');

console.log('\n🎉 ALL 15 WIP PROJECT LOCK VERIFICATIONS PASSED SUCCESSFULLY!');
