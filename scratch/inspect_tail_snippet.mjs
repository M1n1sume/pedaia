import fs from 'fs';

const code = fs.readFileSync('public/js/views/aiOutputStudio.js', 'utf8');
const lines = code.split('\n');
console.log(lines.slice(2955, 2990).map((l, i) => `${2955 + i + 1}: ${l}`).join('\n'));
