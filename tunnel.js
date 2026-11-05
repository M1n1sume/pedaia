import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keyPath = path.join(__dirname, 'id_temp');
const urlFilePath = path.join(__dirname, 'tunnel-url.txt');
const cloudflaredPath = path.join(__dirname, 'cloudflared.exe');

// 1. Start the PEDAIA HTTP Server
console.log('[1/2] Starting PEDAIA server on port 3000...');
await import('./server.js');
await new Promise(r => setTimeout(r, 1500));

// 2. Start Cloudflare Tunnel (or Pinggy / Localhost.run fallback)
console.log('[2/2] Connecting Cloudflare Tunnel to provide clean, permanent public URL...');

function startTunnel(service = 'cloudflare') {
  let procCmd;
  let args;

  if (service === 'cloudflare' && fs.existsSync(cloudflaredPath)) {
    procCmd = cloudflaredPath;
    args = ['tunnel', '--url', 'http://127.0.0.1:3000'];
  } else if (service === 'pinggy') {
    procCmd = 'ssh.exe';
    args = [
      '-i', keyPath,
      '-T',
      '-p', '443',
      '-R0:localhost:3000',
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'UserKnownHostsFile=NUL',
      '-o', 'ServerAliveInterval=30',
      'a.pinggy.io'
    ];
  } else {
    procCmd = 'ssh.exe';
    args = [
      '-i', keyPath,
      '-T',
      '-R', '80:localhost:3000',
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'UserKnownHostsFile=NUL',
      '-o', 'ServerAliveInterval=30',
      'nokey@localhost.run'
    ];
  }

  console.log(`Spawning tunnel via ${service}...`);
  const tunnelProc = spawn(procCmd, args, { stdio: ['pipe', 'pipe', 'pipe'] });

  let foundUrl = false;

  const handleData = (chunk) => {
    const text = chunk.toString();
    process.stdout.write(text);

    // Regex to match public tunnel URLs (Cloudflare, Pinggy, localhost.run)
    const matches = text.match(/https:\/\/(?!api\.)[a-zA-Z0-9\-]+\.trycloudflare\.com/i)
      || text.match(/https:\/\/[a-zA-Z0-9\-_\.]+\.(pinggy\.link|lhr\.life|lhrtunnel\.pro|localhost\.run)/i)
      || text.match(/https:\/\/[a-zA-Z0-9\-_\.]+\.a\.pinggy\.link/i);

    if (matches && !foundUrl) {
      foundUrl = true;
      const publicUrl = matches[0];
      console.log('\n======================================================');
      console.log(`>>> PEDAIA LIVE PUBLIC CLOUDFLARE URL: ${publicUrl} <<<`);
      console.log('======================================================\n');
      fs.writeFileSync(urlFilePath, publicUrl, 'utf-8');
    }
  };

  tunnelProc.stdout.on('data', handleData);
  tunnelProc.stderr.on('data', handleData);

  tunnelProc.on('close', (code) => {
    console.log(`Tunnel process (${service}) exited with code ${code}`);
    if (!foundUrl) {
      if (service === 'cloudflare') {
        console.log('Falling back to pinggy...');
        startTunnel('pinggy');
      } else if (service === 'pinggy') {
        console.log('Falling back to localhost.run...');
        startTunnel('localhost.run');
      }
    }
  });

  tunnelProc.on('error', (err) => {
    console.error(`Tunnel error (${service}):`, err);
    if (!foundUrl) {
      if (service === 'cloudflare') {
        startTunnel('pinggy');
      } else if (service === 'pinggy') {
        startTunnel('localhost.run');
      }
    }
  });
}

// Start with Cloudflare
startTunnel('cloudflare');
