import fs from 'fs';

const act = fs.readFileSync('public/js/views/activityDesigner.js', 'utf8');
const lines = act.split('\n');

lines.forEach((l, i) => {
  if (l.includes('chip') || l.includes('card') || l.includes('data-val') || l.includes('select')) {
    if (l.includes('button') || l.includes('querySelectorAll') || l.includes('<select')) {
      console.log(`Line ${i + 1}: ${l.trim()}`);
    }
  }
});
