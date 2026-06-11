import { useEffect, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

import { ThemeProvider } from '@/components/theme-provider';
import { AppStoreProvider } from '@/app/workflow/store';
import SidebarLayout from '@/app/workflow/layouts/sidebar-layout';
import Workflow from '@/app/workflow/components/workflow';
import { loadData } from '@/app/workflow/mock-data';
import type { AppNode } from '@/app/workflow/components/nodes';
import type { AppEdge } from '@/app/workflow/components/edges';

/**
 * In the original Next.js template the initial nodes and edges are laid out on
 * the server inside the root layout. Here we run the (async) ELK layout in the
 * browser once before mounting the workflow so the store and React Flow share
 * the same initial state.
 */
export default function App() {
  const [data, setData] = useState<{ nodes: AppNode[]; edges: AppEdge[] } | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    loadData().then((result) => {
      if (active) setData(result);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!data) return null;

  return (
    <AppStoreProvider initialState={{ nodes: data.nodes, edges: data.edges }}>
      <ReactFlowProvider initialNodes={data.nodes} initialEdges={data.edges}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarLayout>
            <Workflow />
          </SidebarLayout>
        </ThemeProvider>
      </ReactFlowProvider>
    </AppStoreProvider>
  );
}
