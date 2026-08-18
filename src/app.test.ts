import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { SatelliteOrbit } from "./clients/celestrak.js";
import { createApp } from "./app.js";
import { InMemoryOrbitStore } from "./stores/orbit-store.js";

const issOrbit: SatelliteOrbit = {
  catalogId: 25544,
  name: "ISS (ZARYA)",
  epoch: "2026-08-17T19:01:13.496448",
  meanMotion: 15.49477092,
  eccentricity: 0.00075348,
  inclination: 51.6334,
  rightAscensionOfAscendingNode: 355.1923,
  argumentOfPericenter: 57.5442,
  meanAnomaly: 302.6274,
  bstar: 0.00011255153,
};

describe("createApp", () => {
  it("returns a healthy response for GET /health", () => {
    const handleRequest = createApp(new InMemoryOrbitStore());
    const result = handleRequest("GET", "/health");

    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body, { status: "ok", satellitesLoaded: 0 });
  });

  it("returns the cached ISS orbit", () => {
    const store = new InMemoryOrbitStore();
    store.save(issOrbit);
    const handleRequest = createApp(store);

    const result = handleRequest("GET", "/satellites/25544");

    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body, { satellite: issOrbit });
  });

  it("returns service unavailable when the ISS orbit is missing", () => {
    const handleRequest = createApp(new InMemoryOrbitStore());

    const result = handleRequest("GET", "/satellites/25544");

    assert.equal(result.statusCode, 503);
    assert.deepEqual(result.body, {
      error: "ISS orbit data is not available",
    });
  });

  it("returns not found for an unknown path", () => {
    const handleRequest = createApp(new InMemoryOrbitStore());
    const result = handleRequest("GET", "/satellites");

    assert.equal(result.statusCode, 404);
    assert.deepEqual(result.body, { error: "Not found" });
  });

  it("does not treat POST /health as GET /health", () => {
    const handleRequest = createApp(new InMemoryOrbitStore());
    const result = handleRequest("POST", "/health");

    assert.equal(result.statusCode, 404);
  });
});
