import { LoanApplication } from '@/types/loan';
import { formatCurrency, formatDate } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, FileText, CheckCircle } from 'lucide-react';

interface SanctionLetterProps {
  application: LoanApplication;
  onDownload?: () => void;
}

export function SanctionLetterCard({ application, onDownload }: SanctionLetterProps) {
  if (application.status !== 'sanctioned' || !application.sanction_letter_url) {
    return null;
  }

  return (
    <Card className="p-5 border-success shadow-success-glow animate-scale-in">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-lg gradient-success flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6 text-success-foreground" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">Sanction Letter Ready</h3>
            <CheckCircle className="w-4 h-4 text-success" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Your loan of {formatCurrency(application.approved_amount || application.requested_amount)} has been sanctioned. Download your official sanction letter below.
          </p>

          {/* Details */}
          <div className="grid grid-cols-2 gap-2 text-sm mb-4 p-3 bg-muted/50 rounded-lg">
            <div>
              <span className="text-muted-foreground">Applicant:</span>
              <span className="ml-2 font-medium">{application.applicant_name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Date:</span>
              <span className="ml-2 font-medium">{formatDate(application.updated_at)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Amount:</span>
              <span className="ml-2 font-medium text-success">{formatCurrency(application.approved_amount || 0)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Ref:</span>
              <span className="ml-2 font-medium">#{application.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>

          {/* Download Button */}
          <Button onClick={onDownload} className="w-full gradient-success text-success-foreground">
            <Download className="w-4 h-4 mr-2" />
            Download Sanction Letter
          </Button>
        </div>
      </div>
    </Card>
  );
}
