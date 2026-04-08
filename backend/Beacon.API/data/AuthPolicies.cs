namespace Beacon.API.Data
{
    public static class AuthPolicies
    {
        public const string ManageResidents = "ManagingResidents";
        public const string AdminOnly = "AdminOnly";
        public const string DonorOnly = "DonorOnly";
        public const string PartnerOnly = "PartnerOnly";
    }
}