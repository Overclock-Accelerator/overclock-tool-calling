'use client';

import { useState } from 'react';

interface ToolCallBlockProps {
  toolCall: {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
  };
  result?: unknown;
  isExpanded?: boolean;
}

export default function ToolCallBlock({
  toolCall,
  result,
  isExpanded: initialExpanded = false,
}: ToolCallBlockProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  return (
    <div className="my-2 rounded-lg border border-teal-500/30 bg-[#111111] overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-teal-400 hover:bg-[#1a1a1a] transition-colors"
      >
        {/* Wrench icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 shrink-0"
        >
          <path
            fillRule="evenodd"
            d="M19 5.5a4.5 4.5 0 0 1-4.791 4.49c-.873-.055-1.808.128-2.368.8l-6.024 7.23a2.724 2.724 0 1 1-3.837-3.837L9.21 8.16c.672-.56.855-1.495.8-2.368a4.5 4.5 0 0 1 5.873-4.575c.016.008.034.017.05.032.02.018.037.042.048.07a.12.12 0 0 1-.013.1L13.501 4.2a.5.5 0 0 0 .1.598l1.6 1.6a.5.5 0 0 0 .598.1l2.78-1.467a.12.12 0 0 1 .1-.013c.028.01.052.028.07.048.015.016.024.034.032.05A4.5 4.5 0 0 1 19 5.5Z"
            clipRule="evenodd"
          />
        </svg>

        <span className="flex-1 font-mono">{toolCall.name}</span>

        {/* Chevron */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="border-t border-teal-500/20 px-4 py-3 space-y-3">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Arguments
            </p>
            <pre className="overflow-x-auto rounded bg-[#0a0a0a] p-3 text-xs leading-relaxed text-zinc-300 font-mono">
              {JSON.stringify(toolCall.arguments, null, 2)}
            </pre>
          </div>

          {result !== undefined && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Result
              </p>
              <pre className="overflow-x-auto rounded bg-[#0a0a0a] p-3 text-xs leading-relaxed text-zinc-300 font-mono">
                {typeof result === 'string'
                  ? result
                  : JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
