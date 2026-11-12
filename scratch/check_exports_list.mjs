import fs from 'fs';
const eu = fs.readFileSync('public/js/exportUtils.js', 'utf8');
const lines = eu.split('\n');
lines.forEach((l, i) => {
  if (l.startsWith('export function')) {
    console.log(`exportUtils.js:${i+1}: ${l.trim()}`);
  }
});
