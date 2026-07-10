using Smart.Application.Common;
using Smart.Application.DTOs.Customer;

namespace Smart.Application.Interfaces
{
    public interface ICustomerService
    {
        Task<IReadOnlyList<CustomerDto>> GetAllAsync();
        Task<PagedResult<CustomerDto>> GetPagedAsync(int page, int pageSize, string? search = null);
        Task<CustomerDto?> GetByIdAsync(int id);
        Task<ServiceResult<CustomerDto>> CreateAsync(CreateCustomerDto dto);
        Task<ServiceResult<CustomerDto>> UpdateAsync(int id, UpdateCustomerDto dto);
        Task<ServiceResult<bool>> DeleteAsync(int id);
    }
}