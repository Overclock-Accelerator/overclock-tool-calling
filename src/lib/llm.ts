import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import {
  type LLMRequest,
  type LLMResponse,
  type Message,
  type Model,
  type ToolCall,
  type ToolDefinition,
  type ToolResult,
} from './types';

// ── SDK Clients (lazy singletons) ──────────────────────────────────

let _anthropic: Anthropic | null = null;
function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return _anthropic;
}

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _openai;
}

let _openrouter: OpenAI | null = null;
function getOpenRouter(): OpenAI {
  if (!_openrouter) {
    _openrouter = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY!,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }
  return _openrouter;
}

// ── Anthropic helpers ──────────────────────────────────────────────

function toAnthropicMessages(
  messages: Message[],
): Anthropic.MessageParam[] {
  const result: Anthropic.MessageParam[] = [];

  for (const msg of messages) {
    if (msg.role === 'user') {
      result.push({ role: 'user', content: msg.content });
    } else if (msg.role === 'assistant') {
      // If the assistant message included tool calls, represent them as content blocks
      if (msg.toolCalls && msg.toolCalls.length > 0) {
        const blocks: Anthropic.ContentBlockParam[] = [];
        if (msg.content) {
          blocks.push({ type: 'text', text: msg.content });
        }
        for (const tc of msg.toolCalls) {
          blocks.push({
            type: 'tool_use',
            id: tc.id,
            name: tc.name,
            input: tc.arguments,
          });
        }
        result.push({ role: 'assistant', content: blocks });
      } else {
        result.push({ role: 'assistant', content: msg.content });
      }
    } else if (msg.role === 'tool' && msg.toolResults) {
      // Tool results go as a user message with tool_result content blocks
      const blocks: Anthropic.ToolResultBlockParam[] = msg.toolResults.map(
        (tr) => ({
          type: 'tool_result' as const,
          tool_use_id: tr.toolCallId,
          content: typeof tr.result === 'string' ? tr.result : JSON.stringify(tr.result),
        }),
      );
      result.push({ role: 'user', content: blocks });
    }
  }

  return result;
}

function toAnthropicTools(
  tools: ToolDefinition[],
): Anthropic.Tool[] {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: {
      type: 'object' as const,
      ...t.parameters,
    },
  }));
}

function toAnthropicToolChoice(
  choice?: LLMRequest['toolChoice'],
): Anthropic.MessageCreateParams['tool_choice'] {
  if (!choice) return undefined;
  if (choice === 'auto') return { type: 'auto' };
  if (choice === 'none') return undefined; // Anthropic doesn't have a "none" — just omit tools
  if (choice === 'required') return { type: 'any' };
  if (typeof choice === 'object' && 'name' in choice) {
    return { type: 'tool', name: choice.name };
  }
  return undefined;
}

async function callAnthropic(req: LLMRequest): Promise<LLMResponse> {
  const client = getAnthropic();

  const params: Anthropic.MessageCreateParams = {
    model: req.model.id,
    max_tokens: 4096,
    messages: toAnthropicMessages(req.messages),
  };

  if (req.systemPrompt) {
    params.system = req.systemPrompt;
  }
  if (req.tools && req.tools.length > 0) {
    params.tools = toAnthropicTools(req.tools);
    const tc = toAnthropicToolChoice(req.toolChoice);
    if (tc) params.tool_choice = tc;
  }

  const response = await client.messages.create(params);

  // Extract text content and tool_use blocks
  let content = '';
  const toolCalls: ToolCall[] = [];

  for (const block of response.content) {
    if (block.type === 'text') {
      content += block.text;
    } else if (block.type === 'tool_use') {
      toolCalls.push({
        id: block.id,
        name: block.name,
        arguments: block.input as Record<string, unknown>,
      });
    }
  }

  return {
    content,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  };
}

// ── OpenAI / OpenRouter helpers ────────────────────────────────────

function toOpenAIMessages(
  messages: Message[],
  systemPrompt?: string,
): OpenAI.ChatCompletionMessageParam[] {
  const result: OpenAI.ChatCompletionMessageParam[] = [];

  if (systemPrompt) {
    result.push({ role: 'system', content: systemPrompt });
  }

  for (const msg of messages) {
    if (msg.role === 'user') {
      result.push({ role: 'user', content: msg.content });
    } else if (msg.role === 'assistant') {
      const assistantMsg: OpenAI.ChatCompletionAssistantMessageParam = {
        role: 'assistant',
        content: msg.content || null,
      };
      if (msg.toolCalls && msg.toolCalls.length > 0) {
        assistantMsg.tool_calls = msg.toolCalls.map((tc) => ({
          id: tc.id,
          type: 'function' as const,
          function: {
            name: tc.name,
            arguments: JSON.stringify(tc.arguments),
          },
        }));
      }
      result.push(assistantMsg);
    } else if (msg.role === 'tool' && msg.toolResults) {
      for (const tr of msg.toolResults) {
        result.push({
          role: 'tool',
          tool_call_id: tr.toolCallId,
          content: typeof tr.result === 'string' ? tr.result : JSON.stringify(tr.result),
        });
      }
    }
  }

  return result;
}

function toOpenAITools(
  tools: ToolDefinition[],
): OpenAI.ChatCompletionTool[] {
  return tools.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

function toOpenAIToolChoice(
  choice?: LLMRequest['toolChoice'],
): OpenAI.ChatCompletionToolChoiceOption | undefined {
  if (!choice) return undefined;
  if (choice === 'auto') return 'auto';
  if (choice === 'none') return 'none';
  if (choice === 'required') return 'required';
  if (typeof choice === 'object' && 'name' in choice) {
    return { type: 'function', function: { name: choice.name } };
  }
  return undefined;
}

async function callOpenAICompatible(
  req: LLMRequest,
  client: OpenAI,
): Promise<LLMResponse> {
  const params: OpenAI.ChatCompletionCreateParams = {
    model: req.model.id,
    messages: toOpenAIMessages(req.messages, req.systemPrompt),
  };

  if (req.tools && req.tools.length > 0) {
    params.tools = toOpenAITools(req.tools);
    const tc = toOpenAIToolChoice(req.toolChoice);
    if (tc) params.tool_choice = tc;
  }

  const response = await client.chat.completions.create(params);
  const choice = response.choices[0];
  const message = choice.message;

  const toolCalls: ToolCall[] = [];
  if (message.tool_calls) {
    for (const tc of message.tool_calls) {
      if (tc.type === 'function') {
        toolCalls.push({
          id: tc.id,
          name: tc.function.name,
          arguments: JSON.parse(tc.function.arguments),
        });
      }
    }
  }

  return {
    content: message.content ?? '',
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    usage: {
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0,
    },
  };
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Call an LLM across any supported provider. Returns a normalized response
 * with content, optional tool calls, and usage stats.
 */
export async function callLLM(req: LLMRequest): Promise<LLMResponse> {
  switch (req.model.provider) {
    case 'anthropic':
      return callAnthropic(req);
    case 'openai':
      return callOpenAICompatible(req, getOpenAI());
    case 'openrouter':
      return callOpenAICompatible(req, getOpenRouter());
    default:
      throw new Error(`Unsupported provider: ${req.model.provider}`);
  }
}

/**
 * Multi-turn tool-calling loop. Calls the LLM, and when it returns tool calls,
 * yields them to the caller for execution. The caller provides results, and the
 * loop continues until the LLM returns a final text response (no tool calls)
 * or we hit `maxIterations`.
 *
 * The `executeTool` callback receives a ToolCall and must return a ToolResult.
 */
export async function callLLMWithTools({
  model,
  messages,
  systemPrompt,
  tools,
  maxIterations = 10,
  executeTool,
}: {
  model: Model;
  messages: Message[];
  systemPrompt?: string;
  tools: ToolDefinition[];
  maxIterations?: number;
  executeTool: (toolCall: ToolCall) => Promise<ToolResult>;
}): Promise<{
  response: LLMResponse;
  messages: Message[];
  iterations: number;
}> {
  const conversationMessages = [...messages];
  let iterations = 0;
  let lastResponse: LLMResponse;

  while (iterations < maxIterations) {
    iterations++;

    lastResponse = await callLLM({
      model,
      messages: conversationMessages,
      systemPrompt,
      tools,
      toolChoice: 'auto',
    });

    // If no tool calls, we're done
    if (!lastResponse.toolCalls || lastResponse.toolCalls.length === 0) {
      return { response: lastResponse, messages: conversationMessages, iterations };
    }

    // Append assistant message with tool calls
    conversationMessages.push({
      role: 'assistant',
      content: lastResponse.content,
      toolCalls: lastResponse.toolCalls,
    });

    // Execute each tool call and collect results
    const toolResults: ToolResult[] = [];
    for (const tc of lastResponse.toolCalls) {
      const result = await executeTool(tc);
      toolResults.push(result);
    }

    // Append tool results message
    conversationMessages.push({
      role: 'tool',
      content: '',
      toolResults,
    });
  }

  // If we exhausted iterations, return the last response as-is
  return { response: lastResponse!, messages: conversationMessages, iterations };
}
