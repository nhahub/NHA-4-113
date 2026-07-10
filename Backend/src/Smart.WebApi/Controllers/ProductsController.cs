using Microsoft.AspNetCore.Mvc;
using Smart.Application.DTOs.Product;
using Smart.Application.Interfaces;

namespace Smart.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _service;
        public ProductsController(IProductService service) => _service = service;

        // من غير page: بيرجّع القائمة كاملة (زي ما كان قبل كده، مستخدم في Dashboard).
        // بـ ?page=1&pageSize=20: بيرجّع صفحة واحدة بس + العدد الكلي (PagedResult).
        [HttpGet]
        public async Task<ActionResult> GetAll([FromQuery] int? page, [FromQuery] int? pageSize, [FromQuery] string? search)
        {
            if (page.HasValue)
                return Ok(await _service.GetPagedAsync(page.Value, pageSize ?? 20, search));

            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("low-stock")]
        public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetLowStock() =>
          Ok(await _service.GetLowStockAsync());

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ProductDto>> GetById(int id)
        {
            var product = await _service.GetByIdAsync(id);
            return product == null ? NotFound() : Ok(product);
        }

        [HttpPost]
        public async Task<ActionResult<ProductDto>> Create(CreateProductDto dto)
        {
            var result = await _service.CreateAsync(dto);
            if (!result.Success) return BadRequest(new { error = result.Error });
            return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<ProductDto>> Update(int id, UpdateProductDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);
            if (!result.Success) return BadRequest(new { error = result.Error });
            return Ok(result.Data);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result.Success) return BadRequest(new { error = result.Error });
            return NoContent();
        }
    }
}