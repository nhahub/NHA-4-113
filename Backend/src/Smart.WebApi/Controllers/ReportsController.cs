using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Smart.Application.DTOs.Report;
using Smart.Application.Interfaces;

namespace Smart.WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // Reports (financial summaries, breakdowns) are admin-only.
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _service;
        public ReportsController(IReportService service) => _service = service;

        [HttpGet("summary")]
        public async Task<ActionResult<ReportSummaryDto>> GetSummary() =>
            Ok(await _service.GetSummaryAsync());

        [HttpGet("category-breakdown")]
        public async Task<ActionResult<IReadOnlyList<CategoryBreakdownDto>>> GetCategoryBreakdown() =>
            Ok(await _service.GetCategoryBreakdownAsync());
    }
}