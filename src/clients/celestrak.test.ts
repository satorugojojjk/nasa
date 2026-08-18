import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { fetchIssOrbit, type HttpGet } from "./celestrak.js";

const validOrbit = {
  OBJECT_NAME: "ISS (ZARYA)",
  EPOCH: "2026-08-17T19:01:13.496448",
  MEAN_MOTION: 15.49477092,
  ECCENTRICITY: 0.00075348,
  INCLINATION: 51.6334,
  RA_OF_ASC_NODE: 355.1923,
  ARG_OF_PERICENTER: 57.5442,
  MEAN_ANOMALY: 302.6274,
  NORAD_CAT_ID: 25544,
  BSTAR: 0.00011255153,
};

describe("fetchIssOrbit", () => {
  it("normalizes a valid CelesTrak response", async () => {
    const httpGet: HttpGet = async () => ({
      ok: true,
      status: 200,
      json: async () => [validOrbit],
    });

    const orbit = await fetchIssOrbit(httpGet);

    assert.equal(orbit.catalogId, 25544);
    assert.equal(orbit.name, "ISS (ZARYA)");
    assert.equal(orbit.inclination, 51.6334);
  });

  it("rejects a failed upstream request", async () => {
    const httpGet: HttpGet = async () => ({
      ok: false,
      status: 503,
      json: async () => null,
    });

    await assert.rejects(
      fetchIssOrbit(httpGet),
      /CelesTrak request failed with status 503/,
    );
  });

  it("rejects malformed upstream data", async () => {
    const httpGet: HttpGet = async () => ({
      ok: true,
      status: 200,
      json: async () => [{ OBJECT_NAME: "ISS (ZARYA)" }],
    });

    await assert.rejects(
      fetchIssOrbit(httpGet),
      /unexpected ISS orbit response/,
    );
  });
});
