import React from 'react';
import { PortalView } from './Navbar';
import { ShieldIcon, ArrowRightIcon, TerminalIcon } from './icons';

interface HeroProps {
  onOpenDocs: (docName: string) => void;
  onNavigateView?: (view: PortalView) => void;
}

const CONTAINMENT_PIPELINE_STEPS = [
  {
    stepNumber: '1',
    title: 'Target Origin Binding',
    description:
      'Point to localhost, private LAN terminals (192.168.x.x), or public HTTPS domains with automatic origin extraction.'
  },
  {
    stepNumber: '2',
    title: 'Main-Process Boundary',
    description:
      'Intercepts unapproved external redirects, denies popups via setWindowOpenHandler, and suppresses DevTools shortcuts.'
  },
  {
    stepNumber: '3',
    title: 'Display Containment',
    description:
      'Deploy as a framed desktop window, borderless fullscreen display, or pinned kiosk shell with Android Lock Task.'
  },
  {
    stepNumber: '4',
    title: 'PBKDF2 Admin Lock',
    description:
      'Secures runtime configuration with 100,000-iteration SHA-512 PIN derivation and a 30-second brute-force lockout.'
  }
];

export const Hero: React.FC<HeroProps> = ({ onOpenDocs, onNavigateView }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
      <section style={{ textAlign: 'center', maxWidth: '740px', margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '9999px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          <ShieldIcon size={14} style={{ color: 'var(--success)' }} />
          <span>Windows &bull; macOS &bull; Android Kiosk Container</span>
        </div>

        <h1
          style={{
            margin: '0 0 16px 0',
            fontSize: 'clamp(30px, 5vw, 42px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            lineHeight: 1.15
          }}
        >
          Any website. Your app.
        </h1>

        <p
          style={{
            margin: '0 0 28px 0',
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: 1.65
          }}
        >
          Transform localhost servers, private LAN point-of-sale terminals, and cloud web applications into distraction-free native experiences. Eliminate browser chrome, enforce strict domain boundaries, and lock unattended screens with zero web code changes.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => onNavigateView ? onNavigateView('downloads') : undefined}
            className="btn btn-primary btn-lg"
          >
            <span>Download FrameKit</span>
            <ArrowRightIcon size={16} />
          </button>

          <button
            type="button"
            onClick={() => onOpenDocs('ARCHITECTURE.md')}
            className="btn btn-outline btn-lg"
          >
            <span>Documentation</span>
          </button>

          {onNavigateView && (
            <button
              type="button"
              onClick={() => onNavigateView('simulator')}
              className="btn btn-secondary btn-lg"
            >
              <TerminalIcon size={16} />
              <span>Container Simulator</span>
            </button>
          )}
        </div>
      </section>

      <section>
        <div className="section-header-bar">
          <div>
            <h2 className="section-title">End-to-End Containment Pipeline</h2>
            <p className="section-subtitle">
              How web applications are encapsulated and hardened inside the native FrameKit runtime.
            </p>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
            Target Origin &rarr; Main-Process Guard &rarr; Native Shell
          </span>
        </div>

        <div className="grid-4">
          {CONTAINMENT_PIPELINE_STEPS.map((pipelineStep) => (
            <div
              key={pipelineStep.stepNumber}
              className="card"
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--bg-muted)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {pipelineStep.stepNumber}
              </span>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {pipelineStep.title}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {pipelineStep.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
