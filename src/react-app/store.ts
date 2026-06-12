import { create, useStore } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';

export type NodeStatus = 'idle' | 'running' | 'success' | 'error';

export type WorkflowState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  runNode: (nodeId: string) => Promise<void>;
};

export function getNextNodeId() {
  return `node-${crypto.randomUUID()}`;
}

const initialNodes: Node[] = [
  {
    id: 'node-1',
    type: 'llmPrompt',
    position: { x: 250, y: 150 },
    data: {
      model: 'gpt-4',
      systemPrompt: 'You are a tax operations workflow assistant for GS.',
      status: 'idle',
      output: null,
    },
  },
];

export const useWorkflowStore = create<WorkflowState>()(
  temporal(
    persist(
      (set, get) => ({
        nodes: initialNodes,
        edges: [],
        onNodesChange: (changes) => {
          set({ nodes: applyNodeChanges(changes, get().nodes) });
        },
        onEdgesChange: (changes) => {
          set({ edges: applyEdgeChanges(changes, get().edges) });
        },
        onConnect: (connection) => {
          set({ edges: addEdge(connection, get().edges) });
        },
        addNode: (node) => {
          set({ nodes: [...get().nodes, node] });
        },
        updateNodeData: (nodeId, newData) => {
          set({
            nodes: get().nodes.map((node) => {
              if (node.id === nodeId) {
                return { ...node, data: { ...node.data, ...newData } };
              }
              return node;
            }),
          });
        },
        runNode: async (nodeId) => {
          const { nodes, edges, updateNodeData } = get();
          const node = nodes.find((n) => n.id === nodeId);
          if (!node) return;

          updateNodeData(nodeId, { status: 'running', output: null, error: undefined });

          const incomingEdges = edges.filter((e) => e.target === nodeId);
          const nodesMap = new Map(nodes.map((n) => [n.id, n]));
          const inputs = incomingEdges
            .map((e) => {
              const sourceNode = nodesMap.get(e.source);
              if (!sourceNode?.data.output) return { text: '' };
              const output = sourceNode.data.output;
              if (typeof output === 'string') return { text: output };
              if (typeof output === 'object' && output !== null && 'text' in output) {
                return { text: String((output as Record<string, unknown>).text ?? '') };
              }
              return { text: JSON.stringify(output) };
            })
            .filter(Boolean);

          try {
            const res = await fetch('/api/run', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                nodeId,
                nodeType: node.type,
                data: node.data,
                inputs,
              }),
            });

            if (!res.ok) {
              const errorText = await res.text();
              updateNodeData(nodeId, { status: 'error', error: `HTTP ${res.status}: ${errorText}` });
              return;
            }

            const result = await res.json();

            if (result.status === 'success') {
              updateNodeData(nodeId, { status: 'success', output: result.output });
            } else {
              updateNodeData(nodeId, { status: 'error', error: result.error });
            }
          } catch (err) {
            updateNodeData(nodeId, {
              status: 'error',
              error: err instanceof Error ? err.message : 'Network error',
            });
          }
        },
      }),
      {
        name: 'gs-tax-workflow',
        partialize: (state) => ({
          nodes: state.nodes,
          edges: state.edges,
        }),
      },
    ),
    {
      // Only track meaningful changes (not transient drag positions)
      equality: (pastState, currentState) =>
        JSON.stringify(pastState.nodes.map((n) => ({ id: n.id, type: n.type, data: n.data }))) ===
          JSON.stringify(currentState.nodes.map((n) => ({ id: n.id, type: n.type, data: n.data }))) &&
        JSON.stringify(pastState.edges) === JSON.stringify(currentState.edges),
      limit: 50,
    },
  ),
);

// Export undo/redo helpers as a reactive hook
export const useTemporalStore = () => {
  return useStore(useWorkflowStore.temporal);
};
