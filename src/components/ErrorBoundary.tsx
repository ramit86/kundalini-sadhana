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
    console.error('[ErrorBoundary] runtime error', error);
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
            maxWidth: 640,
            width: '100%',
            border: '1px solid rgba(200,169,110,0.22)',
            background: 'linear-gradient(180deg, rgba(20,16,12,0.94) 0%, rgba(12,10,8,0.94) 100%)',
            borderRadius: 14,
            boxShadow: '0 16px 30px rgba(0,0,0,0.35)',
            padding: '0.95rem 1rem',
          }}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C8A96E', marginBottom: 8 }}>
              Unexpected Error
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: '#D7CCBD', wordBreak: 'break-word' }}>
              {this.state.message || 'Unknown runtime error'}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
