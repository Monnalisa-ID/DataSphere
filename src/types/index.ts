export type UserRole = 'admin' | 'manager' | 'viewer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  active: boolean;
}

export interface MetricHistory {
  date: string;
  value: number;
}

export interface MetricData {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number; // percentage change, e.g. +12.5 or -3.2
  category: 'financial' | 'operational' | 'hr' | 'sales';
  history: MetricHistory[];
  lastUpdated: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  ip: string;
  status: 'success' | 'blocked';
  reason?: string;
  details?: string;
}

export interface ExploitAttempt {
  id: string;
  timestamp: string;
  type: 'XSS' | 'SQL Injection' | 'CSRF' | 'Rate Limit';
  payload: string;
  attackerIp: string;
  sanitizedPayload?: string;
  status: 'blocked' | 'sanitized';
}

export interface VulnerabilityPatch {
  id: string;
  name: string;
  description: string;
  patched: boolean;
}

export interface DatabaseSyncStatus {
  isConnected: boolean;
  syncIntervalMs: number;
  lastSyncedAt: string;
  simulatedLatencyMs: number;
  activeConnectionsCount: number;
}
