'use client';

import ChatInterface from '@/components/ChatInterface';

export default function AgentPage() {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <ChatInterface
        apiEndpoint="/api/agent/chat"
        title="CRM Agent — MedLine Surgical Solutions"
        subtitle="Demo 4 — Chat interface with 11 custom tools wired to the CRM. Search accounts, create records, update deals, log activities, and generate reports."
        showToolCalls
        systemPrompt="You are MedLine AI, an intelligent assistant for MedLine Surgical Solutions — a B2B supplier of surgical instruments, implants, disposables, and equipment to major hospital systems. You have access to the company's CRM system and can search accounts, view details, create/update records, log activities, and generate reports. Be professional and precise. When creating or updating records, confirm the action was successful. Format financial values as currency."
      />
    </div>
  );
}
