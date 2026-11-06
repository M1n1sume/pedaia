import fs from 'fs';
const content = fs.readFileSync('public/js/state.js', 'utf8');
const lines = content.split('\n');
console.log('Total lines:', lines.length);
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('getEducatorProfile') || lines[i].includes('USER_PROFILES') || lines[i].includes('saveEducatorProfile')) {
    console.log(i + 1, lines[i].trim());
  }
}
