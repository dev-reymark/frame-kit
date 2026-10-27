import React, { useState, useMemo } from 'react';
import {
  MonitorIcon,
  MaximizeIcon,
  LockIcon,
  ActivityIcon,
  CopyIcon,
  CheckIcon,
  ShieldIcon,
  AlertTriangleIcon
} from './icons';

type DisplayModeId = 'windowed' | 'fullscreen' | 'kiosk';
type InspectorTabId = 'viewport' | 'config' | 'powershell';
type GuardScenarioId = 'internal' | 'external' | 'popup';

interface OriginPreset {
  id: string;
  label: string;
  url: string;
  appName: string;
  mode: DisplayModeId;
  subtitle: string;
}

const ORIGIN_PRESETS: OriginPreset[] = [
  {
    id: 'lan_pos',
    label: 'Store LAN Terminal',
    url: 'http://192.168.1.150:3000/pos',
    appName: 'Register Terminal #01',
    mode: 'kiosk',
    subtitle: 'Private LAN subnet + Kiosk Lock'
  },
  {
    id: 'localhost',
    label: 'Localhost Development',
    url: 'http://localhost:3000/kiosk',
    appName: 'Local POS Dev',
    mode: 'windowed',
    subtitle: '127.0.0.1 / localhost origin'
  },
  {
    id: 'cloud_https',
    label: 'Cloud HTTPS POS',
    url: 'https://pos.yourdomain.com/checkout',
    appName: 'Cloud Counter Kiosk',
    mode: 'fullscreen',
    subtitle: 'Public TLS verified origin'
  },
  {
    id: 'plain_http',
    label: 'Unencrypted Public HTTP',
    url: 'http://legacy.yourdomain.com/app',
    appName: 'Legacy Backoffice',
    mode: 'windowed',
    subtitle: 'Triggers plain-HTTP security warning'
  }
];

const MODE_DEFINITIONS: Record<
  DisplayModeId,
  {
    title: string;
    badge: string;
    subtitle: string;
    description: string;
    specs: string[];
  }
> = {
  windowed: {
    title: 'Windowed Mode',
    badge: 'Desktop Workstations',
    subtitle: 'Framed native window without browser address bars or tabs',
    description:
      'Runs as a standard resizable desktop window (default 1280x800) with custom titlebar and window controls. Ideal for supervisor PCs running multiple applications.',
    specs: [
      'Native OS window frame with minimize/maximize',
      'Zero URL bar, bookmarks, or DevTools access',
      'Same-origin navigation guard active'
    ]
  },
  fullscreen: {
    title: 'Fullscreen Mode',
    badge: 'Cashier & KDS Displays',
    subtitle: 'Borderless edge-to-edge viewport across the display',
    description:
      'Expands across the full monitor without window borders or taskbar intrusion. Designed for cashier checkout counters and kitchen display systems.',
    specs: [
      'Edge-to-edge borderless Chromium surface',
      'Hides Windows taskbar and macOS Dock',
      'Multi-monitor friendly for secondary customer screens'
    ]
  },
  kiosk: {
    title: 'Kiosk Mode (Locked)',
    badge: 'Hardened Containment',
    subtitle: 'Pinned fullscreen shell with OS shortcut & Lock Task enforcement',
    description:
      'Maximum perimeter lock. Pins the window on top with screen-saver priority, blocks task-switching shortcuts, and activates Android Lock Task Mode on tablets.',
    specs: [
      'Electron setKiosk(true) & always-on-top pinning',
      'Android Lock Task Mode disables Home & Recents',
      'Exclusively unlockable via Ctrl+Shift+Alt+K admin PIN'
    ]
  }
};

export const WindowModes: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('lan_pos');
  const [appName, setAppName] = useState<string>('Register Terminal #01');
  const [targetUrl, setTargetUrl] = useState<string>('http://192.168.1.150:3000/pos');
  const [activeMode, setActiveMode] = useState<DisplayModeId>('kiosk');
  const [launchOnStartup, setLaunchOnStartup] = useState<boolean>(true);
  const [activeInspectorTab, setActiveInspectorTab] = useState<InspectorTabId>('viewport');
  const [guardScenario, setGuardScenario] = useState<GuardScenarioId>('internal');
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [probeLatencyMs, setProbeLatencyMs] = useState<number | null>(14);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const urlAnalysis = useMemo(() => {
    const trimmed = targetUrl.trim();
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return {
          isValid: false,
          origin: '',
          isLocal: false,
          isHttpWarning: false,
          error: `Unsupported protocol "${parsed.protocol}". Only http: and https: are allowed.`
        };
      }
      const host = parsed.hostname.toLowerCase();
      const isLocal =
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host.startsWith('192.168.') ||
        host.startsWith('10.') ||
        host.endsWith('.local');
      const isHttpWarning = parsed.protocol === 'http:' && !isLocal;

      return {
        isValid: true,
        origin: parsed.origin,
        isLocal,
        isHttpWarning,
        error: null
      };
    } catch {
      return {
        isValid: false,
        origin: '',
        isLocal: false,
        isHttpWarning: false,
        error: 'Enter a valid URL including http:// or https://'
      };
    }
  }, [targetUrl]);

  const handleSelectPreset = (preset: OriginPreset) => {
    setSelectedPresetId(preset.id);
    setAppName(preset.appName);
    setTargetUrl(preset.url);
    setActiveMode(preset.mode);
    setProbeLatencyMs(preset.id === 'localhost' ? 4 : preset.id === 'lan_pos' ? 14 : 42);
  };

  const handleRunProbe = () => {
    if (!urlAnalysis.isValid) return;
    setIsProbing(true);
    setTimeout(() => {
      setIsProbing(false);
      setProbeLatencyMs(urlAnalysis.isLocal ? 9 : 38);
    }, 350);
  };

  const generatedConfigJson = useMemo(() => {
    const origin = urlAnalysis.origin || 'http://localhost:3000';
    return JSON.stringify(
      {
        appName: appName.trim() || 'FrameKit Terminal',
        targetUrl: targetUrl.trim() || 'http://localhost:3000',
        launchMode: activeMode,
        launchOnStartup,
        rememberConfig: true,
        allowedDomains: [origin],
        adminShortcut: 'CommandOrControl+Shift+Alt+K',
        adminPasswordHash: 'pbkdf2_sha512_100000_iterations_redacted',
        adminPasswordSalt: '32_byte_random_hex_salt'
      },
      null,
      2
    );
  }, [appName, targetUrl, activeMode, launchOnStartup, urlAnalysis.origin]);

  const generatedPowerShellScript = useMemo(() => {
    return [
      '# 1. Silent installation across Windows POS terminals',
      'Start-Process -FilePath ".\\FrameKit.Setup.1.0.0.exe" -ArgumentList "/S" -Wait',
      '',
      '# 2. Provision container configuration to %APPDATA%\\framekit',
      '$ConfigDir = "$env:APPDATA\\framekit"',
      'New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null',
      `Set-Content -Path "$ConfigDir\\framekit-config.json" -Value '${generatedConfigJson.replace(/\n/g, ' ')}'`
    ].join('\n');
  }, [generatedConfigJson]);

  const handleCopyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(key);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const currentModeInfo = MODE_DEFINITIONS[activeMode];

  return (
    <section id="modes">
      <div className="section-header-bar">
        <div>
          <h2 className="section-title">Display Profiles &amp; Container Simulator</h2>
          <p className="section-subtitle">
            Test origin validation, display containment modes, main-process navigation guards, and generated configuration schemas.
          </p>
        </div>
        <span className="badge badge-emerald">Interactive Inspector</span>
      </div>

      <div className="sim-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <div className="card-header" style={{ padding: '14px 18px' }}>
              <h3 className="card-title" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Preset Target Profiles
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ORIGIN_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      backgroundColor: isSelected ? 'var(--bg-muted)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border-subtle)',
                      borderLeft: isSelected ? '3px solid var(--text-primary)' : '3px solid transparent',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background-color 120ms ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: isSelected ? 600 : 500, color: 'var(--text-primary)' }}>
                        {preset.label}
                      </span>
                      <span className="kbd-badge" style={{ textTransform: 'uppercase' }}>
                        {preset.mode}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                        marginTop: '3px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {preset.url}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ padding: '14px 18px' }}>
              <h3 className="card-title" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Mode Specification
              </h3>
              <span className="badge badge-blue">{currentModeInfo.badge}</span>
            </div>
            <div className="card-content" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {currentModeInfo.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.55 }}>
                  {currentModeInfo.description}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                {currentModeInfo.specs.map((spec) => (
                  <div key={spec} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-primary)' }}>
                    <CheckIcon size={13} style={{ color: 'var(--success)', flexShrink: 0 }} />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Container Provisioning &amp; Guard Inspector</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Configure target URL and display mode to inspect runtime behavior and JSON schema.
              </p>
            </div>
            <span className="kbd-badge">Shortcut: Ctrl+Shift+Alt+K</span>
          </div>

          <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="grid-2">
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--text-muted)',
                    marginBottom: '6px'
                  }}
                >
                  Target Website URL
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(event) => setTargetUrl(event.target.value)}
                    className="input-square input-mono"
                    placeholder="http://localhost:3000"
                  />
                  <button
                    type="button"
                    onClick={handleRunProbe}
                    disabled={!urlAnalysis.isValid || isProbing}
                    className="btn btn-outline btn-sm"
                    style={{ height: '38px' }}
                  >
                    <ActivityIcon size={13} />
                    <span>{isProbing ? 'Probing...' : 'Probe'}</span>
                  </button>
                </div>

                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {urlAnalysis.isValid ? (
                    <>
                      <span className="badge badge-emerald">
                        <span className="badge-dot" />
                        <span>HTTP 200 ({probeLatencyMs ?? 12}ms)</span>
                      </span>
                      <span className="badge">
                        {urlAnalysis.isLocal ? 'Local / LAN Origin' : 'Public Origin'}
                      </span>
                      {urlAnalysis.isHttpWarning && (
                        <span className="badge badge-amber">
                          <AlertTriangleIcon size={11} />
                          <span>Plain HTTP Warning</span>
                        </span>
                      )}
                    </>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{urlAnalysis.error}</span>
                  )}
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--text-muted)',
                    marginBottom: '6px'
                  }}
                >
                  Display Containment Profile
                </label>
                <div className="segmented-control">
                  <button
                    type="button"
                    onClick={() => setActiveMode('windowed')}
                    className={`segmented-btn ${activeMode === 'windowed' ? 'active' : ''}`}
                  >
                    <MonitorIcon size={13} />
                    <span>Windowed</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMode('fullscreen')}
                    className={`segmented-btn ${activeMode === 'fullscreen' ? 'active' : ''}`}
                  >
                    <MaximizeIcon size={13} />
                    <span>Fullscreen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMode('kiosk')}
                    className={`segmented-btn ${activeMode === 'kiosk' ? 'active' : ''}`}
                  >
                    <LockIcon size={13} />
                    <span>Kiosk</span>
                  </button>
                </div>

                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={launchOnStartup}
                      onChange={(event) => setLaunchOnStartup(event.target.checked)}
                    />
                    <span>Launch on OS startup</span>
                  </label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                    Origin: {urlAnalysis.origin || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(
                    [
                      { id: 'viewport', label: 'Simulated Viewport' },
                      { id: 'config', label: 'framekit-config.json' },
                      { id: 'powershell', label: 'Silent Fleet PowerShell' }
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveInspectorTab(tab.id)}
                      className={`btn btn-sm ${activeInspectorTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeInspectorTab !== 'viewport' && (
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyCode(
                        activeInspectorTab === 'config' ? generatedConfigJson : generatedPowerShellScript,
                        activeInspectorTab
                      )
                    }
                    className="btn btn-secondary btn-sm"
                  >
                    {copiedTab === activeInspectorTab ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                    <span>{copiedTab === activeInspectorTab ? 'Copied' : 'Copy Snippet'}</span>
                  </button>
                )}
              </div>

              {activeInspectorTab === 'viewport' && (
                <div
                  style={{
                    border: '1px solid var(--border-strong)',
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '16px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                      marginBottom: '10px',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <span>CONTAINER VIEWPORT ({activeMode.toUpperCase()})</span>
                    <span>ALLOWED ORIGIN: {urlAnalysis.origin || 'NONE'}</span>
                  </div>

                  <div
                    style={{
                      border: '1px solid var(--border-strong)',
                      backgroundColor: 'var(--bg-surface)',
                      overflow: 'hidden'
                    }}
                  >
                    {activeMode === 'windowed' && (
                      <div
                        style={{
                          height: '32px',
                          backgroundColor: 'var(--bg-muted)',
                          borderBottom: '1px solid var(--border-subtle)',
                          padding: '0 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <span>{appName} &mdash; Native Window</span>
                        <span>1280 &times; 800</span>
                      </div>
                    )}

                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid var(--border-subtle)',
                          paddingBottom: '10px',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {appName}
                          </div>
                          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            {targetUrl}
                          </div>
                        </div>

                        <span className="badge badge-emerald">
                          <ShieldIcon size={11} />
                          <span>{activeMode === 'kiosk' ? 'Kiosk Pinned' : activeMode === 'fullscreen' ? 'Borderless Fullscreen' : 'Windowed Shell'}</span>
                        </span>
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Test Main-Process Navigation Guard
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                          <button
                            type="button"
                            onClick={() => setGuardScenario('internal')}
                            className={`btn btn-sm ${guardScenario === 'internal' ? 'btn-primary' : 'btn-outline'}`}
                          >
                            Internal Route (/orders)
                          </button>
                          <button
                            type="button"
                            onClick={() => setGuardScenario('external')}
                            className={`btn btn-sm ${guardScenario === 'external' ? 'btn-primary' : 'btn-outline'}`}
                          >
                            External Link (google.com)
                          </button>
                          <button
                            type="button"
                            onClick={() => setGuardScenario('popup')}
                            className={`btn btn-sm ${guardScenario === 'popup' ? 'btn-primary' : 'btn-outline'}`}
                          >
                            Popup (window.open)
                          </button>
                        </div>

                        <div
                          style={{
                            padding: '10px 12px',
                            backgroundColor: 'var(--bg-subtle)',
                            border: '1px solid var(--border-subtle)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                            flexWrap: 'wrap'
                          }}
                        >
                          {guardScenario === 'internal' && (
                            <>
                              <span>will-navigate &rarr; {urlAnalysis.origin || 'http://localhost:3000'}/orders</span>
                              <span className="badge badge-emerald">ALLOWED (Whitelisted Origin)</span>
                            </>
                          )}
                          {guardScenario === 'external' && (
                            <>
                              <span>will-navigate &rarr; https://google.com</span>
                              <span className="badge badge-amber">BLOCKED (Unapproved Domain)</span>
                            </>
                          )}
                          {guardScenario === 'popup' && (
                            <>
                              <span>setWindowOpenHandler &rarr; target=&quot;_blank&quot;</span>
                              <span className="badge badge-amber">DENIED (Action: deny)</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeInspectorTab === 'config' && (
                <pre className="code-block" style={{ margin: 0 }}>
                  <code>{generatedConfigJson}</code>
                </pre>
              )}

              {activeInspectorTab === 'powershell' && (
                <pre className="code-block" style={{ margin: 0 }}>
                  <code>{generatedPowerShellScript}</code>
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
