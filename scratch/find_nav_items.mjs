import fs from 'fs';

const html = fs.readFileSync('public/index.html', 'utf8');
const regex = /<([a-z0-9]+)[^>]*class="[^"]*nav-item[^"]*"[^>]*>/gi;
let match;
while ((match = regex.exec(html)) !== null) {
  console.log(match[0]);
}
