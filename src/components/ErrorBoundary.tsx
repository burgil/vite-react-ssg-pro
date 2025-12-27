import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    showErrorDetails?: boolean;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
    errorId: string;
    timestamp: string;
    showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    private retryCount = 0;
    private maxRetries = 3;

    public state: State = {
        hasError: false,
        errorId: '',
        timestamp: '',
        showDetails: false
    };

    public static getDerivedStateFromError(error: Error): Partial<State> {
        const errorId = `ERR_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        return {
            hasError: true,
            error,
            errorId,
            timestamp: new Date().toISOString()
        };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.group(`🚨 ErrorBoundary - Error ID: ${this.state.errorId}`);
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
        console.error('Component Stack:', errorInfo.componentStack);
        console.groupEnd();
        this.setState({ errorInfo });
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    private handleRetry = () => {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            this.setState({
                hasError: false,
                error: undefined,
                errorInfo: undefined,
                errorId: '',
                timestamp: '',
                showDetails: false
            });
        } else {
            window.location.reload();
        }
    };

    private toggleDetails = () => {
        this.setState(prevState => ({ showDetails: !prevState.showDetails }));
    };

    private copyErrorToClipboard = () => {
        const errorDetails = {
            errorId: this.state.errorId,
            timestamp: this.state.timestamp,
            message: this.state.error?.message,
            stack: this.state.error?.stack,
            componentStack: this.state.errorInfo?.componentStack,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
    };

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #141414 100%)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                        <div className="max-w-2xl w-full bg-gray-900 border border-red-500 rounded-lg p-6" style={{ marginTop: '20px', marginBottom: '20px' }}>
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">💥</div>
                                <h1 className="text-2xl font-bold text-red-400 mb-2">
                                    Application Error
                                </h1>
                                <p className="text-gray-300 text-sm">
                                    Error ID: <code className="bg-gray-800 px-2 py-1 rounded text-xs">{this.state.errorId}</code>
                                </p>
                                <p className="text-gray-400 text-xs mt-1">
                                    {new Date(this.state.timestamp).toLocaleString()}
                                </p>
                            </div>

                            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                                <h3 className="font-semibold text-red-300 mb-2">Error Summary</h3>
                                <p className="text-sm text-gray-300 mb-2">
                                    <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
                                </p>
                                {this.retryCount > 0 && (
                                    <p className="text-xs text-yellow-300">
                                        Retry attempt: {this.retryCount} of {this.maxRetries}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3 justify-center mb-4">
                                <button
                                    onClick={this.handleRetry}
                                    disabled={this.retryCount >= this.maxRetries}
                                    className={`px-4 py-2 rounded transition-colors text-sm font-medium ${this.retryCount >= this.maxRetries
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {this.retryCount >= this.maxRetries ? 'Max Retries Reached' : 'Try Again'}
                                </button>

                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium"
                                >
                                    Reload Page
                                </button>

                                <button
                                    onClick={this.toggleDetails}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium"
                                >
                                    {this.state.showDetails ? 'Hide Details' : 'Show Details'}
                                </button>

                                <button
                                    onClick={this.copyErrorToClipboard}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium"
                                >
                                    Copy Error Report
                                </button>
                            </div>

                            {this.state.showDetails && (
                                <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-200 mb-3">Technical Details</h3>

                                    <div className="space-y-3 text-xs">
                                        <div>
                                            <h4 className="font-medium text-gray-300 mb-1">Error Message:</h4>
                                            <pre className="bg-gray-900 p-2 rounded text-red-300 overflow-auto max-h-20">
                                                {this.state.error?.message}
                                            </pre>
                                        </div>

                                        {this.state.error?.stack && (
                                            <div>
                                                <h4 className="font-medium text-gray-300 mb-1">Stack Trace:</h4>
                                                <pre className="bg-gray-900 p-2 rounded text-gray-400 text-xs" style={{ overflowY: 'auto', maxHeight: '200px' }}>
                                                    {this.state.error.stack}
                                                </pre>
                                            </div>
                                        )}

                                        {this.state.errorInfo?.componentStack && (
                                            <div>
                                                <h4 className="font-medium text-gray-300 mb-1">Component Stack:</h4>
                                                <pre className="bg-gray-900 p-2 rounded text-gray-400 text-xs" style={{ overflowY: 'auto', maxHeight: '200px' }}>
                                                    {this.state.errorInfo.componentStack}
                                                </pre>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-600">
                                            <div>
                                                <h4 className="font-medium text-gray-300 mb-1">Environment:</h4>
                                                <p className="text-gray-400">{navigator.userAgent.slice(0, 60)}...</p>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-300 mb-1">URL:</h4>
                                                <p className="text-gray-400 break-all">{window.location.href}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;