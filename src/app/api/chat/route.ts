import { callLLM } from '@/lib/llm';
import { findModelById } from '@/lib/models';
import { Message } from '@/lib/types';

const DEFAULT_SYSTEM_PROMPT =
  'You are a helpful AI assistant. Be concise and clear.';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      model,
      messages,
      systemPrompt,
    }: {
      model: string;
      messages: Message[];
      systemPrompt?: string;
    } = body;

    if (!model || !messages || !Array.isArray(messages)) {
      return Response.json(
        { error: 'Missing required fields: model and messages' },
        { status: 400 }
      );
    }

    const resolvedModel = findModelById(model);

    const result = await callLLM({
      model: resolvedModel,
      messages,
      systemPrompt: systemPrompt || DEFAULT_SYSTEM_PROMPT,
    });

    return Response.json({
      content: result.content,
      usage: result.usage,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
