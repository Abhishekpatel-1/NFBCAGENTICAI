import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Upload, FileImage, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface DocumentUploadProps {
  documentType: 'pan' | 'aadhaar';
  onUpload: (file: File) => Promise<void>;
  uploaded?: boolean;
  uploading?: boolean;
}

export function DocumentUpload({ documentType, onUpload, uploaded, uploading }: DocumentUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
        await onUpload(file);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 1,
    disabled: uploading || uploaded,
  });

  const label = documentType === 'pan' ? 'PAN Card' : 'Aadhaar Card';

  return (
    <Card
      {...getRootProps()}
      className={cn(
        'p-4 border-2 border-dashed cursor-pointer transition-all',
        isDragActive && 'border-primary bg-primary/5',
        uploaded && 'border-success bg-success/5',
        uploading && 'opacity-70 cursor-wait',
        !uploaded && !uploading && 'hover:border-primary/50 hover:bg-muted/50'
      )}
    >
      <input {...getInputProps()} />
      
      <div className="flex items-center gap-4">
        {/* Preview or Icon */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
          {preview ? (
            <img src={preview} alt={label} className="w-full h-full object-cover" />
          ) : (
            <FileImage className="w-6 h-6 text-muted-foreground" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}
          {uploaded && !uploading && (
            <div className="absolute -top-1 -right-1">
              <CheckCircle className="w-5 h-5 text-success fill-background" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {uploaded
              ? 'Document uploaded successfully'
              : isDragActive
              ? 'Drop the file here'
              : 'Drag & drop or click to upload'}
          </p>
        </div>

        {/* Action */}
        {!uploaded && !uploading && (
          <Button variant="outline" size="sm" className="shrink-0">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        )}
      </div>
    </Card>
  );
}

interface DocumentUploadGroupProps {
  onUploadPAN: (file: File) => Promise<void>;
  onUploadAadhaar: (file: File) => Promise<void>;
  panUploaded?: boolean;
  aadhaarUploaded?: boolean;
  panUploading?: boolean;
  aadhaarUploading?: boolean;
}

export function DocumentUploadGroup({
  onUploadPAN,
  onUploadAadhaar,
  panUploaded,
  aadhaarUploaded,
  panUploading,
  aadhaarUploading,
}: DocumentUploadGroupProps) {
  return (
    <div className="space-y-3 p-4 bg-card rounded-xl border border-border animate-scale-in">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <FileImage className="w-4 h-4 text-primary" />
        <span>Upload KYC Documents</span>
      </div>
      <div className="space-y-3">
        <DocumentUpload
          documentType="pan"
          onUpload={onUploadPAN}
          uploaded={panUploaded}
          uploading={panUploading}
        />
        <DocumentUpload
          documentType="aadhaar"
          onUpload={onUploadAadhaar}
          uploaded={aadhaarUploaded}
          uploading={aadhaarUploading}
        />
      </div>
    </div>
  );
}
