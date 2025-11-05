export interface Consent {
  userId: string;
  active: boolean;
  grantedAt?: string;
  revokedAt?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ConsentRequest {
  userId: string;
  agreed: boolean;
  timestamp: string;
}

export interface ConsentRevocation {
  userId: string;
  reason?: string;
  timestamp: string;
}

