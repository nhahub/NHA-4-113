using System.ComponentModel.DataAnnotations;

namespace Smart.Application.DTOs.Supplier
{
    public class SupplierDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Address { get; set; }
        public double Rating { get; set; }
        public int ProductCount { get; set; }
    }

    public class CreateSupplierDto
    {
        [Required, StringLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required, StringLength(100)]
        public string Category { get; set; } = string.Empty;

        [Required, Phone, StringLength(30)]
        public string Phone { get; set; } = string.Empty;

        [EmailAddress, StringLength(150)]
        public string? Email { get; set; }

        [StringLength(250)]
        public string? Address { get; set; }
    }

    public class UpdateSupplierDto : CreateSupplierDto
    {
        [Range(0, 5)]
        public double Rating { get; set; }
    }
}
