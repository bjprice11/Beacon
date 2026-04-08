using System.Security.Claims;
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

    private async Task<int?> GetSupporterIdForCurrentUserAsync()
    {
        var claimEmail = User.FindFirstValue(ClaimTypes.Email);
        var normalizedEmail = claimEmail?.Trim().ToLower();
        if (string.IsNullOrEmpty(normalizedEmail))
            return null;

        var supporter = await _beaconContext.Supporters
            .AsNoTracking()
            .FirstOrDefaultAsync(s =>
                s.Email != null && s.Email.Trim().ToLower() == normalizedEmail);

        return supporter?.SupporterId;
    }

    //GET LIST OF ALL RESIDENTS (legacy route)
    [HttpGet("Residents")]
    public OkObjectResult GetResidentsLegacy() => GetResidentList();

    [HttpGet("AllResidents")]
    public IEnumerable<Resident> GetResidents() => _beaconContext.Residents.ToList();

    [HttpGet("ResidentList")]
    public OkObjectResult GetResidentList()
    {
        var residents = _beaconContext.Residents
            .Join(_beaconContext.Safehouses,
                r => r.SafehouseId,
                s => s.SafehouseId,
                (r, s) => new
                {
                    r.ResidentId,
                    Name = (r.FirstName ?? "") + " " + (r.LastInitial ?? ""),
                    SafehouseName = s.Name,
                    r.CaseStatus,
                    r.Sex,
                    r.DateOfBirth
                })
            .ToList();

        return Ok(residents);
    }

    //GET LIST OF ALL SAFEHOUSES
    [HttpGet("Safehouses")]
    public IEnumerable<Safehouse> GetSafehouses() => _beaconContext.Safehouses.ToList();

    //GET LIST OF ALL PARTNERS
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

    [HttpGet("Me")]
    [Authorize]
    public async Task<IActionResult> GetMeForCurrentUser()
    {
        var supporterId = await GetSupporterIdForCurrentUserAsync();
        if (!supporterId.HasValue)
        {
            return Ok(new
            {
                supporterId = (int?)null,
                displayName = (string?)null,
                firstName = (string?)null,
                supporterType = (string?)null
            });
        }

        var supporter = await _beaconContext.Supporters
            .AsNoTracking()
            .Where(s => s.SupporterId == supporterId.Value)
            .Select(s => new
            {
                s.DisplayName,
                s.FirstName,
                s.SupporterType
            })
            .FirstOrDefaultAsync();

        if (supporter is null)
        {
            return Ok(new
            {
                supporterId = (int?)null,
                displayName = (string?)null,
                firstName = (string?)null,
                supporterType = (string?)null
            });
        }

        return Ok(new
        {
            supporterId = (int?)supporterId.Value,
            displayName = supporter.DisplayName,
            firstName = supporter.FirstName,
            supporterType = supporter.SupporterType
        });
    }
    [HttpGet("Search")]
    public OkObjectResult Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(Array.Empty<object>());

        var query = q.Trim().ToLower();
        
        var supporters = _beaconContext.Supporters
            .Where(s => (s.DisplayName ?? "").ToLower().Contains(query)
                        || (s.FirstName ?? "").ToLower().Contains(query)
                        || (s.LastName ?? "").ToLower().Contains(query)
                        || (s.OrganizationName ?? "").ToLower().Contains(query))
            .Select(s => new
            {
                Id = s.SupporterId,
                Name = s.DisplayName ?? (s.FirstName + " " + s.LastName),
                Type = "Donor"
            })
            .Take(10)
            .ToList();

        var partners = _beaconContext.Partners
            .Where(p => p.PartnerName.ToLower().Contains(query)
                        || (p.ContactName ?? "").ToLower().Contains(query))
            .Select(p => new
            {
                Id = p.PartnerId,
                Name = p.PartnerName,
                Type = "Partner"
            })
            .Take(10)
            .ToList();
        var safehouses = _beaconContext.Safehouses
            .Where(s => s.Name.ToLower().Contains(query)
                        || s.SafehouseCode.ToLower().Contains(query))
            .Select(s => new
            {
                Id = s.SafehouseId,
                Name = s.Name,
                Type = "Safehouse"
            })
            .Take(10)
            .ToList();
        var residents = _beaconContext.Residents
            .Where(r => (r.FirstName ?? "").ToLower().Contains(query)
                        || (r.LastInitial ?? "").ToLower().Contains(query)
                        || (r.CaseControlNo ?? "").ToLower().Contains(query))
            .Select(r => new
            {
                Id = r.ResidentId,
                Name = (r.FirstName ?? "") + " " + (r.LastInitial ?? ""),
                Type = "Resident"
            })
            .Take(10)
            .ToList();

        var results = supporters.Cast<object>()
            .Concat(partners)
            .Concat(safehouses)
            .Concat(residents)
            .ToList();
        return Ok(results);
    }

    //GET THE PERCENTAGE OF DONATIONS ALLOCATED TO EACH PROGRAM
    [HttpGet("Allocations")]
    public IEnumerable<object> GetAllocationList()
    {
        return _beaconContext.DonationAllocations
            .Select(d => new
            {
                d.DonationId,
                d.ProgramArea,
                d.AmountAllocated
            })
            .ToList();
    }

    [HttpGet("Donations")]
    [Authorize]
    public async Task<IActionResult> GetDonations([FromQuery] int? supporterId, [FromQuery] bool includeAllocations = false)
    {
        var isAdmin = User.IsInRole(AuthRoles.Admin);
        if (supporterId is null)
        {
            if (!isAdmin)
                return Forbid();
        }
        else
        {
            var myId = await GetSupporterIdForCurrentUserAsync();
            if (!isAdmin && myId != supporterId)
                return Forbid();
        }

        if (includeAllocations && supporterId is null)
        {
            return BadRequest(new
            {
                message = "includeAllocations requires supporterId."
            });
        }

        var query = _beaconContext.Donations.AsNoTracking().AsQueryable();
        if (supporterId is int filterId)
            query = query.Where(d => d.SupporterId == filterId);

        if (includeAllocations && supporterId is int _)
        {
            var list = await query
                .OrderByDescending(d => d.DonationDate)
                .ThenByDescending(d => d.DonationId)
                .Select(d => new
                {
                    donationId = d.DonationId,
                    supporterId = d.SupporterId,
                    supporterDisplayName = d.Supporter.DisplayName ??
                        ((d.Supporter.FirstName ?? "") + " " + (d.Supporter.LastName ?? "")).Trim(),
                    donationType = d.DonationType,
                    donationDate = d.DonationDate,
                    amount = d.Amount,
                    currencyCode = d.CurrencyCode,
                    campaignName = d.CampaignName,
                    isRecurring = d.IsRecurring,
                    allocations = d.DonationAllocations
                        .OrderBy(a => a.ProgramArea)
                        .Select(a => new
                        {
                            programArea = a.ProgramArea,
                            amountAllocated = a.AmountAllocated,
                            allocationDate = a.AllocationDate
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(list);
        }

        var listSimple = await query
            .OrderByDescending(d => d.DonationDate)
            .ThenByDescending(d => d.DonationId)
            .Select(d => new
            {
                donationId = d.DonationId,
                supporterId = d.SupporterId,
                supporterDisplayName = d.Supporter.DisplayName ??
                    ((d.Supporter.FirstName ?? "") + " " + (d.Supporter.LastName ?? "")).Trim(),
                donationType = d.DonationType,
                donationDate = d.DonationDate,
                amount = d.Amount,
                currencyCode = d.CurrencyCode,
                campaignName = d.CampaignName,
                isRecurring = d.IsRecurring
            })
            .ToListAsync();

        return Ok(listSimple);
    }

    [HttpGet("Donations/{id:int}")]
    [Authorize]
    public async Task<IActionResult> GetDonation(int id)
    {
        var isAdmin = User.IsInRole(AuthRoles.Admin);

        var ownerRow = await _beaconContext.Donations
            .AsNoTracking()
            .Where(d => d.DonationId == id)
            .Select(d => new { d.SupporterId })
            .SingleOrDefaultAsync();

        if (ownerRow is null)
            return NotFound();

        if (!isAdmin)
        {
            var myId = await GetSupporterIdForCurrentUserAsync();
            if (myId != ownerRow.SupporterId)
                return Forbid();
        }

        var row = await _beaconContext.Donations
            .AsNoTracking()
            .Where(d => d.DonationId == id)
            .Select(d => new
            {
                donationId = d.DonationId,
                supporterId = d.SupporterId,
                supporterDisplayName = d.Supporter.DisplayName ??
                    ((d.Supporter.FirstName ?? "") + " " + (d.Supporter.LastName ?? "")).Trim(),
                donationType = d.DonationType,
                donationDate = d.DonationDate,
                isRecurring = d.IsRecurring,
                campaignName = d.CampaignName,
                channelSource = d.ChannelSource,
                currencyCode = d.CurrencyCode,
                amount = d.Amount,
                estimatedValue = d.EstimatedValue,
                impactUnit = d.ImpactUnit,
                notes = d.Notes,
                referralPostId = d.ReferralPostId,
                allocationCount = d.DonationAllocations.Count,
                inKindItemCount = d.InKindDonationItems.Count,
                allocations = d.DonationAllocations
                    .OrderBy(a => a.ProgramArea)
                    .Select(a => new
                    {
                        programArea = a.ProgramArea,
                        amountAllocated = a.AmountAllocated,
                        allocationDate = a.AllocationDate
                    })
                    .ToList()
            })
            .SingleOrDefaultAsync();

        if (row is null)
            return NotFound();

        return Ok(row);
    }

    //GET INDIVIDUAL DONORS, SAFEHOUSES, RESIDENTS, OR PARTNERS BY ID
    [HttpGet("Supporter/{id}")]
    [Authorize]
    public async Task<IActionResult> GetDonor(int id)
    {
        var isAdmin = User.IsInRole(AuthRoles.Admin);
        if (!isAdmin)
        {
            var myId = await GetSupporterIdForCurrentUserAsync();
            if (myId != id)
                return Forbid();
        }

        var donor = await _beaconContext.Supporters.AsNoTracking()
            .FirstOrDefaultAsync(s => s.SupporterId == id);
        if (donor == null) return NotFound();
        return Ok(donor);
    }

    //GET DONOR DASHBOARD: personal info + donation history with program areas
    [HttpGet("DonorDashboard/{id}")]
    [Authorize]
    public async Task<IActionResult> GetDonorDashboard(int id)
    {
        var isAdmin = User.IsInRole(AuthRoles.Admin);
        if (!isAdmin)
        {
            var myId = await GetSupporterIdForCurrentUserAsync();
            if (myId != id)
                return Forbid();
        }

        var supporter = await _beaconContext.Supporters.AsNoTracking().FirstOrDefaultAsync(s => s.SupporterId == id);
        if (supporter == null) return NotFound();

        var history = _beaconContext.Donations
            .Where(d => d.SupporterId == id)
            .Join(_beaconContext.DonationAllocations,
                d => d.DonationId,
                a => a.DonationId,
                (d, a) => new
                {
                    d.DonationType,
                    d.DonationDate,
                    d.Amount,
                    d.EstimatedValue,
                    d.ImpactUnit,
                    a.ProgramArea
                })
            .OrderByDescending(x => x.DonationDate)
            .ToList();

        return Ok(new { supporter, donationHistory = history });
    }
}