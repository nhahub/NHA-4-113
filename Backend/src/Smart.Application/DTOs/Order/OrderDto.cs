using System.ComponentModel.DataAnnotations;

namespace Smart.Application.DTOs.Order
{
    // Property names are chosen to match what the Orders.jsx table already renders
    // (row.product, row.warehouse, row.date, ...) so the frontend needs minimal changes.
    public class OrderDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;

        public int ProductId { get; set; }
        public string Product { get; set; } = string.Empty;

        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal RemainingAmount { get; set; }

        public int? WarehouseId { get; set; }
        public string? Warehouse { get; set; }

        public string Status { get; set; } = string.Empty;
        public DateTime Date { get; set; }

        public int? OriginalOrderId { get; set; }
        public string? Reason { get; set; }
        public decimal? ReturnAmount { get; set; }
        public decimal? RefundAmount { get; set; }
    }

    // Used for both "توريد" (supply) and "صرف" (issue) orders.
    public class CreateOrderDto
    {
        [Required, StringLength(20)]
        public string Type { get; set; } = string.Empty;

        public int ProductId { get; set; }
        public int? WarehouseId { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [Range(0, double.MaxValue)]
        public decimal PaidAmount { get; set; }
    }

    public class CreateReturnDto
    {
        public int OriginalOrderId { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [Required, StringLength(200)]
        public string Reason { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal RefundAmount { get; set; }
    }

    public class PaymentDto
    {
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }
    }
}