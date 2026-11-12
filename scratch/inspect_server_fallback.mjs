import fs from 'fs';

const server = fs.readFileSync('server.js', 'utf8');
const lines = server.split('\n');
console.log(lines.slice(1060, 1140).join('\n'));
