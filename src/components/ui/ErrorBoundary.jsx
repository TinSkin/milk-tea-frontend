import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  //! Xử lý lỗi
  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Error Boundary caught an error:', error, errorInfo);
      // You can integrate with error tracking services like Sentry here
    }
  }

  //! Thử lại (reset state)
  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page or go back to the homepage.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              
              <Link
                to="/"
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <Home className="h-4 w-4" />
                Go to Homepage
              </Link>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <summary className="font-medium text-red-800 cursor-pointer">
                  Error Details (Development)
                </summary>
                <div className="mt-2 text-sm text-red-700 font-mono">
                  <p className="font-semibold">Error:</p>
                  <p className="mb-2">{this.state.error.toString()}</p>
                  
                  <p className="font-semibold">Stack Trace:</p>
                  <pre className="whitespace-pre-wrap overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;