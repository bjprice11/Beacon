import type { Supporter } from "../types/Supporter";

interface DonorInfoProps {
  supporter: Supporter;
}

function DonorInfo({ supporter }: DonorInfoProps) {
  const name = supporter.displayName
    ?? ([supporter.firstName, supporter.lastName].filter(Boolean).join(" ") || "Unknown");

  const fields: [string, string | undefined | null][] = [
    ["Type", supporter.supporterType],
    ["Organization", supporter.organizationName],
    ["Email", supporter.email],
    ["Phone", supporter.phone],
    ["Region", supporter.region],
    ["Country", supporter.country],
    ["Status", supporter.status],
    ["Relationship", supporter.relationshipType],
    ["First Donation", supporter.firstDonationDate],
    ["Acquisition Channel", supporter.acquisitionChannel],
  ];

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="card-title h5 mb-3">{name}</h2>
        <table className="table table-sm mb-0">
          <tbody>
            {fields
              .filter(([, value]) => value != null && value !== "")
              .map(([label, value]) => (
                <tr key={label}><th>{label}</th><td>{value}</td></tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DonorInfo;
