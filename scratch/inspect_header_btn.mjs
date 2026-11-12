import fs from 'fs';

const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');
console.log(lines.slice(410, 460).join('\n'));
