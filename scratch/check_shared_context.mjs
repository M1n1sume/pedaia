import fs from 'fs';
const sc = fs.readFileSync('public/js/views/sharedContext.js', 'utf8');
const lines = sc.split('\n');
lines.forEach((l, i) => {
  if (l.includes('button') || l.includes('import') || l.includes('Import') || l.includes('template')) {
    console.log(`sharedContext.js:${i+1}: ${l.trim()}`);
  }
});
