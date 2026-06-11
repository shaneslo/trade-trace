import { test, expect } from '@playwright/test';

test.describe('Workflow Editor Template', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow');
  });

  test('renders the React Flow canvas with a background', async ({ page }) => {
    await expect(page.locator('.react-flow')).toBeVisible();
    await expect(page.locator('.react-flow__background')).toBeVisible();
  });

  test('sidebar shows the Workflow Editor heading', async ({ page }) => {
    await expect(page.getByText('Workflow Editor')).toBeVisible();
  });

  test('sidebar lists all configured node types', async ({ page }) => {
    const sidebar = page.locator('[data-slot="sidebar"]');
    for (const title of [
      'Initial Node',
      'Transform Node',
      'Join Node',
      'Branch Node',
      'Output Node',
    ]) {
      await expect(sidebar.getByText(title, { exact: true })).toBeVisible();
    }
  });

  test('renders the initial workflow nodes from mock data', async ({ page }) => {
    await page.waitForSelector('.react-flow__node');
    // mock-data seeds 5 nodes (initial, branch, transform, output, output)
    await expect(page.locator('.react-flow__node')).toHaveCount(5);
    await expect(
      page.locator('.react-flow__node').getByText('Initial Node'),
    ).toBeVisible();
  });

  test('renders edges between the seeded nodes', async ({ page }) => {
    await page.waitForSelector('.react-flow__edge');
    expect(await page.locator('.react-flow__edge').count()).toBeGreaterThan(0);
  });

  test('shows the Run Workflow button and toggles to Stop', async ({ page }) => {
    const runButton = page.getByRole('button', { name: /Run Workflow/i });
    await expect(runButton).toBeVisible();
    await runButton.click();
    await expect(
      page.getByRole('button', { name: /Stop Workflow/i }),
    ).toBeVisible();
  });

  test('exposes the zoom slider control', async ({ page }) => {
    await expect(page.getByRole('slider')).toBeVisible();
  });

  test('adding a node from the sidebar increases the node count', async ({
    page,
  }) => {
    await page.waitForSelector('.react-flow__node');
    const before = await page.locator('.react-flow__node').count();
    // Clicking a sidebar item drops the node at the viewport center.
    await page
      .locator('[data-slot="sidebar"]')
      .getByText('Transform Node', { exact: true })
      .click();
    await expect(page.locator('.react-flow__node')).toHaveCount(before + 1);
  });
});
