import fs from 'fs';

const sc = fs.readFileSync('public/js/views/sharedContext.js', 'utf8');
const lines = sc.split('\n');
console.log(lines.slice(100, 160).join('\n'));
