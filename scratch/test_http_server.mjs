import http from 'http';
import { spawn } from 'child_process';

const srv = spawn(process.execPath, ['server.js']);

srv.stdout.on('data', (d) => console.log('SRV:', d.toString().trim()));
srv.stderr.on('data', (d) => console.error('SRV ERR:', d.toString().trim()));

await new Promise(r => setTimeout(r, 1500));

http.get('http://127.0.0.1:3000/js/views/aiOutputStudio.js', (res) => {
  console.log('HTTP Status:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Downloaded length:', data.length);
    srv.kill();
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('Fetch error:', err);
  srv.kill();
  process.exit(1);
});
