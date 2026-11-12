import fs from 'fs';

const appJs = fs.readFileSync('public/js/app.js', 'utf8');
const lines = appJs.split('\n');
console.log(lines.slice(768, 805).join('\n'));
