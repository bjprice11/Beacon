using Beacon.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Beacon.API.Data;
using Microsoft.EntityFrameworkCore;

namespace Beacon.API.Controllers;

[Route("[controller]")]
[ApiController]

public class BeaconController : ControllerBase
{
    private PostgresContext _beaconContext;

    public BeaconController(PostgresContext temp) => _beaconContext = temp;

    [HttpGet("AllResidents")]
    public IEnumerable<Resident> GetResidents() => _beaconContext.Residents.ToList();

    [HttpGet("ResidentList")]
    public OkObjectResult GetResidentList()
    {
        var residents = _beaconContext.Residents
            .Select(r => new
            {
                r.ResidentId,
                r.SafehouseId,
                r.CaseStatus,
                r.Sex,
                r.DateOfBirth
            })
            .ToList();

        return Ok(residents);
    }


    [HttpGet("Safehouses")]
    public IEnumerable<Safehouse> GetSafehouses() => _beaconContext.Safehouses.ToList();
    
    [HttpGet("Partners")]
    public IEnumerable<Partner> GetPartner() => _beaconContext.Partners.ToList();

    [HttpGet("admin/residents")]
    [Authorize(Policy = AuthPolicies.ManageResidents)]
    public async Task<IActionResult> GetResidentsForAdmin()
    {
        var residents = await _beaconContext.Residents.ToListAsync();
        return Ok(residents);
    }

    [HttpPost]
    [Authorize(Policy = AuthPolicies.ManageResidents)]
    public async Task<IActionResult> CreateResident([FromBody] Resident resident)
    {
        var nextResidentId = _beaconContext.Residents.Max(r => (int?)r.ResidentId ?? 0) + 1;
        resident.ResidentId = nextResidentId;
        _beaconContext.Residents.Add(resident);
        await _beaconContext.SaveChangesAsync();
        return Created($"/residents/{resident.ResidentId}", resident);
    }
}
