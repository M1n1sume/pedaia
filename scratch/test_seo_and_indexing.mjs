// Verification for PEDAIA Search Engine Discovery & Indexing
import fs from 'fs';
import path from 'path';

console.log('--- Verifying Search Engine Discovery & SEO Assets ---');

const indexPath = path.join(process.cwd(), 'public', 'index.html');
const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
const serverPath = path.join(process.cwd(), 'server.js');

const indexHtml = fs.readFileSync(indexPath, 'utf-8');
const robotsTxt = fs.readFileSync(robotsPath, 'utf-8');
const sitemapXml = fs.readFileSync(sitemapPath, 'utf-8');
const serverJs = fs.readFileSync(serverPath, 'utf-8');

let errors = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    errors++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('\n[1] robots.txt & sitemap.xml:');
assert(robotsTxt.includes('User-agent: *') && robotsTxt.includes('Allow: /'), 'robots.txt allows search engine crawlers');
assert(robotsTxt.includes('sitemap.xml'), 'robots.txt points to sitemap.xml');
assert(sitemapXml.includes('<loc>https://pedaia.onrender.com/</loc>'), 'sitemap.xml contains base URL');
assert(sitemapXml.includes('#lesson-planning') && sitemapXml.includes('#ai-output-studio'), 'sitemap.xml declares studio modules');

console.log('\n[2] server.js MIME types:');
assert(serverJs.includes("'.txt': 'text/plain; charset=utf-8'"), 'server.js serves .txt files with correct MIME type');
assert(serverJs.includes("'.xml': 'application/xml; charset=utf-8'"), 'server.js serves .xml files with correct MIME type');

console.log('\n[3] index.html SEO & Google Indexing:');
assert(indexHtml.includes('name="keywords"') && indexHtml.includes('PEDAIA'), 'Contains PEDAIA brand keywords');
assert(indexHtml.includes('rel="canonical"'), 'Contains canonical link');
assert(indexHtml.includes('property="og:title"') && indexHtml.includes('property="og:image"'), 'Contains Open Graph social preview tags');
assert(indexHtml.includes('name="twitter:card"'), 'Contains Twitter/X card tags');
assert(indexHtml.includes('type="application/ld+json"'), 'Contains Schema.org JSON-LD structured data');
assert(indexHtml.includes('"name": "PEDAIA"'), 'Structured data registers official name as PEDAIA');
assert(indexHtml.includes('"@type": "WebApplication"'), 'Structured data declares WebApplication entity');
assert(indexHtml.includes('icon-512.png'), 'High-res icon attached to structured data for Google snippet icon');

if (errors > 0) {
  console.error(`\n❌ Total failures: ${errors}`);
  process.exit(1);
} else {
  console.log('\n✨ ALL SEO & SEARCH ENGINE INDEXING TESTS PASSED!');
}
