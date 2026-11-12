import fs from 'fs';
import path from 'path';

console.log('Current working directory:', process.cwd());
console.log('Files in cwd:', fs.readdirSync('.'));

function search(dir, regex) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) search(full, regex);
    else if (/\.(html|js|css)$/.test(e.name)) {
      const code = fs.readFileSync(full, 'utf8');
      if (regex.test(code)) {
        console.log('Match in:', full);
      }
    }
  }
}

console.log('Searching for role or admin badge or profile:');
search('public', /admin|role|profile|avatar/i);
