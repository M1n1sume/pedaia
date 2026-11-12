import fs from 'fs';
const aos = fs.readFileSync('public/js/views/aiOutputStudio.js', 'utf8');
const lines = aos.split('\n');
lines.forEach((l, i) => {
  if (l.toLowerCase().includes('import')) {
    console.log(`aiOutputStudio.js:${i+1}: ${l.trim()}`);
  }
});
