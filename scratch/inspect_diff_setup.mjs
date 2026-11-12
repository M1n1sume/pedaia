import fs from 'fs';

const diff = fs.readFileSync('public/js/views/differentiationStudio.js', 'utf8');
const lines = diff.split('\n');
console.log('--- Imports in differentiationStudio.js ---');
console.log(lines.slice(0, 15).join('\n'));
console.log('--- diff dimensions & strategies listeners ---');
const idx = lines.findIndex(l => l.includes('diff-strategies-group'));
console.log(lines.slice(idx - 15, idx + 50).join('\n'));
