import fs from 'fs';
const diff = fs.readFileSync('public/js/views/differentiationStudio.js', 'utf8');
const lines = diff.split('\n');
lines.forEach((l, i) => {
  if (l.includes('setupDifferentiationStudioListeners') || l.includes('diff-reset-btn') || l.includes('reset-btn')) {
    console.log(`differentiationStudio.js:${i+1}: ${l.trim()}`);
  }
});
