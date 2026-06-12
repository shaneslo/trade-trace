import React from 'react';

export function NodeOutput({ output }: { output: unknown }) {
  if (!output) return null;

  return (
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
      {typeof output === 'object'
        ? JSON.stringify(output, null, 2)
        : String(output)}
    </div>
  );
}

export function NodeError({ error }: { error: unknown }) {
  if (!error) return null;

  return (
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
      {String(error)}
    </div>
  );
}
