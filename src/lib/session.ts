const SESSION_KEY = 'loan_chat_session_id';

export function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    initiated: 'bg-info/10 text-info',
    kyc_pending: 'bg-warning/10 text-warning',
    kyc_verified: 'bg-success/10 text-success',
    credit_check: 'bg-info/10 text-info',
    underwriting: 'bg-warning/10 text-warning',
    approved: 'bg-success/10 text-success',
    rejected: 'bg-destructive/10 text-destructive',
    sanctioned: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    verified: 'bg-success/10 text-success',
    failed: 'bg-destructive/10 text-destructive',
  };
  return colors[status] || 'bg-muted text-muted-foreground';
}

export function getRiskColor(risk: string | null): string {
  if (!risk) return 'text-muted-foreground';
  const colors: Record<string, string> = {
    low: 'text-success',
    medium: 'text-warning',
    high: 'text-destructive',
    very_high: 'text-destructive',
  };
  return colors[risk] || 'text-muted-foreground';
}
