import { useState, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { AuditPanel } from '@/components/loan/AuditPanel';
import { LoanProgressSteps } from '@/components/loan/LoanStatus';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoanApplication, AuditLog, LoanStatus } from '@/types/loan';
import { formatCurrency } from '@/lib/session';
import { PanelRightOpen, ChevronRight, Activity, ClipboardList, TrendingUp } from 'lucide-react';

export default function Index() {
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleReset = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onReset={handleReset} onMenuToggle={() => setSidebarOpen(true)} />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Hero Banner */}
          <div className="gradient-hero text-primary-foreground px-6 py-8">
            <div className="container mx-auto">
              <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
                AI-Powered Personal Loans
              </h1>
              <p className="text-primary-foreground/80 max-w-xl">
                Get instant loan approval with our intelligent multi-agent system. Complete KYC verification, credit assessment, and underwriting in minutes.
              </p>
              {application && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg px-4 py-2">
                    <p className="text-xs opacity-70">Requested</p>
                    <p className="font-semibold">{formatCurrency(application.requested_amount)}</p>
                  </div>
                  {application.credit_score && (
                    <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg px-4 py-2">
                      <p className="text-xs opacity-70">Credit Score</p>
                      <p className="font-semibold">{application.credit_score}</p>
                    </div>
                  )}
                  <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg px-4 py-2">
                    <p className="text-xs opacity-70">Status</p>
                    <p className="font-semibold capitalize">{application.status.replace('_', ' ')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 overflow-hidden">
            <ChatContainer
              onApplicationChange={setApplication}
              onAuditLogsChange={setAuditLogs}
            />
          </div>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-80 border-l border-border bg-card flex-col">
          <Tabs defaultValue="progress" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4 py-2">
              <TabsTrigger value="progress" className="gap-2">
                <Activity className="w-4 h-4" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="audit" className="gap-2">
                <ClipboardList className="w-4 h-4" />
                Audit
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="progress" className="flex-1 p-4 mt-0 overflow-auto">
              <div className="space-y-6">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Application Progress
                  </h3>
                  <LoanProgressSteps currentStatus={application?.status || 'initiated'} />
                </Card>

                {/* Quick Stats */}
                {application && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Quick Stats</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Application ID</span>
                        <span className="font-mono">#{application.id.slice(0, 8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Loan Amount</span>
                        <span className="font-medium">{formatCurrency(application.requested_amount)}</span>
                      </div>
                      {application.credit_score && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Credit Score</span>
                          <span className="font-medium">{application.credit_score}</span>
                        </div>
                      )}
                      {application.risk_level && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Risk Level</span>
                          <span className="font-medium capitalize">{application.risk_level}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="audit" className="flex-1 p-4 mt-0 overflow-auto">
              <AuditPanel logs={auditLogs} />
            </TabsContent>
          </Tabs>
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="right" className="w-80 p-0">
            <SheetTitle className="sr-only">Application Details</SheetTitle>
            <Tabs defaultValue="progress" className="h-full flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4 py-2">
                <TabsTrigger value="progress" className="gap-2">
                  <Activity className="w-4 h-4" />
                  Progress
                </TabsTrigger>
                <TabsTrigger value="audit" className="gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Audit
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="progress" className="flex-1 p-4 mt-0 overflow-auto">
                <div className="space-y-6">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Application Progress
                    </h3>
                    <LoanProgressSteps currentStatus={application?.status || 'initiated'} />
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="audit" className="flex-1 p-4 mt-0 overflow-auto">
                <AuditPanel logs={auditLogs} />
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      </main>
    </div>
  );
}
