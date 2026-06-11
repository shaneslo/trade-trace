import { test, expect } from '@playwright/test';

test.describe('Phase 2: Node Registry + Drag-from-Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('sidebar is visible with Node Palette heading', async ({ page }) => {
    const sidebar = page.locator('[data-testid="workflow-sidebar"]');
    await expect(sidebar).toBeVisible();
    await expect(sidebar.locator('h2')).toHaveText('Node Palette');
  });

  test('sidebar lists both node types', async ({ page }) => {
    const sidebar = page.locator('[data-testid="workflow-sidebar"]');
    await expect(sidebar.getByText('LLM Prompt')).toBeVisible();
    await expect(sidebar.getByText('Data Source')).toBeVisible();
  });

  test('drag DataSource node onto canvas creates a new node', async ({ page }) => {
    // Initially only 1 node
    await expect(page.locator('.react-flow__node')).toHaveCount(1);

    // Simulate drop via native DnD event dispatch
    await page.evaluate(() => {
      const pane = document.querySelector('.react-flow__pane');
      if (!pane) return;

      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
        clientX: window.innerWidth / 2,
        clientY: window.innerHeight / 2,
      });
      pane.dispatchEvent(dragOverEvent);

      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
        clientX: window.innerWidth / 2,
        clientY: window.innerHeight / 2,
      });
      dropEvent.dataTransfer!.setData(
        'application/reactflow',
        JSON.stringify({ type: 'dataSource', data: { sourceType: '1099-B', description: '' } }),
      );
      pane.dispatchEvent(dropEvent);
    });

    // Should now have 2 nodes
    await expect(page.locator('.react-flow__node')).toHaveCount(2);
  });

  test('drag LLM Prompt node onto canvas creates node with correct type', async ({ page }) => {
    await page.evaluate(() => {
      const pane = document.querySelector('.react-flow__pane');
      if (!pane) return;

      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true, cancelable: true,
        dataTransfer: new DataTransfer(), clientX: 500, clientY: 300,
      });
      pane.dispatchEvent(dragOverEvent);

      const dropEvent = new DragEvent('drop', {
        bubbles: true, cancelable: true,
        dataTransfer: new DataTransfer(), clientX: 500, clientY: 300,
      });
      dropEvent.dataTransfer!.setData(
        'application/reactflow',
        JSON.stringify({
          type: 'llmPrompt',
          data: { model: 'gpt-4', systemPrompt: 'You are a tax operations workflow assistant for GS.' },
        }),
      );
      pane.dispatchEvent(dropEvent);
    });

    // Should have 2 LLM prompt nodes (initial + dropped)
    await expect(page.locator('.react-flow__node-llmPrompt')).toHaveCount(2);
  });

  test('newly dropped DataSource node has correct default data', async ({ page }) => {
    await page.evaluate(() => {
      const pane = document.querySelector('.react-flow__pane');
      if (!pane) return;

      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true, cancelable: true,
        dataTransfer: new DataTransfer(), clientX: 600, clientY: 400,
      });
      pane.dispatchEvent(dragOverEvent);

      const dropEvent = new DragEvent('drop', {
        bubbles: true, cancelable: true,
        dataTransfer: new DataTransfer(), clientX: 600, clientY: 400,
      });
      dropEvent.dataTransfer!.setData(
        'application/reactflow',
        JSON.stringify({ type: 'dataSource', data: { sourceType: '1099-B', description: '' } }),
      );
      pane.dispatchEvent(dropEvent);
    });

    const dsNode = page.locator('.react-flow__node-dataSource');
    await expect(dsNode).toBeVisible();
    await expect(dsNode.locator('h3')).toHaveText('Data Source');
    await expect(dsNode.locator('select')).toHaveValue('1099-B');
  });

  test('DataSource node select can change source type', async ({ page }) => {
    await page.evaluate(() => {
      const pane = document.querySelector('.react-flow__pane');
      if (!pane) return;
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true, cancelable: true,
        dataTransfer: new DataTransfer(), clientX: 600, clientY: 400,
      });
      pane.dispatchEvent(dragOverEvent);
      const dropEvent = new DragEvent('drop', {
        bubbles: true, cancelable: true,
        dataTransfer: new DataTransfer(), clientX: 600, clientY: 400,
      });
      dropEvent.dataTransfer!.setData(
        'application/reactflow',
        JSON.stringify({ type: 'dataSource', data: { sourceType: '1099-B', description: '' } }),
      );
      pane.dispatchEvent(dropEvent);
    });

    const dsNode = page.locator('.react-flow__node-dataSource');
    await expect(dsNode).toBeVisible();

    const select = dsNode.locator('select');
    await select.selectOption('wash-sale');
    await expect(select).toHaveValue('wash-sale');
  });
});
