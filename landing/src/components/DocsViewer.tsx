import React, { useState } from 'react';
import { docsData } from '../data/docsData';
import { CopyIcon, CheckIcon, DownloadIcon } from './icons';

interface DocsViewerProps {
  selectedDoc: string | null;
  onSelectDoc: (name: string) => void;
}

export const DocsViewer: React.FC<DocsViewerProps> = ({ selectedDoc, onSelectDoc }) => {
  const [activeTab, setActiveTab] = useState<string>(selectedDoc || 'ARCHITECTURE.md');
  const [copied, setCopied] = useState(false);

  const docFiles = [
    { name: 'ARCHITECTURE.md', title: 'Architecture & Boundary' },
    { name: 'SECURITY.md', title: 'Security & Threat Model' },
    { name: 'BUILD-AND-INSTALL.md', title: 'Build & Deployment' },
    { name: 'CONFIGURATION.md', title: 'Configuration Schema' },
    { name: 'TESTING.md', title: 'Security & QA Testing' },
  ];

  const currentContent = docsData[activeTab] || '# Documentation\nSelect a document from the left.';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="docs" style={{ padding: '80px 0', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-contrast)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px auto' }}>
          <span className="badge badge-blue" style={{ marginBottom: '12px', fontSize: '11px', textTransform: 'uppercase' }}>
            Built-In Knowledge Base
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            Technical Documentation & Specifications
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            Complete technical guides are bundled directly into every installed application copy under <code style={{ color: 'var(--accent-blue)' }}>resources/docs/</code>. Browse them live below.
          </p>
        </div>

        {/* Documentation Viewer Container */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Top Bar with Rounded Pills */}
          <div style={{
            backgroundColor: 'var(--bg-main)',
            borderBottom: '1px solid var(--border)',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', maxWidth: '100%', padding: '4px 0' }}>
              {docFiles.map((d) => (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => {
                    setActiveTab(d.name);
                    onSelectDoc(d.name);
                  }}
                  className={activeTab === d.name ? 'btn btn-primary' : 'btn btn-outline'}
                  style={{
                    height: '32px',
                    padding: '0 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: 'monospace'
                  }}
                >
                  {d.name}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-secondary"
                style={{ padding: '0 14px', fontSize: '11px', height: '32px' }}
                title="Copy markdown to clipboard"
              >
                {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                <span>{copied ? 'COPIED RAW' : 'COPY RAW'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="btn btn-secondary"
                style={{ padding: '0 14px', fontSize: '11px', height: '32px' }}
                title="Download markdown file"
              >
                <DownloadIcon size={13} />
                <span>DOWNLOAD .MD</span>
              </button>
            </div>
          </div>

          {/* Document Content View */}
          <div style={{ padding: '32px', maxHeight: '550px', overflowY: 'auto', backgroundColor: 'var(--bg-card)' }}>
            <pre style={{
              margin: 0,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {currentContent}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};