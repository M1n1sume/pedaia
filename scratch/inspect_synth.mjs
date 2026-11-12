import fs from 'fs';

const server = fs.readFileSync('server.js', 'utf8');
const lines = server.split('\n');
const idx = lines.findIndex(l => l.includes('function synthesizePedagogicalDocument'));
console.log(lines.slice(idx, idx + 80).join('\n'));
