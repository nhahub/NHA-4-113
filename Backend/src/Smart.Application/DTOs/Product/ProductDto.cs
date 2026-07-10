using System.ComponentModel.DataAnnotations;

namespace Smart.Application.DTOs.Product
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal UnitPrice { get; set; }
        public int QuantityInStock { get; set; }
        public int ReorderLevel { get; set; }
        public bool IsLowStock { get; set; }

        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }

        public int SupplierId { get; set; }
        public string? SupplierName { get; set; }

        public int? WarehouseId { get; set; }
        public string? WarehouseName { get; set; }
    }

    public class CreateProductDto
    {
        [Required, StringLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required, StringLength(50)]
        public string SKU { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Range(0, double.MaxValue)]
        public decimal UnitPrice { get; set; }

        [Range(0, int.MaxValue)]
        public int QuantityInStock { get; set; }

        [Range(0, int.MaxValue)]
        public int ReorderLevel { get; set; } = 10;

        public int CategoryId { get; set; }
        public int SupplierId { get; set; }

        // Optional — which warehouse this product is stocked in.
        public int? WarehouseId { get; set; }
    }

    public class UpdateProductDto : CreateProductDto
    {
    }
}