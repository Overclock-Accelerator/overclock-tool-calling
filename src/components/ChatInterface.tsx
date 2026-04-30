'use client';

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import ToolCallBlock from './ToolCallBlock';
import ModelSelector from './ModelSelector';
import { defaultModel } from '@/lib/models';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ToolCallData {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCallData[];
}

interface ChatInterfaceProps {
  apiEndpoint: string;
  systemPrompt?: string;
  showToolCalls?: boolean;
  title: string;
  subtitle?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ChatInterface({
  apiEndpoint,
  systemPrompt,
  showToolCalls = false,
  title,
  subtitle,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(defaultModel.id);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Auto-scroll ---------------------------------------------------- */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /* Auto-resize textarea ------------------------------------------- */
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
    }
  }, [input]);

  /* Send message --------------------------------------------------- */
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          ...(systemPrompt ? { systemPrompt } : {}),
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();

      // Normalize tool call shapes — some routes return `input`, others `arguments`
      const toolCalls = data.toolCalls?.map((tc: Record<string, unknown>) => ({
        id: tc.id,
        name: tc.name,
        arguments: tc.arguments || tc.input || {},
        result: tc.result,
      }));

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content ?? data.message ?? '',
        ...(toolCalls?.length ? { toolCalls } : {}),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Something went wrong.'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /* Keyboard handler ----------------------------------------------- */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* Render --------------------------------------------------------- */
  return (
    <div className="flex flex-1 flex-col bg-[#0a0a0a] font-sans">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
            )}
          </div>
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-zinc-600">
              Send a message to get started.
            </p>
          </div>
        )}

        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((msg, i) => (
            <div key={i}>
              {/* Message bubble */}
              <div
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'user' ? (
                <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap bg-teal-600 text-white">
                  {msg.content}
                </div>
              ) : (
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-[#1a1a1a] text-zinc-200 assistant-msg"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                />
              )}
              </div>

              {/* Tool calls (shown below the assistant message) */}
              {showToolCalls &&
                msg.toolCalls &&
                msg.toolCalls.length > 0 && (
                  <div className="ml-0 mt-2 max-w-[85%]">
                    {msg.toolCalls.map((tc) => (
                      <ToolCallBlock
                        key={tc.id}
                        toolCall={tc}
                        result={tc.result}
                      />
                    ))}
                  </div>
                )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-[#1a1a1a] px-4 py-3">
                <span className="inline-flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400 [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-zinc-800 bg-[#0a0a0a] px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-zinc-700 bg-[#111111] px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30"
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white transition-colors hover:bg-teal-500 disabled:opacity-40 disabled:hover:bg-teal-600"
          >
            {/* Send arrow icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
            </svg>
          </button>
        </div>

        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-zinc-600">
          Press Enter to send, Shift + Enter for a new line
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Markdown formatter for assistant messages                          */
/* ------------------------------------------------------------------ */

function formatMarkdown(text: string): string {
  const lines = text.split('\n');
  let html = '';
  let tableRows: string[][] = [];
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect table rows
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.slice(1, -1).split('|').map((c) => c.trim());
      // Skip separator rows (---|---|---)
      if (cells.every((c) => /^[-:]+$/.test(c))) continue;
      if (!inTable) inTable = true;
      tableRows.push(cells);
      continue;
    }

    // Flush table if we were in one
    if (inTable) {
      html += renderTable(tableRows);
      tableRows = [];
      inTable = false;
    }

    // Empty line = paragraph break
    if (!trimmed) {
      html += '<div class="h-2"></div>';
      continue;
    }

    html += '<p>' + inlineFormat(trimmed) + '</p>';
  }

  // Flush any remaining table
  if (inTable) html += renderTable(tableRows);

  return html;
}

function renderTable(rows: string[][]): string {
  if (rows.length === 0) return '';
  const [header, ...body] = rows;
  let t = '<table class="w-full text-xs my-3 border border-zinc-700 rounded-lg overflow-hidden">';
  t += '<thead><tr class="bg-zinc-800/50">';
  for (const cell of header) {
    t += `<th class="text-left px-3 py-2.5 font-semibold text-teal-400 border-b border-zinc-700">${esc(cell)}</th>`;
  }
  t += '</tr></thead><tbody>';
  for (let i = 0; i < body.length; i++) {
    const stripe = i % 2 === 1 ? ' bg-zinc-800/20' : '';
    t += `<tr class="border-b border-zinc-800 last:border-0${stripe}">`;
    for (const cell of body[i]) {
      t += `<td class="px-3 py-2.5 text-zinc-300">${inlineFormat(cell)}</td>`;
    }
    t += '</tr>';
  }
  t += '</tbody></table>';
  return t;
}

function inlineFormat(text: string): string {
  let s = esc(text);
  // Bold: **text**
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-zinc-100 font-semibold">$1</strong>');
  // Italic: *text*
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Links: [text](url)
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener" class="text-teal-400 underline underline-offset-2 hover:text-teal-300">$1</a>',
  );
  // Inline code: `text`
  s = s.replace(/`([^`]+)`/g, '<code class="bg-zinc-800 text-teal-300 px-1 py-0.5 rounded text-xs">$1</code>');
  return s;
}

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
