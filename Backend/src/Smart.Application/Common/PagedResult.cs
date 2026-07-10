namespace Smart.Application.Common
{
    // غلاف عام لأي استجابة مقسّمة لصفحات (pagination)، بيستخدمه أي Service
    // محتاج يرجّع قايمة كبيرة على دفعات بدل ما يجيب كل الصفوف مرة واحدة.
    public class PagedResult<T>
    {
        public IReadOnlyList<T> Items { get; set; } = Array.Empty<T>();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
    }
}
