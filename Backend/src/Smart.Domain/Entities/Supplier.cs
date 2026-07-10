using System.ComponentModel.DataAnnotations;
using Smart.Domain.Common;

namespace Smart.Domain.Entities
{
    public class Supplier : BaseEntity
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(150)]
        public string Name { get; set; } = string.Empty;

        // Free-text category 
        [Required(ErrorMessage = "Category is required")]
        [StringLength(100)]
        public string Category { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone is required")]
        [Phone]
        [StringLength(30)]
        public string Phone { get; set; } = string.Empty;

        [EmailAddress]
        [StringLength(150)]
        public string? Email { get; set; }

        [StringLength(250)]
        public string? Address { get; set; }

        [Range(0, 5)]
        public double Rating { get; set; } = 0;

        public virtual ICollection<Product>? Products { get; set; }
    }
}
