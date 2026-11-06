// Script to generate a strong random password for M1n1sume and initialize the account
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import * as db from '../serverDb.js';

function generateSecureRandomPassword(length = 16) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*_-+=';
  const all = upper + lower + digits + symbols;

  // Guarantee at least one of each category
  const pwdChars = [
    upper[crypto.randomInt(0, upper.length)],
    lower[crypto.randomInt(0, lower.length)],
    digits[crypto.randomInt(0, digits.length)],
    symbols[crypto.randomInt(0, symbols.length)],
  ];

  for (let i = 4; i < length; i++) {
    pwdChars.push(all[crypto.randomInt(0, all.length)]);
  }

  // Shuffle securely
  for (let i = pwdChars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [pwdChars[i], pwdChars[j]] = [pwdChars[j], pwdChars[i]];
  }

  return pwdChars.join('');
}

const randomPassword = generateSecureRandomPassword(16);
console.log('Generated Random Password for M1n1sume:', randomPassword);

const users = db.readJson('users.json', []);
let adminUser = users.find(u => u && u.username && u.username.toLowerCase() === 'm1n1sume');

if (!adminUser) {
  adminUser = {
    id: 'usr_admin_m1n1sume',
    username: 'M1n1sume',
    email: 'admin@pedaia.internal',
    role: 'admin',
    createdAt: new Date().toISOString()
  };
  users.push(adminUser);
}

const salt = db.generateSalt();
const passwordHash = db.hashPassword(randomPassword, salt);

adminUser.passwordHash = passwordHash;
adminUser.salt = salt;
adminUser.isInitialized = true;
adminUser.updatedAt = new Date().toISOString();

db.writeJson('users.json', users);
console.log('Saved M1n1sume password hash and salt to data/users.json.');

// Test login with this password
const loginRes = db.loginUser({
  identifier: 'M1n1sume',
  password: randomPassword
});

console.log('Login verification result:', {
  success: loginRes.success,
  username: loginRes.user.username,
  role: loginRes.user.role,
  token: loginRes.token ? 'GENERATED_VALID_TOKEN' : 'NO_TOKEN'
});

// Test changing password functionality
const testNewPass = 'TempPass123!456';
const changeRes = db.changeUserPassword({
  userId: adminUser.id,
  oldPassword: randomPassword,
  newPassword: testNewPass
});
console.log('Test change password result:', changeRes);

// Verify login with new pass
const loginRes2 = db.loginUser({
  identifier: 'M1n1sume',
  password: testNewPass
});
console.log('Login verification with new password:', {
  success: loginRes2.success,
  username: loginRes2.user.username
});

// Change it back to the original random password so the user has the generated password!
db.changeUserPassword({
  userId: adminUser.id,
  oldPassword: testNewPass,
  newPassword: randomPassword
});
console.log('Successfully reverted to generated random password for the user!');

// Write the password to a secure temporary file in scratch so we can also inspect it
fs.writeFileSync(path.join(process.cwd(), 'scratch', 'm1n1sume_credentials.txt'), 
`Username: M1n1sume\nPassword: ${randomPassword}\nRole: admin\nGeneratedAt: ${new Date().toISOString()}\n`, 'utf8');

console.log('Credential file created in scratch/m1n1sume_credentials.txt');
