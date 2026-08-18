import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { handleRequest } from "./app.js";

describe("handleRequest", () => {
  it("returns a healthy response for GET /health", () => {
    const result = handleRequest("GET", "/health");

    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body, { status: "ok" });
  });

  it("returns not found for an unknown path", () => {
    const result = handleRequest("GET", "/satellites");

    assert.equal(result.statusCode, 404);
    assert.deepEqual(result.body, { error: "Not found" });
  });

  it("does not treat POST /health as GET /health", () => {
    const result = handleRequest("POST", "/health");

    assert.equal(result.statusCode, 404);
  });
});
