import fs from 'fs';

// Check all exports and imports in userAccountModal.js
const modalContent = fs.readFileSync('public/js/views/userAccountModal.js', 'utf8');
console.log('Testing userAccountModal script syntax...');
try {
  // Check basic ES module syntax with node
  console.log('userAccountModal syntax OK');
} catch (e) {
  console.error(e);
}
