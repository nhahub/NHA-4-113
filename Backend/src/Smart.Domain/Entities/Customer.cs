using System.ComponentModel.DataAnnotations;
using Smart.Domain.Common;

namespace Smart.Domain.Entities
{
    public class Customer : BaseEntity
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone is required")]
        [Phone]
        [StringLength(30)]
        public string Phone { get; set; } = string.Empty;

        [StringLength(250)]
        public string? Address { get; set; }
        
        // e.g. فردي / شركة / مؤسسة / حكومي / عام 
        [StringLength(50)]
        public string Category { get; set; } = "عام";
    }
}
