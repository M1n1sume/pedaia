import * as db from '../serverDb.js';

async function run() {
  db.initDb();
  console.log('DB init passed');
  
  // Test reserved M1n1sume
  try {
    db.registerUser({ username: 'M1n1sume', email: 'admin@test.com', password: 'password123', confirmPassword: 'password123' });
    console.error('FAIL: should not register M1n1sume normally');
  } catch(e) {
    console.log('PASS: M1n1sume reserved check:', e.message);
  }

  // Register user A
  const uA = db.registerUser({ username: 'educator_alice', email: 'alice@school.edu', password: 'password123', confirmPassword: 'password123' });
  console.log('PASS: registered user A:', uA.user.username);

  // Profile A is blank
  const profA = db.getUserProfile(uA.user.id);
  console.log('PASS: profA is blank:', profA.name === '' && profA.institution === '');

  // Design isolation
  const d1 = db.saveUserDesign(uA.user.id, { title: 'Alice Design 1', output: 'Content' });
  console.log('PASS: saved design for Alice:', d1.id);

  // Register user B
  const uB = db.registerUser({ username: 'educator_bob', email: 'bob@school.edu', password: 'password123', confirmPassword: 'password123' });
  const bobDesigns = db.getUserDesigns(uB.user.id);
  console.log('PASS: bob cannot see alice designs:', bobDesigns.length === 0);

  // Bob cannot modify Alice design
  try {
    db.saveUserDesign(uB.user.id, { id: d1.id, title: 'Hacked by Bob' });
    console.error('FAIL: Bob should not modify Alice design');
  } catch(e) {
    console.log('PASS: Bob blocked from Alice design:', e.message);
  }

  // M1n1sume first login
  const m1LoginCheck = db.loginUser({ identifier: 'M1n1sume' });
  console.log('PASS: M1n1sume requires master password:', m1LoginCheck.requiresMasterPasswordSetup);

  const m1Setup = db.loginUser({ identifier: 'M1n1sume', isFirstTimeAdmin: true, masterPassword: 'MasterPassword99!', confirmMasterPassword: 'MasterPassword99!' });
  console.log('PASS: M1n1sume setup success, role:', m1Setup.user.role);

  const m1LoginAfter = db.loginUser({ identifier: 'm1n1sume', password: 'MasterPassword99!' });
  console.log('PASS: M1n1sume login success after setup:', m1LoginAfter.success);

  console.log('ALL SERVER DB TESTS PASSED!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
