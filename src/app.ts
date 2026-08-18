export type AppResponse = {
  statusCode: number;
  body: Record<string, string>;
};

export function handleRequest(method: string | undefined, path: string): AppResponse {
  if (method === "GET" && path === "/health") {
    return {
      statusCode: 200,
      body: { status: "ok" },
    };
  }

  return {
    statusCode: 404,
    body: { error: "Not found" },
  };
}
