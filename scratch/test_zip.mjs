import fs from 'fs';

const zipPath = 'public/pedaia-browser-extension.zip';
if (!fs.existsSync(zipPath)) {
  console.error('Extension zip does not exist!');
  process.exit(1);
}

const stats = fs.statSync(zipPath);
console.log(`✓ Zip file size: ${stats.size} bytes`);

// Check zip signature (PK\x03\x04)
const fd = fs.openSync(zipPath, 'r');
const buf = Buffer.alloc(4);
fs.readSync(fd, buf, 0, 4, 0);
fs.closeSync(fd);

if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) {
  console.log('✓ Valid ZIP magic header signature (PK\\x03\\x04) confirmed');
} else {
  console.error('❌ Invalid ZIP header!');
  process.exit(1);
}
console.log('🎉 Extension zip package is valid and ready for download!');
