import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('--- Checking syntax of all JS/MJS files ---');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        results = results.concat(getFiles(fullPath));
      }
    } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
      results.push(fullPath);
    }
  });
  return results;
}

const allJsFiles = [...getFiles('./public'), ...getFiles('./scratch'), 'server.js'];
let errorCount = 0;

allJsFiles.forEach(f => {
  try {
    execSync(`node --check "${f}"`, { stdio: 'pipe' });
  } catch (err) {
    console.error(`SYNTAX ERROR in ${f}:`, err.stderr ? err.stderr.toString() : err.message);
    errorCount++;
  }
});

console.log(`Syntax check finished: ${allJsFiles.length} files scanned, ${errorCount} errors found.`);
