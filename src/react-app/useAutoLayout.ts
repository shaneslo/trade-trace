import { useCallback } from 'react';
import { Node, Edge, useReactFlow } from '@xyflow/react';
import ELK, { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

const DEFAULT_WIDTH = 280;
const DEFAULT_HEIGHT = 200;

export interface LayoutOptions {
  direction: 'RIGHT' | 'DOWN';
  spacing: number;
}

const defaultOptions: LayoutOptions = {
  direction: 'RIGHT',
  spacing: 80,
};

async function computeLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = defaultOptions,
): Promise<Node[]> {
  const elkNodes: ElkNode[] = nodes.map((node) => ({
    id: node.id,
    width: node.measured?.width ?? DEFAULT_WIDTH,
    height: node.measured?.height ?? DEFAULT_HEIGHT,
  }));

  const elkEdges: ElkExtendedEdge[] = edges.map((edge) => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
  }));

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': options.direction,
      'elk.spacing.nodeNode': String(options.spacing),
      'elk.layered.spacing.nodeNodeBetweenLayers': String(options.spacing),
    },
    children: elkNodes,
    edges: elkEdges,
  };

  const layoutedGraph = await elk.layout(graph);

  return nodes.map((node) => {
    const elkNode = layoutedGraph.children?.find((n) => n.id === node.id);
    if (elkNode) {
      return {
        ...node,
        position: { x: elkNode.x ?? 0, y: elkNode.y ?? 0 },
      };
    }
    return node;
  });
}

export function useAutoLayout() {
  const { getNodes, getEdges, setNodes, fitView } = useReactFlow();

  const layoutNodes = useCallback(
    async (options?: Partial<LayoutOptions>) => {
      const nodes = getNodes();
      const edges = getEdges();

      if (nodes.length === 0) return;

      try {
        const layouted = await computeLayout(nodes, edges, {
          ...defaultOptions,
          ...options,
        });

        setNodes(layouted);

        // Wait for React to render, then fit view
        requestAnimationFrame(() => {
          fitView({ padding: 0.2 });
        });
      } catch (err) {
        console.error('Auto-layout failed:', err);
      }
    },
    [getNodes, getEdges, setNodes, fitView],
  );

  return { layoutNodes };
}
