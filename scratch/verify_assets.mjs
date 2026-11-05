import fs from 'fs';

const html = fs.readFileSync('public/index.html', 'utf8');
const scriptSrcs = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(m => m[1]);
const linkHrefs = [...html.matchAll(/<link[^>]+href=["']([^"']+)["']/g)].map(m => m[1]);

console.log('--- Checking Scripts ---');
for (const s of scriptSrcs) {
  if (!s.startsWith('http')) {
    const p = 'public/' + s.replace(/^\//, '');
    if (!fs.existsSync(p)) console.error('❌ Missing script file:', p);
    else console.log('✓ Found script:', p);
  } else {
    console.log('✓ External CDN script:', s);
  }
}

console.log('\n--- Checking Links ---');
for (const l of linkHrefs) {
  if (!l.startsWith('http') && !l.startsWith('data:')) {
    const p = 'public/' + l.replace(/^\//, '');
    if (!fs.existsSync(p)) console.error('❌ Missing link href:', p);
    else console.log('✓ Found link:', p);
  } else {
    console.log('✓ External or inline link:', l);
  }
}

console.log('\nAsset verification completed.');
