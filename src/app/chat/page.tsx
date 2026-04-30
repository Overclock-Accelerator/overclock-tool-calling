'use client';

import ChatInterface from '@/components/ChatInterface';

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <ChatInterface
        apiEndpoint="/api/chat"
        title="Basic Chat"
        subtitle="Demo 1 — Simple chat wrapper with no tools. The LLM can only respond with what it knows."
        systemPrompt="You are a helpful AI assistant. Be concise and clear in your responses."
      />
    </div>
  );
}
