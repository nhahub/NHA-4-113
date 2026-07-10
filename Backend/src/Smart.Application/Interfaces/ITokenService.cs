namespace Smart.Application.Interfaces
{
    public interface ITokenService
    {
        (string Token, DateTime ExpiresAt) GenerateToken(int userId, string username, string role);
    }
}
