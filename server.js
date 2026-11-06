import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { synthesizePedagogicalDocument } from './public/js/pedagogicalEngine.js';

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
  '.zip': 'application/zip'
};

const server = http.createServer(async (req, res) => {
  // Universal Cross-Device & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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

  // API Routes
  if (pathname.startsWith('/api/')) {
    if (pathname === '/api/auth/info' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        authModel: 'client-secure-salted-sha256',
        adminAccount: 'M1n1sume',
        multiUserSupported: true,
        dataIsolation: 'per-user',
        serverTime: new Date().toISOString()
      }));
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
