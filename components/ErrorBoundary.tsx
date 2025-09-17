import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
          <h1 className="text-3xl text-red-500 font-bold mb-4">Something went wrong</h1>
          <p className="text-slate-300 mb-4">The simulation encountered an unexpected error.</p>
          <button 
            className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-500"
            onClick={() => window.location.reload()}
          >
            Reload Application
          </button>
          {this.state.error && (
            <details className="mt-4 p-4 bg-slate-800 rounded-md max-w-2xl">
              <summary className="cursor-pointer text-slate-400">Error Details</summary>
              <pre className="mt-2 text-xs text-red-400 overflow-auto">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;