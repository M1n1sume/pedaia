import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('public/index.html', 'utf8');

// Collect all IDs in index.html
const htmlIdRegex = /id=["']([a-zA-Z0-9_\-]+)["']/g;
const staticIds = new Set();
let match;
while ((match = htmlIdRegex.exec(html)) !== null) {
  staticIds.add(match[1]);
}

console.log(`Found ${staticIds.size} static element IDs in public/index.html`);

// Collect dynamic IDs generated in templates across all js files
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

const jsFiles = getFiles('public/js', '.js');
const dynamicIds = new Set();

for (const f of jsFiles) {
  const code = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = htmlIdRegex.exec(code)) !== null) {
    dynamicIds.add(m[1]);
  }
}

console.log(`Found ${dynamicIds.size} dynamic IDs declared in templates across JS views.`);

const allKnownIds = new Set([...staticIds, ...dynamicIds]);

// Now check all document.getElementById and querySelector('#id')
let lookupWarnings = [];

for (const f of jsFiles) {
  const code = fs.readFileSync(f, 'utf8');
  
  // match getElementById('...')
  const getElemRegex = /getElementById\(['"]([a-zA-Z0-9_\-]+)['"]\)/g;
  let gMatch;
  while ((gMatch = getElemRegex.exec(code)) !== null) {
    const id = gMatch[1];
    if (!allKnownIds.has(id)) {
      lookupWarnings.push({ file: path.relative('.', f), id, type: 'getElementById' });
    }
  }

  // match querySelector('#...')
  const qsRegex = /querySelector\(['"]#([a-zA-Z0-9_\-]+)['"]\)/g;
  let qMatch;
  while ((qMatch = qsRegex.exec(code)) !== null) {
    const id = qMatch[1];
    if (!allKnownIds.has(id)) {
      lookupWarnings.push({ file: path.relative('.', f), id, type: 'querySelector' });
    }
  }
}

if (lookupWarnings.length === 0) {
  console.log(`🎉 100% OF DOM ELEMENT LOOKUPS (${allKnownIds.size} IDs) MATCH REAL DOM NODES! No missing element IDs found.`);
} else {
  console.warn(`Found ${lookupWarnings.length} element lookups that were not statically matched:`);
  lookupWarnings.forEach(w => console.warn(` - [${w.file}] looked for #${w.id} via ${w.type}`));
}
