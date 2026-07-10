using System.Linq.Expressions;
using Smart.Application.Common;
using Smart.Application.DTOs.Product;
using Smart.Application.Interfaces;
using Smart.Domain.Entities;
using Smart.Domain.Interfaces;

namespace Smart.Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IUnitOfWork _uow;
        public ProductService(IUnitOfWork uow) => _uow = uow;

        public async Task<IReadOnlyList<ProductDto>> GetAllAsync()
        {
            var products = await _uow.Products.GetAllAsync("Category", "Supplier", "Warehouse");
            return products.Select(ToDto).ToList();
        }

        public async Task<PagedResult<ProductDto>> GetPagedAsync(int page, int pageSize, string? search = null)
        {
            Expression<Func<Product, bool>>? filter = null;
            if (!string.IsNullOrWhiteSpace(search))
            {
                var q = search.Trim();
                filter = p =>
                    p.Name.Contains(q) ||
                    p.SKU.Contains(q) ||
                    (p.Category != null && p.Category.Name.Contains(q)) ||
                    (p.Supplier != null && p.Supplier.Name.Contains(q));
            }

            var (items, totalCount) = await _uow.Products.GetPagedAsync(page, pageSize, filter, "Category", "Supplier", "Warehouse");
            return new PagedResult<ProductDto>
            {
                Items = items.Select(ToDto).ToList(),
                Page = page < 1 ? 1 : page,
                PageSize = pageSize < 1 ? 20 : pageSize,
                TotalCount = totalCount,
            };
        }

        public async Task<IReadOnlyList<ProductDto>> GetLowStockAsync()
        {
            var products = await _uow.Products.FindAsync(p => p.QuantityInStock <= p.ReorderLevel);
            return products.Select(ToDto).ToList();
        }

        public async Task<ProductDto?> GetByIdAsync(int id)
        {
            var product = await _uow.Products.GetByIdAsync(id, "Category", "Supplier", "Warehouse");
            return product == null ? null : ToDto(product);
        }

        public async Task<ServiceResult<ProductDto>> CreateAsync(CreateProductDto dto)
        {
            var validationError = await ValidateReferencesAndSku(dto.CategoryId, dto.SupplierId, dto.SKU, warehouseId: dto.WarehouseId);
            if (validationError != null)
                return ServiceResult<ProductDto>.Fail(validationError);

            var product = new Product
            {
                Name = dto.Name,
                SKU = dto.SKU,
                Description = dto.Description,
                UnitPrice = dto.UnitPrice,
                QuantityInStock = dto.QuantityInStock,
                ReorderLevel = dto.ReorderLevel,
                CategoryId = dto.CategoryId,
                SupplierId = dto.SupplierId,
                WarehouseId = dto.WarehouseId
            };

            await _uow.Products.AddAsync(product);
            await _uow.SaveChangesAsync();

            // Re-fetch so navigation properties (Category/Supplier/Warehouse names) are populated for the DTO
            var saved = await _uow.Products.GetByIdAsync(product.Id, "Category", "Supplier", "Warehouse");
            return ServiceResult<ProductDto>.Ok(ToDto(saved!));
        }

        public async Task<ServiceResult<ProductDto>> UpdateAsync(int id, UpdateProductDto dto)
        {
            var product = await _uow.Products.GetByIdAsync(id, "Category", "Supplier", "Warehouse");
            if (product == null)
                return ServiceResult<ProductDto>.Fail("Product not found.");

            var validationError = await ValidateReferencesAndSku(dto.CategoryId, dto.SupplierId, dto.SKU, excludeProductId: id, warehouseId: dto.WarehouseId);
            if (validationError != null)
                return ServiceResult<ProductDto>.Fail(validationError);

            product.Name = dto.Name;
            product.SKU = dto.SKU;
            product.Description = dto.Description;
            product.UnitPrice = dto.UnitPrice;
            product.QuantityInStock = dto.QuantityInStock;
            product.ReorderLevel = dto.ReorderLevel;
            product.CategoryId = dto.CategoryId;
            product.SupplierId = dto.SupplierId;
            product.WarehouseId = dto.WarehouseId;
            product.UpdatedAt = DateTime.UtcNow;

            _uow.Products.Update(product);
            await _uow.SaveChangesAsync();

            var saved = await _uow.Products.GetByIdAsync(id, "Category", "Supplier", "Warehouse");
            return ServiceResult<ProductDto>.Ok(ToDto(saved!));
        }

        public async Task<ServiceResult<bool>> DeleteAsync(int id)
        {
            var product = await _uow.Products.GetByIdAsync(id, "Category", "Supplier", "Warehouse");
            if (product == null)
                return ServiceResult<bool>.Fail("Product not found.");

            _uow.Products.Remove(product);
            await _uow.SaveChangesAsync();
            return ServiceResult<bool>.Ok(true);
        }

        private async Task<string?> ValidateReferencesAndSku(int categoryId, int supplierId, string sku, int? excludeProductId = null, int? warehouseId = null)
        {
            if (!await _uow.Categories.AnyAsync(c => c.Id == categoryId))
                return "The selected category does not exist.";

            if (!await _uow.Suppliers.AnyAsync(s => s.Id == supplierId))
                return "The selected supplier does not exist.";

            if (warehouseId.HasValue && !await _uow.Warehouses.AnyAsync(w => w.Id == warehouseId.Value))
                return "The selected warehouse does not exist.";

            var skuTaken = await _uow.Products.AnyAsync(p => p.SKU == sku && p.Id != (excludeProductId ?? 0));
            if (skuTaken)
                return "A product with this SKU already exists.";

            return null;
        }

        private static ProductDto ToDto(Product p) => new()
        {
            Id = p.Id,
            Name = p.Name,
            SKU = p.SKU,
            Description = p.Description,
            UnitPrice = p.UnitPrice,
            QuantityInStock = p.QuantityInStock,
            ReorderLevel = p.ReorderLevel,
            IsLowStock = p.IsLowStock,
            CategoryId = p.CategoryId,
            CategoryName = p.Category?.Name,
            SupplierId = p.SupplierId,
            SupplierName = p.Supplier?.Name,
            WarehouseId = p.WarehouseId,
            WarehouseName = p.Warehouse?.Name
        };
    }
}