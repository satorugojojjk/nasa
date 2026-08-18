import type { SatelliteOrbit } from "../clients/celestrak.js";

export interface OrbitStore {
  save(orbit: SatelliteOrbit): void;
  findByCatalogId(catalogId: number): SatelliteOrbit | undefined;
  count(): number;
}

export class InMemoryOrbitStore implements OrbitStore {
  private readonly orbits = new Map<number, SatelliteOrbit>();

  save(orbit: SatelliteOrbit): void {
    this.orbits.set(orbit.catalogId, orbit);
  }

  findByCatalogId(catalogId: number): SatelliteOrbit | undefined {
    return this.orbits.get(catalogId);
  }

  count(): number {
    return this.orbits.size;
  }
}
