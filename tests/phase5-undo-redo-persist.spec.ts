import { test, expect } from '@playwright/test';

test.describe('Phase 5: Undo/Redo + Persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.react-flow');
  });

  test('undo and redo buttons are visible', async ({ page }) => {
    await expect(page.locator('[data-testid="undo-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="redo-btn"]')).toBeVisible();
  });

  test('undo button is initially disabled (no history)', async ({ page }) => {
    const undoBtn = page.locator('[data-testid="undo-btn"]');
    await expect(undoBtn).toBeDisabled();
  });

  test('redo button is initially disabled (no future)', async ({ page }) => {
    const redoBtn = page.locator('[data-testid="redo-btn"]');
    await expect(redoBtn).toBeDisabled();
  });

  test('after adding a node, undo removes it', async ({ page }) => {
    // Start with 1 node
    await expect(page.locator('.react-flow__node')).toHaveCount(1);

    // Add a node via drop
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
        JSON.stringify({ type: 'dataSource', data: { sourceType: '1099-B', description: '', status: 'idle', output: null } }),
      );
      pane.dispatchEvent(dropEvent);
    });

    await expect(page.locator('.react-flow__node')).toHaveCount(2);

    // Undo should now be enabled
    const undoBtn = page.locator('[data-testid="undo-btn"]');
    await expect(undoBtn).toBeEnabled();

    // Click undo
    await undoBtn.click();

    // Should be back to 1 node
    await expect(page.locator('.react-flow__node')).toHaveCount(1);
  });

  test('after undo, redo restores the node', async ({ page }) => {
    // Add a node
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
        JSON.stringify({ type: 'dataSource', data: { sourceType: '1099-B', description: '', status: 'idle', output: null } }),
      );
      pane.dispatchEvent(dropEvent);
    });

    await expect(page.locator('.react-flow__node')).toHaveCount(2);

    // Undo
    await page.locator('[data-testid="undo-btn"]').click();
    await expect(page.locator('.react-flow__node')).toHaveCount(1);

    // Redo should be enabled
    const redoBtn = page.locator('[data-testid="redo-btn"]');
    await expect(redoBtn).toBeEnabled();

    // Click redo
    await redoBtn.click();
    await expect(page.locator('.react-flow__node')).toHaveCount(2);
  });

  test('workflow state persists across page reloads', async ({ page }) => {
    // Add a node
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
        JSON.stringify({ type: 'dataSource', data: { sourceType: '1099-DIV', description: 'Q4 dividends', status: 'idle', output: null } }),
      );
      pane.dispatchEvent(dropEvent);
    });

    await expect(page.locator('.react-flow__node')).toHaveCount(2);

    // Verify localStorage was written
    const stored = await page.evaluate(() => localStorage.getItem('gs-tax-workflow'));
    expect(stored).not.toBeNull();
    expect(stored).toContain('1099-DIV');

    // Reload page
    await page.reload();
    await page.waitForSelector('.react-flow');

    // Should still have 2 nodes (persisted)
    await expect(page.locator('.react-flow__node')).toHaveCount(2);

    // The DataSource node should have persisted data
    const dsNode = page.locator('.react-flow__node-dataSource');
    await expect(dsNode).toBeVisible();
    await expect(dsNode.locator('select')).toHaveValue('1099-DIV');
  });

  test('localStorage contains workflow data with correct key', async ({ page }) => {
    const stored = await page.evaluate(() => localStorage.getItem('gs-tax-workflow'));
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.state).toHaveProperty('nodes');
    expect(parsed.state).toHaveProperty('edges');
    expect(parsed.state.nodes.length).toBeGreaterThan(0);
  });
});
