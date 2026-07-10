using Microsoft.AspNetCore.Mvc;
using Smart.Application.DTOs.Order;
using Smart.Application.Interfaces;

namespace Smart.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _service;
        public OrdersController(IOrderService service) => _service = service;

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetAll() =>
            Ok(await _service.GetAllAsync());

        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderDto>> GetById(int id)
        {
            var order = await _service.GetByIdAsync(id);
            return order == null ? NotFound() : Ok(order);
        }

        // Creates a "توريد" (supply) or "صرف" (issue) order; adjusts the product's stock accordingly.
        [HttpPost]
        public async Task<ActionResult<OrderDto>> Create(CreateOrderDto dto)
        {
            var result = await _service.CreateAsync(dto);
            if (!result.Success) return BadRequest(new { error = result.Error });
            return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
        }

        // Creates an independent "مرتجع" (return) order against an existing order.
        [HttpPost("return")]
        public async Task<ActionResult<OrderDto>> CreateReturn(CreateReturnDto dto)
        {
            var result = await _service.CreateReturnAsync(dto);
            if (!result.Success) return BadRequest(new { error = result.Error });
            return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
        }

        // Records a payment against the remaining balance of any order.
        [HttpPost("{id:int}/payment")]
        public async Task<ActionResult<OrderDto>> Pay(int id, PaymentDto dto)
        {
            var result = await _service.PayAsync(id, dto);
            if (!result.Success) return BadRequest(new { error = result.Error });
            return Ok(result.Data);
        }
    }
}