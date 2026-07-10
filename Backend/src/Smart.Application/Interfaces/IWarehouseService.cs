using Smart.Application.Common;
using Smart.Application.DTOs.Warehouse;

namespace Smart.Application.Interfaces
{
    public interface IWarehouseService
    {
        Task<IReadOnlyList<WarehouseDto>> GetAllAsync();
        Task<WarehouseDto?> GetByIdAsync(int id);
        Task<ServiceResult<WarehouseDto>> CreateAsync(CreateWarehouseDto dto);
    }
}