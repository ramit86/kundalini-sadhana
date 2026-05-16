import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] runtime error', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0A0806',
          color: '#E8DDD0',
          fontFamily: "'Raleway', sans-serif",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            maxWidth: 720,
            width: '100%',
            border: '1px solid rgba(220,90,90,0.35)',
            background: 'rgba(220,90,90,0.08)',
            borderRadius: 12,
            padding: '0.9rem 1rem',
          }}>
            <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#E5A0A0', marginBottom: 8 }}>
              Runtime Error
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5, color: '#F0DADA', wordBreak: 'break-word' }}>
              {this.state.message || 'Unknown runtime error'}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

