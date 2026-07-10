using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smart.Application.DTOs.Auth;
using Smart.Application.Interfaces;

namespace Smart.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService) => _authService = authService;

        // The only endpoint in the whole API that doesn't require a token.
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginRequestDto dto)
        {
            var result = await _authService.LoginAsync(dto);
            if (!result.Success) return Unauthorized(new { error = result.Error });
            return Ok(result.Data);
        }

        // Lets the frontend re-check "who am I" (e.g. after a page refresh) without
        // re-sending credentials, using whatever token is already stored.
        [Authorize]
        [HttpGet("me")]
        public ActionResult<UserDto> Me()
        {
            var id = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var username = User.Identity?.Name ?? string.Empty;
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? string.Empty;

            return Ok(new UserDto
            {
                Id = int.TryParse(id, out var parsedId) ? parsedId : 0,
                Username = username,
                Role = role
            });
        }
    }
}
