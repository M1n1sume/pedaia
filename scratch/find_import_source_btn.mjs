import fs from 'fs';
import path from 'path';

function search(dir, str) {
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) search(full, str);
    else if (f.endsWith('.js')) {
      const c = fs.readFileSync(full, 'utf8');
      if (c.includes(str)) console.log(`Found "${str}" in ${full}`);
    }
  });
}
search('public/js', 'import-source-btn');
