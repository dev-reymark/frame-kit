import React, { useState, useMemo } from 'react';
import { docsData } from '../data/docsData';
import { DOC_CATALOG, PortalView } from './Navbar';
import { CopyIcon, CheckIcon, DownloadIcon, ArrowUpRightIcon } from './icons';

interface DocsViewerProps {
  selectedDoc: string | null;
  onSelectDoc: (name: string) => void;
  onNavigateView?: (view: PortalView) => void;
}

interface ParsedHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

type DocBlock =
  | { type: 'heading'; level: 2 | 3; id: string; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'code'; language: string; code: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'callout'; text: string };

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function renderInlineFormatting(text: string): React.ReactNode[] {
  const cleaned = text
    .replace(/&rarr;/g, '→')
    .replace(/&ge;/g, '≥')
    .replace(/\$\$\\text\{([^}]+)\}\s*\+\s*\\text\{([^}]+)\}\s*\+\s*\\text\{([^}]+)\}\s*\+\s*\\text\{([^}]+)\}\$\$/g, '`$1 + $2 + $3 + $4`');

  const tokens = cleaned.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return <code key={idx}>{token.slice(1, -1)}</code>;
    }
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return <strong key={idx}>{token.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
}

function parseMarkdownDocument(markdown: string): {
  blocks: DocBlock[];
  headings: ParsedHeading[];
} {
  const lines = markdown.split(/\r?\n/);
  const blocks: DocBlock[] = [];
  const headings: ParsedHeading[] = [];

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed === '---' || trimmed.startsWith('# ')) {
      i++;
      continue;
    }

    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim() || 'text';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({
        type: 'code',
        language,
        code: codeLines.join('\n')
      });
      continue;
    }

    if (trimmed.startsWith('## ')) {
      const headingText = trimmed.replace(/^##\s+/, '');
      const headingId = slugifyHeading(headingText);
      headings.push({ id: headingId, text: headingText, level: 2 });
      blocks.push({ type: 'heading', level: 2, id: headingId, text: headingText });
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      const headingText = trimmed.replace(/^###\s+/, '');
      const headingId = slugifyHeading(headingText);
      headings.push({ id: headingId, text: headingText, level: 3 });
      blocks.push({ type: 'heading', level: 3, id: headingId, text: headingText });
      i++;
      continue;
    }

    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        const cleanedQuote = lines[i]
          .trim()
          .replace(/^>\s*/, '')
          .replace(/^\[!(WARNING|IMPORTANT|NOTE)\]\s*/i, '');
        if (cleanedQuote) quoteLines.push(cleanedQuote);
        i++;
      }
      blocks.push({
        type: 'callout',
        text: quoteLines.join(' ')
      });
      continue;
    }

    if (trimmed.startsWith('|') && i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) {
      const parseCells = (rowStr: string) =>
        rowStr
          .trim()
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((cell) => cell.trim().replace(/✓/g, 'Verified:'));

      const headers = parseCells(lines[i]);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(parseCells(lines[i]));
        i++;
      }
      blocks.push({ type: 'table', headers, rows });
      continue;
    }

    if (/^([-*]|\d+\.)\s+/.test(trimmed)) {
      const ordered = /^\d+\.\s+/.test(trimmed);
      const listItems: string[] = [];
      while (i < lines.length && /^(\s*[-*]|\s*\d+\.)\s+/.test(lines[i])) {
        listItems.push(lines[i].trim().replace(/^([-*]|\d+\.)\s+/, ''));
        i++;
      }
      blocks.push({ type: 'list', ordered, items: listItems });
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      lines[i].trim() !== '---' &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('>') &&
      !lines[i].trim().startsWith('|') &&
      !/^([-*]|\d+\.)\s+/.test(lines[i].trim())
    ) {
      paragraphLines.push(lines[i].trim());
      i++;
    }
    if (paragraphLines.length > 0) {
      blocks.push({
        type: 'paragraph',
        text: paragraphLines.join(' ')
      });
    } else {
      i++;
    }
  }

  return { blocks, headings };
}

export const DocsViewer: React.FC<DocsViewerProps> = ({
  selectedDoc,
  onSelectDoc,
  onNavigateView
}) => {
  const activeDocName = selectedDoc || 'ARCHITECTURE.md';
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedBlockIndex, setCopiedBlockIndex] = useState<number | null>(null);

  const flatDocs = useMemo(
    () =>
      DOC_CATALOG.flatMap((group) =>
        group.items.map((item) => ({
          ...item,
          sectionTitle: group.section
        }))
      ),
    []
  );

  const currentDocIndex = flatDocs.findIndex((doc) => doc.name === activeDocName);
  const activeDocMeta = flatDocs[currentDocIndex] || flatDocs[0];
  const prevDocMeta = currentDocIndex > 0 ? flatDocs[currentDocIndex - 1] : undefined;
  const nextDocMeta =
    currentDocIndex >= 0 && currentDocIndex < flatDocs.length - 1
      ? flatDocs[currentDocIndex + 1]
      : undefined;

  const rawMarkdown = docsData[activeDocMeta.name] || '';
  const { blocks, headings } = useMemo(
    () => parseMarkdownDocument(rawMarkdown),
    [rawMarkdown]
  );

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(rawMarkdown);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleCopyCodeBlock = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedBlockIndex(index);
    setTimeout(() => setCopiedBlockIndex(null), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([rawMarkdown], { type: 'text/markdown;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = activeDocMeta.name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
  };

  return (
    <div id="docs">
      <div className="docs-mobile-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', width: '100%' }}>
          {flatDocs.map((docItem) => {
            const isActive = docItem.name === activeDocMeta.name;
            return (
              <button
                key={docItem.name}
                type="button"
                onClick={() => onSelectDoc(docItem.name)}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
              >
                {docItem.title}
              </button>
            );
          })}
        </div>
      </div>

      <div className="docs-layout">
        <aside className="docs-sidebar" aria-label="Documentation Sidebar">
          {onNavigateView && (
            <div style={{ marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => onNavigateView('simulator')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <span>Container Simulator</span>
                <ArrowUpRightIcon size={14} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {DOC_CATALOG.map((group) => (
              <div key={group.section}>
                <h3
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-muted)',
                    padding: '4px 8px',
                    marginBottom: '4px'
                  }}
                >
                  {group.section}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {group.items.map((item) => {
                    const isActive = item.name === activeDocMeta.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => onSelectDoc(item.name)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 10px',
                          fontSize: '12px',
                          fontFamily: 'inherit',
                          backgroundColor: isActive ? 'var(--bg-subtle)' : 'transparent',
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontWeight: isActive ? 600 : 400,
                          border: 'none',
                          borderLeft: isActive ? '2px solid var(--text-primary)' : '2px solid transparent',
                          cursor: 'pointer',
                          transition: 'all 120ms ease'
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </span>
                        <span className="kbd-badge" style={{ fontSize: '9px' }}>
                          {item.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="docs-main">
          <article className="docs-article">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '16px'
              }}
            >
              <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>Docs</span>
                <span>/</span>
                <span>{activeDocMeta.sectionTitle}</span>
                <span>/</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{activeDocMeta.title}</span>
              </nav>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleCopyRaw}
                  className="btn btn-secondary btn-sm"
                >
                  {copiedRaw ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                  <span>{copiedRaw ? 'Copied Markdown' : 'Copy Markdown'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadMarkdown}
                  className="btn btn-outline btn-sm"
                >
                  <DownloadIcon size={13} />
                  <span>Download .md</span>
                </button>
              </div>
            </div>

            <header
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '22px',
                marginBottom: '24px'
              }}
            >
              <h1
                style={{
                  fontSize: 'clamp(22px, 3.5vw, 30px)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  marginBottom: '8px'
                }}
              >
                {activeDocMeta.title}
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {activeDocMeta.description}
              </p>
            </header>

            <div className="docs-prose">
              {blocks.map((block, index) => {
                if (block.type === 'heading') {
                  return block.level === 2 ? (
                    <h2 key={index} id={block.id}>
                      {block.text}
                    </h2>
                  ) : (
                    <h3 key={index} id={block.id}>
                      {block.text}
                    </h3>
                  );
                }

                if (block.type === 'paragraph') {
                  return <p key={index}>{renderInlineFormatting(block.text)}</p>;
                }

                if (block.type === 'callout') {
                  return (
                    <div key={index} className="callout callout-warning">
                      {renderInlineFormatting(block.text)}
                    </div>
                  );
                }

                if (block.type === 'list') {
                  const ListTag = block.ordered ? 'ol' : 'ul';
                  return (
                    <ListTag key={index}>
                      {block.items.map((itemText, itemIdx) => (
                        <li key={itemIdx}>{renderInlineFormatting(itemText)}</li>
                      ))}
                    </ListTag>
                  );
                }

                if (block.type === 'table') {
                  return (
                    <div key={index} className="docs-table-wrap">
                      <table className="docs-table">
                        <thead>
                          <tr>
                            {block.headers.map((header, hIdx) => (
                              <th key={hIdx}>{renderInlineFormatting(header)}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {block.rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => {
                                const parts = cell.split(/<br\s*\/?>/i);
                                return (
                                  <td key={cIdx}>
                                    {parts.map((part, pIdx) => (
                                      <div key={pIdx}>{renderInlineFormatting(part.replace(/•\s*/g, '- '))}</div>
                                    ))}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                if (block.type === 'code') {
                  return (
                    <div key={index} style={{ position: 'relative', margin: '16px 0' }}>
                      <pre className="code-block" style={{ margin: 0, paddingRight: '72px' }}>
                        <code>{block.code}</code>
                      </pre>
                      <button
                        type="button"
                        onClick={() => handleCopyCodeBlock(block.code, index)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          backgroundColor: 'var(--bg-muted)',
                          border: '1px solid var(--border-subtle)',
                          color: copiedBlockIndex === index ? 'var(--success)' : 'var(--text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        {copiedBlockIndex === index ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            <nav
              style={{
                marginTop: '44px',
                paddingTop: '24px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px'
              }}
            >
              {prevDocMeta ? (
                <button
                  type="button"
                  onClick={() => onSelectDoc(prevDocMeta.name)}
                  style={{
                    padding: '16px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-page)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    &larr; Previous
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {prevDocMeta.title}
                  </span>
                </button>
              ) : (
                <div />
              )}

              {nextDocMeta ? (
                <button
                  type="button"
                  onClick={() => onSelectDoc(nextDocMeta.name)}
                  style={{
                    padding: '16px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-page)',
                    textAlign: 'right',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    Next &rarr;
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {nextDocMeta.title}
                  </span>
                </button>
              ) : (
                <div />
              )}
            </nav>
          </article>

          {headings.length > 0 && (
            <aside className="docs-toc" aria-label="On This Page">
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                  marginBottom: '12px'
                }}
              >
                On This Page
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    style={{
                      display: 'block',
                      paddingLeft: heading.level === 3 ? '12px' : '0',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4
                    }}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};
