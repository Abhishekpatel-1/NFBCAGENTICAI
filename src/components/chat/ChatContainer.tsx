import { useRef, useEffect } from 'react';
import { ChatMessage, TypingIndicator } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { LoanAmountSelector } from './LoanAmountSelector';
import { DocumentUploadGroup } from './DocumentUpload';
import { OCRPreview } from './OCRPreview';
import { LoanStatusCard, LoanProgressSteps } from '@/components/loan/LoanStatus';
import { SanctionLetterCard } from '@/components/loan/SanctionLetter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLoanChat } from '@/hooks/useLoanChat';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ChatContainerProps {
  onApplicationChange?: (app: any) => void;
  onAuditLogsChange?: (logs: any[]) => void;
}

export function ChatContainer({ onApplicationChange, onAuditLogsChange }: ChatContainerProps) {
  const {
    messages,
    application,
    kycDocuments,
    auditLogs,
    isLoading,
    currentAgent,
    sendMessage,
    selectLoanAmount,
    uploadDocument,
  } = useLoanChat();

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Notify parent of changes
  useEffect(() => {
    onApplicationChange?.(application);
  }, [application, onApplicationChange]);

  useEffect(() => {
    onAuditLogsChange?.(auditLogs);
  }, [auditLogs, onAuditLogsChange]);

  const showLoanSelector = !application;
  const showDocumentUpload = application && (application.status === 'initiated' || application.status === 'kyc_pending');
  const showOCRPreviews = kycDocuments.length > 0;
  const showLoanStatus = application && ['credit_check', 'underwriting', 'approved', 'rejected', 'sanctioned'].includes(application.status);
  const showSanctionLetter = application?.status === 'sanctioned';

  const panDoc = kycDocuments.find((d) => d.document_type === 'pan');
  const aadhaarDoc = kycDocuments.find((d) => d.document_type === 'aadhaar');

  const handleDownloadSanction = () => {
    if (application?.sanction_letter_url) {
      window.open(application.sanction_letter_url, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Area */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4 space-y-4 pb-6">
          {/* Chat Messages */}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Typing Indicator */}
          {isLoading && <TypingIndicator agentType={currentAgent || undefined} />}

          {/* Interactive Components */}
          <div className="space-y-4 mt-4">
            {/* Loan Amount Selector */}
            {showLoanSelector && (
              <LoanAmountSelector
                onSelect={selectLoanAmount}
                selectedAmount={application?.requested_amount}
                disabled={isLoading}
              />
            )}

            {/* Document Upload */}
            {showDocumentUpload && (
              <DocumentUploadGroup
                onUploadPAN={(file) => uploadDocument(file, 'pan')}
                onUploadAadhaar={(file) => uploadDocument(file, 'aadhaar')}
                panUploaded={!!panDoc}
                aadhaarUploaded={!!aadhaarDoc}
                panUploading={isLoading && currentAgent === 'kyc'}
                aadhaarUploading={isLoading && currentAgent === 'kyc'}
              />
            )}

            {/* OCR Previews */}
            {showOCRPreviews && (
              <div className="space-y-3">
                {panDoc && <OCRPreview document={panDoc} />}
                {aadhaarDoc && <OCRPreview document={aadhaarDoc} />}
              </div>
            )}

            {/* Loan Status */}
            {showLoanStatus && application && (
              <LoanStatusCard application={application} />
            )}

            {/* Sanction Letter */}
            {showSanctionLetter && application && (
              <SanctionLetterCard
                application={application}
                onDownload={handleDownloadSanction}
              />
            )}
          </div>

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <ChatInput
        onSend={sendMessage}
        disabled={isLoading}
        placeholder={
          !application
            ? 'Select a loan amount or type your request...'
            : 'Type your message...'
        }
      />
    </div>
  );
}
