using Smart.Application.Common;
using Smart.Application.DTOs.Warehouse;
using Smart.Application.Interfaces;
using Smart.Domain.Entities;
using Smart.Domain.Interfaces;

namespace Smart.Application.Services
{
    public class WarehouseService : IWarehouseService
    {
        private readonly IUnitOfWork _uow;
        public WarehouseService(IUnitOfWork uow) => _uow = uow;

        public async Task<IReadOnlyList<WarehouseDto>> GetAllAsync()
        {
            var warehouses = await _uow.Warehouses.GetAllAsync("Products");
            return warehouses.Select(ToDto).ToList();
        }

        public async Task<WarehouseDto?> GetByIdAsync(int id)
        {
            var warehouse = await _uow.Warehouses.GetByIdAsync(id, "Products");
            return warehouse == null ? null : ToDto(warehouse);
        }

        public async Task<ServiceResult<WarehouseDto>> CreateAsync(CreateWarehouseDto dto)
        {
            var nameTaken = await _uow.Warehouses.AnyAsync(w => w.Name == dto.Name);
            if (nameTaken)
                return ServiceResult<WarehouseDto>.Fail("A warehouse with this name already exists.");

            var warehouse = new Warehouse
            {
                Name = dto.Name,
                CapacityUsed = dto.CapacityUsed
            };

            await _uow.Warehouses.AddAsync(warehouse);
            await _uow.SaveChangesAsync();
            return ServiceResult<WarehouseDto>.Ok(ToDto(warehouse));
        }

        private static WarehouseDto ToDto(Warehouse w) => new()
        {
            Id = w.Id,
            Name = w.Name,
            CapacityUsed = w.CapacityUsed,
            ProductCount = w.Products?.Count ?? 0
        };
    }
}