import React, { useState } from 'react';
import { DownloadIcon } from './icons';

interface HeroProps {
  onOpenDocs: (docName: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDocs }) => {
  const [simUrl, setSimUrl] = useState('http://localhost:3000');
  const [simMode, setSimMode] = useState<'standard' | 'fullscreen' | 'kiosk'>('kiosk');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestProbe = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult('● Connected: 200 OK (2ms latency)');
    }, 550);
  };

  return (
    <section style={{
      padding: '70px 0 90px 0',
      borderBottom: '1px solid var(--border)',
      background: 'radial-gradient(ellipse at 50% 10%, rgba(56, 189, 248, 0.08) 0%, transparent 60%)',
      transition: 'background 200ms ease'
    }}>
      <div className="container">
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center', marginBottom: '48px' }}>
          {/* Target Platforms Pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '22px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="badge badge-blue">WINDOWS</span>
            <span className="badge badge-emerald">macOS</span>
            <span className="badge badge-purple">ANDROID</span>
            <span className="badge">ZERO APP TOUCH</span>
          </div>

          {/* Primary Tagline */}
          <h1 style={{ fontSize: '52px', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '20px' }}>
            Any website. Your app.
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: '19px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '34px', maxWidth: '720px', margin: '0 auto 34px auto' }}>
            A lightweight, cross-platform application that transforms websites into standalone, native-looking experiences.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <a href="#releases" className="btn btn-primary" style={{ padding: '14px 30px', fontSize: '15px' }}>
              <DownloadIcon size={18} />
              <span>Download FrameKit (Windows)</span>
            </a>
            <a href="#platforms" className="btn btn-secondary" style={{ padding: '14px 26px', fontSize: '15px' }}>
              <span>View All Platforms</span>
            </a>
            <button
              onClick={() => onOpenDocs('ARCHITECTURE.md')}
              className="btn btn-outline"
              style={{ padding: '14px 24px', fontSize: '15px' }}
            >
              <span>Architecture Docs</span>
            </button>
          </div>

          <div style={{ marginTop: '18px', fontSize: '12px', color: 'var(--text-muted)' }}>
            Windows x64 • macOS (Apple Silicon & Intel) • Android (Capacitor Kiosk Shell) • MIT License
          </div>
        </div>

        {/* Live Interactive UI Simulation */}
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg-contrast)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '9999px' }}></div>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#f59e0b', borderRadius: '9999px' }}></div>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '9999px' }}></div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px', fontFamily: 'monospace' }}>
                FrameKit Runtime Simulator
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              Master Unlock: Ctrl+Shift+Alt+K (Cmd on Mac)
            </span>
          </div>

          <div style={{ padding: '32px 28px', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ maxWidth: '540px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    FrameKit Container Setup
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Launch any URL as a dedicated, framed app</p>
                </div>
                <span className="badge badge-emerald">
                  Interactive Preview
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    TARGET URL (LOCALHOST, LAN IP, OR HTTPS) *
                  </label>
                  <input
                    type="text"
                    value={simUrl}
                    onChange={(e) => setSimUrl(e.target.value)}
                    placeholder="https://pos.example.com or http://192.168.1.50:3000"
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '0 16px',
                      fontSize: '13px',
                      border: '1px solid var(--border)',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--bg-main)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontFamily: 'monospace'
                    }}
                  />
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleTestProbe}
                      disabled={testing}
                      className="btn btn-secondary"
                      style={{ height: '32px', padding: '0 16px', fontSize: '12px' }}
                    >
                      {testing ? 'Probing...' : 'Test Connection'}
                    </button>
                    {testResult && (
                      <span className="badge badge-emerald" style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                        {testResult}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    DISPLAY MODE
                  </label>
                  <div style={{ display: 'flex', padding: '4px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '9999px' }}>
                    <button
                      type="button"
                      onClick={() => setSimMode('standard')}
                      style={{
                        flex: 1,
                        height: '34px',
                        border: 'none',
                        borderRadius: '9999px',
                        background: simMode === 'standard' ? 'var(--btn-primary-bg)' : 'transparent',
                        color: simMode === 'standard' ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 150ms ease'
                      }}
                    >
                      Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimMode('fullscreen')}
                      style={{
                        flex: 1,
                        height: '34px',
                        border: 'none',
                        borderRadius: '9999px',
                        background: simMode === 'fullscreen' ? 'var(--btn-primary-bg)' : 'transparent',
                        color: simMode === 'fullscreen' ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 150ms ease'
                      }}
                    >
                      Fullscreen
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimMode('kiosk')}
                      style={{
                        flex: 1,
                        height: '34px',
                        border: 'none',
                        borderRadius: '9999px',
                        background: simMode === 'kiosk' ? 'var(--btn-primary-bg)' : 'transparent',
                        color: simMode === 'kiosk' ? 'var(--btn-primary-text)' : 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 150ms ease'
                      }}
                    >
                      Kiosk (Locked)
                    </button>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    {simMode === 'kiosk' ? 'Maximum containment. Pins fullscreen on top and suppresses OS navigation.' : simMode === 'fullscreen' ? 'Edge-to-edge display across monitors without window borders.' : 'Standard native window with customizable titlebar and resize controls.'}
                  </p>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', height: '42px', fontSize: '14px', fontWeight: 700 }}
                  >
                    Launch Standalone Experience
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};