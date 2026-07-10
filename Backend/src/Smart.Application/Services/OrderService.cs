using Smart.Application.Common;
using Smart.Application.DTOs.Order;
using Smart.Domain.Entities;
using Smart.Domain.Interfaces;
using Smart.Application.Interfaces;

namespace Smart.Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly IUnitOfWork _uow;
        public OrderService(IUnitOfWork uow) => _uow = uow;

        public async Task<IReadOnlyList<OrderDto>> GetAllAsync()
        {
            var orders = await _uow.Orders.GetAllAsync("Product", "Warehouse");
            return orders.OrderByDescending(o => o.Id).Select(ToDto).ToList();
        }

        public async Task<OrderDto?> GetByIdAsync(int id)
        {
            var order = await _uow.Orders.GetByIdAsync(id, "Product", "Warehouse");
            return order == null ? null : ToDto(order);
        }

        // Handles "توريد" (supply, adds stock) and "صرف" (issue, removes stock).
        public async Task<ServiceResult<OrderDto>> CreateAsync(CreateOrderDto dto)
        {
            if (dto.Type != OrderTypes.Supply && dto.Type != OrderTypes.Issue)
                return ServiceResult<OrderDto>.Fail("Order type must be either 'توريد' or 'صرف'.");

            var product = await _uow.Products.GetByIdAsync(dto.ProductId);
            if (product == null)
                return ServiceResult<OrderDto>.Fail("The selected product does not exist.");

            if (dto.WarehouseId.HasValue && !await _uow.Warehouses.AnyAsync(w => w.Id == dto.WarehouseId.Value))
                return ServiceResult<OrderDto>.Fail("The selected warehouse does not exist.");

            if (dto.Type == OrderTypes.Issue && product.QuantityInStock < dto.Quantity)
                return ServiceResult<OrderDto>.Fail("Not enough stock available for this issue order.");

            var unitPrice = product.UnitPrice;
            var totalAmount = dto.Quantity * unitPrice;
            var paidAmount = dto.PaidAmount < 0 ? 0 : dto.PaidAmount;
            var remainingAmount = totalAmount - paidAmount;
            var status = paidAmount >= totalAmount && totalAmount > 0 ? OrderStatuses.Complete : OrderStatuses.Incomplete;

            product.QuantityInStock += dto.Type == OrderTypes.Supply ? dto.Quantity : -dto.Quantity;
            product.UpdatedAt = DateTime.UtcNow;
            _uow.Products.Update(product);

            var order = new Order
            {
                Type = dto.Type,
                ProductId = dto.ProductId,
                WarehouseId = dto.WarehouseId,
                Quantity = dto.Quantity,
                UnitPrice = unitPrice,
                TotalAmount = totalAmount,
                PaidAmount = paidAmount,
                RemainingAmount = remainingAmount,
                Status = status,
                OrderDate = DateTime.UtcNow
            };

            await _uow.Orders.AddAsync(order);
            await _uow.SaveChangesAsync();

            var saved = await _uow.Orders.GetByIdAsync(order.Id, "Product", "Warehouse");
            return ServiceResult<OrderDto>.Ok(ToDto(saved!));
        }

        // Creates an independent "مرتجع" (return) order against an existing order, mirroring
        // the debt/refund math that used to live entirely in Orders.jsx.
        public async Task<ServiceResult<OrderDto>> CreateReturnAsync(CreateReturnDto dto)
        {
            var original = await _uow.Orders.GetByIdAsync(dto.OriginalOrderId, "Product", "Warehouse");
            if (original == null)
                return ServiceResult<OrderDto>.Fail("The original order does not exist.");

            var remainingDebtRaw = original.TotalAmount - original.PaidAmount;
            var remainingDebt = remainingDebtRaw > 0 ? remainingDebtRaw : 0;

            var returnAmount = dto.Quantity * original.UnitPrice;
            var refund = dto.RefundAmount < 0 ? 0 : dto.RefundAmount;

            decimal paidAmount;
            decimal finalTotal;
            string status;

            if (refund > 0)
            {
                if (remainingDebt > 0)
                {
                    if (refund <= remainingDebt)
                    {
                        paidAmount = 0;
                        finalTotal = returnAmount;
                        status = OrderStatuses.Incomplete;
                    }
                    else
                    {
                        var excess = refund - remainingDebt;
                        paidAmount = excess;
                        finalTotal = returnAmount - refund;
                        status = paidAmount > 0 ? OrderStatuses.Complete : OrderStatuses.Incomplete;
                    }
                }
                else
                {
                    paidAmount = refund;
                    finalTotal = returnAmount - refund;
                    status = paidAmount > 0 ? OrderStatuses.Complete : OrderStatuses.Incomplete;
                }
            }
            else
            {
                paidAmount = 0;
                finalTotal = returnAmount;
                status = OrderStatuses.Incomplete;
            }

            // Returned goods go back into stock.
            var product = await _uow.Products.GetByIdAsync(original.ProductId);
            if (product != null)
            {
                product.QuantityInStock += dto.Quantity;
                product.UpdatedAt = DateTime.UtcNow;
                _uow.Products.Update(product);
            }

            var returnOrder = new Order
            {
                Type = OrderTypes.Return,
                ProductId = original.ProductId,
                WarehouseId = original.WarehouseId,
                Quantity = dto.Quantity,
                UnitPrice = original.UnitPrice,
                TotalAmount = -finalTotal,
                PaidAmount = paidAmount,
                RemainingAmount = -finalTotal - paidAmount,
                Status = status,
                OrderDate = DateTime.UtcNow,
                OriginalOrderId = original.Id,
                Reason = dto.Reason,
                ReturnAmount = -returnAmount,
                RefundAmount = refund
            };

            await _uow.Orders.AddAsync(returnOrder);
            await _uow.SaveChangesAsync();

            var saved = await _uow.Orders.GetByIdAsync(returnOrder.Id, "Product", "Warehouse");
            return ServiceResult<OrderDto>.Ok(ToDto(saved!));
        }

        // Records a payment against the remaining balance of any order (supply/issue/return).
        public async Task<ServiceResult<OrderDto>> PayAsync(int id, PaymentDto dto)
        {
            var order = await _uow.Orders.GetByIdAsync(id, "Product", "Warehouse");
            if (order == null)
                return ServiceResult<OrderDto>.Fail("Order not found.");

            var newPaidAmount = order.PaidAmount + dto.Amount;
            var newRemainingAmount = order.TotalAmount - newPaidAmount;

            // Positive-total orders (supply/issue) are complete once nothing is left owed to us;
            // negative-total orders (returns) are complete once nothing is left owed to the customer.
            var isComplete = order.TotalAmount >= 0 ? newRemainingAmount <= 0 : newRemainingAmount >= 0;

            order.PaidAmount = newPaidAmount;
            order.RemainingAmount = newRemainingAmount;
            order.Status = isComplete ? OrderStatuses.Complete : OrderStatuses.Incomplete;
            order.UpdatedAt = DateTime.UtcNow;

            _uow.Orders.Update(order);
            await _uow.SaveChangesAsync();

            var saved = await _uow.Orders.GetByIdAsync(id, "Product", "Warehouse");
            return ServiceResult<OrderDto>.Ok(ToDto(saved!));
        }

        private static OrderDto ToDto(Order o) => new()
        {
            Id = o.Id,
            Type = o.Type,
            ProductId = o.ProductId,
            Product = o.Product?.Name ?? string.Empty,
            Quantity = o.Quantity,
            UnitPrice = o.UnitPrice,
            TotalAmount = o.TotalAmount,
            PaidAmount = o.PaidAmount,
            RemainingAmount = o.RemainingAmount,
            WarehouseId = o.WarehouseId,
            Warehouse = o.Warehouse?.Name,
            Status = o.Status,
            Date = o.OrderDate,
            OriginalOrderId = o.OriginalOrderId,
            Reason = o.Reason,
            ReturnAmount = o.ReturnAmount,
            RefundAmount = o.RefundAmount
        };
    }
}