import fs from 'fs';

const code = fs.readFileSync('public/js/views/aiOutputStudio.js', 'utf8');
const lines = code.split('\n');
console.log(lines.slice(2935, 2980).map((l, i) => `${2935 + i + 1}: ${l}`).join('\n'));
