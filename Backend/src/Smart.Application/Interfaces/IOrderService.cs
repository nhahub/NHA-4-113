using Smart.Application.Common;
using Smart.Application.DTOs.Order;

namespace Smart.Application.Interfaces
{
    public interface IOrderService
    {
        Task<IReadOnlyList<OrderDto>> GetAllAsync();
        Task<OrderDto?> GetByIdAsync(int id);
        Task<ServiceResult<OrderDto>> CreateAsync(CreateOrderDto dto);
        Task<ServiceResult<OrderDto>> CreateReturnAsync(CreateReturnDto dto);
        Task<ServiceResult<OrderDto>> PayAsync(int id, PaymentDto dto);
    }
}