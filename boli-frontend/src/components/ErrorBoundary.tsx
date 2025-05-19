// src/components/ErrorBoundary.tsx

import React, { ReactNode, Component, ErrorInfo } from 'react';
import styles from '../styles/ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error: error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h1 className={styles.errorTitle}>Something went wrong</h1>
            
            {this.state.error?.message.includes('Attempt to get default algod configuration') ? (
              <div className={styles.errorMessage}>
                <p>
                  Please make sure to set up your environment variables correctly. Create a .env file based on .env.template and fill in the required values.
                </p>
                <p className={styles.errorDetail}>
                  This error typically occurs when the application cannot find the necessary Algorand node configuration.
                </p>
              </div>
            ) : (
              <p className={styles.errorMessage}>{this.state.error?.message || 'An unknown error occurred'}</p>
            )}
            
            <button 
              className={styles.refreshButton}
              onClick={() => window.location.reload()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12C3 16.9706 7.02944 21 12 21C16.2832 21 19.8675 18.008 20.777 14M21 8C20.1625 4.59333 16.9441 2 13.2 2C8.77124 2 5.13859 5.16229 4.24353 9.32788M21 3V8H16M3 16V21H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Refresh Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;