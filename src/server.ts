import { createServer } from "node:http";

import { createApp } from "./app.js";
import { fetchIssOrbit } from "./clients/celestrak.js";
import { InMemoryOrbitStore } from "./stores/orbit-store.js";

const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const orbitStore = new InMemoryOrbitStore();

try {
  const issOrbit = await fetchIssOrbit();
  orbitStore.save(issOrbit);
  console.log(`Loaded orbit data for ${issOrbit.name}`);
} catch (error) {
  console.error("Could not load ISS orbit data during startup", error);
}

const handleRequest = createApp(orbitStore);

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  const result = handleRequest(request.method, url.pathname);

  response.writeHead(result.statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(result.body));
});

server.listen(port, () => {
  console.log(`OrbitPulse API is listening on http://localhost:${port}`);
});
