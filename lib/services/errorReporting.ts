/**
 * Centralized Error Reporting
 *
 * Provides consistent error handling and reporting across the application.
 * Can be extended with external services like Sentry or Bugsnag.
 */

export interface ErrorContext {
  userId?: string;
  screen?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  error: Error;
  context?: ErrorContext;
  timestamp: Date;
  environment: string;
  isFatal: boolean;
}

class ErrorReportingService {
  private static instance: ErrorReportingService;
  private errorQueue: ErrorReport[] = [];
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  /**
   * Initialize the error reporting service
   */
  public initialize(): void {
    if (this.isInitialized) {
      return;
    }

    // Set up global error handlers
    this.setupGlobalErrorHandlers();
    this.isInitialized = true;

    if (__DEV__) {
      console.log('🛡️ Error reporting service initialized');
    }
  }

  /**
   * Report an error with context
   */
  public reportError(
    error: Error,
    context?: ErrorContext,
    isFatal: boolean = false
  ): void {
    const report: ErrorReport = {
      error,
      context,
      timestamp: new Date(),
      environment: __DEV__ ? 'development' : 'production',
      isFatal,
    };

    // Add to queue
    this.errorQueue.push(report);

    // Handle immediately
    this.handleError(report);

    // Keep only last 50 errors in queue
    if (this.errorQueue.length > 50) {
      this.errorQueue = this.errorQueue.slice(-50);
    }
  }

  /**
   * Report a non-fatal error
   */
  public reportWarning(error: Error, context?: ErrorContext): void {
    this.reportError(error, context, false);
  }

  /**
   * Report a fatal error that crashes the app
   */
  public reportFatalError(error: Error, context?: ErrorContext): void {
    this.reportError(error, context, true);
  }

  /**
   * Handle database errors specifically
   */
  public reportDatabaseError(
    error: Error,
    query: string,
    context?: ErrorContext
  ): void {
    this.reportError(error, {
      ...context,
      action: 'database_query',
      metadata: { query },
    });
  }

  /**
   * Handle network errors specifically
   */
  public reportNetworkError(
    error: Error,
    url: string,
    method: string,
    context?: ErrorContext
  ): void {
    this.reportError(error, {
      ...context,
      action: 'network_request',
      metadata: { url, method },
    });
  }

  /**
   * Handle authentication errors specifically
   */
  public reportAuthError(error: Error, context?: ErrorContext): void {
    this.reportError(error, {
      ...context,
      action: 'authentication',
    });
  }

  /**
   * Get recent errors for debugging
   */
  public getRecentErrors(): ErrorReport[] {
    return [...this.errorQueue];
  }

  /**
   * Clear error queue
   */
  public clearErrors(): void {
    this.errorQueue = [];
  }

  /**
   * Handle individual error report
   */
  private handleError(report: ErrorReport): void {
    if (__DEV__) {
      this.logErrorInDevelopment(report);
    } else {
      this.handleProductionError(report);
    }
  }

  /**
   * Log error in development with detailed information
   */
  private logErrorInDevelopment(report: ErrorReport): void {
    const { error, context, isFatal } = report;

    console.group(`🚨 ${isFatal ? 'FATAL' : 'ERROR'}: ${error.name}`);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);

    if (context) {
      console.log('Context:', context);
    }

    console.log('Timestamp:', report.timestamp.toISOString());
    console.groupEnd();
  }

  /**
   * Handle error in production (can be extended with external services)
   */
  private handleProductionError(report: ErrorReport): void {
    // In production, log minimal information
    console.error(
      `[${report.isFatal ? 'FATAL' : 'ERROR'}] ${report.error.name}: ${
        report.error.message
      }`
    );

    // TODO: Integrate with external error reporting service
    // Example: Sentry.captureException(report.error, { extra: report.context });
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Handle global JavaScript errors in React Native
    if (typeof ErrorUtils !== 'undefined') {
      const originalHandler = ErrorUtils.getGlobalHandler();

      ErrorUtils.setGlobalHandler((error, isFatal) => {
        this.reportError(error, { action: 'global_error' }, isFatal);

        // Call original handler
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });
    }

    // Handle unhandled promise rejections (React Native specific)
    const originalPromiseRejectionHandler =
      require('react-native/Libraries/Core/ExceptionsManager').default
        .handleUncaughtException;

    if (originalPromiseRejectionHandler) {
      require('react-native/Libraries/Core/ExceptionsManager').default.handleUncaughtException =
        (error: Error, isFatal: boolean) => {
          this.reportError(
            error,
            { action: 'unhandled_promise_rejection' },
            isFatal
          );

          // Call original handler
          originalPromiseRejectionHandler(error, isFatal);
        };
    }
  }
}

// Export singleton instance
export const errorReporting = ErrorReportingService.getInstance();

/**
 * Convenience functions for common error reporting patterns
 */

export const reportError = (error: Error, context?: ErrorContext): void => {
  errorReporting.reportError(error, context);
};

export const reportWarning = (error: Error, context?: ErrorContext): void => {
  errorReporting.reportWarning(error, context);
};

export const reportFatalError = (
  error: Error,
  context?: ErrorContext
): void => {
  errorReporting.reportFatalError(error, context);
};

export const reportDatabaseError = (
  error: Error,
  query: string,
  context?: ErrorContext
): void => {
  errorReporting.reportDatabaseError(error, query, context);
};

export const reportNetworkError = (
  error: Error,
  url: string,
  method: string = 'GET',
  context?: ErrorContext
): void => {
  errorReporting.reportNetworkError(error, url, method, context);
};

export const reportAuthError = (error: Error, context?: ErrorContext): void => {
  errorReporting.reportAuthError(error, context);
};

/**
 * Initialize error reporting on app startup
 */
export const initializeErrorReporting = (): void => {
  errorReporting.initialize();
};
