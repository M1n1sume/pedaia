import fs from 'fs';

const code = fs.readFileSync('public/js/views/aiOutputStudio.js', 'utf8');
const lines = code.split('\n');

lines.forEach((l, i) => {
  if (/visual\s*design|theme|custom/i.test(l)) {
    console.log(`Line ${i + 1}: ${l.trim()}`);
  }
});
