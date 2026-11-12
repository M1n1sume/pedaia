import fs from 'fs';

const sw = fs.readFileSync('public/sw.js', 'utf8');
const lines = sw.split('\n');
console.log(lines.slice(0, 10).join('\n'));
