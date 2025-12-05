import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Agent system prompts
const AGENT_PROMPTS = {
  master: `You are a helpful NBFC loan assistant. Guide users through the personal loan process. Be professional, friendly, and concise. Ask for information step by step.`,
  negotiation: `You are a loan negotiation specialist. Help users understand loan terms and amounts. Be helpful in explaining loan options.`,
  kyc: `You are a KYC verification agent. Guide users through document upload and verification. Explain what documents are needed and verify extracted information.`,
  underwriting: `You are an underwriting agent. Evaluate loan applications based on credit score, income, and risk factors. Provide clear explanations of decisions.`,
  sanction: `You are a sanction agent. Congratulate approved applicants and explain next steps for loan disbursement.`,
  compliance: `You are a compliance agent. Ensure all regulatory requirements are met and maintain audit trails.`,
};

// Mock credit bureau API
function mockCreditCheck(applicantName: string): { score: number; risk_level: string; factors: string[] } {
  const score = Math.floor(Math.random() * 300) + 550; // 550-850
  let risk_level = 'low';
  if (score < 650) risk_level = 'high';
  else if (score < 700) risk_level = 'medium';
  
  return {
    score,
    risk_level,
    factors: score < 700 
      ? ['Limited credit history', 'Recent credit inquiries']
      : ['Good payment history', 'Low credit utilization'],
  };
}

// Mock OCR extraction
function mockOCRExtraction(documentType: string): { name: string; id_number: string; dob: string; address: string; confidence: number } {
  const names = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Gupta'];
  return {
    name: names[Math.floor(Math.random() * names.length)],
    id_number: documentType === 'pan' ? 'ABCDE1234F' : '1234 5678 9012',
    dob: '15/08/1990',
    address: '123 Main Street, Mumbai, Maharashtra 400001',
    confidence: 85 + Math.random() * 10,
  };
}

// Underwriting logic
function evaluateLoan(creditScore: number, requestedAmount: number, monthlyIncome: number = 50000): { approved: boolean; approvedAmount: number | null; riskScore: number; dtiRatio: number; reasons: string[] } {
  const dtiRatio = (requestedAmount / 12) / monthlyIncome * 100;
  const riskScore = 100 - ((creditScore - 550) / 3);
  
  let approved = creditScore >= 650 && dtiRatio < 50;
  let approvedAmount = approved ? requestedAmount : null;
  
  // Reduce amount for borderline cases
  if (creditScore >= 600 && creditScore < 650 && dtiRatio < 40) {
    approved = true;
    approvedAmount = Math.floor(requestedAmount * 0.7);
  }
  
  const reasons: string[] = [];
  if (creditScore < 650) reasons.push('Credit score below minimum threshold');
  if (dtiRatio >= 50) reasons.push('Debt-to-income ratio too high');
  
  return { approved, approvedAmount, riskScore: Math.min(100, Math.max(0, riskScore)), dtiRatio, reasons };
}

async function callAI(systemPrompt: string, userMessage: string, context: string = ''): Promise<string> {
  if (!LOVABLE_API_KEY) {
    console.log("No API key, returning mock response");
    return "I'm processing your request. How can I help you further?";
  }
  
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt + (context ? `\n\nContext: ${context}` : '') },
          { role: "user", content: userMessage },
        ],
        max_tokens: 500,
      }),
    });
    
    if (!response.ok) {
      console.error("AI API error:", response.status);
      return "I'm here to help with your loan application. What would you like to know?";
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "How can I assist you?";
  } catch (error) {
    console.error("AI call failed:", error);
    return "I'm ready to help with your loan application.";
  }
}

async function addAuditLog(applicationId: string | null, action: string, agentType: string, details: object = {}) {
  await supabase.from('audit_logs').insert({
    application_id: applicationId,
    action,
    agent_type: agentType,
    details,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, sessionId, applicationId, content, amount, documentType, fileUrl } = await req.json();
    console.log(`Action: ${action}, Session: ${sessionId}`);

    let response: any = {};

    switch (action) {
      case 'init': {
        const aiResponse = await callAI(
          AGENT_PROMPTS.master,
          "A new user has arrived. Welcome them and explain that you can help with personal loan applications. Ask them to select a loan amount."
        );
        
        response = {
          message: aiResponse,
          agent: 'master',
          messages: [{
            id: crypto.randomUUID(),
            session_id: sessionId,
            role: 'assistant',
            content: aiResponse,
            agent_type: 'master',
            metadata: {},
            created_at: new Date().toISOString(),
          }],
        };
        break;
      }

      case 'select_amount': {
        // Create loan application
        const { data: app, error } = await supabase
          .from('loan_applications')
          .insert({ requested_amount: amount, status: 'initiated' })
          .select()
          .single();
        
        if (error) throw error;
        
        await addAuditLog(app.id, 'Application created', 'master', { amount });
        
        const aiResponse = await callAI(
          AGENT_PROMPTS.negotiation,
          `User selected loan amount of ₹${amount.toLocaleString()}. Confirm the amount and ask them to proceed with KYC document upload (PAN and Aadhaar cards).`
        );
        
        // Update status
        await supabase.from('loan_applications').update({ status: 'kyc_pending' }).eq('id', app.id);
        app.status = 'kyc_pending';
        
        const { data: logs } = await supabase.from('audit_logs').select('*').eq('application_id', app.id).order('created_at', { ascending: false });
        
        response = {
          message: aiResponse,
          agent: 'negotiation',
          application: app,
          auditLogs: logs || [],
        };
        break;
      }

      case 'upload_kyc': {
        // Mock OCR processing
        const ocrResult = mockOCRExtraction(documentType);
        
        // Save KYC document
        const { data: doc, error } = await supabase
          .from('kyc_documents')
          .insert({
            application_id: applicationId,
            document_type: documentType,
            file_url: fileUrl,
            extracted_name: ocrResult.name,
            extracted_id: ocrResult.id_number,
            extracted_dob: ocrResult.dob,
            extracted_address: ocrResult.address,
            ocr_confidence: ocrResult.confidence,
            verification_status: 'verified',
          })
          .select()
          .single();
        
        if (error) throw error;
        
        await addAuditLog(applicationId, `${documentType.toUpperCase()} verified via OCR`, 'kyc', { confidence: ocrResult.confidence });
        
        // Check if both documents uploaded
        const { data: allDocs } = await supabase
          .from('kyc_documents')
          .select('document_type')
          .eq('application_id', applicationId);
        
        const hasAll = allDocs && allDocs.some(d => d.document_type === 'pan') && allDocs.some(d => d.document_type === 'aadhaar');
        
        let aiResponse: string;
        let newStatus = 'kyc_pending';
        
        if (hasAll) {
          // Both documents uploaded - proceed to credit check
          newStatus = 'credit_check';
          await addAuditLog(applicationId, 'KYC verification complete', 'kyc', {});
          
          // Get application and run credit check
          const { data: app } = await supabase.from('loan_applications').select('*').eq('id', applicationId).single();
          const creditResult = mockCreditCheck(ocrResult.name);
          
          await supabase.from('loan_applications').update({
            applicant_name: ocrResult.name,
            status: 'credit_check',
            credit_score: creditResult.score,
            risk_level: creditResult.risk_level,
          }).eq('id', applicationId);
          
          await addAuditLog(applicationId, 'Credit check completed', 'underwriting', creditResult);
          
          // Run underwriting
          const underwriteResult = evaluateLoan(creditResult.score, app!.requested_amount);
          
          const finalStatus = underwriteResult.approved ? 'approved' : 'rejected';
          await supabase.from('loan_applications').update({
            status: finalStatus,
            approved_amount: underwriteResult.approvedAmount,
            risk_score: underwriteResult.riskScore,
            dti_ratio: underwriteResult.dtiRatio,
            rejection_reason: underwriteResult.reasons.join('; ') || null,
          }).eq('id', applicationId);
          
          await addAuditLog(applicationId, `Loan ${finalStatus}`, 'underwriting', underwriteResult);
          
          if (underwriteResult.approved) {
            // Generate sanction letter URL (mock)
            const sanctionUrl = `${SUPABASE_URL}/storage/v1/object/public/sanction-letters/${applicationId}.pdf`;
            await supabase.from('loan_applications').update({
              status: 'sanctioned',
              sanction_letter_url: sanctionUrl,
            }).eq('id', applicationId);
            await addAuditLog(applicationId, 'Sanction letter generated', 'sanction', {});
            
            aiResponse = await callAI(AGENT_PROMPTS.sanction, `Loan approved! Amount: ₹${underwriteResult.approvedAmount?.toLocaleString()}. Credit score: ${creditResult.score}. Congratulate the user and inform them about the sanction letter.`);
            newStatus = 'sanctioned';
          } else {
            aiResponse = await callAI(AGENT_PROMPTS.underwriting, `Loan rejected. Credit score: ${creditResult.score}. Reasons: ${underwriteResult.reasons.join(', ')}. Explain the rejection politely and suggest improvements.`);
            newStatus = 'rejected';
          }
        } else {
          aiResponse = await callAI(AGENT_PROMPTS.kyc, `${documentType.toUpperCase()} card verified successfully. Extracted name: ${ocrResult.name}. Ask user to upload the remaining document.`);
        }
        
        const { data: updatedApp } = await supabase.from('loan_applications').select('*').eq('id', applicationId).single();
        const { data: logs } = await supabase.from('audit_logs').select('*').eq('application_id', applicationId).order('created_at', { ascending: false });
        
        response = {
          message: aiResponse,
          agent: hasAll ? 'underwriting' : 'kyc',
          document: doc,
          application: updatedApp,
          auditLogs: logs || [],
        };
        break;
      }

      case 'message': {
        const context = applicationId ? `Application ID: ${applicationId}` : '';
        const aiResponse = await callAI(AGENT_PROMPTS.master, content, context);
        
        let logs: any[] = [];
        let app = null;
        if (applicationId) {
          const { data } = await supabase.from('audit_logs').select('*').eq('application_id', applicationId).order('created_at', { ascending: false });
          logs = data || [];
          const { data: appData } = await supabase.from('loan_applications').select('*').eq('id', applicationId).single();
          app = appData;
        }
        
        response = {
          message: aiResponse,
          agent: 'master',
          application: app,
          auditLogs: logs,
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
