export interface OperatorAction {
  id: string;
  operatorId: string;
  action: ActionType;
  targetId: string;
  targetType: 'user' | 'recommendation';
  timestamp: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export type ActionType = 
  | 'approve'
  | 'reject'
  | 'flag'
  | 'view'
  | 'bulk_approve'
  | 'bulk_reject';

export interface BulkActionRequest {
  recommendationIds: string[];
  action: 'approve' | 'reject';
  reason?: string;
}

export interface BulkActionResult {
  successful: string[];
  failed: Array<{
    id: string;
    reason: string;
  }>;
}

export interface SystemMetrics {
  totalUsers: number;
  usersWithConsent: number;
  usersWithPersona: number;
  coveragePercentage: number;
  totalRecommendations: number;
  averageRecommendationsPerUser: number;
  recommendationsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    flagged: number;
  };
  averageLatency: number;
  errorCount: number;
  lastUpdated: string;
}

