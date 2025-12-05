-- Create enum for loan application status
CREATE TYPE public.loan_status AS ENUM (
  'initiated',
  'kyc_pending',
  'kyc_verified',
  'credit_check',
  'underwriting',
  'approved',
  'rejected',
  'sanctioned'
);

-- Create enum for agent types
CREATE TYPE public.agent_type AS ENUM (
  'master',
  'negotiation',
  'kyc',
  'underwriting',
  'sanction',
  'compliance'
);

-- Create enum for risk level
CREATE TYPE public.risk_level AS ENUM (
  'low',
  'medium',
  'high',
  'very_high'
);

-- Loan applications table
CREATE TABLE public.loan_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  applicant_name TEXT,
  email TEXT,
  phone TEXT,
  requested_amount DECIMAL(12, 2) NOT NULL,
  approved_amount DECIMAL(12, 2),
  monthly_income DECIMAL(12, 2),
  employment_type TEXT,
  status loan_status NOT NULL DEFAULT 'initiated',
  credit_score INTEGER,
  risk_level risk_level,
  risk_score DECIMAL(5, 2),
  dti_ratio DECIMAL(5, 2),
  rejection_reason TEXT,
  sanction_letter_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- KYC documents table
CREATE TABLE public.kyc_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL, -- 'pan' or 'aadhaar'
  file_url TEXT NOT NULL,
  extracted_name TEXT,
  extracted_id TEXT,
  extracted_dob TEXT,
  extracted_address TEXT,
  verification_status TEXT DEFAULT 'pending',
  ocr_confidence DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  agent_type agent_type,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.loan_applications(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  agent_type agent_type,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_loan_applications_status ON public.loan_applications(status);
CREATE INDEX idx_kyc_documents_application ON public.kyc_documents(application_id);
CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_application ON public.chat_messages(application_id);
CREATE INDEX idx_audit_logs_application ON public.audit_logs(application_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at);

-- Enable RLS on all tables (public access for demo)
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create public access policies for demo purposes
CREATE POLICY "Allow public access to loan_applications" 
ON public.loan_applications FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to kyc_documents" 
ON public.kyc_documents FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to chat_messages" 
ON public.chat_messages FOR ALL 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to audit_logs" 
ON public.audit_logs FOR ALL 
USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to loan_applications
CREATE TRIGGER update_loan_applications_updated_at
  BEFORE UPDATE ON public.loan_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc-documents', 'kyc-documents', true);

-- Storage policy for KYC documents
CREATE POLICY "Allow public uploads to kyc-documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'kyc-documents');

CREATE POLICY "Allow public read from kyc-documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'kyc-documents');

-- Create storage bucket for sanction letters
INSERT INTO storage.buckets (id, name, public) 
VALUES ('sanction-letters', 'sanction-letters', true);

-- Storage policy for sanction letters
CREATE POLICY "Allow public uploads to sanction-letters" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'sanction-letters');

CREATE POLICY "Allow public read from sanction-letters" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'sanction-letters');