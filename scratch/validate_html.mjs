import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

console.log('--- Validating public/index.html ---');

// Check unclosed tags (for common block tags)
const tagsToCheck = ['div', 'button', 'main', 'header', 'nav', 'aside', 'footer', 'section'];
for (const tag of tagsToCheck) {
  const openRegex = new RegExp(`<${tag}[\\s>]`, 'gi');
  const closeRegex = new RegExp(`<\/${tag}>`, 'gi');
  const openCount = (html.match(openRegex) || []).length;
  const closeCount = (html.match(closeRegex) || []).length;
  if (openCount !== closeCount) {
    console.error(`❌ Mismatched <${tag}>: opened ${openCount} times, closed ${closeCount} times`);
  } else {
    console.log(`✓ <${tag}> balanced (${openCount} pairs)`);
  }
}

// Check duplicate element IDs
const idMatches = [...html.matchAll(/id="([^"]+)"/g)];
const ids = idMatches.map(m => m[1]);
const idCounts = {};
const duplicates = [];
for (const id of ids) {
  idCounts[id] = (idCounts[id] || 0) + 1;
  if (idCounts[id] === 2) duplicates.push(id);
}

if (duplicates.length > 0) {
  console.warn(`⚠️ Duplicate IDs found in index.html: ${duplicates.join(', ')}`);
} else {
  console.log(`✓ All ${ids.length} element IDs are unique`);
}

console.log('HTML validation complete.');
