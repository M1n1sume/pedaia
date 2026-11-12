import fs from 'fs';

const pe = fs.readFileSync('public/js/promptEngine.js', 'utf8');
const lines = pe.split('\n');
console.log(lines.slice(25, 60).join('\n'));
