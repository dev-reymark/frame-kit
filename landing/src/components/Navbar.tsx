import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { docsData } from '../data/docsData';
import {
  SunIcon,
  MoonIcon,
  DownloadIcon,
  MenuIcon,
  CloseIcon,
  SearchIcon,
  ArrowUpRightIcon
} from './icons';

export type PortalView = 'overview' | 'docs' | 'simulator' | 'downloads';

interface NavbarProps {
  activeView: PortalView;
  selectedDoc: string;
  onNavigateView: (view: PortalView) => void;
  onOpenDocs: (docName: string) => void;
}

interface SearchMatch {
  docName: string;
  docTitle: string;
  sectionTitle: string;
  headingText: string;
  snippet: string;
}

export const DOC_CATALOG = [
  {
    section: 'Architecture & Runtime',
    items: [
      {
        name: 'ARCHITECTURE.md',
        title: 'Architecture & System Design',
        badge: 'Core',
        description: 'Three-tier process isolation, contextBridge preloads, and deterministic state machine.'
      }
    ]
  },
  {
    section: 'Security & Containment',
    items: [
      {
        name: 'SECURITY.md',
        title: 'Security & Hardening Guide',
        badge: 'PBKDF2',
        description: 'Threat model, Chromium navigation guards, 100k-iteration SHA-512 hashing, and OS kiosk policies.'
      }
    ]
  },
  {
    section: 'Fleet & Operations',
    items: [
      {
        name: 'BUILD-AND-INSTALL.md',
        title: 'Build & Installation Guide',
        badge: 'CLI',
        description: 'Development setup, NSIS packaging, and unattended silent deployment (/S) for store fleets.'
      },
      {
        name: 'CONFIGURATION.md',
        title: 'Configuration Reference',
        badge: 'JSON',
        description: 'Storage schema, launch modes, origin whitelisting, admin shortcuts, and recovery.'
      }
    ]
  },
  {
    section: 'Quality Assurance',
    items: [
      {
        name: 'TESTING.md',
        title: 'Automated Testing & QA',
        badge: '40/40',
        description: 'Unit and end-to-end verification matrices for URL validation, cryptography, and IPC.'
      }
    ]
  }
];

function searchDocumentation(rawQuery: string): SearchMatch[] {
  const query = rawQuery.trim().toLowerCase();
  if (query.length < 2) return [];

  const matches: SearchMatch[] = [];

  for (const group of DOC_CATALOG) {
    for (const item of group.items) {
      const content = docsData[item.name] || '';
      const lines = content.split(/\r?\n/);
      let currentHeading = item.title;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('## ')) {
          currentHeading = line.replace(/^##\s+/, '');
        } else if (line.startsWith('### ')) {
          currentHeading = line.replace(/^###\s+/, '');
        }

        if (line.toLowerCase().includes(query)) {
          const cleanSnippet = line
            .replace(/^[#>*|-]+\s*/, '')
            .replace(/`/g, '')
            .slice(0, 140);

          if (cleanSnippet.length > 0) {
            matches.push({
              docName: item.name,
              docTitle: item.title,
              sectionTitle: group.section,
              headingText: currentHeading,
              snippet: cleanSnippet
            });
            if (matches.length >= 10) return matches;
          }
        }
      }
    }
  }

  return matches;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  selectedDoc,
  onNavigateView,
  onOpenDocs
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 40);
    } else {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = searchDocumentation(searchQuery);

  const navLinks: { id: PortalView; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'docs', label: 'Documentation' },
    { id: 'simulator', label: 'Container Simulator' },
    { id: 'downloads', label: 'Downloads' }
  ];

  const handleSelectNav = (view: PortalView) => {
    onNavigateView(view);
    setIsMobileMenuOpen(false);
  };

  const handleSelectDocItem = (docName: string) => {
    onOpenDocs(docName);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  };

  return (
    <>
      <header className="portal-header">
        <div className="portal-header-left">
          <div className="portal-brand-wrap">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="mobile-menu-btn"
              aria-label="Toggle navigation menu"
            >
              <MenuIcon size={18} />
            </button>

            <a
              href="#overview"
              onClick={(event) => {
                event.preventDefault();
                handleSelectNav('overview');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <span className="logo-badge">F</span>
              <span className="portal-brand-text">
                FrameKit <span className="portal-brand-sub">Platform</span>
              </span>
            </a>
          </div>

          <nav className="portal-nav" aria-label="Primary Navigation">
            {navLinks.map((navLink) => (
              <button
                key={navLink.id}
                type="button"
                onClick={() => handleSelectNav(navLink.id)}
                className={`portal-nav-link ${activeView === navLink.id ? 'active' : ''}`}
              >
                {navLink.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="portal-header-right">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="search-trigger-desktop"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SearchIcon size={14} />
              <span>Search docs...</span>
            </span>
            <kbd className="kbd-badge">Ctrl K</kbd>
          </button>

          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="theme-toggle-btn search-trigger-mobile"
            aria-label="Search documentation"
            title="Search documentation (Ctrl+K)"
          >
            <SearchIcon size={15} />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            aria-label="Toggle light or dark theme"
          >
            {theme === 'dark' ? (
              <SunIcon size={15} style={{ color: '#fbbf24' }} />
            ) : (
              <MoonIcon size={15} />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSelectNav('downloads')}
            className="btn btn-primary btn-sm"
          >
            <DownloadIcon size={14} />
            <span>Get FrameKit</span>
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`} aria-label="Mobile Navigation">
        <div className="mobile-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="logo-badge">F</span>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>FrameKit</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="theme-toggle-btn"
            aria-label="Close navigation menu"
          >
            <CloseIcon size={15} />
          </button>
        </div>

        <div className="mobile-drawer-body">
          <div>
            <div className="mobile-nav-group-title">Navigation</div>
            {navLinks.map((navLink) => (
              <button
                key={navLink.id}
                type="button"
                onClick={() => handleSelectNav(navLink.id)}
                className={`mobile-nav-item ${activeView === navLink.id ? 'active' : ''}`}
              >
                <span>{navLink.label}</span>
              </button>
            ))}
          </div>

          {DOC_CATALOG.map((group) => (
            <div key={group.section}>
              <div className="mobile-nav-group-title">{group.section}</div>
              {group.items.map((item) => {
                const isDocActive = activeView === 'docs' && selectedDoc === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectDocItem(item.name)}
                    className={`mobile-nav-item ${isDocActive ? 'active' : ''}`}
                  >
                    <span>{item.title}</span>
                    <span className="kbd-badge">{item.badge}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {isSearchOpen && (
        <div
          className="search-modal-backdrop"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="search-modal-box"
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                gap: '10px'
              }}
            >
              <SearchIcon size={17} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search documentation, security policies, or CLI flags..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
              <kbd className="kbd-badge">ESC</kbd>
            </div>

            <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '8px' }}>
              {searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                  No matching documentation found for &ldquo;{searchQuery}&rdquo;
                </div>
              )}

              {searchResults.map((match, idx) => (
                <button
                  key={`${match.docName}-${idx}`}
                  type="button"
                  onClick={() => handleSelectDocItem(match.docName)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'block'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    <span>{match.sectionTitle}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{match.docName}</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {match.docTitle}
                    <span style={{ fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '6px', fontSize: '12px' }}>
                      &rarr; {match.headingText}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    {match.snippet}
                  </div>
                </button>
              ))}

              {searchQuery.trim().length < 2 && (
                <div style={{ padding: '14px 12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    Quick Navigation
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {DOC_CATALOG.flatMap((group) => group.items).map((docItem) => (
                      <button
                        key={docItem.name}
                        type="button"
                        onClick={() => handleSelectDocItem(docItem.name)}
                        style={{
                          padding: '6px 10px',
                          fontSize: '12px',
                          fontFamily: 'inherit',
                          backgroundColor: 'var(--bg-subtle)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>{docItem.title}</span>
                        <ArrowUpRightIcon size={12} style={{ color: 'var(--text-muted)' }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
