import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";

export type ToolDef = {
  name: string;
  description: string;
  inputSchema?: Record<string, z.ZodType>;
  handler: (args: any) => Promise<any>;
};

export function registerToolSet(server: McpServer, tools: ToolDef[]) {
  for (const t of tools) {
    server.registerTool(
      t.name,
      { description: t.description, inputSchema: t.inputSchema ?? {} },
      async (args) => {
        try {
          const data = await t.handler(args);
          return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        } catch (err: any) {
          console.error("[MCP TOOL ERROR]", err);
          return {
            content: [{ type: "text", text: `Error: ${err.response?.data?.message || err.message || String(err)}` }],
            isError: true,
          };
        }
      }
    );
  }
}
