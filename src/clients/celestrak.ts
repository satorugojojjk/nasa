const ISS_ORBIT_URL =
  "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=JSON";

export type SatelliteOrbit = {
  readonly catalogId: number;
  readonly name: string;
  readonly epoch: string;
  readonly meanMotion: number;
  readonly eccentricity: number;
  readonly inclination: number;
  readonly rightAscensionOfAscendingNode: number;
  readonly argumentOfPericenter: number;
  readonly meanAnomaly: number;
  readonly bstar: number;
};

type HttpResponse = {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
};

export type HttpGet = (url: string) => Promise<HttpResponse>;

const defaultHttpGet: HttpGet = (url) => fetch(url);

export async function fetchIssOrbit(
  httpGet: HttpGet = defaultHttpGet,
): Promise<SatelliteOrbit> {
  const response = await httpGet(ISS_ORBIT_URL);

  if (!response.ok) {
    throw new Error(`CelesTrak request failed with status ${response.status}`);
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data) || data.length !== 1 || !isOrbitRecord(data[0])) {
    throw new Error("CelesTrak returned an unexpected ISS orbit response");
  }

  const orbit = data[0];

  return {
    catalogId: orbit.NORAD_CAT_ID,
    name: orbit.OBJECT_NAME,
    epoch: orbit.EPOCH,
    meanMotion: orbit.MEAN_MOTION,
    eccentricity: orbit.ECCENTRICITY,
    inclination: orbit.INCLINATION,
    rightAscensionOfAscendingNode: orbit.RA_OF_ASC_NODE,
    argumentOfPericenter: orbit.ARG_OF_PERICENTER,
    meanAnomaly: orbit.MEAN_ANOMALY,
    bstar: orbit.BSTAR,
  };
}

type OrbitRecord = {
  NORAD_CAT_ID: number;
  OBJECT_NAME: string;
  EPOCH: string;
  MEAN_MOTION: number;
  ECCENTRICITY: number;
  INCLINATION: number;
  RA_OF_ASC_NODE: number;
  ARG_OF_PERICENTER: number;
  MEAN_ANOMALY: number;
  BSTAR: number;
};

function isOrbitRecord(value: unknown): value is OrbitRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.NORAD_CAT_ID === "number" &&
    typeof record.OBJECT_NAME === "string" &&
    typeof record.EPOCH === "string" &&
    typeof record.MEAN_MOTION === "number" &&
    typeof record.ECCENTRICITY === "number" &&
    typeof record.INCLINATION === "number" &&
    typeof record.RA_OF_ASC_NODE === "number" &&
    typeof record.ARG_OF_PERICENTER === "number" &&
    typeof record.MEAN_ANOMALY === "number" &&
    typeof record.BSTAR === "number"
  );
}
