import fs from 'fs';

const q = fs.readFileSync('public/js/views/questioningStudio.js', 'utf8');
const lines = q.split('\n');
console.log('--- Imports in questioningStudio.js ---');
console.log(lines.slice(0, 15).join('\n'));
console.log('--- Blooms and q-types listeners ---');
const idx = lines.findIndex(l => l.includes('blooms-inputs-container'));
console.log(lines.slice(idx - 5, idx + 50).join('\n'));
