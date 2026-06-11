import { nodeCatalog, NodeCatalogEntry } from './nodes';

function DraggableNodeItem({ entry }: { entry: NodeCatalogEntry }) {
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({ type: entry.id, data: entry.defaultData }),
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        padding: '10px 12px',
        marginBottom: '6px',
        backgroundColor: '#2a2a2a',
        border: '1px solid #444',
        borderRadius: '6px',
        cursor: 'grab',
        fontSize: '13px',
      }}
    >
      <div style={{ fontWeight: 600 }}>{entry.label}</div>
      <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
        {entry.description}
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside
      data-testid="workflow-sidebar"
      style={{
        width: '220px',
        padding: '16px',
        borderRight: '1px solid #333',
        backgroundColor: '#1a1a1a',
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      <h2 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600 }}>
        Node Palette
      </h2>
      <p style={{ fontSize: '11px', color: '#888', marginBottom: '12px' }}>
        Drag nodes onto the canvas
      </p>
      {nodeCatalog.map((entry) => (
        <DraggableNodeItem key={entry.id} entry={entry} />
      ))}
    </aside>
  );
}
