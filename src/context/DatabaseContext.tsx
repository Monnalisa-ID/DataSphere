import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { 
  UserRole, 
  User, 
  MetricData, 
  AuditLog, 
  ExploitAttempt, 
  VulnerabilityPatch, 
  DatabaseSyncStatus 
} from '../types';

interface DatabaseContextType {
  currentRole: UserRole;
  currentUser: User;
  setRole: (role: UserRole) => void;
  metrics: MetricData[];
  logs: AuditLog[];
  exploits: ExploitAttempt[];
  patches: VulnerabilityPatch[];
  syncStatus: DatabaseSyncStatus;
  rateLimitBlocked: boolean;
  rateLimitTimer: number;
  csrfToken: string;
  isRealtimeActive: boolean;
  setRealtimeActive: (active: boolean) => void;
  addMetric: (metric: Omit<MetricData, 'id' | 'lastUpdated' | 'change' | 'history'>, token: string) => { success: boolean; error?: string };
  updateMetric: (id: string, value: number, token: string, name?: string) => { success: boolean; error?: string };
  deleteMetric: (id: string, token: string) => { success: boolean; error?: string };
  triggerExploitSimulation: (type: 'XSS' | 'SQL Injection' | 'CSRF' | 'Rate Limit') => void;
  togglePatch: (id: string) => void;
  rotateCsrfToken: () => void;
  clearLogs: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Helper for generating UUIDs
const uuid = () => Math.random().toString(36).substring(2, 9);

// Mock Users
const USERS: Record<UserRole, User> = {
  admin: { id: 'usr-admin', name: 'Alexander Wright', role: 'admin', email: 'a.wright@securecorp.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces', active: true },
  manager: { id: 'usr-manager', name: 'Sophia Chen', role: 'manager', email: 's.chen@securecorp.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces', active: true },
  viewer: { id: 'usr-viewer', name: 'Daniel Kim', role: 'viewer', email: 'd.kim@securecorp.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces', active: true }
};

// Initial database records
const INITIAL_METRICS: MetricData[] = [
  {
    id: 'met-1',
    name: 'Quarterly Revenue',
    value: 3480000,
    unit: '$',
    change: 12.4,
    category: 'financial',
    lastUpdated: new Date().toLocaleTimeString(),
    history: [
      { date: 'Jan', value: 2900000 },
      { date: 'Feb', value: 3050000 },
      { date: 'Mar', value: 3100000 },
      { date: 'Apr', value: 3250000 },
      { date: 'May', value: 3350000 },
      { date: 'Jun', value: 3480000 },
    ]
  },
  {
    id: 'met-2',
    name: 'Active Customers',
    value: 12490,
    unit: '',
    change: 8.3,
    category: 'sales',
    lastUpdated: new Date().toLocaleTimeString(),
    history: [
      { date: 'Jan', value: 11200 },
      { date: 'Feb', value: 11500 },
      { date: 'Mar', value: 11800 },
      { date: 'Apr', value: 12050 },
      { date: 'May', value: 12200 },
      { date: 'Jun', value: 12490 },
    ]
  },
  {
    id: 'met-3',
    name: 'Server CPU Load',
    value: 34,
    unit: '%',
    change: -4.5,
    category: 'operational',
    lastUpdated: new Date().toLocaleTimeString(),
    history: [
      { date: 'Jan', value: 55 },
      { date: 'Feb', value: 48 },
      { date: 'Mar', value: 42 },
      { date: 'Apr', value: 45 },
      { date: 'May', value: 38 },
      { date: 'Jun', value: 34 },
    ]
  },
  {
    id: 'met-4',
    name: 'Active Projects',
    value: 42,
    unit: '',
    change: -2.1,
    category: 'operational',
    lastUpdated: new Date().toLocaleTimeString(),
    history: [
      { date: 'Jan', value: 38 },
      { date: 'Feb', value: 40 },
      { date: 'Mar', value: 45 },
      { date: 'Apr', value: 44 },
      { date: 'May', value: 43 },
      { date: 'Jun', value: 42 },
    ]
  },
  {
    id: 'met-5',
    name: 'Monthly New Hires',
    value: 18,
    unit: '',
    change: 25.0,
    category: 'hr',
    lastUpdated: new Date().toLocaleTimeString(),
    history: [
      { date: 'Jan', value: 12 },
      { date: 'Feb', value: 10 },
      { date: 'Mar', value: 15 },
      { date: 'Apr', value: 14 },
      { date: 'May', value: 14 },
      { date: 'Jun', value: 18 },
    ]
  },
  {
    id: 'met-6',
    name: 'Customer Acquisition Cost',
    value: 124,
    unit: '$',
    change: -5.2,
    category: 'sales',
    lastUpdated: new Date().toLocaleTimeString(),
    history: [
      { date: 'Jan', value: 135 },
      { date: 'Feb', value: 132 },
      { date: 'Mar', value: 130 },
      { date: 'Apr', value: 128 },
      { date: 'May', value: 126 },
      { date: 'Jun', value: 124 },
    ]
  }
];

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [metrics, setMetrics] = useState<MetricData[]>(() => {
    const saved = localStorage.getItem('company_metrics');
    return saved ? JSON.parse(saved) : INITIAL_METRICS;
  });
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [exploits, setExploits] = useState<ExploitAttempt[]>([]);
  const [isRealtimeActive, setRealtimeActive] = useState<boolean>(true);
  const [rateLimitBlocked, setRateLimitBlocked] = useState<boolean>(false);
  const [rateLimitTimer, setRateLimitTimer] = useState<number>(0);
  const [csrfToken, setCsrfToken] = useState<string>(() => uuid());
  
  const [patches, setPatches] = useState<VulnerabilityPatch[]>([
    { id: 'patch-xss', name: 'XSS Sanitization Filter', description: 'HTML-encodes input parameters before saving to database', patched: true },
    { id: 'patch-sql', name: 'SQL Query Parameterization', description: 'Prevents structural query manipulation in inputs', patched: true },
    { id: 'patch-csrf', name: 'Anti-CSRF Verification Token', description: 'Validates cryptographic tokens on all destructive state-mutating actions', patched: true },
    { id: 'patch-rate', name: 'Rate Limiter (Token Bucket)', description: 'Limits clients to maximum of 5 writes per 10 seconds to prevent DDoS/Brute force', patched: true }
  ]);

  const [syncStatus, setSyncStatus] = useState<DatabaseSyncStatus>({
    isConnected: true,
    syncIntervalMs: 3000,
    lastSyncedAt: new Date().toLocaleTimeString(),
    simulatedLatencyMs: 24,
    activeConnectionsCount: 1
  });

  const rateLimitCounter = useRef<number[]>([]);
  const broadcastChannel = useRef<BroadcastChannel | null>(null);

  // Sync with LocalStorage and setup BroadcastChannel for Multi-tab sync
  useEffect(() => {
    localStorage.setItem('company_metrics', JSON.stringify(metrics));
  }, [metrics]);

  useEffect(() => {
    // Check if BroadcastChannel is supported
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      broadcastChannel.current = new BroadcastChannel('company_database_sync');
      
      const handleBroadcast = (event: MessageEvent) => {
        const { type, data } = event.data;
        
        // Simulating latency
        const latency = Math.floor(Math.random() * 30) + 10;
        setSyncStatus(prev => ({
          ...prev,
          lastSyncedAt: new Date().toLocaleTimeString(),
          simulatedLatencyMs: latency
        }));

        if (type === 'SYNC_METRICS') {
          setMetrics(data);
          addAuditLog({
            action: 'Realtime Sync Received',
            status: 'success',
            details: `Synchronized ${data.length} metrics from peer connection (latency: ${latency}ms)`
          }, 'system');
        } else if (type === 'PING') {
          broadcastChannel.current?.postMessage({
            type: 'PONG',
            senderId: uuid()
          });
          setSyncStatus(prev => ({
            ...prev,
            activeConnectionsCount: Math.min(prev.activeConnectionsCount + 1, 5)
          }));
        } else if (type === 'PONG') {
          setSyncStatus(prev => ({
            ...prev,
            activeConnectionsCount: Math.min(prev.activeConnectionsCount + 1, 5)
          }));
        }
      };

      broadcastChannel.current.onmessage = handleBroadcast;
      
      // Ping others to declare existence
      broadcastChannel.current.postMessage({ type: 'PING', senderId: uuid() });
    }

    // Load initial logs
    addAuditLog({
      action: 'Session Initialized',
      status: 'success',
      details: `Database connection established with role [${currentRole.toUpperCase()}]`
    }, 'system');

    return () => {
      broadcastChannel.current?.close();
    };
  }, []);

  // Sync connections count periodically
  useEffect(() => {
    const checkConnections = setInterval(() => {
      if (broadcastChannel.current) {
        broadcastChannel.current.postMessage({ type: 'PING', senderId: uuid() });
      }
    }, 10000);
    return () => clearInterval(checkConnections);
  }, []);

  // Broadcast helper
  const broadcastChange = (updatedMetrics: MetricData[]) => {
    if (broadcastChannel.current) {
      broadcastChannel.current.postMessage({
        type: 'SYNC_METRICS',
        data: updatedMetrics,
        senderId: uuid()
      });
    }
  };

  // Switch role and log it
  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    addAuditLog({
      action: 'Role Switched',
      status: 'success',
      details: `Security context changed from ${currentRole} to ${role}`
    }, 'system', role);
  };

  // Helper to add audit logs
  const addAuditLog = (
    log: Omit<AuditLog, 'id' | 'timestamp' | 'userId' | 'userName' | 'userRole' | 'ip'>,
    actor: 'user' | 'system' = 'user',
    overrideRole?: UserRole
  ) => {
    const activeRole = overrideRole || currentRole;
    const userObj = USERS[activeRole];
    
    const newLog: AuditLog = {
      id: `log-${uuid()}`,
      timestamp: new Date().toLocaleTimeString() + '.' + String(new Date().getMilliseconds()).padStart(3, '0'),
      userId: actor === 'user' ? userObj.id : 'system-agent',
      userName: actor === 'user' ? userObj.name : 'System Core',
      userRole: activeRole,
      ip: actor === 'user' ? '192.168.1.104' : '127.0.0.1',
      ...log
    };

    setLogs(prev => [newLog, ...prev].slice(0, 100)); // cap logs at 100
  };

  // Helper to add exploit logs
  const addExploitAttempt = (attempt: Omit<ExploitAttempt, 'id' | 'timestamp'>) => {
    const newAttempt: ExploitAttempt = {
      id: `exp-${uuid()}`,
      timestamp: new Date().toLocaleTimeString(),
      ...attempt
    };
    setExploits(prev => [newAttempt, ...prev].slice(0, 50));
  };

  // Toggle patches
  const togglePatch = (id: string) => {
    setPatches(prev => prev.map(p => p.id === id ? { ...p, patched: !p.patched } : p));
    const patch = patches.find(p => p.id === id);
    if (patch) {
      addAuditLog({
        action: patch.patched ? 'Vulnerability Dispatched' : 'Vulnerability Patched',
        status: 'success',
        details: `Security component "${patch.name}" was ${patch.patched ? 'disabled (unpatched)' : 'enabled (patched)'}`
      }, 'system');
    }
  };

  // Anti-CSRF Token Rotation
  const rotateCsrfToken = () => {
    const newToken = uuid();
    setCsrfToken(newToken);
    addAuditLog({
      action: 'CSRF Token Rotated',
      status: 'success',
      details: 'Cryptographic challenge-response token rotated successfully'
    }, 'system');
  };

  const clearLogs = () => {
    setLogs([]);
    addAuditLog({
      action: 'Logs Cleared',
      status: 'success',
      details: 'Audit trail database cleared by Admin'
    });
  };

  // Rate Limiting checker
  const checkRateLimit = (): boolean => {
    const isRateLimiterPatched = patches.find(p => p.id === 'patch-rate')?.patched;
    if (!isRateLimiterPatched) return true; // Rate limiting disabled, allow request

    const now = Date.now();
    // Filter events in the last 10 seconds
    rateLimitCounter.current = rateLimitCounter.current.filter(t => now - t < 10000);
    
    if (rateLimitCounter.current.length >= 5) {
      // Trigger Rate Limit Block
      setRateLimitBlocked(true);
      setRateLimitTimer(8);
      
      addExploitAttempt({
        type: 'Rate Limit',
        payload: 'Excessive requests (6+ in 10s)',
        attackerIp: '192.168.1.104',
        status: 'blocked'
      });

      addAuditLog({
        action: 'Write Throttled',
        status: 'blocked',
        reason: 'Rate limit exceeded (HTTP 429)',
        details: 'Client attempted multiple edits in a burst period. Execution throttled.'
      }, 'system');

      return false;
    }

    rateLimitCounter.current.push(now);
    return true;
  };

  // Countdown timer for rate limiting block
  useEffect(() => {
    if (rateLimitBlocked && rateLimitTimer > 0) {
      const interval = setInterval(() => {
        setRateLimitTimer(t => {
          if (t <= 1) {
            setRateLimitBlocked(false);
            clearInterval(interval);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [rateLimitBlocked, rateLimitTimer]);

  // Security Sanitization logic
  const sanitizeInput = (
    text: string
  ): { value: string; wasSanitized: boolean; attackDetected: 'XSS' | 'SQL Injection' | null } => {
    let wasSanitized = false;
    let attackDetected: 'XSS' | 'SQL Injection' | null = null;
    let result = text;

    const isXssPatched = patches.find(p => p.id === 'patch-xss')?.patched;
    const isSqlPatched = patches.find(p => p.id === 'patch-sql')?.patched;

    // 1. XSS Check: Look for <script>, javascript:, onerror= etc.
    const xssPattern = /<script[^>]*>([\s\S]*?)<\/script>|javascript:|on\w+\s*=/i;
    if (xssPattern.test(text)) {
      attackDetected = 'XSS';
      if (isXssPatched) {
        // Strip out HTML tags completely or HTML-encode
        result = text.replace(/<[^>]*>/g, '').replace(/on\w+\s*=\s*['"][^'"]*['"]/gi, '');
        wasSanitized = true;
      }
    }

    // 2. SQL Check: Look for OR 1=1, DROP TABLE, SELECT, '--', etc.
    const sqlPattern = /('|--|#|\/\*|\*\/|UNION|SELECT|INSERT|DROP|UPDATE|DELETE|OR\s+['"]?\d+['"]?\s*=\s*['"]?\d+)/i;
    if (sqlPattern.test(text)) {
      if (!attackDetected) attackDetected = 'SQL Injection';
      if (isSqlPatched) {
        // Strip SQL injection chars and escape ticks
        result = text.replace(/['"--#;]/g, '').replace(/(UNION|SELECT|INSERT|DROP|UPDATE|DELETE|OR)/gi, '');
        wasSanitized = true;
      }
    }

    return { value: result, wasSanitized, attackDetected };
  };

  // Check Role Permissions
  const hasPermission = (action: 'write' | 'delete'): boolean => {
    if (action === 'write') {
      return currentRole === 'admin' || currentRole === 'manager';
    }
    if (action === 'delete') {
      return currentRole === 'admin';
    }
    return false;
  };

  // Validate CSRF
  const validateCsrf = (token: string): boolean => {
    const isCsrfPatched = patches.find(p => p.id === 'patch-csrf')?.patched;
    if (!isCsrfPatched) return true; // Bypass validation if unpatched

    return token === csrfToken;
  };

  // Simulated Real-time Business Updates
  useEffect(() => {
    if (!isRealtimeActive) return;

    const interval = setInterval(() => {
      // Select a random metric to update
      const randomIndex = Math.floor(Math.random() * metrics.length);
      const targetMetric = metrics[randomIndex];
      
      let changeAmount = 0;
      let newValue = targetMetric.value;

      if (targetMetric.category === 'financial') {
        changeAmount = (Math.random() * 20000 - 8000); // finance goes up or down
        newValue = Math.max(100000, Math.round(targetMetric.value + changeAmount));
      } else if (targetMetric.category === 'sales') {
        changeAmount = Math.floor(Math.random() * 15 - 5); // clients change
        newValue = Math.max(10, targetMetric.value + changeAmount);
      } else if (targetMetric.name === 'Server CPU Load') {
        changeAmount = Math.floor(Math.random() * 10 - 5);
        newValue = Math.max(10, Math.min(95, targetMetric.value + changeAmount));
      } else {
        changeAmount = Math.floor(Math.random() * 4 - 2);
        newValue = Math.max(1, targetMetric.value + changeAmount);
      }

      setMetrics(prev => {
        const updated = prev.map((m, idx) => {
          if (idx === randomIndex) {
            // Recalculate monthly change %
            const startVal = m.history[0]?.value || 1;
            const newPct = parseFloat((((newValue - startVal) / startVal) * 100).toFixed(1));
            
            // Update history last element slightly, or slide window
            const newHistory = [...m.history];
            if (newHistory.length > 0) {
              newHistory[newHistory.length - 1] = { 
                ...newHistory[newHistory.length - 1], 
                value: newValue 
              };
            }

            return {
              ...m,
              value: newValue,
              change: newPct,
              lastUpdated: new Date().toLocaleTimeString(),
              history: newHistory
            };
          }
          return m;
        });

        // Broadcast to other tabs
        broadcastChange(updated);
        return updated;
      });

      // Update sync status indicator
      const latency = Math.floor(Math.random() * 25) + 5;
      setSyncStatus(prev => ({
        ...prev,
        lastSyncedAt: new Date().toLocaleTimeString(),
        simulatedLatencyMs: latency
      }));

    }, syncStatus.syncIntervalMs);

    return () => clearInterval(interval);
  }, [isRealtimeActive, metrics, syncStatus.syncIntervalMs]);

  // DATABASE WRITES

  // 1. Add Metric
  const addMetric = (
    metric: Omit<MetricData, 'id' | 'lastUpdated' | 'change' | 'history'>, 
    token: string
  ): { success: boolean; error?: string } => {
    // A. Throttling
    if (!checkRateLimit()) {
      return { success: false, error: 'Too many requests. API throttled. (Rate limit active)' };
    }

    // B. Authorization check
    if (!hasPermission('write')) {
      addAuditLog({
        action: 'Metric Add Attempt',
        status: 'blocked',
        reason: 'Insufficient permissions',
        details: `Role viewer attempted to add metric "${metric.name}" (ACCESS DENIED)`
      });
      return { success: false, error: 'Unauthorized. Viewer role cannot write to database.' };
    }

    // C. Anti-CSRF Token Validation
    if (!validateCsrf(token)) {
      addExploitAttempt({
        type: 'CSRF',
        payload: `Forged request - token mismatch (Sent: "${token.substring(0,6)}...", Server Expected: "${csrfToken.substring(0,6)}...")`,
        attackerIp: '192.168.1.104',
        status: 'blocked'
      });
      addAuditLog({
        action: 'Metric Add Attempt',
        status: 'blocked',
        reason: 'Invalid CSRF token',
        details: 'Cross-Site Request Forgery validation failed. Request dropped.'
      }, 'system');
      return { success: false, error: 'CSRF token mismatch. Write operation aborted for security.' };
    }

    // D. Sanitization / Exploit Protection
    const nameCheck = sanitizeInput(metric.name);
    const catCheck = sanitizeInput(metric.category);

    if (nameCheck.attackDetected || catCheck.attackDetected) {
      const type = nameCheck.attackDetected || catCheck.attackDetected || 'XSS';
      const payloadString = `Name: ${metric.name} | Cat: ${metric.category}`;
      const isSanitized = patches.find(p => p.id === (type === 'XSS' ? 'patch-xss' : 'patch-sql'))?.patched;

      addExploitAttempt({
        type,
        payload: payloadString,
        attackerIp: '192.168.1.104',
        sanitizedPayload: isSanitized ? `Name: ${nameCheck.value} | Cat: ${catCheck.value}` : undefined,
        status: isSanitized ? 'sanitized' : 'blocked'
      });

      if (!isSanitized) {
        addAuditLog({
          action: 'Exploit Blocked',
          status: 'blocked',
          reason: `${type} attack payload detected`,
          details: `Security filters rejected input with dangerous character patterns. Data unsaved.`
        }, 'system');
        return { success: false, error: `Database exception: dangerous input pattern detected. Transaction rolled back.` };
      }
    }

    // E. Successful Add
    const id = `met-${uuid()}`;
    // Create static sample history
    const history = [
      { date: 'Jan', value: Math.round(metric.value * 0.8) },
      { date: 'Feb', value: Math.round(metric.value * 0.85) },
      { date: 'Mar', value: Math.round(metric.value * 0.9) },
      { date: 'Apr', value: Math.round(metric.value * 0.95) },
      { date: 'May', value: Math.round(metric.value * 0.98) },
      { date: 'Jun', value: metric.value }
    ];

    const newMetric: MetricData = {
      id,
      name: nameCheck.value,
      value: metric.value,
      unit: metric.unit,
      change: 25.0, // Initial static change rate
      category: catCheck.value as MetricData['category'],
      lastUpdated: new Date().toLocaleTimeString(),
      history
    };

    setMetrics(prev => {
      const updated = [...prev, newMetric];
      broadcastChange(updated);
      return updated;
    });

    addAuditLog({
      action: 'Metric Added',
      status: 'success',
      details: `Created new metric "${nameCheck.value}" (Val: ${metric.value}${metric.unit}, Cat: ${catCheck.value})` + 
               (nameCheck.wasSanitized ? ' [Sanitized XSS/SQL]' : '')
    });

    // Auto rotate CSRF token on success for double security (token hijacking prevention)
    rotateCsrfToken();

    return { success: true };
  };

  // 2. Update Metric
  const updateMetric = (
    id: string, 
    value: number, 
    token: string,
    name?: string
  ): { success: boolean; error?: string } => {
    if (!checkRateLimit()) {
      return { success: false, error: 'Too many requests. API throttled. (Rate limit active)' };
    }

    if (!hasPermission('write')) {
      addAuditLog({
        action: 'Metric Update Attempt',
        status: 'blocked',
        reason: 'Insufficient permissions',
        details: `Role viewer attempted to update metric ID ${id} (ACCESS DENIED)`
      });
      return { success: false, error: 'Unauthorized. Viewer role cannot write to database.' };
    }

    if (!validateCsrf(token)) {
      addExploitAttempt({
        type: 'CSRF',
        payload: `Forged update request - token mismatch`,
        attackerIp: '192.168.1.104',
        status: 'blocked'
      });
      addAuditLog({
        action: 'Metric Update Attempt',
        status: 'blocked',
        reason: 'Invalid CSRF token',
        details: `CSRF verification failed for metric update on ID ${id}.`
      }, 'system');
      return { success: false, error: 'CSRF token mismatch. Write operation aborted.' };
    }

    const currentMetric = metrics.find(m => m.id === id);
    if (!currentMetric) {
      return { success: false, error: 'Metric not found.' };
    }

    // Sanitization if name changed
    let finalName = name || currentMetric.name;
    let nameWasSanitized = false;

    if (name) {
      const nameCheck = sanitizeInput(name);
      finalName = nameCheck.value;
      nameWasSanitized = nameCheck.wasSanitized;

      if (nameCheck.attackDetected) {
        const type = nameCheck.attackDetected;
        const isSanitized = patches.find(p => p.id === (type === 'XSS' ? 'patch-xss' : 'patch-sql'))?.patched;

        addExploitAttempt({
          type,
          payload: `Update Name: ${name}`,
          attackerIp: '192.168.1.104',
          sanitizedPayload: isSanitized ? `Update Name: ${finalName}` : undefined,
          status: isSanitized ? 'sanitized' : 'blocked'
        });

        if (!isSanitized) {
          addAuditLog({
            action: 'Exploit Blocked',
            status: 'blocked',
            reason: `${type} payload detected in update`,
            details: `Update of metric ID ${id} blocked due to active query/script keywords.`
          }, 'system');
          return { success: false, error: `Dangerous query patterns blocked. Update rolled back.` };
        }
      }
    }

    // Commit Update
    setMetrics(prev => {
      const updated = prev.map(m => {
        if (m.id === id) {
          const startVal = m.history[0]?.value || 1;
          const newPct = parseFloat((((value - startVal) / startVal) * 100).toFixed(1));
          
          const newHistory = [...m.history];
          if (newHistory.length > 0) {
            newHistory[newHistory.length - 1] = { 
              ...newHistory[newHistory.length - 1], 
              value 
            };
          }

          return {
            ...m,
            name: finalName,
            value,
            change: newPct,
            lastUpdated: new Date().toLocaleTimeString(),
            history: newHistory
          };
        }
        return m;
      });
      broadcastChange(updated);
      return updated;
    });

    addAuditLog({
      action: 'Metric Updated',
      status: 'success',
      details: `Updated "${currentMetric.name}" value to ${value}${currentMetric.unit}` + 
               (nameWasSanitized ? ' (Name sanitized for code injection)' : '')
    });

    rotateCsrfToken();
    return { success: true };
  };

  // 3. Delete Metric
  const deleteMetric = (id: string, token: string): { success: boolean; error?: string } => {
    if (!checkRateLimit()) {
      return { success: false, error: 'Too many requests. API throttled. (Rate limit active)' };
    }

    if (!hasPermission('delete')) {
      addAuditLog({
        action: 'Metric Delete Attempt',
        status: 'blocked',
        reason: 'Insufficient permissions',
        details: `Role ${currentRole} attempted to delete metric ID ${id} (REQUIRED: ADMIN)`
      });
      return { success: false, error: 'Access Denied. Only Admin users can delete metrics from database.' };
    }

    if (!validateCsrf(token)) {
      addExploitAttempt({
        type: 'CSRF',
        payload: `Forged delete request - token mismatch`,
        attackerIp: '192.168.1.104',
        status: 'blocked'
      });
      addAuditLog({
        action: 'Metric Delete Attempt',
        status: 'blocked',
        reason: 'Invalid CSRF token',
        details: `CSRF verification failed for metric delete on ID ${id}.`
      }, 'system');
      return { success: false, error: 'CSRF token mismatch. Delete operation aborted.' };
    }

    const target = metrics.find(m => m.id === id);
    if (!target) return { success: false, error: 'Metric not found.' };

    setMetrics(prev => {
      const updated = prev.filter(m => m.id !== id);
      broadcastChange(updated);
      return updated;
    });

    addAuditLog({
      action: 'Metric Deleted',
      status: 'success',
      details: `Removed metric "${target.name}" and all historical records from memory`
    });

    rotateCsrfToken();
    return { success: true };
  };

  // Exploit Simulation Trigger (For security visualizer UI)
  const triggerExploitSimulation = (type: 'XSS' | 'SQL Injection' | 'CSRF' | 'Rate Limit') => {
    const isXssPatched = patches.find(p => p.id === 'patch-xss')?.patched;
    const isSqlPatched = patches.find(p => p.id === 'patch-sql')?.patched;
    const isCsrfPatched = patches.find(p => p.id === 'patch-csrf')?.patched;

    switch (type) {
      case 'XSS': {
        const payload = `<script>alert('XSS Hack!')</script> Live Stats`;
        addAuditLog({
          action: 'SecFilter Scanner',
          status: isXssPatched ? 'success' : 'blocked',
          details: `Inbound request contains HTML scripting payload: "${payload}"`
        }, 'system');
        
        if (isXssPatched) {
          addExploitAttempt({
            type: 'XSS',
            payload,
            attackerIp: '185.220.101.5',
            sanitizedPayload: 'Live Stats',
            status: 'sanitized'
          });
          
          // Apply sanitized add
          const id = `met-${uuid()}`;
          const newM: MetricData = {
            id,
            name: 'Live Stats (Sanitized XSS)',
            value: 99,
            unit: '%',
            change: 0,
            category: 'operational',
            lastUpdated: new Date().toLocaleTimeString(),
            history: [{ date: 'Jun', value: 99 }]
          };
          setMetrics(prev => [...prev, newM]);
        } else {
          addExploitAttempt({
            type: 'XSS',
            payload,
            attackerIp: '185.220.101.5',
            status: 'blocked'
          });
          addAuditLog({
            action: 'XSS Injection Executed',
            status: 'blocked',
            reason: 'System Vulnerability Exploded',
            details: 'VULNERABILITY EXPLOITED: JavaScript executed in context of user cookies! (Simulated Alert Triggers)'
          }, 'system');
        }
        break;
      }
      case 'SQL Injection': {
        const payload = `Active CPU'; DROP TABLE metrics; --`;
        addAuditLog({
          action: 'SQL Firewall Check',
          status: isSqlPatched ? 'success' : 'blocked',
          details: `Inbound database transaction matches SQL injection signatures: "${payload}"`
        }, 'system');

        if (isSqlPatched) {
          addExploitAttempt({
            type: 'SQL Injection',
            payload,
            attackerIp: '45.143.203.18',
            sanitizedPayload: 'Active CPU DROP TABLE metrics',
            status: 'sanitized'
          });
        } else {
          addExploitAttempt({
            type: 'SQL Injection',
            payload,
            attackerIp: '45.143.203.18',
            status: 'blocked'
          });
          addAuditLog({
            action: 'SQL Injection Executed',
            status: 'blocked',
            reason: 'Database Exploit Successful',
            details: 'CRITICAL WARNING: SQL injection bypassed parameters! Simulated entire database dropped.'
          }, 'system');
          
          // Simulate database wipe
          setMetrics([]);
        }
        break;
      }
      case 'CSRF': {
        addAuditLog({
          action: 'Request Header Analyzer',
          status: isCsrfPatched ? 'success' : 'blocked',
          details: 'Validating cryptographic CSRF synchronization state parameters...'
        }, 'system');

        if (isCsrfPatched) {
          addExploitAttempt({
            type: 'CSRF',
            payload: 'Unauthorized state mutation request without valid CSRF header',
            attackerIp: '109.201.154.22',
            status: 'blocked'
          });
        } else {
          addExploitAttempt({
            type: 'CSRF',
            payload: 'Compromised state mutation request executed',
            attackerIp: '109.201.154.22',
            status: 'blocked'
          });
          addAuditLog({
            action: 'CSRF Exploit Successful',
            status: 'blocked',
            reason: 'Cross-Site Forgery executed',
            details: 'VIOLATION: Attacker forged an administrative request via active session. Executed delete on random metric.'
          }, 'system');

          // Delete random metric
          setMetrics(prev => {
            if (prev.length > 0) {
              const copy = [...prev];
              copy.splice(Math.floor(Math.random() * copy.length), 1);
              return copy;
            }
            return prev;
          });
        }
        break;
      }
      case 'Rate Limit': {
        // Fast burst
        for (let i = 0; i < 6; i++) {
          checkRateLimit();
        }
        break;
      }
    }
  };

  return (
    <DatabaseContext.Provider value={{
      currentRole,
      currentUser: USERS[currentRole],
      setRole,
      metrics,
      logs,
      exploits,
      patches,
      syncStatus,
      rateLimitBlocked,
      rateLimitTimer,
      csrfToken,
      isRealtimeActive,
      setRealtimeActive,
      addMetric,
      updateMetric,
      deleteMetric,
      triggerExploitSimulation,
      togglePatch,
      rotateCsrfToken,
      clearLogs
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
