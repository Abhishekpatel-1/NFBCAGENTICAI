.

📌 Finedge AI – Agentic Loan Sales & Underwriting System for NBFCs

A Multi-Agent AI System for Automating Personal Loan Journeys

⭐ Overview

Finedge AI is an Agentic AI–powered loan automation system built for NBFCs.
It automates the complete loan lifecycle — from customer conversation, KYC verification, OCR extraction, credit assessment, underwriting, to sanction letter generation.

This prototype is developed for EY Techathon 6.0, demonstrating how agentic systems can replicate human loan officers while improving speed, accuracy, and scalability.

🎯 Key Features

🤖 Human-like AI Chatbot (Negotiation + Information Collection)

📄 Document Upload (PAN/Aadhaar)

🔍 OCR Extraction (EasyOCR/Tesseract)

✔ Automated KYC Verification

📊 AI-Based Underwriting (risk score + eligibility + rules)

🧾 Instant Sanction Letter PDF

🛡 Compliance Logging & Explainability

📈 Dashboard View for Loan Status

🧠 Multi-Agent Architecture

DhanMitra AI uses a structured agentic workflow:

Master Agent

Coordinates the entire journey.

Worker Agents

Negotiation Agent – understands user intent & collects loan details

KYC Agent – verifies identity and extracts text from images

Underwriting Agent – evaluates eligibility & creditworthiness

Sanction Agent – generates approval/rejection and PDFs

Compliance Agent – maintains logs for auditing

🖥️ Tech Stack
Frontend (React)

Chat UI

File upload (PAN/Aadhaar)

OCR preview

Loan status dashboard

Backend (FastAPI)

/message → chatbot communication

/upload-kyc → document OCR

/credit-score → mock bureau API

/underwrite → eligibility computation

/generate-sanction → PDF creation

AI / Tools

GPT-based LLM

LangChain agents

EasyOCR / Tesseract

FPDF for sanction PDFs

Storage

Local / AWS S3 for KYC documents

PostgreSQL / MongoDB for records
