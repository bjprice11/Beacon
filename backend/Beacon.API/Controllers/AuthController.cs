using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Beacon.API.Data;

namespace Beacon.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(UseManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentSession()
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            return Ok(new {
                isAuthenticated = false,
                userName = (string?)null,
                email = (string?)null,
                roles = Array.Empty<string>()
            });
        }

        var user = await userManager.GetUserAsync(User);
        var roles = User.Claims
        .Where(c => c.Type == ClaimTypes.Role)
        .Select(c => c.Value)
        .Distinct()
        .OrderBy(r => r)
        .ToArray();


        return Ok(new {
            isAuthenticated = true,
            userName = user?.UserName ?? User.Identity?.Name,
            email = user?.Email
            roles
        });
    }

}