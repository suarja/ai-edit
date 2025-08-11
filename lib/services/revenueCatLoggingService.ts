import { createClient } from '@supabase/supabase-js';
import { PlanIdentifier, Database } from 'editia-core';
import { CustomerInfo, PurchasesOfferings } from 'react-native-purchases';
import { env } from '@/lib/config/env';
import { Json } from '../types/supabase-types';

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
  | 'user_fetch_failed'
  | 'sync_user_limits_started'
  | 'sync_user_limits_success'
  | 'sync_user_limits_failed'
  | 'user_usage_record_missing'
  | 'user_usage_record_created'
  | 'startup_customer_info_detailed'
  | 'plan_detection_logic'
  | 'subscription_state_comparison'
  | 'user_id_verification'
  | 'startup_flow_summary'
  | 'anonymous_user_identified'
  | 'anonymous_user_identify_failed';

export interface RevenueCatLogMetadata {
  message?: string;
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
  // Enhanced startup debugging fields
  full_customer_info?: any;
  entitlements_found?: string[];
  subscriptions_found?: string[];
  detection_method?: 'entitlements' | 'subscription_inference' | 'fallback';
  plan_detection_steps?: any[];
  database_plan?: PlanIdentifier;
  revenuecat_plan?: PlanIdentifier;
  user_ids?: {
    clerk?: string;
    supabase?: string;
    revenuecat_original?: string;
    revenuecat_current?: string;
  };
  startup_summary?: {
    auth_status?: string;
    revenuecat_init_success?: boolean;
    subscription_detected?: boolean;
    database_updated?: boolean;
    discrepancies?: string[];
  };
  device_type?: 'iPhone' | 'iPad' | 'simulator';
  os_version?: string;
  app_version?: string;
  is_first_launch?: boolean;
  // Anonymous user identification fields
  old_id?: string;
  new_id?: string;
  had_purchases?: boolean;
  anonymous_id?: string;
  app_user_id?: string;
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
      } as unknown as Json // (RevenueCatLogMetadata as Json)
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
    return this.logEvent('customer_info_load_success', {
      duration_ms: duration,
      customer_info: {
        originalAppUserId: customerInfo.originalAppUserId,
        activeSubscriptions: Object.keys(customerInfo.activeSubscriptions),
        entitlements: {
          ...customerInfo.entitlements,
        }
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

  async logSyncUserLimitsStarted(planId: PlanIdentifier, userId: string): Promise<void> {
    return this.logEvent('sync_user_limits_started', {
      plan_id: planId

    });
  }

  async logSyncUserLimitsSuccess(planId: PlanIdentifier, userId: string, duration: number): Promise<void> {
    return this.logEvent('sync_user_limits_success', {
      plan_id: planId,
      duration_ms: duration,
      error_message: `Successfully synced user ${userId} to plan ${planId}`
    });
  }

  async logSyncUserLimitsFailed(error: Error, planId: PlanIdentifier, userId: string, duration: number): Promise<void> {
    return this.logEvent('sync_user_limits_failed', {
      error_message: error.message,
      error_stack: error.stack,
      plan_id: planId,
      duration_ms: duration,
      error_code: `sync_failed_${userId}_${planId}`
    });
  }

  async logUserUsageRecordMissing(userId: string): Promise<void> {
    return this.logEvent('user_usage_record_missing', {
      error_message: `No user_usage record found for user ${userId}`
    });
  }

  async logUserUsageRecordCreated(userId: string, planId: PlanIdentifier): Promise<void> {
    return this.logEvent('user_usage_record_created', {
      plan_id: planId,
      error_message: `Created user_usage record for user ${userId} with plan ${planId}`
    });
  }

  // ============================================================================
  // ENHANCED STARTUP DEBUGGING METHODS
  // ============================================================================

  async logStartupCustomerInfoDetailed(customerInfo: CustomerInfo): Promise<void> {
    return this.logEvent('startup_customer_info_detailed', {
      full_customer_info: {
        originalAppUserId: customerInfo.originalAppUserId,
        activeSubscriptions: customerInfo.activeSubscriptions,
        allEntitlements: customerInfo.entitlements,
        nonSubscriptionTransactions: customerInfo.nonSubscriptionTransactions,
        requestDate: customerInfo.requestDate,
        firstSeen: customerInfo.firstSeen,
        originalApplicationVersion: customerInfo.originalApplicationVersion,
        originalPurchaseDate: customerInfo.originalPurchaseDate,
        managementURL: customerInfo.managementURL,
      },
      entitlements_found: Object.keys(customerInfo.entitlements.active),
      subscriptions_found: customerInfo.activeSubscriptions,
    });
  }

  async logPlanDetectionLogic(steps: {
    entitlementsFound: string[];
    subscriptionsFound: string[];
    detectionMethod: 'entitlements' | 'subscription_inference' | 'fallback';
    finalPlan: PlanIdentifier;
    reasoning: string;
  }): Promise<void> {
    return this.logEvent('plan_detection_logic', {
      entitlements_found: steps.entitlementsFound,
      subscriptions_found: steps.subscriptionsFound,
      detection_method: steps.detectionMethod,
      plan_id: steps.finalPlan,
      message: steps.reasoning,
      plan_detection_steps: [
        { step: 'check_entitlements', found: steps.entitlementsFound },
        { step: 'check_subscriptions', found: steps.subscriptionsFound },
        { step: 'apply_logic', method: steps.detectionMethod },
        { step: 'final_decision', plan: steps.finalPlan, reasoning: steps.reasoning }
      ]
    });
  }

  async logSubscriptionStateComparison(data: {
    databasePlan: PlanIdentifier;
    revenueCatPlan: PlanIdentifier;
    hasDiscrepancy: boolean;
    action: string;
  }): Promise<void> {
    return this.logEvent('subscription_state_comparison', {
      database_plan: data.databasePlan,
      revenuecat_plan: data.revenueCatPlan,
      message: `Database: ${data.databasePlan}, RevenueCat: ${data.revenueCatPlan}, Action: ${data.action}`,
      error_message: data.hasDiscrepancy ? `Discrepancy detected between database (${data.databasePlan}) and RevenueCat (${data.revenueCatPlan})` : undefined
    });
  }

  async logUserIdVerification(userIds: {
    clerkUserId?: string;
    supabaseUserId?: string;
    revenueCatOriginal?: string;
    revenueCatCurrent?: string;
  }): Promise<void> {
    return this.logEvent('user_id_verification', {
      user_ids: {
        clerk: userIds.clerkUserId,
        supabase: userIds.supabaseUserId,
        revenuecat_original: userIds.revenueCatOriginal,
        revenuecat_current: userIds.revenueCatCurrent
      },
      message: `Clerk: ${userIds.clerkUserId}, Supabase: ${userIds.supabaseUserId}, RC Original: ${userIds.revenueCatOriginal}, RC Current: ${userIds.revenueCatCurrent}`
    });
  }

  async logStartupFlowSummary(summary: {
    authStatus: string;
    revenueCatInitSuccess: boolean;
    subscriptionDetected: boolean;
    finalPlan: PlanIdentifier;
    databaseUpdated: boolean;
    discrepancies: string[];
    totalDuration: number;
  }): Promise<void> {
    return this.logEvent('startup_flow_summary', {
      startup_summary: {
        auth_status: summary.authStatus,
        revenuecat_init_success: summary.revenueCatInitSuccess,
        subscription_detected: summary.subscriptionDetected,
        database_updated: summary.databaseUpdated,
        discrepancies: summary.discrepancies
      },
      plan_id: summary.finalPlan,
      duration_ms: summary.totalDuration,
      message: `Startup completed: Auth=${summary.authStatus}, RC=${summary.revenueCatInitSuccess}, Subscription=${summary.subscriptionDetected}, Plan=${summary.finalPlan}, DB Updated=${summary.databaseUpdated}${summary.discrepancies.length > 0 ? `, Issues: ${summary.discrepancies.join(', ')}` : ''}`
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