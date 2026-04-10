import { BASE_URL } from "../config/api";
import type { Resident } from "../types/Resident";
import type { ResidentList } from "../types/ResidentList";

export interface ResidentInput {
  firstName?: string;
  lastInitial?: string;
  caseControlNo: string;
  internalCode: string;
  safehouseId: number;
  caseStatus: string;
  sex: string;
  dateOfBirth: string;
  birthStatus: string;
  placeOfBirth: string;
}

function buildResidentJsonBody(resident: ResidentInput): Record<string, unknown> {
  const dob = resident.dateOfBirth?.trim();
  return {
    firstName: resident.firstName?.trim() || null,
    lastInitial: resident.lastInitial?.trim() || null,
    caseControlNo: resident.caseControlNo?.trim() || null,
    internalCode: resident.internalCode?.trim() || null,
    safehouseId: resident.safehouseId,
    caseStatus: resident.caseStatus?.trim() || null,
    sex: resident.sex?.trim() || null,
    dateOfBirth: dob ? dob : null,
    birthStatus: resident.birthStatus?.trim() || null,
    placeOfBirth: resident.placeOfBirth?.trim() || null,
  };
}

export const getResidentList = async (): Promise<ResidentList[]> => {
  const response = await fetch(`${BASE_URL}/ResidentList`);
  return await response.json();
};


export async function getManagingResidents(): Promise<Resident[]> {
  const response = await fetch (`${BASE_URL}/admin/residents`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

export async function createResident(resident: ResidentInput): Promise<Resident> {
  const response = await fetch(`${BASE_URL}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(buildResidentJsonBody(resident)),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}