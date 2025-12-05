import { LoanApplication, STATUS_STEPS, LoanStatus as LoanStatusType } from '@/types/loan';
import { formatCurrency, getStatusColor, getRiskColor } from '@/lib/session';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CheckCircle, Circle, XCircle, Clock, TrendingUp, Percent, AlertTriangle } from 'lucide-react';

interface LoanStatusProps {
  application: LoanApplication;
}

export function LoanStatusCard({ application }: LoanStatusProps) {
  const isApproved = application.status === 'approved' || application.status === 'sanctioned';
  const isRejected = application.status === 'rejected';

  return (
    <Card className={cn('p-5 animate-scale-in', isApproved && 'border-success shadow-success-glow', isRejected && 'border-destructive')}>
      {/* Status Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isApproved ? (
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
          ) : isRejected ? (
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning animate-pulse" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-foreground">
              {isApproved ? 'Loan Approved!' : isRejected ? 'Loan Rejected' : 'Processing'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Application #{application.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
        <Badge className={getStatusColor(application.status)}>{application.status.replace('_', ' ')}</Badge>
      </div>

      {/* Amount Info */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Requested Amount</p>
          <p className="text-lg font-semibold">{formatCurrency(application.requested_amount)}</p>
        </div>
        {application.approved_amount && (
          <div>
            <p className="text-xs text-muted-foreground">Approved Amount</p>
            <p className="text-lg font-semibold text-success">{formatCurrency(application.approved_amount)}</p>
          </div>
        )}
      </div>

      {/* Risk Metrics */}
      {(application.credit_score || application.risk_level || application.dti_ratio) && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {application.credit_score && (
            <div className="text-center p-3 bg-card rounded-lg border border-border">
              <TrendingUp className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Credit Score</p>
              <p className="font-semibold">{application.credit_score}</p>
            </div>
          )}
          {application.risk_level && (
            <div className="text-center p-3 bg-card rounded-lg border border-border">
              <AlertTriangle className={cn('w-4 h-4 mx-auto mb-1', getRiskColor(application.risk_level))} />
              <p className="text-xs text-muted-foreground">Risk Level</p>
              <p className={cn('font-semibold capitalize', getRiskColor(application.risk_level))}>{application.risk_level}</p>
            </div>
          )}
          {application.dti_ratio && (
            <div className="text-center p-3 bg-card rounded-lg border border-border">
              <Percent className="w-4 h-4 mx-auto mb-1 text-info" />
              <p className="text-xs text-muted-foreground">DTI Ratio</p>
              <p className="font-semibold">{application.dti_ratio.toFixed(1)}%</p>
            </div>
          )}
        </div>
      )}

      {/* Rejection Reason */}
      {isRejected && application.rejection_reason && (
        <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-sm text-destructive font-medium">Rejection Reason:</p>
          <p className="text-sm text-foreground mt-1">{application.rejection_reason}</p>
        </div>
      )}
    </Card>
  );
}

interface LoanProgressProps {
  currentStatus: LoanStatusType;
}

export function LoanProgressSteps({ currentStatus }: LoanProgressProps) {
  const currentIndex = STATUS_STEPS.findIndex((s) => s.status === currentStatus);
  const isRejected = currentStatus === 'rejected';

  return (
    <div className="space-y-2">
      {STATUS_STEPS.filter((s) => s.status !== 'rejected').map((step, index) => {
        const isCompleted = index < currentIndex || currentStatus === 'sanctioned';
        const isCurrent = step.status === currentStatus;

        return (
          <div key={step.status} className="flex items-center gap-3">
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all',
                isCompleted && 'bg-success text-success-foreground',
                isCurrent && !isRejected && 'bg-primary text-primary-foreground pulse-ring',
                !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
              )}
            >
              {isCompleted ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium', isCurrent && 'text-primary', !isCompleted && !isCurrent && 'text-muted-foreground')}>
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
