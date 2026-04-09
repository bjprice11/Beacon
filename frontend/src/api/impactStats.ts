import { BASE_URL } from "../config/api";

export type ImpactPublicStats = {
  totalResidentsServed: number;
  residentialShelters: number;
  currentResidents: number;
  yearsOfOperation: number;
};

/** Public aggregates for the Impact page (`Beacon/Impact/PublicStats`). */
export async function fetchImpactPublicStats(): Promise<ImpactPublicStats | null> {
  try {
    const url = new URL("Impact/PublicStats", `${BASE_URL}/`);
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    return (await res.json()) as ImpactPublicStats;
  } catch {
    return null;
  }
}
