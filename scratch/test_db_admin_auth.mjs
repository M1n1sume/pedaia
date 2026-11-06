import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import * as db from '../serverDb.js';

console.log('🧪 Starting Admin M1n1sume Auth & Password Management Test...\n');

const creds = fs.readFileSync(path.join(process.cwd(), 'scratch', 'm1n1sume_credentials.txt'), 'utf8');
const passMatch = creds.match(/Password:\s*(\S+)/);
const randomPassword = passMatch ? passMatch[1] : null;

assert(randomPassword, 'Password must be present in credentials file.');
console.log('✓ Found generated random password:', randomPassword);

// 1. Verify M1n1sume login with random password
const loginRes = db.loginUser({
  identifier: 'M1n1sume',
  password: randomPassword
});
assert.strictEqual(loginRes.success, true);
assert.strictEqual(loginRes.user.username, 'M1n1sume');
assert.strictEqual(loginRes.user.role, 'admin');
assert(loginRes.token, 'Token must be issued upon successful login.');
console.log('✓ Step 1: M1n1sume logged in successfully with the random password.');

// 2. Verify session retrieval by token
const authUser = db.getUserByToken(loginRes.token);
assert.strictEqual(authUser.username, 'M1n1sume');
assert.strictEqual(authUser.role, 'admin');
console.log('✓ Step 2: Session verified via token.');

// 3. Verify incorrect password fails
assert.throws(() => {
  db.loginUser({
    identifier: 'M1n1sume',
    password: 'IncorrectPassword999!'
  });
}, /Incorrect password/);
console.log('✓ Step 3: Login rejected when wrong password is used.');

// 4. Test change password with incorrect old password fails
assert.throws(() => {
  db.changeUserPassword({
    userId: authUser.id,
    oldPassword: 'WrongOldPassword!',
    newPassword: 'MyNewSecretPassword2026!'
  });
}, /Current password does not match/);
console.log('✓ Step 4: Password change rejected when old password does not match.');

// 5. Test change password with too short new password fails
assert.throws(() => {
  db.changeUserPassword({
    userId: authUser.id,
    oldPassword: randomPassword,
    newPassword: '123'
  });
}, /at least 6 characters/);
console.log('✓ Step 5: Short password rejected (< 6 chars).');

// 6. Test change password with valid credentials
const changeRes = db.changeUserPassword({
  userId: authUser.id,
  oldPassword: randomPassword,
  newPassword: 'SuperNewSecureAdminPass#2026'
});
assert.strictEqual(changeRes.success, true);
console.log('✓ Step 6: Password successfully changed to new password.');

// 7. Verify old password no longer works
assert.throws(() => {
  db.loginUser({
    identifier: 'M1n1sume',
    password: randomPassword
  });
}, /Incorrect password/);
console.log('✓ Step 7: Old password is properly invalidated.');

// 8. Verify login with new password works
const newLogin = db.loginUser({
  identifier: 'M1n1sume',
  password: 'SuperNewSecureAdminPass#2026'
});
assert.strictEqual(newLogin.success, true);
assert.strictEqual(newLogin.user.username, 'M1n1sume');
console.log('✓ Step 8: Logged in successfully with new password.');

// 9. Revert back to the generated random password so the credentials provided to the user remain active!
db.changeUserPassword({
  userId: authUser.id,
  oldPassword: 'SuperNewSecureAdminPass#2026',
  newPassword: randomPassword
});
console.log('✓ Step 9: Reverted back to the original generated random password.');

// 10. Final login verification with the generated password
const finalLogin = db.loginUser({
  identifier: 'M1n1sume',
  password: randomPassword
});
assert.strictEqual(finalLogin.success, true);
assert.strictEqual(finalLogin.user.username, 'M1n1sume');
assert.strictEqual(finalLogin.user.role, 'admin');
console.log('✓ Step 10: Final login test succeeded. Generated password is active and functional!');

console.log('\n=========================================');
console.log('🎉 ALL 10 TESTS PASSED!');
console.log('=========================================\n');
