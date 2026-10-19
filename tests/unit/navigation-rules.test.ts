import { describe, it, expect } from 'vitest';
import { isNavigationAllowed, isBlockedShortcut, isAdminShortcut } from '../../src/main/security';

describe('Security: Navigation Restrictions', () => {
  const target = 'http://localhost:3000/pos';
  const allowed = ['https://cdn.pos-assets.com', 'http://192.168.1.50:8000'];

  it('allows same-origin paths and query parameters', () => {
    expect(isNavigationAllowed('http://localhost:3000/orders', target, allowed)).toBe(true);
    expect(isNavigationAllowed('http://localhost:3000/checkout?table=5', target, allowed)).toBe(true);
    expect(isNavigationAllowed('http://localhost:3000/api/menu', target, allowed)).toBe(true);
  });

  it('allows explicitly whitelisted domains', () => {
    expect(isNavigationAllowed('https://cdn.pos-assets.com/logo.png', target, allowed)).toBe(true);
    expect(isNavigationAllowed('http://192.168.1.50:8000/print', target, allowed)).toBe(true);
  });

  it('blocks unapproved external domains', () => {
    expect(isNavigationAllowed('https://google.com', target, allowed)).toBe(false);
    expect(isNavigationAllowed('https://facebook.com', target, allowed)).toBe(false);
    expect(isNavigationAllowed('http://localhost:4000', target, allowed)).toBe(false); // different port
    expect(isNavigationAllowed('https://evil-phishing.com', target, allowed)).toBe(false);
  });

  it('blocks dangerous protocol schemes', () => {
    expect(isNavigationAllowed('javascript:alert(1)', target, allowed)).toBe(false);
    expect(isNavigationAllowed('data:text/html,<h1>Hacked</h1>', target, allowed)).toBe(false);
  });
});

describe('Security: Keyboard Shortcut Restrictions', () => {
  it('blocks DevTools keys (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C)', () => {
    expect(isBlockedShortcut({ key: 'F12', code: 'F12' } as any)).toBe(true);
    expect(isBlockedShortcut({ key: 'i', control: true, shift: true } as any)).toBe(true);
    expect(isBlockedShortcut({ key: 'j', control: true, shift: true } as any)).toBe(true);
    expect(isBlockedShortcut({ key: 'c', control: true, shift: true } as any)).toBe(true);
  });

  it('blocks reload shortcuts (F5, Ctrl+R)', () => {
    expect(isBlockedShortcut({ key: 'F5', code: 'F5' } as any)).toBe(true);
    expect(isBlockedShortcut({ key: 'r', control: true } as any)).toBe(true);
  });

  it('blocks new tab / window / close shortcuts (Ctrl+T, Ctrl+N, Ctrl+W)', () => {
    expect(isBlockedShortcut({ key: 't', control: true } as any)).toBe(true);
    expect(isBlockedShortcut({ key: 'n', control: true } as any)).toBe(true);
    expect(isBlockedShortcut({ key: 'w', control: true } as any)).toBe(true);
  });

  it('blocks address bar and print shortcuts (Ctrl+L, Ctrl+P, Ctrl+O)', () => {
    expect(isBlockedShortcut({ key: 'l', control: true } as any)).toBe(true);
    expect(isBlockedShortcut({ key: 'p', control: true } as any)).toBe(true);
    expect(isBlockedShortcut({ key: 'o', control: true } as any)).toBe(true);
  });

  it('blocks browser history navigation (Alt+Left, Alt+Right)', () => {
    expect(isBlockedShortcut({ key: 'ArrowLeft', alt: true } as any)).toBe(true);
    expect(isBlockedShortcut({ key: 'ArrowRight', alt: true } as any)).toBe(true);
  });

  it('allows ordinary typing and form inputs', () => {
    expect(isBlockedShortcut({ key: 'a' } as any)).toBe(false);
    expect(isBlockedShortcut({ key: '1' } as any)).toBe(false);
    expect(isBlockedShortcut({ key: 'Enter' } as any)).toBe(false);
    expect(isBlockedShortcut({ key: 'Backspace' } as any)).toBe(false);
    expect(isBlockedShortcut({ key: 'Tab' } as any)).toBe(false);
    expect(isBlockedShortcut({ key: 'c', control: true } as any)).toBe(false); // Copy allowed
    expect(isBlockedShortcut({ key: 'v', control: true } as any)).toBe(false); // Paste allowed
  });

  it('correctly triggers admin shortcut on Ctrl+Shift+Alt+K', () => {
    expect(isAdminShortcut({ key: 'k', control: true, shift: true, alt: true } as any)).toBe(true);
    expect(isAdminShortcut({ code: 'KeyK', control: true, shift: true, alt: true } as any)).toBe(true);
    expect(isAdminShortcut({ key: 'k', control: true } as any)).toBe(false);
    expect(isAdminShortcut({ key: 'k', alt: true } as any)).toBe(false);
  });
});
