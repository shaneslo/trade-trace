import { test, expect } from '@playwright/test';

test.describe('Phase 3: Backend Execution via /api/run', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('LLM node has a Run button', async ({ page }) => {
    const node = page.locator('.react-flow__node-llmPrompt');
    const runBtn = node.locator('[data-testid="run-node-btn"]');
    await expect(runBtn).toBeVisible();
    await expect(runBtn).toHaveText('Run');
  });

  test('LLM node shows idle status initially', async ({ page }) => {
    const node = page.locator('.react-flow__node-llmPrompt');
    const status = node.locator('[data-testid="node-status"]');
    await expect(status).toHaveText('idle');
  });

  test('clicking Run executes the node and shows output', async ({ page }) => {
    const node = page.locator('.react-flow__node-llmPrompt');
    const runBtn = node.locator('[data-testid="run-node-btn"]');

    await runBtn.click();

    // Should transition to success and show output
    const output = node.locator('[data-testid="node-output"]');
    await expect(output).toBeVisible({ timeout: 10000 });

    const status = node.locator('[data-testid="node-status"]');
    await expect(status).toHaveText('success');
  });

  test('output contains model name and processed text', async ({ page }) => {
    const node = page.locator('.react-flow__node-llmPrompt');
    const runBtn = node.locator('[data-testid="run-node-btn"]');

    await runBtn.click();

    const output = node.locator('[data-testid="node-output"]');
    await expect(output).toBeVisible({ timeout: 10000 });

    const text = await output.textContent();
    expect(text).toContain('gpt-4');
  });

  test('/api/run endpoint returns correct response for llmPrompt', async ({ request }) => {
    const res = await request.post('/api/run', {
      data: {
        nodeId: 'test-1',
        nodeType: 'llmPrompt',
        data: { model: 'gpt-4', systemPrompt: 'Test prompt' },
        inputs: [{ text: 'hello' }],
      },
    });

    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.nodeId).toBe('test-1');
    expect(body.status).toBe('success');
    expect(body.output.model).toBe('gpt-4');
    expect(body.output.text).toContain('hello');
  });

  test('/api/run endpoint returns correct response for dataSource', async ({ request }) => {
    const res = await request.post('/api/run', {
      data: {
        nodeId: 'test-2',
        nodeType: 'dataSource',
        data: { sourceType: '1099-B', description: 'Test' },
        inputs: [],
      },
    });

    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.nodeId).toBe('test-2');
    expect(body.status).toBe('success');
    expect(body.output.sourceType).toBe('1099-B');
    expect(body.output.records).toBeGreaterThan(0);
    expect(body.output.sample).toHaveLength(2);
  });

  test('/api/run returns error for unknown node type', async ({ request }) => {
    const res = await request.post('/api/run', {
      data: {
        nodeId: 'test-3',
        nodeType: 'unknownType',
        data: {},
        inputs: [],
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.status).toBe('error');
    expect(body.error).toContain('Unknown node type');
  });


  test('/api/run returns error for invalid JSON request body', async ({ request }) => {
    // By passing a Buffer or a string with malformed JSON, and specifying application/json,
    // Hono will attempt to parse it as JSON and fail.
    const res = await request.post('/api/run', {
      data: Buffer.from('{ "nodeId": "123", "nodeType": "llmPrompt", }'), // trailing comma makes it invalid JSON
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.status).toBe('error');
    expect(body.error).toContain('Invalid JSON in request body');
  });

  test('/api/run returns error for missing nodeId', async ({ request }) => {
    const res = await request.post('/api/run', {
      data: {
        nodeType: 'llmPrompt',
        data: {},
        inputs: [],
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.status).toBe('error');
  });

  test('DataSource node Run button works end-to-end', async ({ page }) => {
    // Drop a DataSource node
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

    const runBtn = dsNode.locator('[data-testid="run-node-btn"]');
    await runBtn.click();

    const output = dsNode.locator('[data-testid="node-output"]');
    await expect(output).toBeVisible({ timeout: 10000 });

    const status = dsNode.locator('[data-testid="node-status"]');
    await expect(status).toHaveText('success');
  });
});
