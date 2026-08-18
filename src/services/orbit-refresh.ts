import { setInterval as nodeSetInterval } from "node:timers";

import {
  fetchIssOrbit,
  type SatelliteOrbit,
} from "../clients/celestrak.js";
import type { OrbitStore } from "../stores/orbit-store.js";

export const MINIMUM_REFRESH_INTERVAL_MS = 2 * 60 * 60 * 1_000;

export type FetchOrbit = () => Promise<SatelliteOrbit>;

export async function refreshIssOrbit(
  orbitStore: OrbitStore,
  fetchOrbit: FetchOrbit = fetchIssOrbit,
): Promise<SatelliteOrbit> {
  const orbit = await fetchOrbit();
  orbitStore.save(orbit);
  return orbit;
}

type Timer = {
  unref(): void;
};

export type ScheduleInterval = (
  callback: () => void,
  intervalMs: number,
) => Timer;

type RefreshScheduleOptions = {
  refresh: () => Promise<unknown>;
  intervalMs: number;
  onError?: (error: unknown) => void;
  scheduleInterval?: ScheduleInterval;
};

export function startOrbitRefreshSchedule({
  refresh,
  intervalMs,
  onError = (error) => console.error("Scheduled orbit refresh failed", error),
  scheduleInterval = nodeSetInterval,
}: RefreshScheduleOptions): Timer {
  if (
    !Number.isInteger(intervalMs) ||
    intervalMs < MINIMUM_REFRESH_INTERVAL_MS
  ) {
    throw new Error("Orbit refresh interval must be at least two hours");
  }

  const timer = scheduleInterval(() => {
    void refresh().catch(onError);
  }, intervalMs);

  timer.unref();
  return timer;
}
