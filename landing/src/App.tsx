import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { WindowModes } from './components/WindowModes';
import { Platforms } from './components/Platforms';
import { Deployment } from './components/Deployment';
import { DocsViewer } from './components/DocsViewer';
import { Releases } from './components/Releases';
import { Footer } from './components/Footer';

export const AppContent: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const handleOpenDocs = (docName: string) => {
    setSelectedDoc(docName);
    const element = document.getElementById('docs');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-main)',
      color: 'var(--text-primary)',
      transition: 'background-color 200ms ease, color 200ms ease'
    }}>
      <Navbar onOpenDocs={handleOpenDocs} />
      <main style={{ flex: 1 }}>
        <Hero onOpenDocs={handleOpenDocs} />
        <Features />
        <WindowModes />
        <Platforms />
        <Deployment />
        <Releases />
        <DocsViewer
          selectedDoc={selectedDoc}
          onSelectDoc={(doc) => setSelectedDoc(doc)}
        />
      </main>
      <Footer />
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