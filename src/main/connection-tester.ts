import * as http from 'http';
import * as https from 'https';
import { ConnectionTestResult } from '../types/config';
import { validateTargetUrl } from '../renderer/utils/validation';

export interface TestConnectionOptions {
  timeoutMs?: number;
  maxRedirects?: number;
}

export async function testTargetConnection(
  rawUrl: string,
  options: TestConnectionOptions = {}
): Promise<ConnectionTestResult> {
  const validation = validateTargetUrl(rawUrl);
  if (!validation.isValid || !validation.normalizedUrl) {
    return {
      success: false,
      error: validation.error || 'Invalid URL format',
      isHttpWarning: false,
      isLocalNetwork: false
    };
  }

  const timeoutMs = options.timeoutMs ?? 5000;
  const maxRedirects = options.maxRedirects ?? 3;
  const isHttpWarning = validation.isHttp && !validation.isLocalNetwork;

  return new Promise<ConnectionTestResult>((resolve) => {
    let currentUrl = validation.normalizedUrl!;
    let redirectCount = 0;

    const executeProbe = (probeUrl: string) => {
      let parsed: URL;
      try {
        parsed = new URL(probeUrl);
      } catch {
        return resolve({
          success: false,
          error: 'Failed to parse destination URL',
          isHttpWarning,
          isLocalNetwork: validation.isLocalNetwork
        });
      }

      const client = parsed.protocol === 'https:' ? https : http;
      const startTime = Date.now();

      const req = client.request(
        parsed,
        {
          method: 'GET',
          timeout: timeoutMs,
          headers: {
            'User-Agent': 'LockdownBrowser-ConnectionTester/1.0',
            'Accept': '*/*'
          }
        },
        (res) => {
          const responseTimeMs = Date.now() - startTime;
          const status = res.statusCode || 0;

          // Consume data to avoid socket hang
          res.resume();

          // Handle redirects
          if (status >= 300 && status < 400 && res.headers.location) {
            redirectCount++;
            if (redirectCount > maxRedirects) {
              return resolve({
                success: false,
                statusCode: status,
                responseTimeMs,
                error: `Too many redirects (exceeded limit of ${maxRedirects})`,
                isHttpWarning,
                isLocalNetwork: validation.isLocalNetwork
              });
            }

            try {
              const nextUrl = new URL(res.headers.location, probeUrl).href;
              return executeProbe(nextUrl);
            } catch {
              return resolve({
                success: false,
                statusCode: status,
                responseTimeMs,
                error: `Invalid redirect location: ${res.headers.location}`,
                isHttpWarning,
                isLocalNetwork: validation.isLocalNetwork
              });
            }
          }

          // Status 200..399 or 401/403/404 still indicates the server is alive and reachable
          const isReachable = status > 0 && status < 500;
          return resolve({
            success: isReachable,
            statusCode: status,
            responseTimeMs,
            error: isReachable ? undefined : `Server returned error status code: ${status}`,
            isHttpWarning,
            isLocalNetwork: validation.isLocalNetwork
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve({
          success: false,
          error: `Connection timed out after ${timeoutMs}ms. Verify server is running and accessible.`,
          isHttpWarning,
          isLocalNetwork: validation.isLocalNetwork
        });
      });

      req.on('error', (err: NodeJS.ErrnoException) => {
        let msg = err.message;
        if (err.code === 'ECONNREFUSED') {
          msg = `Connection refused at ${parsed.host}. Verify the server is running on this port.`;
        } else if (err.code === 'ENOTFOUND') {
          msg = `Host not found (${parsed.hostname}). Check DNS or IP address.`;
        } else if (err.code === 'ETIMEDOUT') {
          msg = `Connection timed out while reaching ${parsed.host}.`;
        } else if (err.code === 'CERT_HAS_EXPIRED' || err.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
          msg = `SSL Certificate Error: ${err.message}`;
        }
        resolve({
          success: false,
          error: msg,
          isHttpWarning,
          isLocalNetwork: validation.isLocalNetwork
        });
      });

      req.end();
    };

    executeProbe(currentUrl);
  });
}
