using System.ComponentModel.DataAnnotations;
using Smart.Domain.Common;
using Smart.Domain.Enums;

namespace Smart.Domain.Entities
{
    public class User : BaseEntity
    {
        [Required(ErrorMessage = "Username is required")]
        [StringLength(50, ErrorMessage = "Username cannot be longer than 50 characters")]
        public string Username { get; set; } = string.Empty;

        // Never store the raw password - only the PBKDF2 hash (see Infrastructure/Security/PasswordHasher).
        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required(ErrorMessage = "Full name is required")]
        [StringLength(100, ErrorMessage = "Full name cannot be longer than 100 characters")]
        public string FullName { get; set; } = string.Empty;

        public UserRole Role { get; set; } = UserRole.Staff;

        // Lets an admin disable an account without deleting it (distinct from the soft-delete IsDeleted flag).
        public bool IsActive { get; set; } = true;
    }
}
