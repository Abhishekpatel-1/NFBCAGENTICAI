import { KYCDocument } from '@/types/loan';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getStatusColor } from '@/lib/session';
import { User, CreditCard, Calendar, MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface OCRPreviewProps {
  document: KYCDocument;
  loading?: boolean;
}

export function OCRPreview({ document, loading }: OCRPreviewProps) {
  const isVerified = document.verification_status === 'verified';
  const isFailed = document.verification_status === 'failed';
  const label = document.document_type === 'pan' ? 'PAN Card' : 'Aadhaar Card';

  const fields = [
    { icon: User, label: 'Name', value: document.extracted_name },
    { icon: CreditCard, label: 'ID Number', value: document.extracted_id },
    { icon: Calendar, label: 'Date of Birth', value: document.extracted_dob },
    { icon: MapPin, label: 'Address', value: document.extracted_address },
  ].filter((f) => f.value);

  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm font-medium">Processing {label}...</span>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-muted rounded" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-4 animate-scale-in', isVerified && 'border-success', isFailed && 'border-destructive')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isVerified ? (
            <CheckCircle className="w-5 h-5 text-success" />
          ) : isFailed ? (
            <AlertCircle className="w-5 h-5 text-destructive" />
          ) : (
            <Loader2 className="w-5 h-5 animate-spin text-warning" />
          )}
          <span className="font-medium">{label} - OCR Results</span>
        </div>
        <Badge className={getStatusColor(document.verification_status)}>
          {document.verification_status}
        </Badge>
      </div>

      {/* Extracted Fields */}
      {fields.length > 0 ? (
        <div className="space-y-3">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No fields extracted yet.</p>
      )}

      {/* Confidence Score */}
      {document.ocr_confidence != null && (
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">OCR Confidence</span>
            <span className={cn('font-medium', document.ocr_confidence >= 80 ? 'text-success' : document.ocr_confidence >= 60 ? 'text-warning' : 'text-destructive')}>
              {document.ocr_confidence.toFixed(1)}%
            </span>
          </div>
          <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all', document.ocr_confidence >= 80 ? 'bg-success' : document.ocr_confidence >= 60 ? 'bg-warning' : 'bg-destructive')}
              style={{ width: `${document.ocr_confidence}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
