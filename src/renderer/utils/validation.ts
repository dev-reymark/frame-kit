export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
  origin?: string;
  isHttp: boolean;
  isLocalNetwork: boolean;
  warning?: string;
}

export function isLocalOrPrivateIp(hostname: string): boolean {
  const host = hostname.toLowerCase().trim();

  // Localhost
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '[::1]') {
    return true;
  }

  // .local mDNS
  if (host.endsWith('.local')) {
    return true;
  }

  // IPv4 regex check
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = host.match(ipv4Regex);
  if (match) {
    const octets = match.slice(1, 5).map(Number);
    if (octets.some(o => o < 0 || o > 255)) {
      return false;
    }
    // 10.0.0.0 - 10.255.255.255
    if (octets[0] === 10) return true;
    // 172.16.0.0 - 172.31.255.255
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
    // 192.168.0.0 - 192.168.255.255
    if (octets[0] === 192 && octets[1] === 168) return true;
    // 127.0.0.0/8 loopback
    if (octets[0] === 127) return true;
    // 169.254.0.0/16 link-local
    if (octets[0] === 169 && octets[1] === 254) return true;
  }

  return false;
}

export function validateTargetUrl(rawUrl: string): UrlValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim().length === 0) {
    return {
      isValid: false,
      error: 'Website URL is required.',
      isHttp: false,
      isLocalNetwork: false
    };
  }

  const trimmed = rawUrl.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format. Example: http://localhost:3000 or https://pos.example.com',
      isHttp: false,
      isLocalNetwork: false
    };
  }

  // Protocol check: Only http: and https: allowed
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      isValid: false,
      error: `Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.`,
      isHttp: false,
      isLocalNetwork: false
    };
  }

  // Hostname check
  if (!parsed.hostname || parsed.hostname.length === 0) {
    return {
      isValid: false,
      error: 'URL must contain a valid hostname or IP address.',
      isHttp: parsed.protocol === 'http:',
      isLocalNetwork: false
    };
  }

  const isHttp = parsed.protocol === 'http:';
  const isLocalNetwork = isLocalOrPrivateIp(parsed.hostname);

  let warning: string | undefined;
  if (isHttp && !isLocalNetwork) {
    warning = 'Warning: Plain HTTP is unencrypted. HTTPS is strongly recommended for public domains.';
  } else if (isHttp && isLocalNetwork) {
    warning = 'Unencrypted HTTP on trusted local/LAN network.';
  }

  return {
    isValid: true,
    normalizedUrl: parsed.href,
    origin: parsed.origin,
    isHttp,
    isLocalNetwork,
    warning
  };
}
