import fs from 'fs';
const qs = fs.readFileSync('public/js/views/questioningStudio.js', 'utf8');
const lines = qs.split('\n');
lines.forEach((l, i) => {
  if (l.includes('setupQuestioningStudioListeners') || l.includes('qs-reset-btn') || l.includes('reset-btn')) {
    console.log(`questioningStudio.js:${i+1}: ${l.trim()}`);
  }
});
