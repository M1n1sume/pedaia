import fs from 'fs';

const diff = fs.readFileSync('public/js/views/differentiationStudio.js', 'utf8');
const lines = diff.split('\n');
console.log(lines.slice(745, 830).join('\n'));
