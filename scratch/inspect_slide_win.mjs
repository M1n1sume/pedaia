import fs from 'fs';

const code = fs.readFileSync('public/js/views/aiOutputStudio.js', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('function openInteractiveSlideDeckWindow'));
console.log(lines.slice(idx, idx + 60).join('\n'));
