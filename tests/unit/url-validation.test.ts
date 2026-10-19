import { describe, it, expect } from 'vitest';
import { validateTargetUrl, isLocalOrPrivateIp } from '../../src/renderer/utils/validation';

describe('URL Validation & Classification', () => {
  it('validates http://localhost:3000', () => {
    const res = validateTargetUrl('http://localhost:3000');
    expect(res.isValid).toBe(true);
    expect(res.isLocalNetwork).toBe(true);
    expect(res.isHttp).toBe(true);
    expect(res.origin).toBe('http://localhost:3000');
    expect(res.warning).toContain('local/LAN');
  });

  it('validates http://127.0.0.1:3000', () => {
    const res = validateTargetUrl('http://127.0.0.1:3000');
    expect(res.isValid).toBe(true);
    expect(res.isLocalNetwork).toBe(true);
    expect(res.isHttp).toBe(true);
    expect(res.origin).toBe('http://127.0.0.1:3000');
  });

  it('validates LAN IP: http://192.168.1.100:3000', () => {
    const res = validateTargetUrl('http://192.168.1.100:3000');
    expect(res.isValid).toBe(true);
    expect(res.isLocalNetwork).toBe(true);
    expect(res.isHttp).toBe(true);
  });

  it('validates 10.x.x.x LAN IP', () => {
    const res = validateTargetUrl('http://10.10.2.55:8000/pos');
    expect(res.isValid).toBe(true);
    expect(res.isLocalNetwork).toBe(true);
    expect(res.origin).toBe('http://10.10.2.55:8000');
  });

  it('validates https://pos.example.com', () => {
    const res = validateTargetUrl('https://pos.example.com');
    expect(res.isValid).toBe(true);
    expect(res.isLocalNetwork).toBe(false);
    expect(res.isHttp).toBe(false);
    expect(res.warning).toBeUndefined();
  });

  it('warns when using plain http on public domain', () => {
    const res = validateTargetUrl('http://pos.example.com');
    expect(res.isValid).toBe(true);
    expect(res.isLocalNetwork).toBe(false);
    expect(res.isHttp).toBe(true);
    expect(res.warning).toContain('HTTPS is strongly recommended');
  });

  it('rejects empty or whitespace URLs', () => {
    expect(validateTargetUrl('').isValid).toBe(false);
    expect(validateTargetUrl('   ').isValid).toBe(false);
  });

  it('rejects unsupported protocols (javascript:, file:, ftp:)', () => {
    expect(validateTargetUrl('javascript:alert(1)').isValid).toBe(false);
    expect(validateTargetUrl('file:///C:/secret.txt').isValid).toBe(false);
    expect(validateTargetUrl('ftp://ftp.example.com').isValid).toBe(false);
  });

  it('rejects malformed text', () => {
    expect(validateTargetUrl('not a url').isValid).toBe(false);
  });

  it('correctly classifies private IP ranges', () => {
    expect(isLocalOrPrivateIp('localhost')).toBe(true);
    expect(isLocalOrPrivateIp('127.0.0.1')).toBe(true);
    expect(isLocalOrPrivateIp('192.168.0.1')).toBe(true);
    expect(isLocalOrPrivateIp('10.200.1.5')).toBe(true);
    expect(isLocalOrPrivateIp('172.20.10.1')).toBe(true);
    expect(isLocalOrPrivateIp('pos.local')).toBe(true);
    expect(isLocalOrPrivateIp('8.8.8.8')).toBe(false);
    expect(isLocalOrPrivateIp('google.com')).toBe(false);
  });
});
