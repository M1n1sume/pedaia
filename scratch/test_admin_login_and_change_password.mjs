// Test HTTP server endpoint for M1n1sume login and change password
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const creds = fs.readFileSync(path.join(process.cwd(), 'scratch', 'm1n1sume_credentials.txt'), 'utf8');
const passMatch = creds.match(/Password:\s*(\S+)/);
const randomPassword = passMatch ? passMatch[1] : null;

if (!randomPassword) {
  console.error('Password not found in scratch/m1n1sume_credentials.txt');
  process.exit(1);
}

console.log('Testing with generated password:', randomPassword);

const PORT = 3899;
const child = spawn(process.execPath, ['server.js'], {
  env: { ...process.env, PORT: String(PORT) },
  stdio: 'inherit'
});

async function waitReady() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/api/auth/me`);
      if (res.status === 401 || res.status === 200) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Server did not start in time');
}

async function runTests() {
  await waitReady();
  console.log(`Server responsive on port ${PORT}`);

  try {
    // 1. Test Login with random password
    console.log('1. Testing POST /api/auth/login with M1n1sume...');
    const loginRes = await fetch(`http://127.0.0.1:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'M1n1sume',
        password: randomPassword
      })
    });
    const loginData = await loginRes.json();
    console.log('Login Response:', { status: loginRes.status, success: loginData.success, user: loginData.user });
    if (!loginData.success || loginData.user.username !== 'M1n1sume' || loginData.user.role !== 'admin') {
      throw new Error('Admin login failed: ' + JSON.stringify(loginData));
    }
    const token = loginData.token;

    // 2. Test GET /api/auth/me
    console.log('2. Testing GET /api/auth/me with Bearer token...');
    const meRes = await fetch(`http://127.0.0.1:${PORT}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    console.log('Me Response:', meData);
    if (!meData.authenticated || meData.user.role !== 'admin') {
      throw new Error('Auth me check failed.');
    }

    // 3. Test POST /api/auth/change-password with invalid old password
    console.log('3. Testing change password with bad old password...');
    const badChangeRes = await fetch(`http://127.0.0.1:${PORT}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        oldPassword: 'WrongPassword999!',
        newPassword: 'MyNewSecretPassword2026!'
      })
    });
    console.log('Bad change response status:', badChangeRes.status);
    if (badChangeRes.status !== 400) {
      throw new Error('Expected 400 for incorrect old password, got ' + badChangeRes.status);
    }

    // 4. Test POST /api/auth/change-password with correct old password
    console.log('4. Testing change password with correct old password...');
    const goodChangeRes = await fetch(`http://127.0.0.1:${PORT}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        oldPassword: randomPassword,
        newPassword: 'MyNewSecretPassword2026!'
      })
    });
    const goodChangeData = await goodChangeRes.json();
    console.log('Good change response:', goodChangeData);
    if (!goodChangeData.success) {
      throw new Error('Change password failed: ' + JSON.stringify(goodChangeData));
    }

    // 5. Test login with old password fails
    console.log('5. Testing login with old password fails...');
    const oldLoginRes = await fetch(`http://127.0.0.1:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'M1n1sume',
        password: randomPassword
      })
    });
    console.log('Old login response status:', oldLoginRes.status);
    if (oldLoginRes.status === 200) {
      throw new Error('Old password should not have worked after change.');
    }

    // 6. Test login with new password succeeds
    console.log('6. Testing login with new password succeeds...');
    const newLoginRes = await fetch(`http://127.0.0.1:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'M1n1sume',
        password: 'MyNewSecretPassword2026!'
      })
    });
    const newLoginData = await newLoginRes.json();
    console.log('New login response status:', newLoginRes.status, newLoginData.user?.username);
    if (!newLoginData.success) {
      throw new Error('Login with new password failed.');
    }

    // 7. Reset back to the generated random password
    console.log('7. Reverting back to original random password for user...');
    const revertRes = await fetch(`http://127.0.0.1:${PORT}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newLoginData.token}`
      },
      body: JSON.stringify({
        oldPassword: 'MyNewSecretPassword2026!',
        newPassword: randomPassword
      })
    });
    const revertData = await revertRes.json();
    console.log('Revert response:', revertData);

    // Final verification that original random password is live
    const finalLoginRes = await fetch(`http://127.0.0.1:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'M1n1sume',
        password: randomPassword
      })
    });
    const finalLoginData = await finalLoginRes.json();
    if (!finalLoginData.success) {
      throw new Error('Final verification failed.');
    }
    console.log('\n======================================================');
    console.log('🎉 ALL TESTS PASSED! M1n1sume can log in seamlessly with the generated password, and can change their password at any time via the API / My Account.');
    console.log('======================================================\n');
  } finally {
    child.kill('SIGTERM');
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test error:', err);
  child.kill('SIGTERM');
  process.exit(1);
});
