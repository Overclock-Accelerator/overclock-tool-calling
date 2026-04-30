'use client';

import { getModelsByProvider } from '@/lib/models';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const providerLabels: Record<string, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  openrouter: 'OpenRouter',
};

export default function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  const grouped = getModelsByProvider();

  return (
    <select
      value={selectedModel}
      onChange={(e) => onModelChange(e.target.value)}
      className="rounded-lg border border-zinc-700 bg-[#111111] px-3 py-2 text-sm text-zinc-200 outline-none transition-colors hover:border-teal-500/50 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 font-sans"
    >
      {Object.entries(grouped).map(([provider, providerModels]) => (
        <optgroup
          key={provider}
          label={providerLabels[provider] ?? provider}
          className="bg-[#111111] text-zinc-200"
        >
          {providerModels.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
