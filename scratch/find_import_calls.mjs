import fs from 'fs';
import path from 'path';

function searchInDir(dir, query) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === 'brain') continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchInDir(fullPath, query);
    } else if (file.endsWith('.js') || file.endsWith('.html')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(query)) {
        console.log(`Found "${query}" in ${fullPath}`);
      }
    }
  }
}

searchInDir('./public/js', 'openUniversalImportModal');
searchInDir('./public/js', 'parseAnyFile');
