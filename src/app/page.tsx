import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-light tracking-tight mb-4">
          <span className="text-[#17ffdc]">Tool-Powered</span> Chat Interfaces
        </h1>
        <p className="text-lg text-[#888] mb-12 max-w-xl mx-auto">
          Unit 5 — Building AI applications that can act on the world through custom tools.
          Four demos showing the progression from basic chat to a fully tool-equipped CRM agent.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Link
            href="/chat"
            className="group p-6 rounded-lg border border-[#222] bg-[#111] hover:border-[#17ffdc]/30 hover:bg-[#111]/80 transition-all text-left"
          >
            <div className="text-sm font-medium text-[#17ffdc] mb-1 uppercase tracking-widest">Demo 1</div>
            <h2 className="text-xl font-medium mb-2">Basic Chat</h2>
            <p className="text-sm text-[#888]">
              Simple chat wrapper — the LLM can only respond with what it knows. No tools.
            </p>
          </Link>

          <Link
            href="/tools"
            className="group p-6 rounded-lg border border-[#222] bg-[#111] hover:border-[#17ffdc]/30 hover:bg-[#111]/80 transition-all text-left"
          >
            <div className="text-sm font-medium text-[#17ffdc] mb-1 uppercase tracking-widest">Demo 2</div>
            <h2 className="text-xl font-medium mb-2">Chat + Tools</h2>
            <p className="text-sm text-[#888]">
              One custom tool added — real-time commodity prices. The LLM decides when to call it.
            </p>
          </Link>

          <Link
            href="/crm"
            className="group p-6 rounded-lg border border-[#222] bg-[#111] hover:border-[#17ffdc]/30 hover:bg-[#111]/80 transition-all text-left"
          >
            <div className="text-sm font-medium text-[#17ffdc] mb-1 uppercase tracking-widest">Demo 3</div>
            <h2 className="text-xl font-medium mb-2">Surgical Supplies CRM</h2>
            <p className="text-sm text-[#888]">
              A hosted CRM with credentialized API — the system the AI agent will interact with.
            </p>
          </Link>

          <Link
            href="/agent"
            className="group p-6 rounded-lg border border-[#222] bg-[#111] hover:border-[#17ffdc]/30 hover:bg-[#111]/80 transition-all text-left"
          >
            <div className="text-sm font-medium text-[#17ffdc] mb-1 uppercase tracking-widest">Demo 4</div>
            <h2 className="text-xl font-medium mb-2">CRM Agent</h2>
            <p className="text-sm text-[#888]">
              Chat interface with 12 custom tools — search, create, update, delete, and report on CRM data.
            </p>
          </Link>


        </div>
      </div>
    </div>
  );
}
