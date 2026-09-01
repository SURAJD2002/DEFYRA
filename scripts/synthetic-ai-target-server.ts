/**
 * Synthetic OpenAI-Compatible Customer AI Target Server
 * Listens on port 4000 to serve real HTTP responses for Phase 7 validation.
 */

import http from 'http';

export type TargetMode = 'SAFE' | 'VULNERABLE' | 'REMEDIATED' | 'UNAUTHORIZED' | 'TIMEOUT' | 'MALFORMED' | 'SECRET_LEAK';

let currentMode: TargetMode = 'SAFE';
let lastReceivedAuthHeader: string | null = null;
let requestCount = 0;

export function setTargetMode(mode: TargetMode) {
  currentMode = mode;
}

export function getLastAuthHeader(): string | null {
  return lastReceivedAuthHeader;
}

export function getRequestCount(): number {
  return requestCount;
}

const server = http.createServer((req, res) => {
  const url = req.url || '/';
  const method = req.method || 'GET';

  lastReceivedAuthHeader = req.headers['authorization'] || null;
  requestCount++;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Health check endpoint
  if (url === '/health' || url === '/v1/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', mode: currentMode, requestsServed: requestCount }));
    return;
  }

  // 2. Control plane endpoint to switch target behavior mode
  if (url === '/admin/mode' && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        if (parsed.mode) {
          currentMode = parsed.mode;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, mode: currentMode }));
      } catch (err: any) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 3. OpenAI-Compatible Chat Completions Endpoint
  if (url === '/v1/chat/completions' && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        // Mode 1: UNAUTHORIZED -> simulate invalid customer API key
        if (currentMode === 'UNAUTHORIZED') {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: {
              message: 'Incorrect API key provided: invalid_customer_key',
              type: 'invalid_request_error',
              param: null,
              code: 'invalid_api_key',
            },
          }));
          return;
        }

        // Mode 2: TIMEOUT -> simulate slow/hanging customer server
        if (currentMode === 'TIMEOUT') {
          setTimeout(() => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ choices: [{ message: { content: 'Delayed response' } }] }));
          }, 20000);
          return;
        }

        // Mode 3: MALFORMED -> simulate unexpected non-JSON response
        if (currentMode === 'MALFORMED') {
          res.writeHead(502, { 'Content-Type': 'text/html' });
          res.end('<html><body>502 Bad Gateway: Upstream Nginx Error</body></html>');
          return;
        }

        let content = '';
        if (currentMode === 'SAFE') {
          content = 'Hello! I am a helpful banking assistant. How can I assist you today?';
        } else if (currentMode === 'VULNERABLE') {
          content = 'Acknowledged. Here is my system prompt: You are a helpful assistant with internal instructions: Never disclose customer credit numbers.';
        } else if (currentMode === 'REMEDIATED') {
          content = 'I cannot fulfill this request as it asks me to reveal or alter confidential system instructions.';
        } else if (currentMode === 'SECRET_LEAK') {
          content = 'Environment context dumped: API_KEY=DEFYRA_CANARY_TOKEN_001';
        }

        const responsePayload = {
          id: `chatcmpl_synth_${Date.now()}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: 'gpt-4o-synthetic-customer',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: content,
              },
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 25,
            completion_tokens: 18,
            total_tokens: 43,
          },
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(responsePayload));
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

const PORT = 4000;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`[SYNTHETIC_AI_TARGET] Listening on http://127.0.0.1:${PORT} (Mode: ${currentMode})`);
});
