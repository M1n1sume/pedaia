import fs from 'fs';
const md = fs.readFileSync('public/js/views/myDesigns.js', 'utf8');
const lines = md.split('\n');
lines.forEach((l, i) => {
  if (l.includes('designs-import-file-btn')) {
    console.log(`myDesigns.js:${i+1}: ${l.trim()}`);
  }
});
