using Smart.Application.Common;
using Smart.Application.DTOs.Category;

namespace Smart.Application.Interfaces
{
    public interface ICategoryService
    {
        Task<IReadOnlyList<CategoryDto>> GetAllAsync();
        Task<CategoryDto?> GetByIdAsync(int id);
        Task<ServiceResult<CategoryDto>> CreateAsync(CreateCategoryDto dto);
        Task<ServiceResult<CategoryDto>> UpdateAsync(int id, UpdateCategoryDto dto);
        Task<ServiceResult<bool>> DeleteAsync(int id);
    }
}
