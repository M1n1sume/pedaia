import fs from 'fs';
import path from 'path';
import vm from 'vm';

function getFiles(dir, ext) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, ext));
    } else if (fullPath.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

const jsFiles = [...getFiles('public/js', '.js'), ...getFiles('extension', '.js'), 'server.js', 'tunnel.js'];
let errors = 0;

console.log(`Checking syntax of ${jsFiles.length} JavaScript files...`);

for (const f of jsFiles) {
  const code = fs.readFileSync(f, 'utf8');
  try {
    // Check module syntax
    new vm.SourceTextModule(code, { initializeImportMeta() {} });
    console.log(`✓ ${path.relative('.', f)} parsed cleanly as ES Module`);
  } catch (mErr) {
    // Try as regular script
    try {
      new vm.Script(code);
      console.log(`✓ ${path.relative('.', f)} parsed cleanly as Script`);
    } catch (sErr) {
      console.error(`❌ SYNTAX ERROR in ${f}:`, mErr.message);
      errors++;
    }
  }
}

if (errors === 0) {
  console.log(`\n🎉 ALL ${jsFiles.length} JS FILES ARE 100% SYNTACTICALLY VALID!`);
} else {
  console.error(`\n❌ Found ${errors} syntax errors!`);
  process.exit(1);
}
