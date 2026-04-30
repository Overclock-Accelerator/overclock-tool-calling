import { callLLM } from '@/lib/llm';
import { findModelById } from '@/lib/models';
import { Message, ToolCall, ToolResult, ToolDefinition } from '@/lib/types';

const SYSTEM_PROMPT =
  'You are a helpful AI assistant with access to real-time commodity price data. When users ask about commodity prices, use the get_commodity_prices tool to fetch current data. Always cite the source as Trading Economics.';

const commodityTool: ToolDefinition = {
  name: 'get_commodity_prices',
  description:
    'Fetches current commodity prices from Trading Economics. Can return all commodities or filter by a specific commodity name.',
  parameters: {
    type: 'object',
    properties: {
      commodity: {
        type: 'string',
        description:
          'Optional commodity name to filter by (e.g., "gold", "oil", "silver"). If omitted, returns all commodities.',
      },
    },
    required: [],
  },
};

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

    // Step 1: Call LLM with the commodity tool definition
    const initialResult = await callLLM({
      model: resolvedModel,
      messages,
      systemPrompt: systemPrompt || SYSTEM_PROMPT,
      tools: [commodityTool],
    });

    // If the LLM did not request any tool calls, return directly
    if (!initialResult.toolCalls || initialResult.toolCalls.length === 0) {
      return Response.json({
        content: initialResult.content,
        usage: initialResult.usage,
      });
    }

    // Step 2: Process tool calls
    const toolCalls: ToolCall[] = initialResult.toolCalls;
    const toolResults: ToolResult[] = [];

    for (const toolCall of toolCalls) {
      if (toolCall.name === 'get_commodity_prices') {
        try {
          // Build the URL for the internal commodities endpoint
          const origin = new URL(request.url).origin;
          const params = new URLSearchParams();
          if (toolCall.arguments?.commodity) {
            params.set('commodity', String(toolCall.arguments.commodity));
          }
          const commodityUrl = `${origin}/api/tools/commodities${params.toString() ? `?${params.toString()}` : ''}`;

          const commodityResponse = await fetch(commodityUrl);
          const commodityData = await commodityResponse.json();

          toolResults.push({
            toolCallId: toolCall.id,
            name: toolCall.name,
            result: JSON.stringify(commodityData),
          });
        } catch (err) {
          toolResults.push({
            toolCallId: toolCall.id,
            name: toolCall.name,
            result: JSON.stringify({
              error: 'Failed to fetch commodity data',
              details: err instanceof Error ? err.message : 'Unknown error',
            }),
          });
        }
      }
    }

    // Step 3: Pass tool results back to the LLM for a final response
    const updatedMessages: Message[] = [
      ...messages,
      {
        role: 'assistant',
        content: initialResult.content || '',
        toolCalls,
      },
      {
        role: 'tool',
        content: '',
        toolResults,
      },
    ];

    const finalResult = await callLLM({
      model: resolvedModel,
      messages: updatedMessages,
      systemPrompt: systemPrompt || SYSTEM_PROMPT,
      tools: [commodityTool],
    });

    return Response.json({
      content: finalResult.content,
      toolCalls,
      toolResults,
      usage: finalResult.usage,
    });
  } catch (error) {
    console.error('Tools chat API error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
