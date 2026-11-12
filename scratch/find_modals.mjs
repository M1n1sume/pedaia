import fs from 'fs';

const app = fs.readFileSync('public/js/app.js', 'utf8');
const lines = app.split('\n');

function findInApp(term) {
  lines.forEach((l, idx) => {
    if (l.includes(term)) {
      console.log(`app.js:${idx + 1}: ${l.trim()}`);
    }
  });
}

findInApp('header-extension-btn');
findInApp('openExtensionModal');
findInApp('model');
findInApp('theme');
