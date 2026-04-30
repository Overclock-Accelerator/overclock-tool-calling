'use client';

import ChatInterface from '@/components/ChatInterface';

export default function ToolsPage() {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <ChatInterface
        apiEndpoint="/api/tools/chat"
        title="Chat + Commodity Price Tool"
        subtitle="Demo 2 — One custom tool added. Ask about commodity prices and the LLM will fetch real-time data from Trading Economics."
        showToolCalls
        systemPrompt="You are a helpful AI assistant with access to real-time commodity price data. When users ask about commodity prices, use the get_commodity_prices tool to fetch current data. Always cite the source as Trading Economics. If the user asks something unrelated to commodities, respond normally without using the tool."
      />
    </div>
  );
}
