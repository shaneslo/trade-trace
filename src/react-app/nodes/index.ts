import { LLMPromptNode } from './LLMPromptNode';
import { DataSourceNode } from './DataSourceNode';

export const nodeTypes = {
  llmPrompt: LLMPromptNode,
  dataSource: DataSourceNode,
};

export type NodeTypeId = keyof typeof nodeTypes;

export interface NodeCatalogEntry {
  id: NodeTypeId;
  label: string;
  description: string;
  defaultData: Record<string, unknown>;
}

export const nodeCatalog: NodeCatalogEntry[] = [
  {
    id: 'llmPrompt',
    label: 'LLM Prompt',
    description: 'AI model prompt for processing tax data',
    defaultData: {
      model: 'gpt-4',
      systemPrompt: 'You are a tax operations workflow assistant for GS.',
      status: 'idle',
      output: null,
    },
  },
  {
    id: 'dataSource',
    label: 'Data Source',
    description: 'Tax data feed (1099s, cost basis, wash sales)',
    defaultData: {
      sourceType: '1099-B',
      description: '',
      status: 'idle',
      output: null,
    },
  },
];
