import { fetchIssOrbit } from "../clients/celestrak.js";

const orbit = await fetchIssOrbit();

console.log(orbit);
