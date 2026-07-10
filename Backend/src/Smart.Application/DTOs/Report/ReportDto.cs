namespace Smart.Application.DTOs.Report
{
    public class ReportSummaryDto
    {
        public int TotalProducts { get; set; }
        public int TotalUnits { get; set; }
        public int LowStock { get; set; }
        public decimal TotalValue { get; set; }
    }

    // name/value match the { name, value } shape recharts' <Pie> expects directly.
    public class CategoryBreakdownDto
    {
        public string Name { get; set; } = string.Empty;
        public int Value { get; set; }
    }
}