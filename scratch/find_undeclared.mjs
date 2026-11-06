import fs from 'fs';

const code = fs.readFileSync('public/js/views/aiOutputStudio.js', 'utf8');

// Check all function calls or variables in template strings
console.log('Scanning aiOutputStudio.js for potential issues...');

// Check for missing imports
const imports = [];
const lines = code.split('\n');
for (let i = 0; i < 50; i++) {
  if (lines[i].startsWith('import ')) {
    imports.push(lines[i]);
  }
}
console.log('Imports:', imports);
