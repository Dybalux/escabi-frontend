import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">
                            Algo salió mal
                        </h1>
                        <p className="text-gray-700 mb-4">
                            La aplicación encontró un error. Por favor, recarga la página.
                        </p>
                        <details className="mb-4">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                Ver detalles del error
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
                                {this.state.error && this.state.error.toString()}
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                        >
                            Recargar página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
