import fs from 'fs';

const app = fs.readFileSync('public/js/app.js', 'utf8');
const lines = app.split('\n');
console.log(lines.slice(300, 365).join('\n'));
