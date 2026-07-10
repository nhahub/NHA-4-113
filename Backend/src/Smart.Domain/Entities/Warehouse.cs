using System.ComponentModel.DataAnnotations;
using Smart.Domain.Common;

namespace Smart.Domain.Entities
{
    public class Warehouse : BaseEntity
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(150)]
        public string Name { get; set; } = string.Empty;

        // Manually-set occupancy percentage (0-100), shown on the Inventory page's capacity bar.
        [Range(0, 100)]
        public int CapacityUsed { get; set; }

        public virtual ICollection<Product>? Products { get; set; }
        public virtual ICollection<Order>? Orders { get; set; }
    }
}