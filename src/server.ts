import { createServer } from "node:http";

import { handleRequest } from "./app.js";

const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  const result = handleRequest(request.method, url.pathname);

  response.writeHead(result.statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(result.body));
});

server.listen(port, () => {
  console.log(`OrbitPulse API is listening on http://localhost:${port}`);
});
