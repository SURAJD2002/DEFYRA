import { promises as dnsPromises } from 'dns';

export interface CanonicalUrlResult {
  valid: boolean;
  canonicalUrl?: string;
  hostname?: string;
  port?: number;
  protocol?: string;
  error?: string;
  code?: 'INVALID_SCHEME' | 'USERINFO_PROHIBITED' | 'INVALID_HOST' | 'PROHIBITED_IP' | 'MALFORMED_URL';
}

export type DNSResolverFn = (hostname: string) => Promise<string[]>;

/**
 * Checks if a string is a standard or non-standard numeric representation of IPv4.
 * Handles Decimal integers (2130706433), Octal (0177.0.0.1), Hex (0x7f000001), and standard dotted quad.
 */
export function parseIPv4Representation(host: string): { isIPv4: boolean; normalized?: string; rawNum?: number } {
  const cleanHost = host.trim().replace(/^\[|\]$/g, '');

  // 1. Single integer/decimal IP (e.g. 2130706433)
  if (/^\d+$/.test(cleanHost)) {
    const num = parseInt(cleanHost, 10);
    if (num >= 0 && num <= 4294967295) {
      const p1 = (num >>> 24) & 255;
      const p2 = (num >>> 16) & 255;
      const p3 = (num >>> 8) & 255;
      const p4 = num & 255;
      return { isIPv4: true, normalized: `${p1}.${p2}.${p3}.${p4}`, rawNum: num };
    }
  }

  // 2. Single Hex integer (e.g. 0x7f000001)
  if (/^0x[0-9a-fA-F]+$/i.test(cleanHost)) {
    const num = parseInt(cleanHost, 16);
    if (num >= 0 && num <= 4294967295) {
      const p1 = (num >>> 24) & 255;
      const p2 = (num >>> 16) & 255;
      const p3 = (num >>> 8) & 255;
      const p4 = num & 255;
      return { isIPv4: true, normalized: `${p1}.${p2}.${p3}.${p4}`, rawNum: num };
    }
  }

  // 3. Multi-part Dotted Quad with possible Hex/Octal parts (e.g. 0177.0.0.1 or 0x7f.0.0.1)
  const parts = cleanHost.split('.');
  if (parts.length === 4) {
    const parsedOctets: number[] = [];
    for (const part of parts) {
      if (/^0x[0-9a-fA-F]+$/i.test(part)) {
        parsedOctets.push(parseInt(part, 16));
      } else if (/^0[0-7]+$/.test(part)) {
        parsedOctets.push(parseInt(part, 8));
      } else if (/^\d+$/.test(part)) {
        parsedOctets.push(parseInt(part, 10));
      } else {
        return { isIPv4: false };
      }
    }

    if (parsedOctets.every((o) => o >= 0 && o <= 255)) {
      const num = ((parsedOctets[0] << 24) | (parsedOctets[1] << 16) | (parsedOctets[2] << 8) | parsedOctets[3]) >>> 0;
      return { isIPv4: true, normalized: parsedOctets.join('.'), rawNum: num };
    }
  }

  return { isIPv4: false };
}

/**
 * Checks if a host is IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1 or ::ffff:7f00:1).
 */
export function parseIPv4MappedIPv6(host: string): { isMapped: boolean; embeddedIPv4?: string } {
  const clean = host.toLowerCase().replace(/^\[|\]$/g, '');
  if (clean.startsWith('::ffff:')) {
    const rest = clean.substring(7);
    const ipv4 = parseIPv4Representation(rest);
    if (ipv4.isIPv4 && ipv4.normalized) {
      return { isMapped: true, embeddedIPv4: ipv4.normalized };
    }
  }
  return { isMapped: false };
}

/**
 * Evaluates whether an IP address belongs to loopback, private RFC 1918, link-local, cloud metadata, or reserved ranges.
 */
export function isProhibitedIP(ipStr: string): { prohibited: boolean; reason?: string } {
  const clean = ipStr.trim().replace(/^\[|\]$/g, '');

  // 1. Check IPv4-mapped IPv6
  const mapped = parseIPv4MappedIPv6(clean);
  if (mapped.isMapped && mapped.embeddedIPv4) {
    return isProhibitedIP(mapped.embeddedIPv4);
  }

  // 2. Check IPv4 representations
  const ipv4 = parseIPv4Representation(clean);
  if (ipv4.isIPv4 && ipv4.normalized && ipv4.rawNum !== undefined) {
    const [p1, p2, p3, p4] = ipv4.normalized.split('.').map(Number);

    // 0.0.0.0/8 (Current network)
    if (p1 === 0) return { prohibited: true, reason: 'RFC 1122 Current Network (0.0.0.0/8) is prohibited.' };
    // 10.0.0.0/8 (Private Class A)
    if (p1 === 10) return { prohibited: true, reason: 'RFC 1918 Private Network (10.0.0.0/8) is prohibited.' };
    // 100.64.0.0/10 (Shared Address Space / CGNAT)
    if (p1 === 100 && p2 >= 64 && p2 <= 127) return { prohibited: true, reason: 'RFC 6598 Shared Address Space (100.64.0.0/10) is prohibited.' };
    // 127.0.0.0/8 (Loopback)
    if (p1 === 127) return { prohibited: true, reason: 'Loopback Range (127.0.0.0/8) is prohibited.' };
    // 169.254.0.0/16 (Link-local & AWS/GCP/Azure Metadata)
    if (p1 === 169 && p2 === 254) return { prohibited: true, reason: 'Link-Local / Cloud Metadata (169.254.0.0/16) is prohibited.' };
    // 172.16.0.0/12 (Private Class B)
    if (p1 === 172 && p2 >= 16 && p2 <= 31) return { prohibited: true, reason: 'RFC 1918 Private Network (172.16.0.0/12) is prohibited.' };
    // 192.0.0.0/24 (IETF Protocol Assignments)
    if (p1 === 192 && p2 === 0 && p3 === 0) return { prohibited: true, reason: 'RFC 6890 IETF Protocol Assignments (192.0.0.0/24) is prohibited.' };
    // 192.0.2.0/24 (TEST-NET-1)
    if (p1 === 192 && p2 === 0 && p3 === 2) return { prohibited: true, reason: 'RFC 5737 TEST-NET-1 is prohibited.' };
    // 192.168.0.0/16 (Private Class C)
    if (p1 === 192 && p2 === 168) return { prohibited: true, reason: 'RFC 1918 Private Network (192.168.0.0/16) is prohibited.' };
    // 198.18.0.0/15 (Benchmarking)
    if (p1 === 198 && (p2 === 18 || p2 === 19)) return { prohibited: true, reason: 'RFC 2544 Benchmarking is prohibited.' };
    // 198.51.100.0/24 (TEST-NET-2)
    if (p1 === 198 && p2 === 51 && p3 === 100) return { prohibited: true, reason: 'RFC 5737 TEST-NET-2 is prohibited.' };
    // 203.0.113.0/24 (TEST-NET-3)
    if (p1 === 203 && p2 === 0 && p3 === 113) return { prohibited: true, reason: 'RFC 5737 TEST-NET-3 is prohibited.' };
    // 224.0.0.0/4 (Multicast)
    if (p1 >= 224 && p1 <= 239) return { prohibited: true, reason: 'RFC 5771 Multicast is prohibited.' };
    // 240.0.0.0/4 (Reserved / Future Use / Class E)
    if (p1 >= 240) return { prohibited: true, reason: 'RFC 1112 Reserved Range (240.0.0.0/4) is prohibited.' };

    return { prohibited: false };
  }

  // 3. Check IPv6 ranges
  const lowerV6 = clean.toLowerCase();
  if (lowerV6 === '::' || lowerV6 === '0:0:0:0:0:0:0:0') {
    return { prohibited: true, reason: 'IPv6 Unspecified address (::/128) is prohibited.' };
  }
  if (lowerV6 === '::1' || lowerV6 === '0:0:0:0:0:0:0:1') {
    return { prohibited: true, reason: 'IPv6 Loopback address (::1/128) is prohibited.' };
  }
  // Unique Local Address fc00::/7 (fc00:: - fdff::)
  if (lowerV6.startsWith('fc') || lowerV6.startsWith('fd')) {
    return { prohibited: true, reason: 'RFC 4193 IPv6 Unique Local Address (fc00::/7) is prohibited.' };
  }
  // Link-Local fe80::/10
  if (lowerV6.startsWith('fe8') || lowerV6.startsWith('fe9') || lowerV6.startsWith('fea') || lowerV6.startsWith('feb')) {
    return { prohibited: true, reason: 'RFC 4291 IPv6 Link-Local Address (fe80::/10) is prohibited.' };
  }
  // Multicast ff00::/8
  if (lowerV6.startsWith('ff')) {
    return { prohibited: true, reason: 'RFC 4291 IPv6 Multicast Address (ff00::/8) is prohibited.' };
  }
  // Documentation 2001:db8::/32
  if (lowerV6.startsWith('2001:db8') || lowerV6.startsWith('2001:0db8')) {
    return { prohibited: true, reason: 'RFC 3849 IPv6 Documentation Prefix is prohibited.' };
  }

  return { prohibited: false };
}

const PROHIBITED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  'instance-data',
  'kubernetes.default',
  'kubernetes.default.svc',
]);

/**
 * Normalizes URL and performs canonical validation against SSRF bypass techniques.
 */
export function canonicalizeAndValidateUrl(rawUrl: string): CanonicalUrlResult {
  try {
    if (!rawUrl || typeof rawUrl !== 'string') {
      return { valid: false, error: 'Target URL is missing or invalid.', code: 'MALFORMED_URL' };
    }

    const trimmed = rawUrl.trim();

    // Check for userinfo bypass (e.g. https://user:pass@evil.com or https://user@evil.com)
    const userinfoMatch = trimmed.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^@/\s]+@/);
    if (userinfoMatch) {
      return {
        valid: false,
        error: 'Security Guardrail: Userinfo (credentials in URL) is strictly prohibited.',
        code: 'USERINFO_PROHIBITED',
      };
    }

    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();

    if (!['https:', 'http:', 'wss:', 'ws:', 'mcp:'].includes(protocol)) {
      return {
        valid: false,
        error: `Protocol '${protocol}' is not allowed for security test execution.`,
        code: 'INVALID_SCHEME',
      };
    }

    // Strip trailing dots from hostname (e.g. "example.com." -> "example.com")
    let hostname = parsed.hostname.toLowerCase().replace(/\.+$/, '');

    // Prohibited named hostnames
    if (PROHIBITED_HOSTNAMES.has(hostname) || hostname.endsWith('.internal.corp') || hostname.endsWith('.local')) {
      return {
        valid: false,
        error: `Host '${hostname}' is disallowed (internal/loopback/cloud-metadata).`,
        code: 'INVALID_HOST',
      };
    }

    // Check numerical / IPv4 / IPv6 representations in host
    const ipCheck = isProhibitedIP(hostname);
    if (ipCheck.prohibited) {
      return {
        valid: false,
        error: `Security Guardrail: ${ipCheck.reason}`,
        code: 'PROHIBITED_IP',
      };
    }

    const port = parsed.port ? parseInt(parsed.port, 10) : protocol === 'https:' || protocol === 'wss:' ? 443 : 80;

    const canonicalUrl = `${protocol}//${hostname}${parsed.port ? `:${parsed.port}` : ''}${parsed.pathname || '/'}${parsed.search || ''}`;

    return {
      valid: true,
      canonicalUrl,
      hostname,
      port,
      protocol,
    };
  } catch (err) {
    return { valid: false, error: 'Malformed URL structure', code: 'MALFORMED_URL' };
  }
}

/**
 * Resolves DNS for the hostname and validates EVERY returned IP against prohibited ranges (DNS Rebinding Defense).
 */
export async function resolveAndValidateTargetIPs(
  hostname: string,
  dnsResolver?: DNSResolverFn
): Promise<{ valid: boolean; resolvedIPs: string[]; error?: string }> {
  try {
    // If hostname is already an IP, check directly
    const directIP = parseIPv4Representation(hostname);
    if (directIP.isIPv4 && directIP.normalized) {
      const check = isProhibitedIP(directIP.normalized);
      if (check.prohibited) {
        return { valid: false, resolvedIPs: [directIP.normalized], error: check.reason };
      }
      return { valid: true, resolvedIPs: [directIP.normalized] };
    }

    const resolver =
      dnsResolver ||
      (async (host: string) => {
        try {
          const results = await dnsPromises.lookup(host, { all: true });
          return results.map((r) => r.address);
        } catch {
          return [];
        }
      });

    const ips = await resolver(hostname);
    if (!ips || ips.length === 0) {
      return { valid: false, resolvedIPs: [], error: `DNS resolution failed for host '${hostname}'.` };
    }

    for (const ip of ips) {
      const check = isProhibitedIP(ip);
      if (check.prohibited) {
        return {
          valid: false,
          resolvedIPs: ips,
          error: `DNS Rebinding / SSRF Defense: Host '${hostname}' resolved to prohibited IP '${ip}': ${check.reason}`,
        };
      }
    }

    return { valid: true, resolvedIPs: ips };
  } catch (err: any) {
    return { valid: false, resolvedIPs: [], error: `DNS lookup error for host '${hostname}': ${err?.message || 'failed'}` };
  }
}

export interface SafeFetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  maxRedirects?: number;
  timeoutMs?: number;
  maxResponseSizeBytes?: number;
  dnsResolver?: DNSResolverFn;
}

export interface SafeFetchResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  bodyText: string;
  finalUrl: string;
  redirectCount: number;
}

/**
 * Executes a hardened outbound HTTP fetch with step-by-step redirect validation,
 * DNS rebinding checks on every hop, and strict timeout/size boundaries.
 */
export async function safeEgressFetch(
  targetUrl: string,
  options: SafeFetchOptions = {}
): Promise<SafeFetchResponse> {
  const maxRedirects = options.maxRedirects ?? 3;
  const timeoutMs = options.timeoutMs ?? 15000;
  const maxBytes = options.maxResponseSizeBytes ?? 5 * 1024 * 1024; // 5 MB max

  let currentUrl = targetUrl;
  let redirectCount = 0;

  while (redirectCount <= maxRedirects) {
    // 1. Canonicalize & Validate URL
    const canonical = canonicalizeAndValidateUrl(currentUrl);
    if (!canonical.valid || !canonical.hostname) {
      throw new Error(`SSRF Guard: Disallowed URL (${canonical.error})`);
    }

    // 2. DNS Rebinding & IP Range Validation
    const dnsCheck = await resolveAndValidateTargetIPs(canonical.hostname, options.dnsResolver);
    if (!dnsCheck.valid) {
      throw new Error(`SSRF Guard: Target DNS validation failed (${dnsCheck.error})`);
    }

    // 3. Step-by-step fetch with manual redirect handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(canonical.canonicalUrl!, {
        method: options.method || 'GET',
        headers: options.headers || {},
        body: options.body,
        redirect: 'manual', // Never follow redirects automatically
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Check for 3xx redirect
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location');
        if (!location) {
          throw new Error('Redirect response missing Location header');
        }

        redirectCount++;
        if (redirectCount > maxRedirects) {
          throw new Error(`Exceeded maximum allowed redirects (${maxRedirects})`);
        }

        // Resolve relative redirects against current URL
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }

      // Read response with size limit
      const text = await res.text();
      if (Buffer.byteLength(text, 'utf8') > maxBytes) {
        throw new Error(`Response payload exceeded safe limit of ${maxBytes} bytes`);
      }

      const headers: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        headers[key] = val;
      });

      return {
        status: res.status,
        statusText: res.statusText,
        headers,
        bodyText: text,
        finalUrl: currentUrl,
        redirectCount,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  throw new Error(`Exceeded maximum allowed redirects (${maxRedirects})`);
}
