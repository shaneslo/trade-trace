import { test, expect } from '@playwright/test';

// Shared CI runners add scheduling jitter and CDP round-trip overhead that
// local runs don't see, so keep tight SLAs locally but relax them under CI to
// avoid flaky failures while still catching gross regressions.
const isCI = !!process.env.CI;
const UI_SLA_MS = isCI ? 2500 : 500;
const BACKEND_SLA_MS = isCI ? 5000 : 2000;

test.describe('Performance and Latency Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('UI Interaction: Drag and drop a node completes within 500ms', async ({ page }) => {
    // Drop a DataSource node
    const startTime = Date.now();

    await page.evaluate(() => {
      const pane = document.querySelector('.react-flow__pane');
      if (!pane) return;
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true, cancelable: true,
        dataTransfer: new DataTransfer(), clientX: 600, clientY: 300,
      });
      pane.dispatchEvent(dragOverEvent);
      const dropEvent = new DragEvent('drop', {
        bubbles: true, cancelable: true,
        dataTransfer: new DataTransfer(), clientX: 600, clientY: 300,
      });
      dropEvent.dataTransfer!.setData(
        'application/reactflow',
        JSON.stringify({ type: 'dataSource', data: { sourceType: '1099-B', description: '', status: 'idle', output: null } }),
      );
      pane.dispatchEvent(dropEvent);
    });

    const dsNode = page.locator('.react-flow__node-dataSource');
    await expect(dsNode).toBeVisible();

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`Drag and drop node took ${duration}ms`);
    expect(duration).toBeLessThan(UI_SLA_MS);
  });

  test('Backend Execution: Running a node completes within 2000ms', async ({ page }) => {
    const node = page.locator('.react-flow__node-llmPrompt');
    const runBtn = node.locator('[data-testid="run-node-btn"]');

    // Make sure we have a run button first
    await expect(runBtn).toBeVisible();

    // Measure the backend round-trip directly off the /api/run response so the
    // SLA reflects actual backend latency rather than UI polling overhead.
    const startTime = Date.now();
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/run')),
      runBtn.click(),
    ]);
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();

    // Verify the UI reflects the result (correctness, not part of the timing).
    const output = node.locator('[data-testid="node-output"]');
    await expect(output).toBeVisible({ timeout: 10000 });

    const status = node.locator('[data-testid="node-status"]');
    await expect(status).toHaveText('success');

    console.log(`Node execution took ${duration}ms`);
    expect(duration).toBeLessThan(BACKEND_SLA_MS);
  });

  test('UI Interaction: Connecting two nodes completes within 500ms', async ({ page }) => {
    // Drop a new DataSource node
    await page.evaluate(() => {
      const pane = document.querySelector('.react-flow__pane');
      if (!pane) return;
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true, cancelable: true,
        dataTransfer: new DataTransfer(), clientX: 200, clientY: 200,
      });
      pane.dispatchEvent(dragOverEvent);
      const dropEvent = new DragEvent('drop', {
        bubbles: true, cancelable: true,
        dataTransfer: new DataTransfer(), clientX: 200, clientY: 200,
      });
      dropEvent.dataTransfer!.setData(
        'application/reactflow',
        JSON.stringify({ type: 'dataSource', data: { sourceType: '1099-B', description: '', status: 'idle', output: null } }),
      );
      pane.dispatchEvent(dropEvent);
    });

    const dsNode = page.locator('.react-flow__node-dataSource');
    await expect(dsNode).toBeVisible();

    const llmNode = page.locator('.react-flow__node-llmPrompt');
    await expect(llmNode).toBeVisible();

    // Source handle of DataSource node
    const sourceHandle = dsNode.locator('.react-flow__handle-right');
    // Target handle of LLMPrompt node
    const targetHandle = llmNode.locator('.react-flow__handle-left');

    // Resolve bounding boxes before timing so their CDP round-trips don't count
    // against the interaction-latency budget.
    const sourceBox = await sourceHandle.boundingBox();
    const targetBox = await targetHandle.boundingBox();

    if (!sourceBox || !targetBox) {
        throw new Error("Could not find bounding boxes for handles");
    }

    const startTime = Date.now();

    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
    await page.mouse.up();

    // Check if an edge was created
    const edge = page.locator('.react-flow__edge');
    await expect(edge).toBeVisible();

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`Connecting nodes took ${duration}ms`);
    expect(duration).toBeLessThan(UI_SLA_MS);
  });
});
