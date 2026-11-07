import fs from 'fs';

const css = fs.readFileSync('./public/css/styles.css', 'utf-8');

let openBraces = 0;
let lines = css.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let ch of line) {
    if (ch === '{') openBraces++;
    if (ch === '}') openBraces--;
  }
}

console.log('Open braces balance in styles.css:', openBraces);
if (openBraces !== 0) {
  console.error('MISMATCHED BRACES in styles.css!');
} else {
  console.log('✓ styles.css has perfectly balanced braces.');
}
