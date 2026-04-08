import { BASE_URL } from "../config/api";
import type { DonorDashboard } from "../types/DonorDashboard";

export const getDonorDashboard = async (id: number): Promise<DonorDashboard> => {
  const response = await fetch(`${BASE_URL}/DonorDashboard/${id}`, { credentials: "include" });
  return await response.json();
};
