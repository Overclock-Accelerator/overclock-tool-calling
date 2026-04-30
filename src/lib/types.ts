// Shared types for the overclock tool-calling app

// ── Chat & Tool Types ──────────────────────────────────────────────

export interface Message {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  name: string;
  result: unknown;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema format
}

// ── Model Types ────────────────────────────────────────────────────

export type Provider = 'anthropic' | 'openai' | 'openrouter';

export interface Model {
  id: string;
  name: string;
  provider: Provider;
  inputPrice: number;  // per 1M tokens
  outputPrice: number; // per 1M tokens
}

// ── LLM Types ──────────────────────────────────────────────────────

export interface LLMRequest {
  model: Model;
  messages: Message[];
  systemPrompt?: string;
  tools?: ToolDefinition[];
  toolChoice?: 'auto' | 'none' | 'required' | { name: string };
}

export interface LLMResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

// ── CRM / Supabase Schema Types ────────────────────────────────────

export interface Account {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  employee_count: number | null;
  annual_revenue: number | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  account_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  department: string | null;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  account_id: string | null;
  contact_id: string | null;
  name: string;
  stage: string;
  amount: number | null;
  probability: number | null;
  close_date: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  account_id: string | null;
  contact_id: string | null;
  opportunity_id: string | null;
  type: string;
  subject: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
