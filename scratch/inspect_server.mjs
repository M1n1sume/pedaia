import fs from 'fs';

const server = fs.readFileSync('server.js', 'utf8');
const lines = server.split('\n');
lines.forEach((l, i) => {
  if (l.includes('studio') || l.includes('generate') || l.includes('fallback') || l.includes('lesson')) {
    console.log(`server.js:${i + 1}: ${l.trim()}`);
  }
});
