import fs from 'fs';

function findSnippet(file, re) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    if (re.test(l)) {
      console.log(`${file}:${idx + 1}: ${l.trim()}`);
    }
  });
}

findSnippet('public/index.html', /user|profile|avatar|admin|badge/i);
findSnippet('public/js/layoutManager.js', /user|profile|avatar|admin|badge/i);
findSnippet('public/js/app.js', /user|profile|avatar|admin/i);
