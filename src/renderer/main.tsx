import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('FrameKit Root Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: 'sans-serif',
            background: '#f8f9fa',
            color: '#111827',
            textAlign: 'center'
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
            FrameKit Initialization Error
          </h2>
          <p
            style={{
              color: '#dc2626',
              fontSize: '12px',
              marginBottom: '16px',
              maxWidth: '380px',
              wordBreak: 'break-all'
            }}
          >
            {this.state.error?.message || 'An unexpected error occurred while launching.'}
          </p>
          <button
            onClick={() => {
              try {
                localStorage.clear();
              } catch {}
              window.location.reload();
            }}
            style={{
              padding: '10px 20px',
              background: '#111827',
              color: '#ffffff',
              border: 'none',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Reset Settings & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
