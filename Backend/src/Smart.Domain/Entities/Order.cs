using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Smart.Domain.Common;

namespace Smart.Domain.Entities
{
    // Order types, kept as the same Arabic literals the frontend already renders/compares against.
    public static class OrderTypes
    {
        public const string Supply = "توريد";
        public const string Issue = "صرف";
        public const string Return = "مرتجع";
    }

    // Order statuses, same reasoning as above.
    public static class OrderStatuses
    {
        public const string Complete = "مكتمل";
        public const string Incomplete = "غير مكتمل";
    }

    public class Order : BaseEntity
    {
        [Required, StringLength(20)]
        public string Type { get; set; } = string.Empty; // توريد / صرف / مرتجع

        public int ProductId { get; set; }
        public virtual Product? Product { get; set; }

        public int? WarehouseId { get; set; }
        public virtual Warehouse? Warehouse { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        // Negative for returns, matching the frontend's sign convention.
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PaidAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal RemainingAmount { get; set; }

        [Required, StringLength(30)]
        public string Status { get; set; } = OrderStatuses.Incomplete;

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        // Only set on "مرتجع" orders — links back to the order being returned against.
        public int? OriginalOrderId { get; set; }
        public virtual Order? OriginalOrder { get; set; }

        [StringLength(200)]
        public string? Reason { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? ReturnAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? RefundAmount { get; set; }
    }
}