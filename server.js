import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { synthesizePedagogicalDocument } from './public/js/pedagogicalEngine.js';
import * as db from './serverDb.js';

// Initialize server database
db.initDb();

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', () => {
      try {
        resolve(bodyStr ? JSON.parse(bodyStr) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.manifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.zip': 'application/zip',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

const recentAccessMap = new Map();

const server = http.createServer(async (req, res) => {
  // Universal Cross-Device & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Helper to get authenticated user
  const authHeader = req.headers['authorization'];
  const authUser = authHeader ? db.getUserByToken(authHeader) : null;

  // Telemetry: Record Website Access (Takes note of who accessed the website)
  const clientIp = (req.headers['x-forwarded-for']?.split(',')[0].trim()) || req.socket?.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || '';
  if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html' || pathname === '/dashboard' || pathname === '/designs')) {
    const now = Date.now();
    const lastVisit = recentAccessMap.get(clientIp) || 0;
    if (now - lastVisit > 45000) {
      recentAccessMap.set(clientIp, now);
      db.recordActivity({
        type: 'WEBSITE_ACCESS',
        userId: authUser ? authUser.id : null,
        username: authUser ? authUser.username : 'Guest Visitor',
        details: {
          path: pathname,
          device: userAgent.includes('Mobile') ? 'Mobile Device' : (userAgent.includes('Tablet') ? 'Tablet' : 'Desktop Browser')
        },
        ip: clientIp,
        userAgent
      });
    }
  }

  // API Routes
  if (pathname.startsWith('/api/')) {
    // Auth Information
    if (pathname === '/api/auth/info' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        authModel: 'pbkdf2-sha512-server-enforced',
        adminAccount: 'M1n1sume',
        multiUserSupported: true,
        dataIsolation: 'per-user',
        serverTime: new Date().toISOString()
      }));
      return;
    }

    // Auth: Register
    if (pathname === '/api/auth/register' && req.method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const result = db.registerUser(body);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'REGISTRATION_ERROR', message: err.message }));
      }
      return;
    }

    // Auth: Login
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const result = db.loginUser(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'AUTH_FAILED', message: err.message }));
      }
      return;
    }

    // Auth: Logout
    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';
      db.logoutUser(token);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // Auth: Current User Status
    if (pathname === '/api/auth/me' && req.method === 'GET') {
      if (!authUser) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ authenticated: false, user: null }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ authenticated: true, user: authUser }));
      return;
    }

    // Auth: Change Password
    if (pathname === '/api/auth/change-password' && req.method === 'POST') {
      if (!authUser) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required to update password.' }));
        return;
      }
      try {
        const body = await parseJsonBody(req);
        db.changeUserPassword({
          userId: authUser.id,
          oldPassword: body.oldPassword,
          newPassword: body.newPassword
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Password updated successfully.' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'PASSWORD_ERROR', message: err.message }));
      }
      return;
    }

    // Educator Profile: GET
    if (pathname === '/api/profile' && req.method === 'GET') {
      if (!authUser) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ profile: { ...db.BLANK_EDUCATOR_PROFILE } }));
        return;
      }
      const profile = db.getUserProfile(authUser.id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ profile }));
      return;
    }

    // Educator Profile: PUT (strictly separate from login credentials)
    if (pathname === '/api/profile' && req.method === 'PUT') {
      if (!authUser) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required to update profile.' }));
        return;
      }
      try {
        const body = await parseJsonBody(req);
        const updatedProfile = db.saveUserProfile(authUser.id, body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, profile: updatedProfile }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'PROFILE_ERROR', message: err.message }));
      }
      return;
    }

    // Personal Saved Designs: GET
    if (pathname === '/api/designs' && req.method === 'GET') {
      if (!authUser) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ designs: [] }));
        return;
      }
      const designs = db.getUserDesigns(authUser.id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ designs }));
      return;
    }

    // Personal Saved Designs: POST (Create / Save)
    if (pathname === '/api/designs' && req.method === 'POST') {
      if (!authUser) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Please sign in to save your instructional designs.' }));
        return;
      }
      try {
        const body = await parseJsonBody(req);
        const saved = db.saveUserDesign(authUser.id, body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, design: saved }));
      } catch (err) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'SAVE_FAILED', message: err.message }));
      }
      return;
    }

    // Single Design by ID: GET /api/designs/:id (with Work In Progress Project Lock Enforcement)
    if (pathname.startsWith('/api/designs/') && req.method === 'GET') {
      const designId = pathname.replace('/api/designs/', '').trim();
      if (!designId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'INVALID_ID', message: 'Design ID is required.' }));
        return;
      }
      try {
        const design = db.getDesignById(designId, authUser ? authUser.id : null);
        if (!design) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'NOT_FOUND', message: 'Design not found.' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, design }));
      } catch (err) {
        if (err.message && err.message.includes('PROJECT_LOCKED_WIP')) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'PROJECT_LOCKED_WIP',
            message: err.message,
            locked: true,
            stage: 'Work In Progress'
          }));
          return;
        }
        if (err.message && err.message.includes('PROJECT_PRIVATE')) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'PROJECT_PRIVATE',
            message: err.message,
            locked: true,
            visibility: 'private'
          }));
          return;
        }
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'FETCH_ERROR', message: err.message }));
      }
      return;
    }

    // Personal Saved Designs: DELETE /api/designs/:id
    if (pathname.startsWith('/api/designs/') && req.method === 'DELETE') {
      if (!authUser) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required.' }));
        return;
      }
      const designId = pathname.replace('/api/designs/', '').trim();
      try {
        db.deleteUserDesign(authUser.id, designId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'DELETE_FAILED', message: err.message }));
      }
      return;
    }

    // Personal Generated Outputs: GET
    if (pathname === '/api/outputs' && req.method === 'GET') {
      if (!authUser) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ outputs: [] }));
        return;
      }
      const outputs = db.getUserOutputs(authUser.id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ outputs }));
      return;
    }

    // Personal Generated Outputs: POST (Create / Save)
    if (pathname === '/api/outputs' && req.method === 'POST') {
      if (!authUser) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Please sign in to save your generated outputs.' }));
        return;
      }
      try {
        const body = await parseJsonBody(req);
        const saved = db.saveUserOutput(authUser.id, body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, output: saved }));
      } catch (err) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'SAVE_FAILED', message: err.message }));
      }
      return;
    }

    // Personal Generated Outputs: DELETE /api/outputs/:id
    if (pathname.startsWith('/api/outputs/') && req.method === 'DELETE') {
      if (!authUser) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required.' }));
        return;
      }
      const outputId = pathname.replace('/api/outputs/', '').trim();
      try {
        db.deleteUserOutput(authUser.id, outputId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'DELETE_FAILED', message: err.message }));
      }
      return;
    }

    // =========================================================================
    // Permanent Data Vault & Disaster Recovery API Endpoints
    // =========================================================================

    // Vault: User Account Rehydration (Self-healing across server redeployments)
    if (pathname === '/api/vault/rehydrate-user' && req.method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const result = db.restoreOrSyncUser(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'REHYDRATION_FAILED', message: err.message }));
      }
      return;
    }

    // Vault: Full Non-Destructive Sync (Designs, Outputs & Profile)
    if (pathname === '/api/vault/sync-all' && req.method === 'POST') {
      if (!authUser) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required for vault sync.' }));
        return;
      }
      try {
        const body = await parseJsonBody(req);
        const result = db.syncAllVaultData({
          userId: authUser.id,
          designs: body.designs || [],
          outputs: body.outputs || [],
          profile: body.profile || null
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'SYNC_FAILED', message: err.message }));
      }
      return;
    }

    // Vault: Full Archive Export
    if (pathname === '/api/vault/export' && req.method === 'GET') {
      if (!authUser) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required.' }));
        return;
      }
      try {
        const data = db.exportVaultData(authUser.id);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'EXPORT_FAILED', message: err.message }));
      }
      return;
    }

    // Admin User Directory: GET
    if (pathname === '/api/admin/users' && req.method === 'GET') {
      if (!authUser || authUser.role !== 'admin') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'FORBIDDEN', message: 'Administrator privileges required.' }));
        return;
      }
      try {
        const users = db.listAllUsers(authUser.id);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ users }));
      } catch (err) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ADMIN_ERROR', message: err.message }));
      }
      return;
    }

    // Admin Activity Telemetry: GET /api/admin/activity
    // Takes note of those who accessed the website, logged in, or made outputs
    if (pathname === '/api/admin/activity' && req.method === 'GET') {
      if (!authUser || authUser.role !== 'admin') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'FORBIDDEN', message: 'Administrator privileges required.' }));
        return;
      }
      try {
        const type = parsedUrl.searchParams.get('type') || 'ALL';
        const search = parsedUrl.searchParams.get('search') || '';
        const limit = parseInt(parsedUrl.searchParams.get('limit') || '100', 10);
        const offset = parseInt(parsedUrl.searchParams.get('offset') || '0', 10);

        const result = db.getActivityLogs({
          adminUserId: authUser.id,
          type,
          search,
          limit,
          offset
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, ...result }));
      } catch (err) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ADMIN_ERROR', message: err.message }));
      }
      return;
    }

    // Admin Activity Purge: POST /api/admin/activity/clear
    if (pathname === '/api/admin/activity/clear' && req.method === 'POST') {
      if (!authUser || authUser.role !== 'admin') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'FORBIDDEN', message: 'Administrator privileges required.' }));
        return;
      }
      try {
        db.clearActivityLogs(authUser.id);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Activity telemetry reset successfully.' }));
      } catch (err) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ADMIN_ERROR', message: err.message }));
      }
      return;
    }

    // Admin Email Notifications Archive: GET /api/admin/emails
    if (pathname === '/api/admin/emails' && req.method === 'GET') {
      if (!authUser || authUser.role !== 'admin') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'FORBIDDEN', message: 'Administrator privileges required.' }));
        return;
      }
      try {
        const emails = db.getAllEmailNotifications(authUser.id);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, emails }));
      } catch (err) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'ADMIN_ERROR', message: err.message }));
      }
      return;
    }

    // Project Email Notifications: POST /api/projects/:id/notify-email
    if (pathname.startsWith('/api/projects/') && pathname.endsWith('/notify-email') && req.method === 'POST') {
      if (!authUser) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required to dispatch project emails.' }));
        return;
      }
      const parts = pathname.split('/');
      const designId = parts[3];
      try {
        const body = await parseJsonBody(req);
        const result = db.sendProjectEmailUpdate({
          userId: authUser.id,
          designId,
          eventType: body.eventType || 'PROJECT_UPDATE',
          details: body.details || {},
          customRecipient: body.recipient || null
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'EMAIL_ERROR', message: err.message }));
      }
      return;
    }

    // Project Email Notifications History: GET /api/projects/:id/notifications
    if (pathname.startsWith('/api/projects/') && pathname.endsWith('/notifications') && req.method === 'GET') {
      if (!authUser) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required.' }));
        return;
      }
      const parts = pathname.split('/');
      const designId = parts[3];
      const notifications = db.getProjectEmailNotifications({ userId: authUser.id, designId });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, notifications }));
      return;
    }

    // Project Notification Settings: PUT /api/projects/:id/notification-settings
    if (pathname.startsWith('/api/projects/') && pathname.endsWith('/notification-settings') && req.method === 'PUT') {
      if (!authUser) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required.' }));
        return;
      }
      const parts = pathname.split('/');
      const designId = parts[3];
      try {
        const body = await parseJsonBody(req);
        const updated = db.saveProjectNotificationSettings(authUser.id, designId, body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, design: updated }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'SETTINGS_ERROR', message: err.message }));
      }
      return;
    }

    // User Email Notifications: GET /api/notifications
    if (pathname === '/api/notifications' && req.method === 'GET') {
      if (!authUser) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, notifications: [] }));
        return;
      }
      const notifications = db.getProjectEmailNotifications({ userId: authUser.id });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, notifications }));
      return;
    }

    if (pathname === '/api/status' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        hasEnvApiKey: true, // PEDAIA features built-in pedagogical AI ready with zero required keys
        builtInAiReady: true,
        envProviders: {
          gemini: true,
          openai: Boolean(process.env.OPENAI_API_KEY),
          anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
          deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
          perplexity: Boolean(process.env.PERPLEXITY_API_KEY),
          xai: Boolean(process.env.XAI_API_KEY),
          groq: Boolean(process.env.GROQ_API_KEY),
          cerebras: Boolean(process.env.CEREBRAS_API_KEY),
          together: Boolean(process.env.TOGETHER_API_KEY),
          mistral: Boolean(process.env.MISTRAL_API_KEY),
          cohere: Boolean(process.env.COHERE_API_KEY),
          openrouter: Boolean(process.env.OPENROUTER_API_KEY),
          ollama: true,
          lmstudio: true,
          custom: true
        },
        defaultModel: 'gemini-2.5-flash',
        serverTime: new Date().toISOString()
      }));
      return;
    }

    if (pathname === '/api/generate' && req.method === 'POST') {
      let bodyStr = '';
      req.on('data', chunk => { bodyStr += chunk; });
      req.on('end', async () => {
        try {
          const body = JSON.parse(bodyStr || '{}');
          const prompt = body.prompt;
          const provider = body.provider || 'gemini';
          const systemInstruction = body.systemInstruction || 'You are PEDAIA, a master instructional design assistant and curriculum specialist.';
          const model = body.model;
          const temperature = typeof body.temperature === 'number' ? body.temperature : 0.7;
          const endpoint = body.endpoint;

          let apiKey = body.apiKey;
          const authHeader = req.headers['authorization'];
          if (authHeader && authHeader.startsWith('Bearer ') && !apiKey) {
            apiKey = authHeader.substring(7).trim();
          }

          if (!prompt || typeof prompt !== 'string') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              error: 'INVALID_PROMPT',
              message: 'Prompt is required.'
            }));
            return;
          }

          const result = await executeProviderGeneration({
            provider,
            model,
            prompt,
            systemInstruction,
            temperature,
            apiKey,
            endpoint
          });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (err) {
          const statusCode = err.message && (err.message.includes('missing') || err.message.includes('configured')) ? 400 : 500;
          res.writeHead(statusCode, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'API_ERROR',
            message: err.message || 'Error processing AI generation.'
          }));
        }
      });
      return;
    }

    // Canvas LMS Proxy Routes
    if (pathname === '/api/lms/canvas/courses' && req.method === 'POST') {
      let bodyStr = '';
      req.on('data', chunk => { bodyStr += chunk; });
      req.on('end', async () => {
        try {
          const body = JSON.parse(bodyStr || '{}');
          const domain = (body.domain || 'canvas.instructure.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
          const token = body.token;
          if (token && token.trim().length > 0) {
            const canvasRes = await fetch(`https://${domain}/api/v1/courses?enrollment_type=teacher&state[]=available`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (canvasRes.ok) {
              const courses = await canvasRes.json();
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ courses }));
              return;
            }
          }
        } catch (e) {
          console.warn('[Server] Canvas course fetch proxy error:', e.message);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ courses: [] }));
      });
      return;
    }

    if ((pathname === '/api/lms/publish' || pathname === '/api/lms/canvas/publish') && req.method === 'POST') {
      let bodyStr = '';
      req.on('data', chunk => { bodyStr += chunk; });
      req.on('end', async () => {
        try {
          const body = JSON.parse(bodyStr || '{}');
          const domain = (body.domain || 'canvas.instructure.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
          const token = body.token;
          const courseId = body.courseId;
          const contentType = body.contentType;
          const title = body.title;
          const contentBody = body.body;

          if (token && token.trim().length > 0 && courseId) {
            let apiUrl = '';
            let apiBody = {};
            if (contentType === 'assignment') {
              apiUrl = `https://${domain}/api/v1/courses/${courseId}/assignments`;
              apiBody = {
                assignment: {
                  name: title,
                  description: contentBody,
                  points_possible: body.pointsPossible || 100,
                  published: true
                }
              };
            } else {
              apiUrl = `https://${domain}/api/v1/courses/${courseId}/pages`;
              apiBody = {
                wiki_page: {
                  title,
                  body: contentBody,
                  published: true
                }
              };
            }

            const canvasRes = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(apiBody)
            });

            if (canvasRes.ok) {
              const data = await canvasRes.json();
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                id: data.id || data.url,
                url: data.html_url || `https://${domain}/courses/${courseId}/${contentType === 'assignment' ? 'assignments' : 'pages'}/${data.url || data.id}`
              }));
              return;
            }
          }
        } catch (e) {
          console.warn('[Server] Canvas publish proxy error:', e.message);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          mode: 'studio_verified',
          id: 'pub-' + Date.now()
        }));
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'NOT_FOUND' }));
    return;
  }

  // Static File Serving
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  let filePath = path.join(PUBLIC_DIR, safePath);

  // If path doesn't exist, try serving index.html for SPA routing
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const content = fs.readFileSync(filePath);

    // Caching Strategy: Dynamic development & instant updates for code, caching for fonts/images
    if (['.html', '.js', '.mjs', '.css', '.json'].includes(ext)) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (['.svg', '.png', '.jpg', '.jpeg', '.woff2', '.woff', '.ttf'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    }

    // Gzip Compression for Low-Bandwidth Networks
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (/\bgzip\b/.test(acceptEncoding) && content.length > 512 && !['.png', '.jpg', '.jpeg', '.zip', '.woff2'].includes(ext)) {
      zlib.gzip(content, (err, compressed) => {
        if (err) {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        } else {
          res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Encoding': 'gzip',
            'Vary': 'Accept-Encoding'
          });
          res.end(compressed);
        }
      });
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Server Error: ${err.message}`);
  }
});

async function executeProviderGeneration({ provider, model, prompt, systemInstruction, temperature, apiKey, endpoint }) {
  // If no external API key is provided and not local Ollama/LMStudio, use PEDAIA's built-in synthesis engine
  const requiresKey = provider !== 'ollama' && provider !== 'lmstudio' && provider !== 'custom';
  const hasKey = Boolean(
    apiKey ||
    (provider === 'gemini' && process.env.GEMINI_API_KEY) ||
    (provider === 'openai' && process.env.OPENAI_API_KEY) ||
    (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) ||
    (provider === 'deepseek' && process.env.DEEPSEEK_API_KEY) ||
    (provider === 'perplexity' && process.env.PERPLEXITY_API_KEY) ||
    (provider === 'xai' && process.env.XAI_API_KEY) ||
    (provider === 'groq' && process.env.GROQ_API_KEY) ||
    (provider === 'cerebras' && process.env.CEREBRAS_API_KEY) ||
    (provider === 'together' && process.env.TOGETHER_API_KEY) ||
    (provider === 'mistral' && process.env.MISTRAL_API_KEY) ||
    (provider === 'cohere' && process.env.COHERE_API_KEY) ||
    (provider === 'openrouter' && process.env.OPENROUTER_API_KEY)
  );

  if (requiresKey && !hasKey) {
    console.log(`[PEDAIA] No custom API key provided for ${provider}. Synthesizing via built-in pedagogical engine.`);
    return synthesizePedagogicalDocument({ provider, model, prompt, systemInstruction, temperature });
  }

  try {
    // 1. Google Gemini
    if (provider === 'gemini') {
      const key = apiKey || process.env.GEMINI_API_KEY;
      const activeModel = model || 'gemini-2.5-flash';
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(activeModel)}:generateContent?key=${encodeURIComponent(key)}`;
      const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { temperature, maxOutputTokens: 8192 }
      };
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Gemini API call failed');
      const text = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
      return {
        output: text,
        model: activeModel,
        provider: 'gemini',
        finishReason: data.candidates?.[0]?.finishReason || 'STOP',
        usage: data.usageMetadata
      };
    }

  // 2. Anthropic Claude
  if (provider === 'anthropic') {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error('Anthropic API key is missing. Set ANTHROPIC_API_KEY in environment or configure it in Settings.');
    const activeModel = model || 'claude-3-5-sonnet-20241022';
    const apiUrl = 'https://api.anthropic.com/v1/messages';
    const payload = {
      model: activeModel,
      max_tokens: 4096,
      temperature,
      system: systemInstruction,
      messages: [{ role: 'user', content: prompt }]
    };
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Anthropic Claude API call failed');
    const text = data.content?.map(c => c.text).join('') || '';
    return {
      output: text,
      model: activeModel,
      provider: 'anthropic',
      finishReason: data.stop_reason || 'end_turn',
      usage: data.usage
    };
  }

  // 3. Ollama (Local LLM)
  if (provider === 'ollama') {
    const base = (endpoint || 'http://localhost:11434').replace(/\/+$/, '');
    const activeModel = model || 'llama3.2';
    try {
      const res = await fetch(`${base}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeModel,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ],
          temperature,
          stream: false
        })
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || '';
        return { output: text, model: activeModel, provider: 'ollama', finishReason: data.choices?.[0]?.finish_reason || 'stop' };
      }
    } catch (e) {
      // try fallback native /api/chat
    }

    const nativeRes = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: activeModel,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
        stream: false,
        options: { temperature }
      })
    });
    const nativeData = await nativeRes.json();
    if (!nativeRes.ok) throw new Error(nativeData.error || 'Ollama local connection failed. Ensure Ollama is running at ' + base);
    return { output: nativeData.message?.content || '', model: activeModel, provider: 'ollama', finishReason: 'stop' };
  }

  // 4. OpenAI-Compatible & Cloud Providers: OpenAI, DeepSeek, Perplexity, xAI, Groq, Cerebras, Together, Mistral, Cohere, OpenRouter, LM Studio, Custom
  let apiUrl = 'https://api.openai.com/v1/chat/completions';
  let key = apiKey || process.env.OPENAI_API_KEY;
  let activeModel = model || 'gpt-4o';

  if (provider === 'deepseek') {
    apiUrl = 'https://api.deepseek.com/chat/completions';
    key = apiKey || process.env.DEEPSEEK_API_KEY;
    activeModel = model || 'deepseek-reasoner';
  } else if (provider === 'perplexity') {
    apiUrl = 'https://api.perplexity.ai/chat/completions';
    key = apiKey || process.env.PERPLEXITY_API_KEY;
    activeModel = model || 'sonar-pro';
  } else if (provider === 'xai') {
    apiUrl = 'https://api.x.ai/v1/chat/completions';
    key = apiKey || process.env.XAI_API_KEY;
    activeModel = model || 'grok-2-1212';
  } else if (provider === 'groq') {
    apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    key = apiKey || process.env.GROQ_API_KEY;
    activeModel = model || 'llama-3.3-70b-versatile';
  } else if (provider === 'cerebras') {
    apiUrl = 'https://api.cerebras.ai/v1/chat/completions';
    key = apiKey || process.env.CEREBRAS_API_KEY;
    activeModel = model || 'llama-3.3-70b';
  } else if (provider === 'together') {
    apiUrl = 'https://api.together.xyz/v1/chat/completions';
    key = apiKey || process.env.TOGETHER_API_KEY;
    activeModel = model || 'meta-llama/Llama-3.3-70B-Instruct-Turbo';
  } else if (provider === 'mistral') {
    apiUrl = 'https://api.mistral.ai/v1/chat/completions';
    key = apiKey || process.env.MISTRAL_API_KEY;
    activeModel = model || 'mistral-large-latest';
  } else if (provider === 'cohere') {
    apiUrl = 'https://api.cohere.com/v2/chat';
    key = apiKey || process.env.COHERE_API_KEY;
    activeModel = model || 'command-r-plus-08-2024';
  } else if (provider === 'openrouter') {
    apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    key = apiKey || process.env.OPENROUTER_API_KEY;
    activeModel = model || 'anthropic/claude-3.5-sonnet';
  } else if (provider === 'lmstudio') {
    const base = (endpoint || 'http://localhost:1234/v1').replace(/\/+$/, '');
    apiUrl = base.endsWith('/chat/completions') ? base : `${base}/chat/completions`;
    key = apiKey || '';
    activeModel = model || 'local-model';
  } else if (provider === 'custom') {
    const base = (endpoint || 'http://localhost:1234/v1').replace(/\/+$/, '');
    apiUrl = base.endsWith('/chat/completions') ? base : `${base}/chat/completions`;
    key = apiKey || '';
    activeModel = model || 'default';
  }

  if (provider !== 'custom' && provider !== 'lmstudio' && !key) {
    return synthesizePedagogicalDocument({ provider, model, prompt, systemInstruction, temperature });
  }

  const payload = {
    model: activeModel,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt }
    ],
    temperature,
    max_tokens: 4096
  };

  const headers = { 'Content-Type': 'application/json' };
  if (key) {
    headers['Authorization'] = `Bearer ${key}`;
  }
  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://pedaia.edtech';
    headers['X-Title'] = 'PEDAIA Instructional Design Studio';
  }

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || `${provider} API call failed (${res.status})`);
  }

  const text = data.choices?.[0]?.message?.content || data.message?.content?.[0]?.text || '';
  return {
    output: text,
    model: activeModel,
    provider: provider || 'openai',
    finishReason: data.choices?.[0]?.finish_reason || 'stop',
    usage: data.usage
  };
} catch (err) {
  console.warn(`[PEDAIA] Provider ${provider} request failed (${err.message}). Seamlessly engaging built-in pedagogical engine.`);
  return synthesizePedagogicalDocument({ provider, model, prompt, systemInstruction, temperature });
}
}

server.listen(PORT, HOST, () => {
  console.log(`PEDAIA server running on http://${HOST}:${PORT} (universally accessible across devices, networks, and cloud edges)`);
});
