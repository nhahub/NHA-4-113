using Smart.Application.Common;
using Smart.Application.DTOs.Product;

namespace Smart.Application.Interfaces
{
    public interface IProductService
    {
        Task<IReadOnlyList<ProductDto>> GetAllAsync();
        Task<PagedResult<ProductDto>> GetPagedAsync(int page, int pageSize, string? search = null);
        Task<IReadOnlyList<ProductDto>> GetLowStockAsync();
        Task<ProductDto?> GetByIdAsync(int id);
        Task<ServiceResult<ProductDto>> CreateAsync(CreateProductDto dto);
        Task<ServiceResult<ProductDto>> UpdateAsync(int id, UpdateProductDto dto);
        Task<ServiceResult<bool>> DeleteAsync(int id);
    }
}