import fs from 'fs';

const q = fs.readFileSync('public/js/views/questioningStudio.js', 'utf8');
const lines = q.split('\n');

lines.forEach((l, i) => {
  if (l.includes('chip') || l.includes('card') || l.includes('data-val') || l.includes('data-level') || l.includes('select')) {
    if (l.includes('button') || l.includes('querySelectorAll') || l.includes('<select')) {
      console.log(`Line ${i + 1}: ${l.trim()}`);
    }
  }
});
