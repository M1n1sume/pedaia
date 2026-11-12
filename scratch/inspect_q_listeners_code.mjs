import fs from 'fs';

const q = fs.readFileSync('public/js/views/questioningStudio.js', 'utf8');
const lines = q.split('\n');
console.log(lines.slice(740, 820).join('\n'));
