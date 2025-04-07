import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full h-full min-h-[200px] flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertTitle className="flex items-center justify-between">
              <span>Something went wrong</span>
              <Button variant="ghost" size="sm" onClick={this.resetError}>
                <RefreshCw className="h-4 w-4 mr-1" />
                <span>Retry</span>
              </Button>
            </AlertTitle>
            <AlertDescription className="mt-2">
              {this.state.error?.message || 'An unknown error occurred.'}
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;