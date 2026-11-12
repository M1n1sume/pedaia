import fs from 'fs';

const sc = fs.readFileSync('public/js/views/sharedContext.js', 'utf8');
const lines = sc.split('\n');

lines.forEach((l, i) => {
  if (l.includes('<select') || l.includes('button') || l.includes('data-') || l.includes('pill') || l.includes('option') || l.includes('tab')) {
    console.log(`Line ${i + 1}: ${l.trim()}`);
  }
});
