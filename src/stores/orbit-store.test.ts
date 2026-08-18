import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { SatelliteOrbit } from "../clients/celestrak.js";
import { InMemoryOrbitStore } from "./orbit-store.js";

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

describe("InMemoryOrbitStore", () => {
  it("starts empty", () => {
    const store = new InMemoryOrbitStore();

    assert.equal(store.count(), 0);
    assert.equal(store.findByCatalogId(25544), undefined);
  });

  it("saves and finds an orbit by catalog ID", () => {
    const store = new InMemoryOrbitStore();

    store.save(issOrbit);

    assert.equal(store.count(), 1);
    assert.deepEqual(store.findByCatalogId(25544), issOrbit);
  });
});
