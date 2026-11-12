import fs from 'fs';

function listExports(file) {
  const content = fs.readFileSync(file, 'utf8');
  const matches = [...content.matchAll(/export\s+(?:async\s+)?function\s+([a-zA-Z0-9_]+)/g)];
  console.log(`Exports in ${file}:`, matches.map(m => m[1]));
}

listExports('public/js/importUtils.js');
listExports('public/js/exportUtils.js');
