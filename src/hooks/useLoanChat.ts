import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getSessionId } from '@/lib/session';
import { 
  ChatMessage, 
  LoanApplication, 
  KYCDocument, 
  AuditLog,
  AgentType 
} from '@/types/loan';
import { useToast } from '@/hooks/use-toast';

interface UseLoanChatReturn {
  messages: ChatMessage[];
  application: LoanApplication | null;
  kycDocuments: KYCDocument[];
  auditLogs: AuditLog[];
  isLoading: boolean;
  currentAgent: AgentType | null;
  sendMessage: (content: string) => Promise<void>;
  selectLoanAmount: (amount: number) => Promise<void>;
  uploadDocument: (file: File, type: 'pan' | 'aadhaar') => Promise<void>;
  resetChat: () => void;
}

export function useLoanChat(): UseLoanChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentType | null>(null);
  const { toast } = useToast();
  
  const sessionId = useRef(getSessionId());

  // Initialize with welcome message
  useEffect(() => {
    const initChat = async () => {
      setIsLoading(true);
      try {
        const response = await supabase.functions.invoke('loan-chat', {
          body: {
            action: 'init',
            sessionId: sessionId.current,
          },
        });

        if (response.error) throw response.error;
        
        const data = response.data;
        if (data.messages) setMessages(data.messages);
        if (data.application) setApplication(data.application);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        setCurrentAgent('master');
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        // Add fallback welcome message
        const welcomeMsg: ChatMessage = {
          id: crypto.randomUUID(),
          session_id: sessionId.current,
          application_id: null,
          role: 'assistant',
          content: `Welcome to FinEdge AI Loan Assistant! 🏦\n\nI'm here to help you with your personal loan application. Our AI-powered system makes the process quick and seamless.\n\nTo get started, please select your desired loan amount below, or tell me how much you'd like to borrow.`,
          agent_type: 'master',
          metadata: {},
          created_at: new Date().toISOString(),
        };
        setMessages([welcomeMsg]);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, []);

  const addMessage = useCallback((msg: Partial<ChatMessage>) => {
    const fullMsg: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: sessionId.current,
      application_id: application?.id || null,
      role: msg.role || 'user',
      content: msg.content || '',
      agent_type: msg.agent_type || null,
      metadata: msg.metadata || {},
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, fullMsg]);
    return fullMsg;
  }, [application]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    addMessage({ role: 'user', content });
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('loan-chat', {
        body: {
          action: 'message',
          sessionId: sessionId.current,
          applicationId: application?.id,
          content,
        },
      });

      if (response.error) throw response.error;

      const data = response.data;
      
      // Update state with response
      if (data.message) {
        addMessage({
          role: 'assistant',
          content: data.message,
          agent_type: data.agent || 'master',
        });
        setCurrentAgent(data.agent || 'master');
      }
      if (data.application) setApplication(data.application);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [application, addMessage, toast]);

  const selectLoanAmount = useCallback(async (amount: number) => {
    addMessage({
      role: 'user',
      content: `I would like to apply for a loan of ₹${amount.toLocaleString('en-IN')}`,
    });
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('loan-chat', {
        body: {
          action: 'select_amount',
          sessionId: sessionId.current,
          amount,
        },
      });

      if (response.error) throw response.error;

      const data = response.data;
      
      if (data.message) {
        addMessage({
          role: 'assistant',
          content: data.message,
          agent_type: data.agent || 'negotiation',
        });
        setCurrentAgent(data.agent || 'negotiation');
      }
      if (data.application) setApplication(data.application);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
    } catch (error) {
      console.error('Failed to select loan amount:', error);
      toast({
        title: 'Error',
        description: 'Failed to process loan amount. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, toast]);

  const uploadDocument = useCallback(async (file: File, type: 'pan' | 'aadhaar') => {
    if (!application?.id) {
      toast({
        title: 'Error',
        description: 'Please select a loan amount first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setCurrentAgent('kyc');

    try {
      // Upload file to storage
      const fileName = `${application.id}/${type}_${Date.now()}.${file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('kyc-documents')
        .getPublicUrl(fileName);

      // Process document with OCR
      const response = await supabase.functions.invoke('loan-chat', {
        body: {
          action: 'upload_kyc',
          sessionId: sessionId.current,
          applicationId: application.id,
          documentType: type,
          fileUrl: urlData.publicUrl,
        },
      });

      if (response.error) throw response.error;

      const data = response.data;

      if (data.message) {
        addMessage({
          role: 'assistant',
          content: data.message,
          agent_type: 'kyc',
        });
      }
      if (data.document) {
        setKycDocuments((prev) => [...prev.filter((d) => d.document_type !== type), data.document]);
      }
      if (data.application) setApplication(data.application);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      
      toast({
        title: 'Document Uploaded',
        description: `Your ${type.toUpperCase()} card has been uploaded and is being processed.`,
      });
    } catch (error) {
      console.error('Failed to upload document:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [application, addMessage, toast]);

  const resetChat = useCallback(() => {
    sessionId.current = crypto.randomUUID();
    sessionStorage.setItem('loan_chat_session_id', sessionId.current);
    setMessages([]);
    setApplication(null);
    setKycDocuments([]);
    setAuditLogs([]);
    setCurrentAgent(null);
    
    // Re-initialize
    const welcomeMsg: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: sessionId.current,
      application_id: null,
      role: 'assistant',
      content: `Welcome back! 🏦\n\nI'm ready to help you with a new loan application. Please select your desired loan amount to begin.`,
      agent_type: 'master',
      metadata: {},
      created_at: new Date().toISOString(),
    };
    setMessages([welcomeMsg]);
  }, []);

  return {
    messages,
    application,
    kycDocuments,
    auditLogs,
    isLoading,
    currentAgent,
    sendMessage,
    selectLoanAmount,
    uploadDocument,
    resetChat,
  };
}
