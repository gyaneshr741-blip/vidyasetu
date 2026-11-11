import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('VidyaSetu error boundary caught error:', error, info);
  }

  private handleRecover = () => {
    this.setState({ hasError: false, message: '' });
  };

  private handleHardReset = () => {
    this.props.onReset();
    this.setState({ hasError: false, message: '' });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="boot-state" role="alert">
        <div className="card" style={{ maxWidth: '460px', textAlign: 'left' }}>
          <h2>Something went wrong</h2>
          <p>{this.state.message}</p>
          <div className="actions-row">
            <button type="button" onClick={this.handleRecover}>
              Try again
            </button>
            <button
              type="button"
              className="ghost"
              onClick={this.handleHardReset}
            >
              Reset portal data
            </button>
          </div>
        </div>
      </div>
    );
  }
}
