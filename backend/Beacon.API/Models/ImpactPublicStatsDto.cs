namespace Beacon.API.Models;

/// <summary>
/// Public marketing stats for the Impact page (aggregated from operational tables).
/// </summary>
public class ImpactPublicStatsDto
{
    public int TotalResidentsServed { get; set; }

    public int ResidentialShelters { get; set; }

    public int CurrentResidents { get; set; }

    public int YearsOfOperation { get; set; }

    public static ImpactPublicStatsDto Empty { get; } = new();
}
