import fs from 'fs';

const code = fs.readFileSync('public/js/views/aiOutputStudio.js', 'utf8');
const lines = code.split('\n');
console.log(lines.slice(595, 730).join('\n'));
