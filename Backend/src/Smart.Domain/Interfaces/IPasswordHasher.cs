namespace Smart.Domain.Interfaces
{
    // Abstraction so Application/Domain never touch a concrete hashing algorithm directly.
    // Implemented in Infrastructure (PBKDF2, no extra NuGet package required).
    public interface IPasswordHasher
    {
        string Hash(string password);
        bool Verify(string password, string passwordHash);
    }
}
