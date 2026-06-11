import { test, expect } from '@playwright/test';

test.describe('Phase 1: Basic Canvas + Zustand + LLMPromptNode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('renders the React Flow canvas', async ({ page }) => {
    const canvas = page.locator('.react-flow');
    await expect(canvas).toBeVisible();
  });

  test('renders Background, Controls, and MiniMap', async ({ page }) => {
    await expect(page.locator('.react-flow__background')).toBeVisible();
    await expect(page.locator('.react-flow__controls')).toBeVisible();
    await expect(page.locator('.react-flow__minimap')).toBeVisible();
  });

  test('renders the initial LLMPromptNode', async ({ page }) => {
    const node = page.locator('.react-flow__node-llmPrompt');
    await expect(node).toBeVisible();
    await expect(node.locator('h3')).toHaveText('LLM Prompt');
  });

  test('LLMPromptNode model selector works', async ({ page }) => {
    const node = page.locator('.react-flow__node-llmPrompt');
    const select = node.locator('select');
    await expect(select).toHaveValue('gpt-4');

    await select.selectOption('claude-3');
    await expect(select).toHaveValue('claude-3');
  });

  test('LLMPromptNode textarea is editable', async ({ page }) => {
    const node = page.locator('.react-flow__node-llmPrompt');
    const textarea = node.locator('textarea');

    await textarea.fill('Generate 1099 summary for client.');
    await expect(textarea).toHaveValue('Generate 1099 summary for client.');
  });

  test('node is draggable', async ({ page }) => {
    const node = page.locator('.react-flow__node-llmPrompt');
    const box = await node.boundingBox();
    if (!box) throw new Error('Node not found');

    await page.mouse.move(box.x + box.width / 2, box.y + 5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 100, box.y + 5, {
      steps: 5,
    });
    await page.mouse.up();

    const newBox = await node.boundingBox();
    if (!newBox) throw new Error('Node not found after drag');
    expect(newBox.x).toBeGreaterThan(box.x);
  });

  test('canvas Controls are rendered with zoom and fit buttons', async ({ page }) => {
    const controls = page.locator('.react-flow__controls');
    await expect(controls).toBeVisible();

    // Verify zoom buttons exist (they may be disabled depending on zoom level)
    await expect(page.locator('.react-flow__controls-zoomin')).toBeAttached();
    await expect(page.locator('.react-flow__controls-zoomout')).toBeAttached();
    await expect(page.locator('.react-flow__controls-fitview')).toBeAttached();
  });

  test('node has input and output handles', async ({ page }) => {
    const node = page.locator('.react-flow__node-llmPrompt');
    const targetHandle = node.locator('.react-flow__handle-left');
    const sourceHandle = node.locator('.react-flow__handle-right');

    await expect(targetHandle).toBeVisible();
    await expect(sourceHandle).toBeVisible();
  });
});
