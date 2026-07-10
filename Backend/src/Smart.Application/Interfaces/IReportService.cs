using Smart.Application.DTOs.Report;

namespace Smart.Application.Interfaces
{
    public interface IReportService
    {
        Task<ReportSummaryDto> GetSummaryAsync();
        Task<IReadOnlyList<CategoryBreakdownDto>> GetCategoryBreakdownAsync();
    }
}