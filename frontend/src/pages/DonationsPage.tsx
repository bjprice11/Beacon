import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext.tsx";
import { formatDonationAmount, getDonations, type DonationListItem } from "../api/Donations";

type ViewState = "loading" | "need_login" | "no_access" | "ready";

function DonationsPage() {
    const { authSession, isAuthenticated, isLoading } = useAuth();
    const [donations, setDonations] = useState<DonationListItem[]>([]);
    const [viewState, setViewState] = useState<ViewState>("loading");

    const isAdmin = authSession?.roles.includes("Admin") ?? false;
    const mySupporterId = authSession?.supporterId ?? null;

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            setViewState("need_login");
            setDonations([]);
            return;
        }

        let cancelled = false;

        void (async () => {
            if (isAdmin) {
                const rows = await getDonations();
                if (!cancelled) {
                    setDonations(rows);
                    setViewState("ready");
                }
                return;
            }

            if (mySupporterId !== null) {
                const rows = await getDonations(mySupporterId);
                if (!cancelled) {
                    setDonations(rows);
                    setViewState("ready");
                }
                return;
            }

            if (!cancelled) {
                setDonations([]);
                setViewState("no_access");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isLoading, isAuthenticated, isAdmin, mySupporterId]);

    return (
        <>
            <Header />
            <div className="container py-4">
                <h1 className="mb-4">Donations</h1>
                {viewState === "loading" || isLoading ? (
                    <p className="text-center py-5">Loading...</p>
                ) : viewState === "need_login" ? (
                    <p className="text-secondary">
                        Please <Link to="/login">sign in</Link> to view donations.
                    </p>
                ) : viewState === "no_access" ? (
                    <p className="text-secondary">
                        Your account is not linked to a supporter record, so donation history cannot
                        be shown. Contact an administrator if this is unexpected.
                    </p>
                ) : donations.length === 0 ? (
                    <p className="text-secondary">No donations found.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-striped table-sm align-middle">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Donor</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Campaign</th>
                                    <th>Recurring</th>
                                </tr>
                            </thead>
                            <tbody>
                                {donations.map((d) => (
                                    <tr key={d.donationId}>
                                        <td>{d.donationDate}</td>
                                        <td>
                                            <Link to={`/donor/${d.supporterId}`}>
                                                {d.supporterDisplayName?.trim() ||
                                                    `Supporter #${d.supporterId}`}
                                            </Link>
                                        </td>
                                        <td>{d.donationType ?? "—"}</td>
                                        <td>{formatDonationAmount(d.amount, d.currencyCode)}</td>
                                        <td>{d.campaignName ?? "—"}</td>
                                        <td>
                                            {d.isRecurring === true
                                                ? "Yes"
                                                : d.isRecurring === false
                                                  ? "No"
                                                  : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

export default DonationsPage;
