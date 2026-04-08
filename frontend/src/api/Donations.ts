import { BASE_URL } from "../config/api";

export function formatDonationAmount(amount: number | null, currencyCode: string | null): string {
    if (amount === null) return "—";
    const parts = [currencyCode, amount.toLocaleString()].filter(Boolean);
    return parts.join(" ");
}

export interface DonationAllocationRow {
    programArea: string | null;
    amountAllocated: number | null;
    allocationDate: string | null;
}

export interface DonationListItem {
    donationId: number;
    supporterId: number;
    supporterDisplayName: string | null;
    donationType: string | null;
    donationDate: string;
    amount: number | null;
    currencyCode: string | null;
    campaignName: string | null;
    isRecurring: boolean | null;
    allocations?: DonationAllocationRow[];
}

export interface DonationDetail {
    donationId: number;
    supporterId: number;
    supporterDisplayName: string | null;
    donationType: string | null;
    donationDate: string;
    isRecurring: boolean | null;
    campaignName: string | null;
    channelSource: string | null;
    currencyCode: string | null;
    amount: number | null;
    estimatedValue: number | null;
    impactUnit: string | null;
    notes: string | null;
    referralPostId: number | null;
    allocationCount: number;
    inKindItemCount: number;
    allocations?: DonationAllocationRow[];
}

function readNullableNumber(v: unknown): number | null {
    if (v === null || v === undefined) return null;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    return null;
}

function readNullableString(v: unknown): string | null {
    if (v === null || v === undefined) return null;
    if (typeof v === "string") return v;
    return null;
}

function readNullableBool(v: unknown): boolean | null {
    if (v === null || v === undefined) return null;
    if (typeof v === "boolean") return v;
    return null;
}

function readInt(v: unknown): number | null {
    if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
    return null;
}

function parseAllocationRow(o: Record<string, unknown>): DonationAllocationRow | null {
    let allocationDate: string | null = null;
    if (typeof o.allocationDate === "string") allocationDate = o.allocationDate;
    else if (o.allocationDate === null) allocationDate = null;
    else return null;

    return {
        programArea: readNullableString(o.programArea),
        amountAllocated: readNullableNumber(o.amountAllocated),
        allocationDate,
    };
}

function parseAllocations(raw: unknown): DonationAllocationRow[] | undefined {
    if (!Array.isArray(raw)) return undefined;
    const out: DonationAllocationRow[] = [];
    for (const item of raw) {
        if (typeof item === "object" && item !== null) {
            const row = parseAllocationRow(item as Record<string, unknown>);
            if (row) out.push(row);
        }
    }
    return out.length > 0 ? out : undefined;
}

function parseDonationListItem(o: Record<string, unknown>): DonationListItem | null {
    const donationId = readInt(o.donationId);
    const supporterId = readInt(o.supporterId);
    if (donationId === null || supporterId === null) return null;
    if (typeof o.donationDate !== "string") return null;

    const allocations = parseAllocations(o.allocations);

    return {
        donationId,
        supporterId,
        supporterDisplayName: readNullableString(o.supporterDisplayName),
        donationType: readNullableString(o.donationType),
        donationDate: o.donationDate,
        amount: readNullableNumber(o.amount),
        currencyCode: readNullableString(o.currencyCode),
        campaignName: readNullableString(o.campaignName),
        isRecurring: readNullableBool(o.isRecurring),
        ...(allocations !== undefined ? { allocations } : {}),
    };
}

export type GetDonationsOptions = {
    includeAllocations?: boolean;
};

export async function getDonations(
    supporterId?: number,
    options?: GetDonationsOptions,
): Promise<DonationListItem[]> {
    try {
        const params = new URLSearchParams();
        if (typeof supporterId === "number" && Number.isFinite(supporterId)) {
            params.set("supporterId", String(supporterId));
        }
        if (options?.includeAllocations === true) {
            params.set("includeAllocations", "true");
        }
        const qs = params.toString();
        const response = await fetch(`${BASE_URL}/Donations${qs ? `?${qs}` : ""}`, {
            credentials: "include",
        });
        if (!response.ok) return [];
        const data: unknown = await response.json();
        if (!Array.isArray(data)) return [];
        const out: DonationListItem[] = [];
        for (const item of data) {
            if (typeof item === "object" && item !== null) {
                const parsed = parseDonationListItem(item as Record<string, unknown>);
                if (parsed) out.push(parsed);
            }
        }
        return out;
    } catch {
        return [];
    }
}

function parseDonationDetail(o: Record<string, unknown>): DonationDetail | null {
    const donationId = readInt(o.donationId);
    const supporterId = readInt(o.supporterId);
    if (donationId === null || supporterId === null) return null;
    if (typeof o.donationDate !== "string") return null;
    const allocationCount = readInt(o.allocationCount);
    const inKindItemCount = readInt(o.inKindItemCount);
    if (allocationCount === null || inKindItemCount === null) return null;

    const allocations = parseAllocations(o.allocations);

    return {
        donationId,
        supporterId,
        supporterDisplayName: readNullableString(o.supporterDisplayName),
        donationType: readNullableString(o.donationType),
        donationDate: o.donationDate,
        isRecurring: readNullableBool(o.isRecurring),
        campaignName: readNullableString(o.campaignName),
        channelSource: readNullableString(o.channelSource),
        currencyCode: readNullableString(o.currencyCode),
        amount: readNullableNumber(o.amount),
        estimatedValue: readNullableNumber(o.estimatedValue),
        impactUnit: readNullableString(o.impactUnit),
        notes: readNullableString(o.notes),
        referralPostId: readInt(o.referralPostId),
        allocationCount,
        inKindItemCount,
        ...(allocations !== undefined ? { allocations } : {}),
    };
}

export async function getDonation(id: number): Promise<DonationDetail | null> {
    try {
        const response = await fetch(`${BASE_URL}/Donations/${id}`, {
            credentials: "include",
        });
        if (response.status === 404) return null;
        if (!response.ok) return null;
        const data: unknown = await response.json();
        if (typeof data !== "object" || data === null) return null;
        return parseDonationDetail(data as Record<string, unknown>);
    } catch {
        return null;
    }
}
