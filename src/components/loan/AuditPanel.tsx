import { AuditLog, AGENT_CONFIG } from '@/types/loan';
import { formatDate } from '@/lib/session';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ClipboardList, ChevronRight } from 'lucide-react';

interface AuditPanelProps {
  logs: AuditLog[];
}

export function AuditPanel({ logs }: AuditPanelProps) {
  if (logs.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ClipboardList className="w-4 h-4" />
          <span>No audit logs yet</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Audit Trail</h3>
          <span className="ml-auto text-xs text-muted-foreground">{logs.length} events</span>
        </div>
      </div>
      <ScrollArea className="h-[300px]">
        <div className="p-2">
          {logs.map((log, index) => {
            const agentConfig = log.agent_type ? AGENT_CONFIG[log.agent_type] : null;

            return (
              <div
                key={log.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50',
                  index !== logs.length - 1 && 'border-b border-border'
                )}
              >
                {/* Timeline dot */}
                <div className="relative mt-1">
                  <div
                    className={cn(
                      'w-2.5 h-2.5 rounded-full',
                      agentConfig ? agentConfig.color : 'bg-muted-foreground'
                    )}
                  />
                  {index !== logs.length - 1 && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-px h-8 bg-border" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{log.action}</span>
                    {agentConfig && (
                      <span
                        className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full',
                          agentConfig.color
                        )}
                      >
                        {agentConfig.icon}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(log.created_at)}</p>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="mt-2 text-xs bg-muted/50 rounded p-2 font-mono">
                      {JSON.stringify(log.details, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}
