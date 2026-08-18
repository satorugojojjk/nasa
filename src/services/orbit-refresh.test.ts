import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { SatelliteOrbit } from "../clients/celestrak.js";
import {
  MINIMUM_REFRESH_INTERVAL_MS,
  refreshIssOrbit,
  startOrbitRefreshSchedule,
  type ScheduleInterval,
} from "./orbit-refresh.js";
import { InMemoryOrbitStore } from "../stores/orbit-store.js";

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

describe("refreshIssOrbit", () => {
  it("fetches and saves the latest orbit", async () => {
    const store = new InMemoryOrbitStore();

    const result = await refreshIssOrbit(store, async () => issOrbit);

    assert.deepEqual(result, issOrbit);
    assert.deepEqual(store.findByCatalogId(25544), issOrbit);
  });

  it("does not replace cached data when fetching fails", async () => {
    const store = new InMemoryOrbitStore();
    store.save(issOrbit);

    await assert.rejects(
      refreshIssOrbit(store, async () => {
        throw new Error("upstream unavailable");
      }),
      /upstream unavailable/,
    );

    assert.deepEqual(store.findByCatalogId(25544), issOrbit);
  });
});

describe("startOrbitRefreshSchedule", () => {
  it("schedules refreshes at the configured interval", async () => {
    let scheduledCallback: (() => void) | undefined;
    let scheduledInterval: number | undefined;
    let timerWasUnreferenced = false;
    let refreshCount = 0;

    const scheduleInterval: ScheduleInterval = (callback, intervalMs) => {
      scheduledCallback = callback;
      scheduledInterval = intervalMs;
      return {
        unref: () => {
          timerWasUnreferenced = true;
        },
      };
    };

    startOrbitRefreshSchedule({
      refresh: async () => {
        refreshCount += 1;
      },
      intervalMs: MINIMUM_REFRESH_INTERVAL_MS,
      scheduleInterval,
    });

    assert.equal(scheduledInterval, MINIMUM_REFRESH_INTERVAL_MS);
    assert.equal(timerWasUnreferenced, true);

    scheduledCallback?.();
    await Promise.resolve();

    assert.equal(refreshCount, 1);
  });

  it("rejects intervals shorter than two hours", () => {
    assert.throws(
      () =>
        startOrbitRefreshSchedule({
          refresh: async () => undefined,
          intervalMs: MINIMUM_REFRESH_INTERVAL_MS - 1,
        }),
      /at least two hours/,
    );
  });
});
