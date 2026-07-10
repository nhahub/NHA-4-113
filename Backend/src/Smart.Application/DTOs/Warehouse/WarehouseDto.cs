using System.ComponentModel.DataAnnotations;

namespace Smart.Application.DTOs.Warehouse
{
    public class WarehouseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int CapacityUsed { get; set; }
        public int ProductCount { get; set; }
    }

    public class CreateWarehouseDto
    {
        [Required, StringLength(150)]
        public string Name { get; set; } = string.Empty;

        [Range(0, 100)]
        public int CapacityUsed { get; set; }
    }
}