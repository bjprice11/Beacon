using System.Text.Json.Serialization;

namespace Beacon.API.Models;

/// <summary>
/// Confirms which resident owns the row before delete/update-from-delete flows.
/// </summary>
public sealed class DeleteResidentRecordRequest
{
    [JsonPropertyName("resident_id")]
    public int ResidentId { get; set; }
}
