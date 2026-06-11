import { Handle, Position, NodeProps } from '@xyflow/react';
import { useWorkflowStore, NodeStatus } from '../store';

const statusColors: Record<NodeStatus, string> = {
  idle: '#ccc',
  running: '#f59e0b',
  success: '#10b981',
  error: '#ef4444',
};

export function LLMPromptNode({ id, data }: NodeProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const runNode = useWorkflowStore((s) => s.runNode);
  const status = (data.status as NodeStatus) ?? 'idle';

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: `2px solid ${statusColors[status]}`,
        borderRadius: '8px',
        padding: '16px',
        width: '260px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        fontFamily: 'sans-serif',
        color: '#333',
      }}
    >
      <Handle type="target" position={Position.Left} id="input-1" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
            LLM Prompt
          </h3>
          <span
            data-testid="node-status"
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: statusColors[status],
              color: status === 'idle' ? '#333' : '#fff',
            }}
          >
            {status}
          </span>
        </div>

        <label style={{ fontSize: '11px', color: '#666' }}>Model</label>
        <select
          className="nodrag"
          value={data.model as string}
          onChange={(e) => updateNodeData(id, { model: e.target.value })}
          style={{ padding: '4px', borderRadius: '4px', fontSize: '12px' }}
        >
          <option value="gpt-4">GPT-4</option>
          <option value="claude-3">Claude 3</option>
          <option value="gpt-4o">GPT-4o</option>
        </select>

        <label style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
          System Prompt
        </label>
        <textarea
          className="nodrag"
          value={data.systemPrompt as string}
          onChange={(e) =>
            updateNodeData(id, { systemPrompt: e.target.value })
          }
          style={{
            padding: '4px',
            borderRadius: '4px',
            height: '60px',
            fontSize: '12px',
            resize: 'vertical',
          }}
        />

        <button
          className="nodrag"
          data-testid="run-node-btn"
          onClick={() => runNode(id)}
          disabled={status === 'running'}
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: status === 'running' ? '#d1d5db' : '#2563eb',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: status === 'running' ? 'not-allowed' : 'pointer',
          }}
        >
          {status === 'running' ? 'Running...' : 'Run'}
        </button>

        {data.output && (
          <div
            data-testid="node-output"
            style={{
              marginTop: '4px',
              padding: '6px',
              backgroundColor: '#f0fdf4',
              borderRadius: '4px',
              fontSize: '11px',
              maxHeight: '80px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {typeof data.output === 'object'
              ? JSON.stringify(data.output, null, 2)
              : String(data.output)}
          </div>
        )}

        {data.error && (
          <div
            data-testid="node-error"
            style={{
              marginTop: '4px',
              padding: '6px',
              backgroundColor: '#fef2f2',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#dc2626',
            }}
          >
            {String(data.error)}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} id="output-1" />
    </div>
  );
}
