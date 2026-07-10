using Smart.Application.Common;
using Smart.Application.DTOs.Category;
using Smart.Application.Interfaces;
using Smart.Domain.Entities;
using Smart.Domain.Interfaces;

namespace Smart.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _uow;
        public CategoryService(IUnitOfWork uow) => _uow = uow;

        public async Task<IReadOnlyList<CategoryDto>> GetAllAsync()
        {
            var categories = await _uow.Categories.GetAllAsync("Products");
            return categories.Select(ToDto).ToList();
        }

        public async Task<CategoryDto?> GetByIdAsync(int id)
        {
            var category = await _uow.Categories.GetByIdAsync(id, "Products");
            return category == null ? null : ToDto(category);
        }

        public async Task<ServiceResult<CategoryDto>> CreateAsync(CreateCategoryDto dto)
        {
            var nameTaken = await _uow.Categories.AnyAsync(c => c.Name == dto.Name);
            if (nameTaken)
                return ServiceResult<CategoryDto>.Fail("A category with this name already exists.");

            var category = new Category { Name = dto.Name, Description = dto.Description };
            await _uow.Categories.AddAsync(category);
            await _uow.SaveChangesAsync();

            return ServiceResult<CategoryDto>.Ok(ToDto(category));
        }

        public async Task<ServiceResult<CategoryDto>> UpdateAsync(int id, UpdateCategoryDto dto)
        {
            var category = await _uow.Categories.GetByIdAsync(id);
            if (category == null)
                return ServiceResult<CategoryDto>.Fail("Category not found.");

            category.Name = dto.Name;
            category.Description = dto.Description;
            category.UpdatedAt = DateTime.UtcNow;

            _uow.Categories.Update(category);
            await _uow.SaveChangesAsync();

            return ServiceResult<CategoryDto>.Ok(ToDto(category));
        }

        public async Task<ServiceResult<bool>> DeleteAsync(int id)
        {
            var category = await _uow.Categories.GetByIdAsync(id);
            if (category == null)
                return ServiceResult<bool>.Fail("Category not found.");

            var hasProducts = await _uow.Products.AnyAsync(p => p.CategoryId == id);
            if (hasProducts)
                return ServiceResult<bool>.Fail("Cannot delete a category that still has products assigned to it.");

            _uow.Categories.Remove(category);
            await _uow.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }

        private static CategoryDto ToDto(Category c) => new()
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            ProductCount = c.Products?.Count ?? 0
        };
    }
}
