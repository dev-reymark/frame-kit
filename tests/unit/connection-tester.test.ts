import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as http from 'http';
import { testTargetConnection } from '../../src/main/connection-tester';

describe('Connection Tester', () => {
  let server: http.Server;
  let serverPort: number;

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      if (req.url === '/redirect') {
        res.writeHead(302, { Location: '/destination' });
        res.end();
      } else if (req.url === '/destination' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
      } else if (req.url === '/error500') {
        res.writeHead(500);
        res.end('Server Error');
      }
    });

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address() as { port: number };
        serverPort = addr.port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('successfully probes a reachable local HTTP server and measures latency', async () => {
    const res = await testTargetConnection(`http://127.0.0.1:${serverPort}/`);
    expect(res.success).toBe(true);
    expect(res.statusCode).toBe(200);
    expect(res.responseTimeMs).toBeDefined();
    expect(res.responseTimeMs).toBeGreaterThanOrEqual(0);
    expect(res.isLocalNetwork).toBe(true);
  });

  it('follows safe redirects to destination', async () => {
    const res = await testTargetConnection(`http://127.0.0.1:${serverPort}/redirect`);
    expect(res.success).toBe(true);
    expect(res.statusCode).toBe(200);
  });

  it('detects unreachable server on an unused port (ECONNREFUSED)', async () => {
    // Pick an unused port, e.g. 59871
    const res = await testTargetConnection('http://127.0.0.1:59871', { timeoutMs: 1000 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('Connection refused');
  });

  it('rejects invalid URL without crashing', async () => {
    const res = await testTargetConnection('invalid-url-format');
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});
