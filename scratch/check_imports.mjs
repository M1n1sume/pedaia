import fs from 'fs';
import path from 'path';

console.log('--- Checking ESM Imports and Exports Consistency ---');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (file.endsWith('.js')) {
      results.push(fullPath);
    }
  });
  return results;
}

const jsFiles = getFiles('./public/js');
let issues = [];

jsFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Match: import ... from '...' or import '...'
  const importRegex = /import\s+(?:(?:(?:\{[^}]*\}|\*\s+as\s+[^,]+|[a-zA-Z0-9_$]+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+[^,]+|[a-zA-Z0-9_$]+))*\s+from\s+)|)['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('.')) {
      const resolved = path.resolve(path.dirname(filePath), importPath);
      // check if file exists or resolved with .js
      const exists = fs.existsSync(resolved) || fs.existsSync(resolved + '.js');
      if (!exists) {
        issues.push({ file: filePath, import: importPath, resolved });
      }
    }
  }
});

console.log(`Scanned ${jsFiles.length} files. Found ${issues.length} broken import paths.`);
if (issues.length > 0) {
  console.error('Broken imports:', issues);
  process.exit(1);
} else {
  console.log('✓ All ESM import targets exist on disk!');
}
