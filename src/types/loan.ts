export type LoanStatus = 
  | 'initiated'
  | 'kyc_pending'
  | 'kyc_verified'
  | 'credit_check'
  | 'underwriting'
  | 'approved'
  | 'rejected'
  | 'sanctioned';

export type AgentType = 
  | 'master'
  | 'negotiation'
  | 'kyc'
  | 'underwriting'
  | 'sanction'
  | 'compliance';

export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high';

export interface LoanApplication {
  id: string;
  applicant_name: string | null;
  email: string | null;
  phone: string | null;
  requested_amount: number;
  approved_amount: number | null;
  monthly_income: number | null;
  employment_type: string | null;
  status: LoanStatus;
  credit_score: number | null;
  risk_level: RiskLevel | null;
  risk_score: number | null;
  dti_ratio: number | null;
  rejection_reason: string | null;
  sanction_letter_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface KYCDocument {
  id: string;
  application_id: string;
  document_type: 'pan' | 'aadhaar';
  file_url: string;
  extracted_name: string | null;
  extracted_id: string | null;
  extracted_dob: string | null;
  extracted_address: string | null;
  verification_status: 'pending' | 'verified' | 'failed';
  ocr_confidence: number | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  application_id: string | null;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent_type: AgentType | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  application_id: string | null;
  action: string;
  agent_type: AgentType | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface CreditScoreResponse {
  score: number;
  risk_level: RiskLevel;
  factors: string[];
}

export interface UnderwritingResult {
  approved: boolean;
  approved_amount: number | null;
  risk_score: number;
  dti_ratio: number;
  rejection_reasons: string[];
}

export interface OCRResult {
  name: string | null;
  id_number: string | null;
  dob: string | null;
  address: string | null;
  confidence: number;
  document_type: 'pan' | 'aadhaar';
}

export const AGENT_CONFIG: Record<AgentType, { name: string; color: string; icon: string }> = {
  master: { name: 'Loan Assistant', color: 'agent-master', icon: '🤖' },
  negotiation: { name: 'Negotiation Agent', color: 'agent-negotiation', icon: '💼' },
  kyc: { name: 'KYC Agent', color: 'agent-kyc', icon: '🔍' },
  underwriting: { name: 'Underwriting Agent', color: 'agent-underwriting', icon: '📊' },
  sanction: { name: 'Sanction Agent', color: 'agent-sanction', icon: '✅' },
  compliance: { name: 'Compliance Agent', color: 'agent-compliance', icon: '📋' },
};

export const LOAN_AMOUNTS = [50000, 100000, 200000, 300000, 500000];

export const STATUS_STEPS: { status: LoanStatus; label: string; description: string }[] = [
  { status: 'initiated', label: 'Application Started', description: 'Loan request initiated' },
  { status: 'kyc_pending', label: 'KYC Pending', description: 'Upload identity documents' },
  { status: 'kyc_verified', label: 'KYC Verified', description: 'Identity verified successfully' },
  { status: 'credit_check', label: 'Credit Check', description: 'Checking credit history' },
  { status: 'underwriting', label: 'Underwriting', description: 'Evaluating eligibility' },
  { status: 'approved', label: 'Approved', description: 'Loan approved' },
  { status: 'sanctioned', label: 'Sanctioned', description: 'Sanction letter ready' },
];
