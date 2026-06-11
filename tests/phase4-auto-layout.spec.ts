import { test, expect } from '@playwright/test';

test.describe('Phase 4: Auto-Layout with ELK', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('layout buttons are visible', async ({ page }) => {
    await expect(page.locator('[data-testid="layout-horizontal"]')).toBeVisible();
    await expect(page.locator('[data-testid="layout-vertical"]')).toBeVisible();
  });

  test('horizontal layout button repositions nodes', async ({ page }) => {
    // Add a second node
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

    await expect(page.locator('.react-flow__node')).toHaveCount(2);

    // Get initial positions
    const nodes = page.locator('.react-flow__node');
    const box1Before = await nodes.nth(0).boundingBox();
    const box2Before = await nodes.nth(1).boundingBox();

    // Click horizontal layout
    await page.locator('[data-testid="layout-horizontal"]').click();

    // Wait for layout to complete
    await page.waitForTimeout(500);

    // After layout, nodes should be repositioned
    const box1After = await nodes.nth(0).boundingBox();
    const box2After = await nodes.nth(1).boundingBox();

    // At least one node should have moved
    const moved =
      (box1Before && box1After && (box1Before.x !== box1After.x || box1Before.y !== box1After.y)) ||
      (box2Before && box2After && (box2Before.x !== box2After.x || box2Before.y !== box2After.y));
    expect(moved).toBe(true);
  });

  test('vertical layout keeps nodes visible', async ({ page }) => {
    // Add a second node
    await page.evaluate(() => {
      const pane = document.querySelector('.react-flow__pane');
      if (!pane) return;
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true, cancelable: true,
        dataTransfer: new DataTransfer(), clientX: 400, clientY: 200,
      });
      pane.dispatchEvent(dragOverEvent);
      const dropEvent = new DragEvent('drop', {
        bubbles: true, cancelable: true,
        dataTransfer: new DataTransfer(), clientX: 400, clientY: 200,
      });
      dropEvent.dataTransfer!.setData(
        'application/reactflow',
        JSON.stringify({ type: 'llmPrompt', data: { model: 'gpt-4', systemPrompt: 'Test', status: 'idle', output: null } }),
      );
      pane.dispatchEvent(dropEvent);
    });

    await expect(page.locator('.react-flow__node')).toHaveCount(2);

    // Click vertical layout
    await page.locator('[data-testid="layout-vertical"]').click();

    // Wait for layout to complete
    await page.waitForTimeout(500);

    // Canvas should still be functional (nodes visible)
    await expect(page.locator('.react-flow__node').first()).toBeVisible();
  });

  test('layout works with multiple disconnected nodes', async ({ page }) => {
    // Add a second node
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

    await expect(page.locator('.react-flow__node')).toHaveCount(2);

    // Click layout - nodes are not connected but layout should still work
    await page.locator('[data-testid="layout-horizontal"]').click();
    await page.waitForTimeout(500);

    // Nodes should still be visible
    await expect(page.locator('.react-flow__node')).toHaveCount(2);
  });
});
