import React from 'react';
import { PortalView } from './Navbar';

interface FooterProps {
  onNavigateView?: (view: PortalView) => void;
  onOpenDocs?: (docName: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateView, onOpenDocs }) => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-page)',
        padding: '24px',
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}
    >
      <div
        className="container"
        style={{
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="logo-badge" style={{ width: '22px', height: '22px', fontSize: '11px' }}>
            F
          </span>
          <span>
            FrameKit Platform &copy; {new Date().getFullYear()} &bull; Cross-Platform Native Web Container
          </span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onNavigateView && onNavigateView('overview')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              color: 'inherit',
              cursor: 'pointer'
            }}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => onOpenDocs && onOpenDocs('ARCHITECTURE.md')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              color: 'inherit',
              cursor: 'pointer'
            }}
          >
            Documentation
          </button>
          <button
            type="button"
            onClick={() => onNavigateView && onNavigateView('simulator')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              color: 'inherit',
              cursor: 'pointer'
            }}
          >
            Container Simulator
          </button>
          <button
            type="button"
            onClick={() => onNavigateView && onNavigateView('downloads')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              color: 'inherit',
              cursor: 'pointer'
            }}
          >
            Downloads
          </button>
          <a
            href="https://github.com/dev-reymark/frame-kit/releases/tag/v1.0.0"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Releases
          </a>
        </nav>
      </div>
    </footer>
  );
};
