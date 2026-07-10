using System.Linq.Expressions;
using Smart.Application.Common;
using Smart.Application.DTOs.Supplier;
using Smart.Application.Interfaces;
using Smart.Domain.Entities;
using Smart.Domain.Interfaces;

namespace Smart.Application.Services
{
    public class SupplierService : ISupplierService
    {
        private readonly IUnitOfWork _uow;
        public SupplierService(IUnitOfWork uow) => _uow = uow;

        public async Task<IReadOnlyList<SupplierDto>> GetAllAsync()
        {
            var suppliers = await _uow.Suppliers.GetAllAsync("Products");
            return suppliers.Select(ToDto).ToList();
        }

        public async Task<PagedResult<SupplierDto>> GetPagedAsync(int page, int pageSize, string? search = null)
        {
            Expression<Func<Supplier, bool>>? filter = null;
            if (!string.IsNullOrWhiteSpace(search))
            {
                var q = search.Trim();
                filter = s => s.Name.Contains(q) || s.Category.Contains(q) || s.Phone.Contains(q) || (s.Email != null && s.Email.Contains(q));
            }

            var (items, totalCount) = await _uow.Suppliers.GetPagedAsync(page, pageSize, filter, "Products");
            return new PagedResult<SupplierDto>
            {
                Items = items.Select(ToDto).ToList(),
                Page = page < 1 ? 1 : page,
                PageSize = pageSize < 1 ? 20 : pageSize,
                TotalCount = totalCount,
            };
        }

        public async Task<SupplierDto?> GetByIdAsync(int id)
        {
            var supplier = await _uow.Suppliers.GetByIdAsync(id, "Products");
            return supplier == null ? null : ToDto(supplier);
        }

        public async Task<ServiceResult<SupplierDto>> CreateAsync(CreateSupplierDto dto)
        {
            var supplier = new Supplier
            {
                Name = dto.Name,
                Category = dto.Category,
                Phone = dto.Phone,
                Email = dto.Email,
                Address = dto.Address
            };

            await _uow.Suppliers.AddAsync(supplier);
            await _uow.SaveChangesAsync();
            return ServiceResult<SupplierDto>.Ok(ToDto(supplier));
        }

        public async Task<ServiceResult<SupplierDto>> UpdateAsync(int id, UpdateSupplierDto dto)
        {
            var supplier = await _uow.Suppliers.GetByIdAsync(id);
            if (supplier == null)
                return ServiceResult<SupplierDto>.Fail("Supplier not found.");

            supplier.Name = dto.Name;
            supplier.Category = dto.Category;
            supplier.Phone = dto.Phone;
            supplier.Email = dto.Email;
            supplier.Address = dto.Address;
            supplier.Rating = dto.Rating;
            supplier.UpdatedAt = DateTime.UtcNow;

            _uow.Suppliers.Update(supplier);
            await _uow.SaveChangesAsync();
            return ServiceResult<SupplierDto>.Ok(ToDto(supplier));
        }

        public async Task<ServiceResult<bool>> DeleteAsync(int id)
        {
            var supplier = await _uow.Suppliers.GetByIdAsync(id);
            if (supplier == null)
                return ServiceResult<bool>.Fail("Supplier not found.");

            var hasProducts = await _uow.Products.AnyAsync(p => p.SupplierId == id);
            if (hasProducts)
                return ServiceResult<bool>.Fail("Cannot delete a supplier that still has products assigned to it.");

            _uow.Suppliers.Remove(supplier);
            await _uow.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }

        private static SupplierDto ToDto(Supplier s) => new()
        {
            Id = s.Id,
            Name = s.Name,
            Category = s.Category,
            Phone = s.Phone,
            Email = s.Email,
            Address = s.Address,
            Rating = s.Rating,
            ProductCount = s.Products?.Count ?? 0
        };
    }
}