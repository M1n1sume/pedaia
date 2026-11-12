import fs from 'fs';

const code = fs.readFileSync('public/js/views/aiOutputStudio.js', 'utf8');
const lines = code.split('\n');
console.log('--- Lines 20-55 ---');
console.log(lines.slice(20, 55).join('\n'));
console.log('--- Lines 310-345 ---');
console.log(lines.slice(310, 345).join('\n'));
