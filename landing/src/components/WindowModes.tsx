import React, { useState } from 'react';

export const WindowModes: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'standard' | 'fullscreen' | 'kiosk'>('kiosk');

  const modes = [
    {
      id: 'standard',
      title: 'Standard Mode',
      subtitle: 'Desktop Workstations & Multi-Window Multitasking',
      badge: 'Windows & macOS',
      description: 'Runs as a dedicated native desktop window with minimize, maximize, and custom window chrome. Ideal for manager workstations running apps side-by-side without browser distractions.',
      characteristics: [
        'Framed desktop window with custom titlebar',
        'Configurable dimensions (default 1280x800)',
        'Zero address bar, tabs, or bookmarks',
        'Can be moved, resized, or minimized'
      ]
    },
    {
      id: 'fullscreen',
      title: 'Fullscreen Mode',
      subtitle: 'Cashier Counters & Dual-Display Screens',
      badge: 'All Platforms',
      description: 'Expands across the entire display without borders or taskbar intrusion. Perfect for POS cashiers, kitchen display systems (KDS), and customer-facing order review screens.',
      characteristics: [
        'Borderless edge-to-edge experience',
        'Hides Windows taskbar and macOS Dock',
        'Optimized for single-task workflow speed',
        'Multi-monitor friendly for secondary customer displays'
      ]
    },
    {
      id: 'kiosk',
      title: 'Kiosk Mode',
      subtitle: 'Customer Self-Ordering & Public Terminals',
      badge: 'Hardened Lock',
      description: 'Maximum perimeter security. The app takes over the screen with kiosk flags, always-on-top, and suppressed system shortcuts. On Android, activates Lock Task Mode to lock the screen.',
      characteristics: [
        'Chromium native kiosk lock & always-on-top',
        'Cannot be minimized, moved, or closed by users',
        'Suppresses Windows key, Alt+Tab, and Android Home/Recents',
        'Exclusively unlockable via admin PIN shortcut'
      ]
    }
  ] as const;

  const current = modes.find(m => m.id === activeMode) || modes[2];

  return (
    <section id="modes" style={{ padding: '80px 0', borderBottom: '1px solid var(--border)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px auto' }}>
          <span className="badge badge-blue" style={{ marginBottom: '12px', fontSize: '11px', textTransform: 'uppercase' }}>
            Flexible Display Profiles
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            Standard, Fullscreen, or Kiosk Containment
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Whether managing a multi-tasking supervisor PC, a dedicated checkout counter, or an unattended self-ordering kiosk, select the exact containment profile needed.
          </p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveMode(m.id)}
              className={activeMode === m.id ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ padding: '10px 24px', fontSize: '13px', fontWeight: 600 }}
            >
              {m.title}
            </button>
          ))}
        </div>

        {/* Mode Preview Card */}
        <div className="card" style={{ maxWidth: '900px', margin: '0 auto', padding: '36px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span className="badge badge-emerald">{current.badge}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Target Profile</span>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>{current.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--accent-blue)', fontWeight: 600, marginBottom: '16px' }}>
                {current.subtitle}
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                {current.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {current.characteristics.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--accent-blue)', borderRadius: '9999px' }} />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Screen Representation */}
            <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span>FRAMEKIT_VIEWPORT</span>
                <span>STATE: {activeMode.toUpperCase()}</span>
              </div>

              {/* Mock Screen Bezel */}
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                height: '240px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                {/* Title bar (only in standard) */}
                {activeMode === 'standard' && (
                  <div style={{ height: '30px', backgroundColor: 'var(--bg-contrast)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>FrameKit — [Coffee Shop Web App]</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#eab308', display: 'inline-block' }} />
                      <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#22c55e', display: 'inline-block' }} />
                      <span style={{ width: '8px', height: '8px', borderRadius: '9999px', backgroundColor: '#ef4444', display: 'inline-block' }} />
                    </div>
                  </div>
                )}

                {/* Content Area */}
                <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border)', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-blue)' }}>COFFEE SHOP POS</span>
                    <span style={{ fontSize: '10px', color: 'var(--accent-emerald)', fontFamily: 'monospace' }}>● ONLINE (127.0.0.1:3000)</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '12px 0' }}>
                    <div style={{ height: '40px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 500 }}>Espresso</div>
                    <div style={{ height: '40px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 500 }}>Americano</div>
                    <div style={{ height: '40px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 500 }}>Latte</div>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-contrast)', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total: PHP 140.00</span>
                    <span style={{ fontSize: '11px', backgroundColor: 'var(--accent-blue)', color: '#ffffff', padding: '4px 14px', borderRadius: '9999px', fontWeight: 700 }}>
                      PAY NOW
                    </span>
                  </div>
                </div>

                {/* Kiosk security watermark badge */}
                {activeMode === 'kiosk' && (
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'var(--accent-emerald)', color: '#ffffff', fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '9999px', letterSpacing: '0.04em' }}>
                    KIOSK PINNED (NO ESCAPE)
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};