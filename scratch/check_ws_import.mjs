import fs from 'fs';
const ow = fs.readFileSync('public/js/views/outputWorkspace.js', 'utf8');
const lines = ow.split('\n');
lines.forEach((l, i) => {
  if (l.includes('ws-import-file-btn')) {
    console.log(`outputWorkspace.js:${i+1}: ${l.trim()}`);
  }
});
