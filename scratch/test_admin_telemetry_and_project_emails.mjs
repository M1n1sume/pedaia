import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import * as db from '../serverDb.js';

console.log('🧪 Starting Admin-Only Activity Telemetry & Project Email Updates Test Suite...\n');

// 1. Verify Admin M1n1sume exists
const users = db.readJson('users.json', []);
const admin = users.find(u => u.username === 'M1n1sume' && u.role === 'admin');
assert(admin, 'Admin account M1n1sume must exist.');
console.log('✓ Step 1: Admin M1n1sume verified:', admin.username);

// 2. Register test educator
const ts = Date.now();
const regResult = db.registerUser({
  username: `educator_notif_${ts}`,
  email: `educator_${ts}@school.edu`,
  password: 'Password123!',
  confirmPassword: 'Password123!',
  role: 'educator'
});
const educatorUser = regResult.user;
assert(educatorUser, 'Educator account created.');
console.log('✓ Step 2: Test educator created:', educatorUser.username);

// 3. Test Activity: Website Access
const accessEntry = db.recordActivity({
  type: 'WEBSITE_ACCESS',
  userId: educatorUser.id,
  username: educatorUser.username,
  details: { path: '/dashboard', device: 'Desktop Browser' },
  ip: '192.168.1.42',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
});
assert(accessEntry && accessEntry.id, 'Website access must be recorded.');
assert.strictEqual(accessEntry.type, 'WEBSITE_ACCESS');
console.log('✓ Step 3: Website access recorded for', educatorUser.username);

// 4. Test Activity: User Logins
const loginEntry = db.recordActivity({
  type: 'USER_LOGIN',
  userId: educatorUser.id,
  username: educatorUser.username,
  details: { status: 'SUCCESS', role: 'educator' },
  ip: '192.168.1.42'
});
assert(loginEntry && loginEntry.type === 'USER_LOGIN');
console.log('✓ Step 4: User login event recorded.');

// 5. Test Activity: Output Made
const design = db.saveUserDesign(educatorUser.id, {
  title: 'Quantum Computing Fundamentals for High School',
  subject: 'Physics & Computer Science',
  gradeLevel: 'Grade 12',
  status: 'Draft',
  visibility: 'private',
  notificationEmail: `educator_${ts}@school.edu`,
  emailNotifications: {
    enabled: true,
    onOutputGenerated: true,
    onStageChange: true
  },
  output: '# Quantum Computing Lesson Plan\nPedagogical introduction to qubits and superposition.'
});
assert(design && design.id, 'Design project created.');

const output = db.saveUserOutput(educatorUser.id, {
  designId: design.id,
  title: 'Interactive Qubit Simulation Worksheet',
  type: 'AI Worksheet & Activity',
  format: 'interactive-markdown',
  content: 'Exercise 1: Superposition state representation.'
});
assert(output && output.id, 'Output artifact created.');
console.log('✓ Step 5: Educational output made and recorded.');

// 6. Test Non-Admin cannot access activity logs
assert.throws(() => {
  db.getActivityLogs({ adminUserId: educatorUser.id });
}, /Administrator privileges required/);
console.log('✓ Step 6: Non-admin educator blocked from accessing activity logs.');

// 7. Test Admin can access activity logs and stats
const adminTelemetry = db.getActivityLogs({ adminUserId: admin.id, type: 'ALL', limit: 50 });
assert(adminTelemetry.logs.length > 0, 'Admin telemetry must return activity logs.');
assert(adminTelemetry.stats.totalVisits >= 1, 'Stats must track website visits.');
assert(adminTelemetry.stats.totalLogins >= 1, 'Stats must track user logins.');
assert(adminTelemetry.stats.totalOutputs >= 1, 'Stats must track educational outputs.');
console.log('✓ Step 7: Admin retrieved live telemetry and KPI metrics:', adminTelemetry.stats);

// 8. Test Filtering by category
const visitLogs = db.getActivityLogs({ adminUserId: admin.id, type: 'WEBSITE_ACCESS' });
assert(visitLogs.logs.every(l => l.type === 'WEBSITE_ACCESS'), 'All filtered logs must be WEBSITE_ACCESS');

const loginLogs = db.getActivityLogs({ adminUserId: admin.id, type: 'USER_LOGIN' });
assert(loginLogs.logs.every(l => l.type === 'USER_LOGIN' || l.type === 'USER_LOGOUT'), 'All filtered logs must be logins');

const outputLogs = db.getActivityLogs({ adminUserId: admin.id, type: 'OUTPUT_CREATED' });
assert(outputLogs.logs.every(l => l.type === 'OUTPUT_CREATED' || l.type === 'OUTPUT_MODIFIED' || l.type === 'PROJECT_SAVED'), 'All filtered logs must be outputs');
console.log('✓ Step 8: Telemetry filters (Website Access, Logins, Outputs) verified.');

// 9. Test Project Email Updates Feature
console.log('\nTesting Project Email Updates Feature...');

// A. Educator sends on-demand project email update
const emailResult = db.sendProjectEmailUpdate({
  userId: educatorUser.id,
  designId: design.id,
  eventType: 'PROJECT_UPDATE',
  details: { message: 'Here is your curriculum dossier update.' }
});
assert.strictEqual(emailResult.success, true);
assert.strictEqual(emailResult.email.recipientEmail, `educator_${ts}@school.edu`);
assert(emailResult.email.subject.includes(design.title));
console.log('✓ Step 9A: Educator successfully dispatched project update email to:', emailResult.email.recipientEmail);

// B. Check email is logged in user history
const userEmails = db.getProjectEmailNotifications({ userId: educatorUser.id, designId: design.id });
assert(userEmails.length >= 1, 'User project email history must contain the sent email.');
assert.strictEqual(userEmails[0].recipientEmail, `educator_${ts}@school.edu`);
console.log('✓ Step 9B: Email update retrieved in user project email history.');

// C. Verify email dispatch appears in Admin telemetry
const emailTelemetry = db.getActivityLogs({ adminUserId: admin.id, type: 'EMAIL_SENT' });
const foundEmailEvent = emailTelemetry.logs.find(l => l.details?.designId === design.id);
assert(foundEmailEvent, 'Dispatched email must appear in Admin telemetry.');
console.log('✓ Step 9C: Email update verified in Admin Telemetry Stream.');

// D. Milestone auto-email when project marked Completed
const completedDesign = db.saveUserDesign(educatorUser.id, {
  id: design.id,
  status: 'Completed',
  title: design.title,
  output: design.output,
  notificationEmail: `educator_${ts}@school.edu`,
  emailNotifications: {
    enabled: true,
    onStageChange: true
  }
});
assert.strictEqual(completedDesign.status, 'Completed');

const updatedEmails = db.getProjectEmailNotifications({ userId: educatorUser.id, designId: design.id });
const milestoneEmail = updatedEmails.find(e => e.eventType === 'STAGE_COMPLETED');
assert(milestoneEmail, 'Milestone email must be auto-dispatched upon project completion.');
assert(milestoneEmail.subject.includes('Completed'));
console.log('✓ Step 9D: Automatic milestone email dispatched upon project completion.');

// E. Verify Source Code Integrations
console.log('\n--- VERIFYING CLIENT AND SERVER SOURCE CODE INTEGRITY ---');

const indexHtml = fs.readFileSync(path.join(process.cwd(), 'public', 'index.html'), 'utf8');
assert(indexHtml.includes('id="nav-admin-tab"'), 'index.html must have #nav-admin-tab');
assert(indexHtml.includes('id="drawer-admin-section"'), 'index.html must have #drawer-admin-section');
console.log('✓ Step 10: Navigation contains Admin-only tab and drawer section.');

const appJs = fs.readFileSync(path.join(process.cwd(), 'public', 'js', 'app.js'), 'utf8');
assert(appJs.includes('navAdminTab.classList.remove(\'hidden\')'), 'app.js must reveal admin tab when isAdmin');
assert(appJs.includes('navAdminTab.classList.add(\'hidden\')'), 'app.js must hide admin tab when not admin');
console.log('✓ Step 11: app.js updates navigation visibility based on admin role.');

const adminViewJs = fs.readFileSync(path.join(process.cwd(), 'public', 'js', 'views', 'adminDashboard.js'), 'utf8');
assert(adminViewJs.includes('Website Access'), 'adminDashboard.js must track Website Access');
assert(adminViewJs.includes('User Logins'), 'adminDashboard.js must track User Logins');
assert(adminViewJs.includes('Outputs Made'), 'adminDashboard.js must track Outputs Made');
assert(adminViewJs.includes('Project Emails'), 'adminDashboard.js must track Project Emails');
console.log('✓ Step 12: Admin view tracks website access, logins, outputs, and project emails.');

const workspaceJs = fs.readFileSync(path.join(process.cwd(), 'public', 'js', 'views', 'outputWorkspace.js'), 'utf8');
assert(workspaceJs.includes('ws-email-updates-btn'), 'outputWorkspace.js must have Email Updates button');
assert(workspaceJs.includes('openProjectEmailModal'), 'outputWorkspace.js must provide email updates modal');
console.log('✓ Step 13: Output Workspace features Email Updates button and modal.');

const myDesignsJs = fs.readFileSync(path.join(process.cwd(), 'public', 'js', 'views', 'myDesigns.js'), 'utf8');
assert(myDesignsJs.includes('data-email-id'), 'myDesigns.js cards must feature email action button');
console.log('✓ Step 14: My Designs cards feature email update action button.');

// Clean up test educator and test design
db.deleteUserDesign(educatorUser.id, design.id);
const allUsers = db.readJson('users.json', []);
db.writeJson('users.json', allUsers.filter(u => u.id !== educatorUser.id));

console.log('\n========================================================================');
console.log('🎉 ALL 14 ADMIN TELEMETRY & PROJECT EMAIL UPDATES TESTS PASSED (100%)!');
console.log('========================================================================\n');
