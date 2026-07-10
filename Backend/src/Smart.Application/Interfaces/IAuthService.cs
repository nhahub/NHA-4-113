using Smart.Application.Common;
using Smart.Application.DTOs.Auth;

namespace Smart.Application.Interfaces
{
    public interface IAuthService
    {
        Task<ServiceResult<AuthResponseDto>> LoginAsync(LoginRequestDto dto);
    }
}
