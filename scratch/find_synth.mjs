import fs from 'fs';

const server = fs.readFileSync('server.js', 'utf8');
const lines = server.split('\n');
lines.forEach((l, i) => {
  if (l.includes('synthesizePedagogicalDocument')) {
    console.log(`line ${i + 1}: ${l}`);
  }
});
