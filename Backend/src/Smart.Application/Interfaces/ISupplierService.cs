using Smart.Application.Common;
using Smart.Application.DTOs.Supplier;

namespace Smart.Application.Interfaces
{
    public interface ISupplierService
    {
        Task<IReadOnlyList<SupplierDto>> GetAllAsync();
        Task<PagedResult<SupplierDto>> GetPagedAsync(int page, int pageSize, string? search = null);
        Task<SupplierDto?> GetByIdAsync(int id);
        Task<ServiceResult<SupplierDto>> CreateAsync(CreateSupplierDto dto);
        Task<ServiceResult<SupplierDto>> UpdateAsync(int id, UpdateSupplierDto dto);
        Task<ServiceResult<bool>> DeleteAsync(int id);
    }
}