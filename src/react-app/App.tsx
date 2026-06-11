import { useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore, useTemporalStore, getNextNodeId } from './store';
import { nodeTypes } from './nodes';
import { Sidebar } from './Sidebar';
import { useAutoLayout } from './useAutoLayout';

function ToolbarPanel() {
  const { layoutNodes } = useAutoLayout();
  const { undo, redo, pastStates, futureStates } = useTemporalStore();

  return (
    <Panel position="top-right">
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          data-testid="undo-btn"
          onClick={() => undo()}
          disabled={pastStates.length === 0}
          title="Undo (Ctrl+Z)"
          style={{
            padding: '6px 10px',
            borderRadius: '4px',
            border: '1px solid #444',
            backgroundColor: pastStates.length === 0 ? '#1a1a1a' : '#2a2a2a',
            color: pastStates.length === 0 ? '#666' : '#fff',
            fontSize: '11px',
            cursor: pastStates.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Undo
        </button>
        <button
          data-testid="redo-btn"
          onClick={() => redo()}
          disabled={futureStates.length === 0}
          title="Redo (Ctrl+Shift+Z)"
          style={{
            padding: '6px 10px',
            borderRadius: '4px',
            border: '1px solid #444',
            backgroundColor: futureStates.length === 0 ? '#1a1a1a' : '#2a2a2a',
            color: futureStates.length === 0 ? '#666' : '#fff',
            fontSize: '11px',
            cursor: futureStates.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Redo
        </button>
        <div style={{ width: '1px', backgroundColor: '#444', margin: '0 4px' }} />
        <button
          data-testid="layout-horizontal"
          onClick={() => layoutNodes({ direction: 'RIGHT' })}
          style={{
            padding: '6px 10px',
            borderRadius: '4px',
            border: '1px solid #444',
            backgroundColor: '#2a2a2a',
            color: '#fff',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          Layout →
        </button>
        <button
          data-testid="layout-vertical"
          onClick={() => layoutNodes({ direction: 'DOWN' })}
          style={{
            padding: '6px 10px',
            borderRadius: '4px',
            border: '1px solid #444',
            backgroundColor: '#2a2a2a',
            color: '#fff',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          Layout ↓
        </button>
      </div>
    </Panel>
  );
}

function WorkflowCanvas() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);
  const addNode = useWorkflowStore((s) => s.addNode);
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData('application/reactflow');
      if (!raw) return;

      const { type, data } = JSON.parse(raw);
      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      addNode({
        id: getNextNodeId(),
        type,
        position,
        data,
      });
    },
    [addNode, screenToFlowPosition],
  );

  return (
    <div style={{ flex: 1, height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
      >
        <Background gap={16} />
        <Controls />
        <MiniMap zoomable pannable />
        <ToolbarPanel />
      </ReactFlow>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <Sidebar />
        <WorkflowCanvas />
      </div>
    </ReactFlowProvider>
  );
}
