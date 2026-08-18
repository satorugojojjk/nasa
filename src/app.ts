import type { OrbitStore } from "./stores/orbit-store.js";

export type AppResponse = {
  statusCode: number;
  body: Record<string, unknown>;
};

export type HandleRequest = (
  method: string | undefined,
  path: string,
) => AppResponse;

export function createApp(orbitStore: OrbitStore): HandleRequest {
  return (method, path) => {
    if (method === "GET" && path === "/health") {
      return {
        statusCode: 200,
        body: {
          status: "ok",
          satellitesLoaded: orbitStore.count(),
        },
      };
    }

    if (method === "GET" && path === "/satellites/25544") {
      const orbit = orbitStore.findByCatalogId(25544);

      if (orbit === undefined) {
        return {
          statusCode: 503,
          body: { error: "ISS orbit data is not available" },
        };
      }

      return {
        statusCode: 200,
        body: { satellite: orbit },
      };
    }

    return {
      statusCode: 404,
      body: { error: "Not found" },
    };
  };
}
