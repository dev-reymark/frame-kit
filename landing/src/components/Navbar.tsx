import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon, DownloadIcon } from './icons';

interface NavbarProps {
  onOpenDocs: (docName: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDocs }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav style={{
      borderBottom: '1px solid var(--border)',
      backgroundColor: 'var(--nav-bg)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      transition: 'background-color 200ms ease, border-color 200ms ease'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
          {/* Rounded-full FrameKit Logo Badge */}
          <div className="logo-badge" title="FrameKit">
            FK
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '0.02em' }}>FRAMEKIT</span>
            <span className="badge badge-emerald" style={{ marginLeft: '8px', fontSize: '10px', padding: '2px 8px' }}>v1.0.0</span>
          </div>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', fontWeight: 500 }} className="nav-links">
            <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Features</a>
            <a href="#modes" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Modes</a>
            <a href="#platforms" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Platforms</a>
            <a href="#deployment" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Deployment</a>
            <button
              onClick={() => onOpenDocs('ARCHITECTURE.md')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Docs
            </button>
            <a href="#releases" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Download</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Theme Toggle Button (Rounded Full) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle light/dark mode"
            >
              {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            </button>

            {/* Download Button (Rounded Full) */}
            <a href="#releases" className="btn btn-primary" style={{ height: '38px', padding: '0 18px', fontSize: '13px' }}>
              <DownloadIcon size={15} />
              <span>Get FrameKit</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};