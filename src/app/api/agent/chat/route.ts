import { callLLM } from '@/lib/llm';
import { findModelById } from '@/lib/models';
import { Message, ToolCall, ToolResult, ToolDefinition } from '@/lib/types';

const SYSTEM_PROMPT =
  'You are MedLine AI, an intelligent assistant for MedLine Surgical Solutions. You have access to the company\'s CRM system and can search accounts, view details, create/update records, log activities, and generate reports. When users ask about accounts, deals, contacts, or activities, use the appropriate tools. Be professional and precise. When creating or updating records, confirm the action was successful. Format financial values as currency.';

const MAX_ITERATIONS = 5;

const crmTools: ToolDefinition[] = [
  {
    name: 'search_accounts',
    description: 'Search for accounts in the CRM by name, status, or region.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query to match against account names.',
        },
        status: {
          type: 'string',
          description: 'Filter by account status (e.g., "active", "prospect", "churned").',
        },
        region: {
          type: 'string',
          description: 'Filter by region (e.g., "Northeast", "West Coast").',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_account_details',
    description: 'Get detailed information about a specific account by its ID.',
    parameters: {
      type: 'object',
      properties: {
        account_id: {
          type: 'string',
          description: 'The unique identifier of the account.',
        },
      },
      required: ['account_id'],
    },
  },
  {
    name: 'create_account',
    description: 'Create a new account in the CRM system.',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the account.',
        },
        industry_segment: {
          type: 'string',
          description: 'The industry segment of the account.',
        },
        region: {
          type: 'string',
          description: 'The region where the account is located.',
        },
        annual_contract_value: {
          type: 'number',
          description: 'The annual contract value in dollars.',
        },
        status: {
          type: 'string',
          description: 'The status of the account.',
        },
        notes: {
          type: 'string',
          description: 'Additional notes about the account.',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_account',
    description: 'Update an existing account in the CRM.',
    parameters: {
      type: 'object',
      properties: {
        account_id: {
          type: 'string',
          description: 'The unique identifier of the account to update.',
        },
        name: {
          type: 'string',
          description: 'Updated account name.',
        },
        industry_segment: {
          type: 'string',
          description: 'Updated industry segment.',
        },
        region: {
          type: 'string',
          description: 'Updated region.',
        },
        annual_contract_value: {
          type: 'number',
          description: 'Updated annual contract value.',
        },
        status: {
          type: 'string',
          description: 'Updated account status.',
        },
        notes: {
          type: 'string',
          description: 'Updated notes.',
        },
      },
      required: ['account_id'],
    },
  },
  {
    name: 'search_contacts',
    description: 'Search for contacts in the CRM.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query to match against contact names or emails.',
        },
        account_id: {
          type: 'string',
          description: 'Filter contacts by account ID.',
        },
      },
      required: [],
    },
  },
  {
    name: 'create_contact',
    description: 'Create a new contact in the CRM.',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The full name of the contact.',
        },
        title: {
          type: 'string',
          description: 'The job title of the contact.',
        },
        email: {
          type: 'string',
          description: 'The email address of the contact.',
        },
        phone: {
          type: 'string',
          description: 'The phone number of the contact.',
        },
        account_id: {
          type: 'string',
          description: 'The account this contact belongs to.',
        },
        notes: {
          type: 'string',
          description: 'Additional notes about the contact.',
        },
      },
      required: ['name', 'account_id'],
    },
  },
  {
    name: 'search_opportunities',
    description: 'Search for sales opportunities/deals in the CRM.',
    parameters: {
      type: 'object',
      properties: {
        stage: {
          type: 'string',
          description: 'Filter by pipeline stage (e.g., "qualification", "proposal", "closed_won").',
        },
        account_id: {
          type: 'string',
          description: 'Filter opportunities by account ID.',
        },
        min_value: {
          type: 'number',
          description: 'Minimum deal value to filter by.',
        },
        owner: {
          type: 'string',
          description: 'Filter by deal owner name.',
        },
      },
      required: [],
    },
  },
  {
    name: 'create_opportunity',
    description: 'Create a new sales opportunity/deal in the CRM.',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the opportunity.',
        },
        account_id: {
          type: 'string',
          description: 'The account this opportunity is associated with.',
        },
        stage: {
          type: 'string',
          description: 'The pipeline stage of the opportunity.',
        },
        value: {
          type: 'number',
          description: 'The deal value in dollars.',
        },
        expected_close: {
          type: 'string',
          description: 'Expected close date (ISO format).',
        },
        owner: {
          type: 'string',
          description: 'The deal owner.',
        },
        notes: {
          type: 'string',
          description: 'Additional notes about the opportunity.',
        },
      },
      required: ['name', 'account_id'],
    },
  },
  {
    name: 'update_opportunity',
    description: 'Update an existing opportunity/deal in the CRM.',
    parameters: {
      type: 'object',
      properties: {
        opportunity_id: {
          type: 'string',
          description: 'The unique identifier of the opportunity to update.',
        },
        stage: {
          type: 'string',
          description: 'Updated pipeline stage.',
        },
        value: {
          type: 'number',
          description: 'Updated deal value.',
        },
        expected_close: {
          type: 'string',
          description: 'Updated expected close date.',
        },
        owner: {
          type: 'string',
          description: 'Updated deal owner.',
        },
        notes: {
          type: 'string',
          description: 'Updated notes.',
        },
      },
      required: ['opportunity_id'],
    },
  },
  {
    name: 'log_activity',
    description: 'Log a sales activity (call, meeting, email, etc.) in the CRM.',
    parameters: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'The type of activity (e.g., "call", "meeting", "email", "demo").',
        },
        account_id: {
          type: 'string',
          description: 'The account this activity is associated with.',
        },
        contact_id: {
          type: 'string',
          description: 'The contact this activity is associated with.',
        },
        opportunity_id: {
          type: 'string',
          description: 'The opportunity this activity is associated with.',
        },
        summary: {
          type: 'string',
          description: 'A summary of the activity.',
        },
        next_steps: {
          type: 'string',
          description: 'Planned next steps after this activity.',
        },
      },
      required: ['type', 'account_id', 'summary'],
    },
  },
  {
    name: 'delete_account',
    description: 'Delete an account and all its related contacts, opportunities, and activities from the CRM.',
    parameters: {
      type: 'object',
      properties: {
        account_id: {
          type: 'string',
          description: 'The unique identifier of the account to delete.',
        },
      },
      required: ['account_id'],
    },
  },
  {
    name: 'generate_pipeline_report',
    description: 'Generate a summary report of the current sales pipeline.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

// Maps tool names to CRM API endpoints and HTTP methods
interface ToolRouteConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  buildRequest: (args: Record<string, unknown>) => {
    url: string;
    options: RequestInit;
  };
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

function buildToolRoutes(): Record<string, ToolRouteConfig> {
  const baseUrl = getBaseUrl();
  const CRM_API_KEY = process.env.CRM_API_KEY || '';

  const authHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-CRM-API-Key': CRM_API_KEY,
  };

  return {
    search_accounts: {
      path: '/api/crm/accounts',
      method: 'GET',
      buildRequest: (args) => {
        const params = new URLSearchParams();
        if (args.query) params.set('query', String(args.query));
        if (args.status) params.set('status', String(args.status));
        if (args.region) params.set('region', String(args.region));
        const qs = params.toString();
        return {
          url: `${baseUrl}/api/crm/accounts${qs ? `?${qs}` : ''}`,
          options: { method: 'GET', headers: authHeaders },
        };
      },
    },
    get_account_details: {
      path: '/api/crm/accounts/[id]',
      method: 'GET',
      buildRequest: (args) => ({
        url: `${baseUrl}/api/crm/accounts/${args.account_id}`,
        options: { method: 'GET', headers: authHeaders },
      }),
    },
    create_account: {
      path: '/api/crm/accounts',
      method: 'POST',
      buildRequest: (args) => ({
        url: `${baseUrl}/api/crm/accounts`,
        options: {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(args),
        },
      }),
    },
    update_account: {
      path: '/api/crm/accounts/[id]',
      method: 'PATCH',
      buildRequest: (args) => {
        const { account_id, ...updateData } = args;
        return {
          url: `${baseUrl}/api/crm/accounts/${account_id}`,
          options: {
            method: 'PATCH',
            headers: authHeaders,
            body: JSON.stringify(updateData),
          },
        };
      },
    },
    search_contacts: {
      path: '/api/crm/contacts',
      method: 'GET',
      buildRequest: (args) => {
        const params = new URLSearchParams();
        if (args.query) params.set('query', String(args.query));
        if (args.account_id) params.set('account_id', String(args.account_id));
        const qs = params.toString();
        return {
          url: `${baseUrl}/api/crm/contacts${qs ? `?${qs}` : ''}`,
          options: { method: 'GET', headers: authHeaders },
        };
      },
    },
    create_contact: {
      path: '/api/crm/contacts',
      method: 'POST',
      buildRequest: (args) => ({
        url: `${baseUrl}/api/crm/contacts`,
        options: {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(args),
        },
      }),
    },
    search_opportunities: {
      path: '/api/crm/opportunities',
      method: 'GET',
      buildRequest: (args) => {
        const params = new URLSearchParams();
        if (args.stage) params.set('stage', String(args.stage));
        if (args.account_id) params.set('account_id', String(args.account_id));
        if (args.min_value) params.set('min_value', String(args.min_value));
        if (args.owner) params.set('owner', String(args.owner));
        const qs = params.toString();
        return {
          url: `${baseUrl}/api/crm/opportunities${qs ? `?${qs}` : ''}`,
          options: { method: 'GET', headers: authHeaders },
        };
      },
    },
    create_opportunity: {
      path: '/api/crm/opportunities',
      method: 'POST',
      buildRequest: (args) => ({
        url: `${baseUrl}/api/crm/opportunities`,
        options: {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(args),
        },
      }),
    },
    update_opportunity: {
      path: '/api/crm/opportunities/[id]',
      method: 'PATCH',
      buildRequest: (args) => {
        const { opportunity_id, ...updateData } = args;
        return {
          url: `${baseUrl}/api/crm/opportunities/${opportunity_id}`,
          options: {
            method: 'PATCH',
            headers: authHeaders,
            body: JSON.stringify(updateData),
          },
        };
      },
    },
    log_activity: {
      path: '/api/crm/activities',
      method: 'POST',
      buildRequest: (args) => ({
        url: `${baseUrl}/api/crm/activities`,
        options: {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify(args),
        },
      }),
    },
    delete_account: {
      path: '/api/crm/accounts/[id]',
      method: 'GET', // overridden in buildRequest
      buildRequest: (args) => ({
        url: `${baseUrl}/api/crm/accounts/${args.account_id}`,
        options: { method: 'DELETE', headers: authHeaders },
      }),
    },
    generate_pipeline_report: {
      path: '/api/crm/reports/pipeline',
      method: 'GET',
      buildRequest: () => ({
        url: `${baseUrl}/api/crm/reports/pipeline`,
        options: { method: 'GET', headers: authHeaders },
      }),
    },
  };
}

async function executeToolCall(
  toolCall: ToolCall
): Promise<ToolResult> {
  const routes = buildToolRoutes();
  const route = routes[toolCall.name];

  if (!route) {
    return {
      toolCallId: toolCall.id,
      name: toolCall.name,
      result: JSON.stringify({ error: `Unknown tool: ${toolCall.name}` }),
    };
  }

  try {
    const { url, options } = route.buildRequest(toolCall.arguments || {});
    const response = await fetch(url, options);
    const data = await response.json();

    return {
      toolCallId: toolCall.id,
      name: toolCall.name,
      result: JSON.stringify(data),
    };
  } catch (err) {
    return {
      toolCallId: toolCall.id,
      name: toolCall.name,
      result: JSON.stringify({
        error: `Failed to execute ${toolCall.name}`,
        details: err instanceof Error ? err.message : 'Unknown error',
      }),
    };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      model,
      messages: initialMessages,
      systemPrompt,
    }: {
      model: string;
      messages: Message[];
      systemPrompt?: string;
    } = body;

    if (!model || !initialMessages || !Array.isArray(initialMessages)) {
      return Response.json(
        { error: 'Missing required fields: model and messages' },
        { status: 400 }
      );
    }

    const resolvedModel = findModelById(model);
    const allToolCalls: ToolCall[] = [];
    const allToolResults: ToolResult[] = [];
    let currentMessages: Message[] = [...initialMessages];
    const activeSystemPrompt = systemPrompt || SYSTEM_PROMPT;

    // Multi-turn tool calling loop
    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
      const result = await callLLM({
        model: resolvedModel,
        messages: currentMessages,
        systemPrompt: activeSystemPrompt,
        tools: crmTools,
      });

      // If no tool calls, we have the final response
      if (!result.toolCalls || result.toolCalls.length === 0) {
        return Response.json({
          content: result.content,
          toolCalls: allToolCalls.length > 0 ? allToolCalls : undefined,
          toolResults: allToolResults.length > 0 ? allToolResults : undefined,
        });
      }

      // Process all tool calls in this iteration
      const iterationToolResults: ToolResult[] = [];
      for (const toolCall of result.toolCalls) {
        allToolCalls.push(toolCall);
        const toolResult = await executeToolCall(toolCall);
        iterationToolResults.push(toolResult);
        allToolResults.push(toolResult);
      }

      // Append the assistant message with tool calls, then tool results
      currentMessages = [
        ...currentMessages,
        {
          role: 'assistant',
          content: result.content || '',
          toolCalls: result.toolCalls,
        },
        {
          role: 'tool',
          content: '',
          toolResults: iterationToolResults,
        },
      ];
    }

    // If we've exhausted iterations, make one final call without tools
    // to force a text response
    const finalResult = await callLLM({
      model: resolvedModel,
      messages: currentMessages,
      systemPrompt: activeSystemPrompt,
    });

    return Response.json({
      content: finalResult.content,
      toolCalls: allToolCalls.length > 0 ? allToolCalls : undefined,
      toolResults: allToolResults.length > 0 ? allToolResults : undefined,
    });
  } catch (error) {
    console.error('Agent chat API error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
