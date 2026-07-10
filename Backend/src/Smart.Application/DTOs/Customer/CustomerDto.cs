using System.ComponentModel.DataAnnotations;

namespace Smart.Application.DTOs.Customer
{
    public class CustomerDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string Category { get; set; } = string.Empty;
    }

    public class CreateCustomerDto
    {
        [Required, StringLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress, StringLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required, Phone, StringLength(30)]
        public string Phone { get; set; } = string.Empty;

        [StringLength(250)]
        public string? Address { get; set; }

        [StringLength(50)]
        public string Category { get; set; } = "عام";
    }

    public class UpdateCustomerDto : CreateCustomerDto
    {
    }
}
