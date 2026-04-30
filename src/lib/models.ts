import { type Model } from './types';

export const models: Model[] = [
  // ── Anthropic ──────────────────────────────────────────────────────
  {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    provider: 'anthropic',
    inputPrice: 3,
    outputPrice: 15,
  },
  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    inputPrice: 0.80,
    outputPrice: 4,
  },

  // ── OpenAI ─────────────────────────────────────────────────────────
  {
    id: 'gpt-5.4',
    name: 'GPT-5.4',
    provider: 'openai',
    inputPrice: 2,
    outputPrice: 8,
  },
  {
    id: 'gpt-5.4-mini',
    name: 'GPT-5.4 Mini',
    provider: 'openai',
    inputPrice: 0.40,
    outputPrice: 1.60,
  },

  // ── OpenRouter ─────────────────────────────────────────────────────
  {
    id: 'deepseek/deepseek-v3.2',
    name: 'DeepSeek V3.2',
    provider: 'openrouter',
    inputPrice: 0.30,
    outputPrice: 0.88,
  },
];

export const defaultModel = models[0];

export function findModelById(id: string): Model {
  const model = models.find((m) => m.id === id);
  if (!model) {
    throw new Error(`Unknown model ID: ${id}`);
  }
  return model;
}

export function getModelsByProvider(): Record<string, Model[]> {
  return models.reduce(
    (acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    },
    {} as Record<string, Model[]>,
  );
}
