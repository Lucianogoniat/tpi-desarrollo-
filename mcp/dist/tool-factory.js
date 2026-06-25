export function registerToolSet(server, tools) {
    for (const t of tools) {
        server.registerTool(t.name, { description: t.description, inputSchema: t.inputSchema ?? {} }, async (args) => {
            try {
                const data = await t.handler(args);
                return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
            }
            catch (err) {
                console.error("[MCP TOOL ERROR]", err);
                return {
                    content: [{ type: "text", text: `Error: ${err.response?.data?.message || err.message || String(err)}` }],
                    isError: true,
                };
            }
        });
    }
}
