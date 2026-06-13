import { test, expect } from '@playwright/test';

test.describe('Worker /api/run endpoint', () => {
  test('returns a successful response for an llmPrompt node', async ({ request }) => {
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

  test('returns a successful response for a dataSource node', async ({ request }) => {
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

  test('returns an error for an unknown node type', async ({ request }) => {
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

  test('returns an error when nodeId is missing', async ({ request }) => {
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
    expect(body.error).toBe('Missing nodeId or nodeType');
    expect(body.nodeId).toBe('');
  });

  test('returns an error when nodeType is missing', async ({ request }) => {
    const res = await request.post('/api/run', {
      data: {
        nodeId: 'test-node-1',
        data: {},
        inputs: [],
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.status).toBe('error');
    expect(body.error).toBe('Missing nodeId or nodeType');
    expect(body.nodeId).toBe('test-node-1');
  });

  test('returns an error when both nodeId and nodeType are missing', async ({ request }) => {
    const res = await request.post('/api/run', {
      data: {
        data: {},
        inputs: [],
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.status).toBe('error');
    expect(body.error).toBe('Missing nodeId or nodeType');
    expect(body.nodeId).toBe('');
  });
});
