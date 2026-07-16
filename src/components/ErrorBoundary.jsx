import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', color: '#ef4444' }}>Something went wrong.</h1>
          <p style={{ marginTop: 10, color: '#6b7280' }}>We are sorry, but an unexpected error occurred.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              marginTop: 20, padding: '10px 20px', background: '#4f46e5', 
              color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' 
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
