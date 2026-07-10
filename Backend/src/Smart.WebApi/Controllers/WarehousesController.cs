using Microsoft.AspNetCore.Mvc;
using Smart.Application.DTOs.Warehouse;
using Smart.Application.Interfaces;

namespace Smart.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WarehousesController : ControllerBase
    {
        private readonly IWarehouseService _service;
        public WarehousesController(IWarehouseService service) => _service = service;

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<WarehouseDto>>> GetAll() =>
            Ok(await _service.GetAllAsync());

        [HttpGet("{id:int}")]
        public async Task<ActionResult<WarehouseDto>> GetById(int id)
        {
            var warehouse = await _service.GetByIdAsync(id);
            return warehouse == null ? NotFound() : Ok(warehouse);
        }

        [HttpPost]
        public async Task<ActionResult<WarehouseDto>> Create(CreateWarehouseDto dto)
        {
            var result = await _service.CreateAsync(dto);
            if (!result.Success) return BadRequest(new { error = result.Error });
            return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
        }
    }
}