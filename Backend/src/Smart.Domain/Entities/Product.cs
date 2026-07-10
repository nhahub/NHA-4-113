using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Smart.Domain.Common;

namespace Smart.Domain.Entities
{
    public class Product : BaseEntity
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "SKU is required")]
        [StringLength(50)]
        public string SKU { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        [Range(0, double.MaxValue, ErrorMessage = "Unit price cannot be negative")]
        public decimal UnitPrice { get; set; }

        [Range(0, int.MaxValue)]
        public int QuantityInStock { get; set; }

        // Alert threshold used for low-stock warnings on the dashboard
        [Range(0, int.MaxValue)]
        public int ReorderLevel { get; set; } = 10;

        // --- Relationships ---
        public int CategoryId { get; set; }
        public virtual Category? Category { get; set; }

        public int SupplierId { get; set; }
        public virtual Supplier? Supplier { get; set; }

        // Optional — which warehouse this product is stocked in. Null means "not yet assigned".
        public int? WarehouseId { get; set; }
        public virtual Warehouse? Warehouse { get; set; }

        [NotMapped]
        public bool IsLowStock => QuantityInStock <= ReorderLevel;
    }
}