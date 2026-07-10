using Microsoft.Extensions.DependencyInjection;
using Smart.Domain.Entities;
using Smart.Domain.Enums;
using Smart.Domain.Interfaces;

namespace Smart.Infrastructure.Data
{
    // Creates a default Admin + Staff account on first run so the app is usable
    // immediately after a fresh migration. Safe to call on every startup: it
    // only inserts when the Users table is empty.
    public static class DataSeeder
    {
        public static async Task SeedAsync(IServiceProvider services)
        {
            var uow = services.GetRequiredService<IUnitOfWork>();
            var passwordHasher = services.GetRequiredService<IPasswordHasher>();

            var anyUsers = await uow.Users.AnyAsync(_ => true);
            if (anyUsers) return;

            var admin = new User
            {
                Username = "admin",
                FullName = "System Administrator",
                Role = UserRole.Admin,
                PasswordHash = passwordHasher.Hash("Admin@123")
            };

            var staff = new User
            {
                Username = "staff",
                FullName = "Staff Member",
                Role = UserRole.Staff,
                PasswordHash = passwordHasher.Hash("Staff@123")
            };

            await uow.Users.AddAsync(admin);
            await uow.Users.AddAsync(staff);
            await uow.SaveChangesAsync();
        }
    }
}
