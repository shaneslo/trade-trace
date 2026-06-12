import { Handle, Position, NodeProps } from '@xyflow/react';
import { useWorkflowStore, NodeStatus } from '../store';
import { NodeOutput, NodeError } from './NodeOutput';

const statusColors: Record<NodeStatus, string> = {
  idle: '#0ea5e9',
  running: '#f59e0b',
  success: '#10b981',
  error: '#ef4444',
};

export function DataSourceNode({ id, data }: NodeProps) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const runNode = useWorkflowStore((s) => s.runNode);
  const status = (data.status as NodeStatus) ?? 'idle';

  return (
    <div
      style={{
        backgroundColor: '#f0f9ff',
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
            Data Source
          </h3>
          <span
            data-testid="node-status"
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: statusColors[status],
              color: '#fff',
            }}
          >
            {status}
          </span>
        </div>

        <label style={{ fontSize: '11px', color: '#666' }}>Source Type</label>
        <select
          className="nodrag"
          value={data.sourceType as string}
          onChange={(e) => updateNodeData(id, { sourceType: e.target.value })}
          style={{ padding: '4px', borderRadius: '4px', fontSize: '12px' }}
        >
          <option value="1099-B">1099-B (Broker Transactions)</option>
          <option value="1099-DIV">1099-DIV (Dividends)</option>
          <option value="1099-INT">1099-INT (Interest)</option>
          <option value="cost-basis">Cost Basis Records</option>
          <option value="wash-sale">Wash Sale Adjustments</option>
        </select>

        <label style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
          Description
        </label>
        <input
          className="nodrag"
          type="text"
          value={data.description as string}
          onChange={(e) => updateNodeData(id, { description: e.target.value })}
          placeholder="e.g., Q4 2025 broker feed"
          style={{ padding: '4px', borderRadius: '4px', fontSize: '12px' }}
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
            backgroundColor: status === 'running' ? '#d1d5db' : '#0284c7',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: status === 'running' ? 'not-allowed' : 'pointer',
          }}
        >
          {status === 'running' ? 'Fetching...' : 'Fetch Data'}
        </button>

        <NodeOutput output={data.output} />
        <NodeError error={data.error} />
      </div>

      <Handle type="source" position={Position.Right} id="output-1" />
    </div>
  );
}
