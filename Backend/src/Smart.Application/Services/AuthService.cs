using Smart.Application.Common;
using Smart.Application.DTOs.Auth;
using Smart.Application.Interfaces;
using Smart.Domain.Interfaces;

namespace Smart.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _uow;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ITokenService _tokenService;

        public AuthService(IUnitOfWork uow, IPasswordHasher passwordHasher, ITokenService tokenService)
        {
            _uow = uow;
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
        }

        public async Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginRequestDto dto)
        {
            var user = await _uow.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
            if (user == null || !user.IsActive)
                return ServiceResult<AuthResponseDto>.Fail("Invalid username or password.");

            if (!_passwordHasher.Verify(dto.Password, user.PasswordHash))
                return ServiceResult<AuthResponseDto>.Fail("Invalid username or password.");

            var (token, expiresAt) = _tokenService.GenerateToken(user.Id, user.Username, user.Role.ToString());

            return ServiceResult<AuthResponseDto>.Ok(new AuthResponseDto
            {
                Token = token,
                ExpiresAt = expiresAt,
                User = new UserDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    FullName = user.FullName,
                    Role = user.Role.ToString()
                }
            });
        }
    }
}
