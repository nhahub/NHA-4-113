using System.ComponentModel.DataAnnotations;
using Smart.Domain.Common;

namespace Smart.Domain.Entities
{
    public class Category : BaseEntity
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot be longer than 100 characters")]
        public string Name { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot be longer than 500 characters")]
        public string? Description { get; set; }

        // Navigation property for the related products
        public virtual ICollection<Product>? Products { get; set; }
    }
}
