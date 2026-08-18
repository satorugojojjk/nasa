import { createServer } from "node:http";

import { createApp } from "./app.js";
import {
  MINIMUM_REFRESH_INTERVAL_MS,
  refreshIssOrbit,
  startOrbitRefreshSchedule,
} from "./services/orbit-refresh.js";
import { InMemoryOrbitStore } from "./stores/orbit-store.js";

const port = Number(process.env.PORT ?? 3000);
const orbitRefreshIntervalMs = Number(
  process.env.ORBIT_REFRESH_INTERVAL_MS ?? MINIMUM_REFRESH_INTERVAL_MS,
);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const orbitStore = new InMemoryOrbitStore();

try {
  const issOrbit = await refreshIssOrbit(orbitStore);
  console.log(`Loaded orbit data for ${issOrbit.name}`);
} catch (error) {
  console.error("Could not load ISS orbit data during startup", error);
}

startOrbitRefreshSchedule({
  refresh: async () => {
    const issOrbit = await refreshIssOrbit(orbitStore);
    console.log(`Refreshed orbit data for ${issOrbit.name}`);
  },
  intervalMs: orbitRefreshIntervalMs,
});

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
