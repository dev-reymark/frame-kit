import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar, PortalView } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { WindowModes } from './components/WindowModes';
import { Platforms } from './components/Platforms';
import { Deployment } from './components/Deployment';
import { DocsViewer } from './components/DocsViewer';
import { Releases } from './components/Releases';
import { Footer } from './components/Footer';

export const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<PortalView>('overview');
  const [selectedDoc, setSelectedDoc] = useState<string>('ARCHITECTURE.md');

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash === 'docs' || hash.startsWith('docs/')) {
        setActiveView('docs');
        const docPart = hash.split('/')[1];
        if (docPart) setSelectedDoc(docPart);
      } else if (hash === 'simulator' || hash === 'modes') {
        setActiveView('simulator');
      } else if (hash === 'downloads' || hash === 'releases') {
        setActiveView('downloads');
      } else if (hash === 'overview') {
        setActiveView('overview');
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const handleNavigateView = (view: PortalView) => {
    setActiveView(view);
    window.history.replaceState(null, '', `#${view}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDocs = (docName: string) => {
    setSelectedDoc(docName);
    setActiveView('docs');
    window.history.replaceState(null, '', `#docs/${docName}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-page)',
        color: 'var(--text-primary)'
      }}
    >
      <Navbar
        activeView={activeView}
        selectedDoc={selectedDoc}
        onNavigateView={handleNavigateView}
        onOpenDocs={handleOpenDocs}
      />

      {activeView === 'docs' ? (
        <main style={{ flex: 1 }}>
          <DocsViewer
            selectedDoc={selectedDoc}
            onSelectDoc={(docName) => handleOpenDocs(docName)}
            onNavigateView={handleNavigateView}
          />
        </main>
      ) : activeView === 'simulator' ? (
        <main
          className="container-wide"
          style={{
            flex: 1,
            paddingTop: '36px',
            paddingBottom: '64px',
            display: 'flex',
            flexDirection: 'column',
            gap: '48px'
          }}
        >
          <WindowModes />
          <Deployment onOpenDocs={handleOpenDocs} />
        </main>
      ) : activeView === 'downloads' ? (
        <main
          className="container"
          style={{
            flex: 1,
            paddingTop: '36px',
            paddingBottom: '64px',
            display: 'flex',
            flexDirection: 'column',
            gap: '48px'
          }}
        >
          <Releases />
          <Platforms onNavigateView={handleNavigateView} />
        </main>
      ) : (
        <main
          className="container"
          style={{
            flex: 1,
            paddingTop: '56px',
            paddingBottom: '72px',
            display: 'flex',
            flexDirection: 'column',
            gap: '64px'
          }}
        >
          <Hero onOpenDocs={handleOpenDocs} onNavigateView={handleNavigateView} />
          <Features />
          <WindowModes />
          <Platforms onNavigateView={handleNavigateView} />
          <Deployment onOpenDocs={handleOpenDocs} />
        </main>
      )}

      <Footer onNavigateView={handleNavigateView} onOpenDocs={handleOpenDocs} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
