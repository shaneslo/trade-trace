import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => c.json({ name: "GS Tax Ops Workflow" }));

interface RunRequest {
  nodeId: string;
  nodeType: string;
  data: Record<string, unknown>;
  inputs: Record<string, unknown>[];
}

interface RunResponse {
  nodeId: string;
  status: "success" | "error";
  output: unknown;
  error?: string;
}

app.post("/api/run", async (c) => {
  const body = await c.req.json<RunRequest>();

  if (!body.nodeId || !body.nodeType) {
    return c.json<RunResponse>(
      { nodeId: body.nodeId ?? "", status: "error", output: null, error: "Missing nodeId or nodeType" },
      400,
    );
  }

  // Simulate node execution based on type
  switch (body.nodeType) {
    case "llmPrompt": {
      const model = (body.data.model as string) ?? "gpt-4";
      const systemPrompt = (body.data.systemPrompt as string) ?? "";
      const inputText = body.inputs.map((i) => i.text ?? "").join("\n");

      // Mock LLM response (in production, call OpenAI/Anthropic via CF AI Gateway)
      const output = {
        text: `[${model}] Processed: "${inputText || "no input"}" with system prompt: "${systemPrompt.slice(0, 50)}..."`,
        model,
        tokens: Math.floor(Math.random() * 500) + 50,
      };

      return c.json<RunResponse>({ nodeId: body.nodeId, status: "success", output });
    }

    case "dataSource": {
      const sourceType = (body.data.sourceType as string) ?? "1099-B";
      // Mock data source fetch
      const output = {
        records: Math.floor(Math.random() * 1000) + 100,
        sourceType,
        lastUpdated: new Date().toISOString(),
        sample: [
          { id: "TXN-001", amount: 15234.50, date: "2025-12-15" },
          { id: "TXN-002", amount: -8921.25, date: "2025-12-18" },
        ],
      };

      return c.json<RunResponse>({ nodeId: body.nodeId, status: "success", output });
    }

    default:
      return c.json<RunResponse>(
        { nodeId: body.nodeId, status: "error", output: null, error: `Unknown node type: ${body.nodeType}` },
        400,
      );
  }
});

export default app;
