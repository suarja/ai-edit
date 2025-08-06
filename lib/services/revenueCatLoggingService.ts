import { createClient } from '@supabase/supabase-js';
import { PlanIdentifier, Database } from 'editia-core';
import { CustomerInfo, PurchasesOfferings } from 'react-native-purchases';
import { env } from '@/lib/config/env';

export type RevenueCatEventType = 
  | 'init_start'
  | 'init_success' 
  | 'init_failed'
  | 'init_timeout'
  | 'offerings_load_start'
  | 'offerings_load_success'
  | 'offerings_load_failed'
  | 'offerings_load_timeout'
  | 'customer_info_load_start'
  | 'customer_info_load_success'
  | 'customer_info_load_failed'
  | 'customer_info_load_timeout'
  | 'purchase_started'
  | 'purchase_success'
  | 'purchase_failed'
  | 'purchase_cancelled'
  | 'restore_started'
  | 'restore_success'
  | 'restore_failed'
  | 'entitlement_updated'
  | 'subscription_expired'
  | 'cold_start_issue'
  | 'user_fetch_failed';

export interface RevenueCatLogMetadata {
  event_type: RevenueCatEventType;
  duration_ms?: number;
  product_id?: string;
  plan_id?: PlanIdentifier;
  price?: number;
  currency?: string;
  transaction_id?: string;
  error_code?: string;
  error_message?: string;
  error_stack?: string;
  customer_info?: Partial<CustomerInfo>;
  offerings_count?: number;
  device_type?: 'iPhone' | 'iPad' | 'simulator';
  os_version?: string;
  app_version?: string;
  is_first_launch?: boolean;
  retry_attempt?: number;
  network_status?: 'connected' | 'disconnected' | 'poor';
  session_id?: string;
  timestamp?: string;
}

class RevenueCatLoggingService {
  private static instance: RevenueCatLoggingService;
  private sessionId: string;
  private userId: string | null = null;
  private supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): RevenueCatLoggingService {
    if (!RevenueCatLoggingService.instance) {
      RevenueCatLoggingService.instance = new RevenueCatLoggingService();
    }
    return RevenueCatLoggingService.instance;
  }

  private generateSessionId(): string {
    return `rc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  setSupabaseClient(client: ReturnType<typeof createClient<Database>>) {
    this.supabaseClient = client;
  }

  async logEvent(
    eventType: RevenueCatEventType,
    metadata: Partial<RevenueCatLogMetadata> = {}
  ): Promise<void> {
    try {
      // Don't await - fire and forget pour ne pas impacter l'UX
      this.logEventAsync(eventType, metadata).catch((error) => {
        console.warn('RevenueCat logging failed:', error.message);
      });
    } catch (error) {
      // Silent fail - logging ne doit jamais casser l'app
      console.warn('RevenueCat logging error:', error);
    }
  }

  private async logEventAsync(
    eventType: RevenueCatEventType,
    metadata: Partial<RevenueCatLogMetadata> = {}
  ): Promise<void> {
    // Ne pas logger si pas de client Supabase configuré
    if (!this.supabaseClient) {
      return;
    }

    const logData = {
      user_id: this.userId,
      action: `revenuecat_${eventType}`,
      metadata: {
        ...metadata,
        event_type: eventType,
        session_id: this.sessionId,
        timestamp: new Date().toISOString(),
        platform: 'mobile',
      } as RevenueCatLogMetadata
    };

    const { error } = await this.supabaseClient
      .from('logs')
      .insert([logData]);

    if (error) {
      throw error;
    }
  }

  // Helper methods pour les événements courants
  async logInitStart(isFirstLaunch: boolean = false): Promise<void> {
    return this.logEvent('init_start', {
      is_first_launch: isFirstLaunch,
      timestamp: new Date().toISOString()
    });
  }

  async logInitSuccess(duration: number): Promise<void> {
    return this.logEvent('init_success', {
      duration_ms: duration
    });
  }

  async logInitFailed(error: Error, duration?: number, retryAttempt?: number): Promise<void> {
    return this.logEvent('init_failed', {
      error_message: error.message,
      error_stack: error.stack,
      duration_ms: duration,
      retry_attempt: retryAttempt
    });
  }

  async logInitTimeout(duration: number, retryAttempt?: number): Promise<void> {
    return this.logEvent('init_timeout', {
      duration_ms: duration,
      retry_attempt: retryAttempt
    });
  }

  async logOfferingsLoadStart(): Promise<void> {
    return this.logEvent('offerings_load_start');
  }

  async logOfferingsLoadSuccess(offerings: PurchasesOfferings, duration: number): Promise<void> {
    const offeringsCount = Object.keys(offerings.all).length;
    return this.logEvent('offerings_load_success', {
      offerings_count: offeringsCount,
      duration_ms: duration
    });
  }

  async logOfferingsLoadFailed(error: Error, duration: number): Promise<void> {
    return this.logEvent('offerings_load_failed', {
      error_message: error.message,
      error_stack: error.stack,
      duration_ms: duration
    });
  }

  async logOfferingsLoadTimeout(duration: number): Promise<void> {
    return this.logEvent('offerings_load_timeout', {
      duration_ms: duration
    });
  }

  async logCustomerInfoLoadStart(): Promise<void> {
    return this.logEvent('customer_info_load_start');
  }

  async logCustomerInfoLoadSuccess(customerInfo: CustomerInfo, duration: number): Promise<void> {
    const activeEntitlements = Object.keys(customerInfo.entitlements.active);
    return this.logEvent('customer_info_load_success', {
      duration_ms: duration,
      customer_info: {
        originalAppUserId: customerInfo.originalAppUserId,
        activeSubscriptions: Object.keys(customerInfo.activeSubscriptions),
        entitlements: activeEntitlements
      }
    });
  }

  async logCustomerInfoLoadFailed(error: Error, duration: number): Promise<void> {
    return this.logEvent('customer_info_load_failed', {
      error_message: error.message,
      error_stack: error.stack,
      duration_ms: duration
    });
  }

  async logCustomerInfoLoadTimeout(duration: number): Promise<void> {
    return this.logEvent('customer_info_load_timeout', {
      duration_ms: duration
    });
  }

  async logPurchaseStarted(productId: string, planId: PlanIdentifier): Promise<void> {
    return this.logEvent('purchase_started', {
      product_id: productId,
      plan_id: planId
    });
  }

  async logPurchaseSuccess(
    productId: string, 
    planId: PlanIdentifier, 
    transactionId: string,
    customerInfo: CustomerInfo
  ): Promise<void> {
    return this.logEvent('purchase_success', {
      product_id: productId,
      plan_id: planId,
      transaction_id: transactionId,
      customer_info: {
        originalAppUserId: customerInfo.originalAppUserId,
        activeSubscriptions: Object.keys(customerInfo.activeSubscriptions)
      }
    });
  }

  async logPurchaseFailed(error: Error, productId?: string): Promise<void> {
    return this.logEvent('purchase_failed', {
      error_message: error.message,
      error_stack: error.stack,
      product_id: productId
    });
  }

  async logColdStartIssue(details: string): Promise<void> {
    return this.logEvent('cold_start_issue', {
      error_message: details,
      is_first_launch: true
    });
  }

  async logUserFetchFailed(error: Error): Promise<void> {
    return this.logEvent('user_fetch_failed', {
      error_message: error.message,
      error_stack: error.stack
    });
  }

  // Timer utility pour mesurer les durées
  createTimer(): { stop: () => number } {
    const start = Date.now();
    return {
      stop: () => Date.now() - start
    };
  }
}

export const revenueCatLogger = RevenueCatLoggingService.getInstance();
export default RevenueCatLoggingService;