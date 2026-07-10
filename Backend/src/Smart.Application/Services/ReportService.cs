using Smart.Application.DTOs.Report;
using Smart.Application.Interfaces;
using Smart.Domain.Interfaces;

namespace Smart.Application.Services
{
    public class ReportService : IReportService
    {
        private readonly IUnitOfWork _uow;
        public ReportService(IUnitOfWork uow) => _uow = uow;

        public async Task<ReportSummaryDto> GetSummaryAsync()
        {
            var products = await _uow.Products.GetAllAsync();

            return new ReportSummaryDto
            {
                TotalProducts = products.Count,
                TotalUnits = products.Sum(p => p.QuantityInStock),
                LowStock = products.Count(p => p.QuantityInStock <= p.ReorderLevel),
                TotalValue = products.Sum(p => p.QuantityInStock * p.UnitPrice)
            };
        }

        public async Task<IReadOnlyList<CategoryBreakdownDto>> GetCategoryBreakdownAsync()
        {
            var categories = await _uow.Categories.GetAllAsync();
            var products = await _uow.Products.GetAllAsync();

            return categories
                .Select(c => new CategoryBreakdownDto
                {
                    Name = c.Name,
                    Value = products.Where(p => p.CategoryId == c.Id).Sum(p => p.QuantityInStock)
                })
                .ToList();
        }
    }
}