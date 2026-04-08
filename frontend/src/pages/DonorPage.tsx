import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Supporter } from "../types/Supporter";
import { getDonor } from "../api/Search";
import {
    formatDonationAmount,
    getDonations,
    type DonationAllocationRow,
    type DonationListItem,
} from "../api/Donations";
import { useAuth } from "../context/AuthContext.tsx";

const CANONICAL_PROGRAM_AREAS = [
    "Operations",
    "Education",
    "Wellbeing",
    "Transport",
    "Outreach",
    "Maintenance",
] as const;

function compareProgramAreaNames(a: string, b: string): number {
    const ia = CANONICAL_PROGRAM_AREAS.findIndex(
        (x) => x.toLowerCase() === a.toLowerCase(),
    );
    const ib = CANONICAL_PROGRAM_AREAS.findIndex(
        (x) => x.toLowerCase() === b.toLowerCase(),
    );
    const ua = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
    const ub = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
    if (ua !== ub) return ua - ub;
    return a.localeCompare(b);
}

function summarizeAllocationsByProgram(rows: DonationAllocationRow[]): { area: string; total: number }[] {
    const totals = new Map<string, number>();
    for (const r of rows) {
        const key = r.programArea?.trim() || "Uncategorized";
        totals.set(key, (totals.get(key) ?? 0) + (r.amountAllocated ?? 0));
    }
    return [...totals.entries()]
        .map(([area, total]) => ({ area, total }))
        .sort((x, y) => compareProgramAreaNames(x.area, y.area));
}

function DonorPage() {
    const { id } = useParams();
    const numericId = id !== undefined && id !== "" ? Number(id) : NaN;
    const { authSession, isAuthenticated, isLoading } = useAuth();
    const isAdmin = authSession?.roles.includes("Admin") ?? false;
    const mySupporterId = authSession?.supporterId ?? null;

    const [donor, setDonor] = useState<Supporter | null>(null);
    const [donorLoadFailed, setDonorLoadFailed] = useState(false);
    const [donations, setDonations] = useState<DonationListItem[]>([]);

    const canViewProfile = isAdmin || (mySupporterId !== null && mySupporterId === numericId);

    useEffect(() => {
        if (!Number.isFinite(numericId)) {
            setDonor(null);
            setDonorLoadFailed(true);
            return;
        }
        if (isLoading) return;
        if (!isAuthenticated) {
            setDonor(null);
            setDonorLoadFailed(false);
            return;
        }
        if (!isAdmin && mySupporterId !== numericId) {
            setDonor(null);
            setDonorLoadFailed(false);
            return;
        }

        let cancelled = false;
        void (async () => {
            const d = await getDonor(numericId);
            if (!cancelled) {
                setDonor(d);
                setDonorLoadFailed(d === null);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [numericId, isLoading, isAuthenticated, isAdmin, mySupporterId]);

    useEffect(() => {
        if (!Number.isFinite(numericId)) {
            setDonations([]);
            return;
        }
        if (isLoading || !isAuthenticated) {
            setDonations([]);
            return;
        }
        if (!isAdmin && mySupporterId !== numericId) {
            setDonations([]);
            return;
        }

        let cancelled = false;
        void (async () => {
            const rows = await getDonations(numericId, { includeAllocations: true });
            if (!cancelled) setDonations(rows);
        })();
        return () => {
            cancelled = true;
        };
    }, [numericId, isLoading, isAuthenticated, isAdmin, mySupporterId]);

    if (isLoading) {
        return <p className="text-center py-5">Loading...</p>;
    }

    if (!Number.isFinite(numericId) || donorLoadFailed) {
        return (
            <div className="container py-4">
                <p className="text-secondary">
                    We could not load this profile. It may not exist or you may not have permission
                    to view it.
                </p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="container py-4">
                <p className="text-secondary">Please sign in to view donor profiles.</p>
            </div>
        );
    }

    if (!canViewProfile && !isLoading) {
        return (
            <div className="container py-4">
                <p className="text-secondary">You do not have access to this donor profile.</p>
            </div>
        );
    }

    if (!donor) {
        return <p className="text-center py-5">Loading...</p>;
    }

    return (
        <div className="container py-4">
            <h1>{donor.displayName ?? `${donor.firstName} ${donor.lastName}`}</h1>
            <table className="table">
                <tbody>
                    <tr>
                        <th>Type</th>
                        <td>{donor.supporterType ?? "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Organization</th>
                        <td>{donor.organizationName ?? "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Email</th>
                        <td>{donor.email ?? "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Phone</th>
                        <td>{donor.phone ?? "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Region</th>
                        <td>{donor.region ?? "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Country</th>
                        <td>{donor.country ?? "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Status</th>
                        <td>{donor.status ?? "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Relationship</th>
                        <td>{donor.relationshipType ?? "N/A"}</td>
                    </tr>
                    <tr>
                        <th>First Donation</th>
                        <td>{donor.firstDonationDate ?? "N/A"}</td>
                    </tr>
                    <tr>
                        <th>Acquisition Channel</th>
                        <td>{donor.acquisitionChannel ?? "N/A"}</td>
                    </tr>
                </tbody>
            </table>

            <h2 className="mt-4">Donations</h2>
            {donations.length === 0 ? (
                <p className="text-secondary">No donation records for this supporter.</p>
            ) : (
                <div className="d-flex flex-column gap-4">
                    {donations.map((d) => {
                        const breakdown = d.allocations?.length
                            ? summarizeAllocationsByProgram(d.allocations)
                            : [];
                        return (
                            <section key={d.donationId} className="border rounded p-3 bg-light bg-opacity-25">
                                <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
                                    <strong>{d.donationDate}</strong>
                                    <span>{formatDonationAmount(d.amount, d.currencyCode)}</span>
                                </div>
                                <p className="small text-muted mb-2">
                                    {d.donationType ?? "—"}
                                    {d.campaignName ? ` · ${d.campaignName}` : ""}
                                    {d.isRecurring === true
                                        ? " · Recurring"
                                        : d.isRecurring === false
                                          ? ""
                                          : ""}
                                </p>
                                <h3 className="h6 mb-2">Program area allocation</h3>
                                {breakdown.length === 0 ? (
                                    <p className="small text-secondary mb-0">
                                        No allocation rows recorded for this donation.
                                    </p>
                                ) : (
                                    <div className="table-responsive mb-0">
                                        <table className="table table-sm table-bordered mb-0 align-middle">
                                            <thead>
                                                <tr>
                                                    <th>Program area</th>
                                                    <th className="text-end">Allocated</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {breakdown.map((row) => (
                                                    <tr key={row.area}>
                                                        <td>{row.area}</td>
                                                        <td className="text-end">
                                                            {formatDonationAmount(
                                                                row.total,
                                                                d.currencyCode,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default DonorPage;
